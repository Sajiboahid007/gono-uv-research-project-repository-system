import express from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../interface";
import { authenticate } from "../authenticate";

const prisma = new PrismaClient();
const router = express.Router();

router.get(
  "/notifications",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(400).json({ error: "User ID is required." });
        return;
      }

      const whereClause: any = {
        OR: [
          { UserId: Number(userId) }
        ]
      };
      if (req.role) {
        whereClause.OR.push({ RecipientRole: req.role });
      }

      const list = await prisma.notifications.findMany({
        where: whereClause,
        orderBy: { CreatedAt: "desc" },
        include: {
          Users: {
            select: {
              Name: true,
            }
          }
        }
      });

      res.status(200).json({
        data: list,
        message: "Notifications retrieved successfully",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  "/notifications",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { UserId, Title, Message, Status, FileUrl } = req.body;
      if (!UserId) {
        res.status(400).json({ error: "Target UserId is required." });
        return;
      }

      const notification = await prisma.notifications.create({
        data: {
          UserId: Number(UserId),
          Title,
          Message,
          Status,
          FileUrl,
        },
      });

      res.status(201).json({
        data: notification,
        message: "Notification created successfully",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export async function createPendingNotifications(
  tx: any,
  params: {
    paperId?: number;
    journalId?: number;
    title: string;
    submittedBy: string;
  }
) {
  const { paperId, journalId, title, submittedBy } = params;
  const resourceType = paperId ? "Research Paper" : "Journal";
  const message = `${resourceType} '${title}' was submitted by ${submittedBy} and is pending approval.`;
  const notificationTitle = `${resourceType} Pending Approval`;

  const roles = ["Admin", "Super-Admin"];

  for (const role of roles) {
    await tx.notifications.create({
      data: {
        Title: notificationTitle,
        Message: message,
        Status: "unread",
        RecipientRole: role,
        PaperId: paperId || null,
        JournalId: journalId || null,
      },
    });
  }
}

(router as any).createPendingNotifications = createPendingNotifications;

module.exports = router;

