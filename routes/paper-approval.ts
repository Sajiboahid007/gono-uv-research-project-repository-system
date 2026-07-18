import express from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../interface";
import { authenticate } from "../authenticate";
import { GRPConfig } from "../GRPConfig";

const prisma = new PrismaClient();
const router = express.Router();

router.get(
  "/paper-approval/get",
  authenticate,
  async (_req: AuthenticatedRequest, res) => {
    try {
      const paperApprovals = await prisma.paperApprovals.findMany({
        where: {
          Status: "Pending"
        },
        orderBy: {
          Id: "desc",
        },
        include: {
          Papers: {
            include: {
              Users: {
                select: {
                  Name: true,
                  Roles: {
                    select: {
                      Name: true,
                    },
                  },
                },
              },
              Category: {
                select: {
                  Name: true,
                },
              },
              Department: {
                select: {
                  Name: true,
                },
              },
              PaperGroups: {
                select: {
                  UserId: true,
                  UserType: true,
                },
              },
            },
          },
        },
      });
      res.json({
        data: paperApprovals,
        message: "Paper approvals retrieved successfully",
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
);

router.post(
  "/paper-approval/update",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { PaperId, Status, Remarks, RemarksFile, IsResubmission } = req.body;

      const paperApproval = await prisma.paperApprovals.findFirst({
        where: {
          PaperId: Number(PaperId),
        },
      });

      if (!paperApproval) {
        return res.status(404).json({ error: "Paper approval not found" });
      }

      const result = await prisma.$transaction(async (tx: any) => {
        const updatedPaperApproval = await tx.paperApprovals.update({
          where: {
            Id: paperApproval.Id,
          },
          data: {
            Status,
            Remarks,
            RemarksFile,
            IsResubmission: IsResubmission === true || IsResubmission === "true",
            UpdatedBy: req.userEmail || "Unknown",
          },
        });

        await tx.paperApprovalHistories.create({
          data: {
            PaperId: Number(PaperId),
            PaperApprovalId: paperApproval.Id,
            Status,
            Remarks,
            ApprovedByUser: req.userEmail || "Unknown",
            CreatedBy: req.userEmail || "Unknown",
          },
        });

        // Auto-generate notification for the paper author
        const paper = await tx.papers.findUnique({
          where: { Id: Number(PaperId) },
          include: { Users: true }
        });
        if (paper && paper.UserId) {
          if (Status === "Pending" && paperApproval.Status !== "Pending") {
            const submittedBy = paper.Users?.Name || "Unknown User";
            const notificationRouter = require("./notification");
            await notificationRouter.createPendingNotifications(tx, {
              paperId: paper.Id,
              title: paper.Title || "Untitled Paper",
              submittedBy,
            });
          }

          if (req.userId !== paper.UserId) {
            await tx.notifications.create({
              data: {
                UserId: paper.UserId,
                Title: "Paper Approval Status Updated",
                Message: `Your paper "${paper.Title}" has been updated to "${Status}". Remarks: ${Remarks}`,
                Status,
                FileUrl: RemarksFile || null,
                PaperId: paper.Id,
              }
            });
          }
        }

        return updatedPaperApproval;
      });

      return res.status(200).json({
        data: result,
        message: "Paper approval updated successfully",
      });
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  },
);

router.post(
  "/journal-approval/update",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { JournalId, Status, Remarks, EditorialId, RemarksFile, IsResubmission } = req.body;


      const journalApproval = await prisma.paperApprovals.findFirst({
        where: {
          JournalId: Number(JournalId),
        },
      });

      if (!journalApproval) {
        return res.status(404).json({ error: "Journal approval not found" });
      }

      const result = await prisma.$transaction(async (tx: any) => {
        // Query journal first to get its Title for reviewer notifications
        const journal = await tx.journals.findUnique({
          where: { Id: Number(JournalId) },
          include: { Users: true }
        });

        const updatedJournalApproval = await tx.paperApprovals.update({
          where: {
            Id: journalApproval.Id,
          },
          data: {
            Status,
            Remarks,
            RemarksFile,
            IsResubmission: IsResubmission === true || IsResubmission === "true",
            UpdatedBy: req.userEmail || "Unknown",
          },
        });

        if (EditorialId && Array.isArray(EditorialId)) {
          for (const editorial of EditorialId) {
            await tx.paperGroups.create({
              data: {
                JournalId: Number(JournalId),
                UserId: Number(editorial),
                UserType: GRPConfig.RoleName.Reviewer,
                CreatedBy: req.userEmail || "Unknown",
              },
            });

            // Notify each reviewer assigned
            await tx.notifications.create({
              data: {
                UserId: Number(editorial),
                Title: "New Journal Assigned for Review",
                Message: `You have been assigned to review the journal "${journal?.Title || 'Untitled Journal'}"`,
                Status: "Pending",
                JournalId: Number(JournalId),
              },
            });
          }
        }

        await tx.paperApprovalHistories.create({
          data: {
            JournalId: Number(JournalId),
            PaperApprovalId: journalApproval.Id,
            Status,
            Remarks,
            ApprovedByUser: req.userEmail || "Unknown",
            CreatedBy: req.userEmail || "Unknown",
          },
        });

        // Auto-generate notification for the journal author
        if (journal && journal.UserId) {
          if (Status === "Pending" && journalApproval.Status !== "Pending") {
            const submittedBy = journal.Users?.Name || "Unknown User";
            const notificationRouter = require("./notification");
            await notificationRouter.createPendingNotifications(tx, {
              journalId: journal.Id,
              title: journal.Title || "Untitled Journal",
              submittedBy,
            });
          }

          if (req.userId !== journal.UserId) {
            await tx.notifications.create({
              data: {
                UserId: journal.UserId,
                Title: "Journal Approval Status Updated",
                Message: `Your journal "${journal.Title}" has been updated to "${Status}". Remarks: ${Remarks}`,
                Status,
                FileUrl: RemarksFile || null,
                JournalId: journal.Id,
              }
            });
          }
        }

        return updatedJournalApproval;
      });

      return res.status(200).json({
        data: result,
        message: "Journal approval updated successfully",
      });
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  },
);

module.exports = router;
