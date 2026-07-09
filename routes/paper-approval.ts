import express from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../interface";
import { authenticate } from "../authenticate";
import { GRPConfig } from "../GRPConfig";
// import { authenticate } from "../authenticate";
// import { AuthenticatedRequest } from "../interface";
// import { GRPConfig } from "../GRPConfig";

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
      const { PaperId, Status, Remarks } = req.body;

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
      const { JournalId, Status, Remarks, EditorialId } = req.body;


      const journalApproval = await prisma.paperApprovals.findFirst({
        where: {
          JournalId: Number(JournalId),
        },
      });

      if (!journalApproval) {
        return res.status(404).json({ error: "Journal approval not found" });
      }

      const result = await prisma.$transaction(async (tx: any) => {
        const updatedJournalApproval = await tx.paperApprovals.update({
          where: {
            Id: journalApproval.Id,
          },
          data: {
            Status,
            Remarks,
            UpdatedBy: req.userEmail || "Unknown",
          },
        });

        for (const editorial of EditorialId) {
          await tx.paperGroups.create({
            data: {
              JournalId: Number(JournalId),
              UserId: Number(editorial),
              UserType: GRPConfig.RoleName.Teacher,
              CreatedBy: req.userEmail || "Unknown",
            },
          });
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

        return updatedJournalApproval;
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

module.exports = router;
