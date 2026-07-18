import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../authenticate";
import { AuthenticatedRequest } from "../interface";
import { GRPConfig } from "../GRPConfig";

const prisma = new PrismaClient();
const router = express.Router();

router.get('/paper-group/get', async (_req, res) => {
  try {
    const paperGroup = await prisma.paperGroups.findMany({
      include: {

        Users: {
          select: {
            Id: true,
            Name: true,
            Email: true,
            Batches: {
              select: {
                Name: true,
              }
            },
            Department: {
              select: {
                Name: true,
              }
            }
          }
        }
      }
    })
    res.json({ data: paperGroup, message: "Paper group retrieved successfully" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.get(
  "/paper-group/status/:userId",
  authenticate,
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const userId = Number(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid userId" });
      }

      // Fetch papers where user is either the creator (UserId) or is part of the PaperGroups
      const papers = await prisma.papers.findMany({
        where: {
          IsMarkToDelete: false,
          OR: [
            { UserId: userId },
            { PaperGroups: { some: { UserId: userId } } },
          ],
        },
        include: {
          PaperApprovals: {
            select: {
              Status: true,
              Remarks: true,
              ApprovedDate: true,
            },
          },
          PaperGroups: {
            select: {
              UserId: true,
              UserType: true,
              Users: {
                select: {
                  Name: true,
                },
              },
            },
          },
        },
      });

      // Fetch journals where user is either the creator (UserId) or is part of the PaperGroups
      const journals = await prisma.journals.findMany({
        where: {
          IsMarkToDelete: false,
          OR: [
            { UserId: userId },
            { PaperGroups: { some: { UserId: userId } } },
          ],
        },
        include: {
          PaperApprovals: {
            select: {
              Status: true,
              Remarks: true,
              ApprovedDate: true,
            },
          },
          PaperGroups: {
            select: {
              UserId: true,
              UserType: true,
              Users: {
                select: {
                  Name: true,
                },
              },
            },
          },
        },
      });

      // Format the results cleanly
      const formattedPapers = papers.map((paper) => {
        // The "papergroup name" or userType for the queried user in this paper's group
        const groupEntry = paper.PaperGroups.find((g: any) => g.UserId === userId);
        const userTypeInGroup = groupEntry ? groupEntry.UserType : null;

        // Get status of the paper approval
        const status = paper.PaperApprovals?.[0]?.Status || "Draft";

        return {
          Id: paper.Id,
          Title: paper.Title,
          Abstract: paper.Abstract,
          Status: status,
          UserType: userTypeInGroup, // User's role/type in the group
          PaperGroups: paper.PaperGroups.map((g: any) => ({
            UserId: g.UserId,
            UserType: g.UserType,
            UserName: g.Users?.Name || "Unknown",
          })),
        };
      });

      const formattedJournals = journals.map((journal) => {
        // The "papergroup name" or userType for the queried user in this journal's group
        const groupEntry = journal.PaperGroups.find((g: any) => g.UserId === userId);
        const userTypeInGroup = groupEntry ? groupEntry.UserType : null;

        // Get status of the journal approval
        const status = journal.PaperApprovals?.[0]?.Status || "Draft";

        return {
          Id: journal.Id,
          Title: journal.Title,
          Name: journal.Name, // Journal's name
          Abstract: journal.Abstract,
          Status: status,
          UserType: userTypeInGroup, // User's role/type in the group
          PaperGroups: journal.PaperGroups.map((g: any) => ({
            UserId: g.UserId,
            UserType: g.UserType,
            UserName: g.Users?.Name || "Unknown",
          })),
        };
      });

      return res.status(200).json({
        data: {
          papers: formattedPapers,
          journals: formattedJournals,
        },
        message: "Status and group details retrieved successfully",
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
);

router.get(
  "/paper-group/members/paper/:paperId",
  authenticate,
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const paperId = Number(req.params.paperId);
      if (isNaN(paperId)) {
        return res.status(400).json({ error: "Invalid paperId" });
      }

      const paperGroups = await prisma.paperGroups.findMany({
        where: {
          PaperId: paperId,
        },
        include: {
          Users: {
            select: {
              Name: true,
            },
          },
        },
      });

      const members = paperGroups.map((g: any) => ({
        UserId: g.UserId,
        UserType: g.UserType,
        Name: g.Users?.Name || "Unknown",
      }));

      const students = members.filter((m: any) => m.UserType === GRPConfig.RoleName.Student || m.UserType === "Student");
      const teachers = members.filter((m: any) => m.UserType === GRPConfig.RoleName.Teacher || m.UserType === "Teacher");
      const reviewers = members.filter((m: any) => m.UserType === GRPConfig.RoleName.Reviewer || m.UserType === "Reviewer");

      return res.status(200).json({
        data: {
          allMembers: members,
          students,
          teachers,
          reviewers,
        },
        message: "Paper group members retrieved successfully",
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
);

router.get(
  "/paper-group/members/journal/:journalId",
  authenticate,
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const journalId = Number(req.params.journalId);
      if (isNaN(journalId)) {
        return res.status(400).json({ error: "Invalid journalId" });
      }

      const paperGroups = await prisma.paperGroups.findMany({
        where: {
          JournalId: journalId,
        },
        include: {
          Users: {
            select: {
              Name: true,
            },
          },
        },
      });

      const members = paperGroups.map((g: any) => ({
        UserId: g.UserId,
        UserType: g.UserType,
        Name: g.Users?.Name || "Unknown",
      }));

      const students = members.filter((m: any) => m.UserType === GRPConfig.RoleName.Student || m.UserType === "Student");
      const teachers = members.filter((m: any) => m.UserType === GRPConfig.RoleName.Teacher || m.UserType === "Teacher");
      const reviewers = members.filter((m: any) => m.UserType === GRPConfig.RoleName.Reviewer || m.UserType === "Reviewer");

      return res.status(200).json({
        data: {
          allMembers: members,
          students,
          teachers,
          reviewers,
        },
        message: "Journal group members retrieved successfully",
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  "/paper-group/update/paper",
  authenticate,
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const { PaperId, StudentIds, TeacherIds } = req.body;
      const parsedPaperId = Number(PaperId);

      if (isNaN(parsedPaperId)) {
        return res.status(400).json({ error: "Invalid PaperId" });
      }

      const students = Array.isArray(StudentIds) ? StudentIds : [];
      const teachers = Array.isArray(TeacherIds) ? TeacherIds : [];

      await prisma.$transaction(async (tx) => {
        // 1. Delete existing groups for this PaperId
        await tx.paperGroups.deleteMany({
          where: {
            PaperId: parsedPaperId,
          },
        });

        // 2. Create new groups for Students
        for (const student of students) {
          await tx.paperGroups.create({
            data: {
              PaperId: parsedPaperId,
              UserId: Number(student),
              UserType: GRPConfig.RoleName.Student,
              CreatedBy: req.userEmail || "Unknown",
            },
          });
        }

        // 3. Create new groups for Teachers
        for (const teacher of teachers) {
          await tx.paperGroups.create({
            data: {
              PaperId: parsedPaperId,
              UserId: Number(teacher),
              UserType: GRPConfig.RoleName.Teacher,
              CreatedBy: req.userEmail || "Unknown",
            },
          });
        }
      });

      return res.status(200).json({
        message: "Paper group members updated successfully",
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  "/paper-group/update/journal",
  authenticate,
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const { JournalId, StudentIds, TeacherIds } = req.body;
      const parsedJournalId = Number(JournalId);

      if (isNaN(parsedJournalId)) {
        return res.status(400).json({ error: "Invalid JournalId" });
      }

      const students = Array.isArray(StudentIds) ? StudentIds : [];
      const teachers = Array.isArray(TeacherIds) ? TeacherIds : [];

      await prisma.$transaction(async (tx) => {
        // 1. Delete existing groups for this JournalId
        await tx.paperGroups.deleteMany({
          where: {
            JournalId: parsedJournalId,
          },
        });

        // 2. Create new groups for Students
        for (const student of students) {
          await tx.paperGroups.create({
            data: {
              JournalId: parsedJournalId,
              UserId: Number(student),
              UserType: GRPConfig.RoleName.Student,
              CreatedBy: req.userEmail || "Unknown",
            },
          });
        }

        // 3. Create new groups for Teachers
        for (const teacher of teachers) {
          await tx.paperGroups.create({
            data: {
              JournalId: parsedJournalId,
              UserId: Number(teacher),
              UserType: GRPConfig.RoleName.Teacher,
              CreatedBy: req.userEmail || "Unknown",
            },
          });
        }
      });

      return res.status(200).json({
        message: "Journal group members updated successfully",
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;