import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { AuthenticatedRequest } from "../interface";
import { authenticate } from "../authenticate";

const prisma = new PrismaClient();

import { GRPConfig } from "../GRPConfig";
const nodemailer = require("nodemailer");
const otpStore = new Map<number, { otp: string; expiresAt: number }>();

const router = express.Router();

router.get(
  "/users/get",
  authenticate,
  async (_req: AuthenticatedRequest, res) => {
    try {
      const users = await prisma.users.findMany({
        where: {
          IsMarkToDelete: false,
        },
        orderBy: {
          Id: "desc",
        },
        include: {
          Department: {
            select: {
              Name: true,
            },
          },
          Roles: {
            select: {
              Name: true,
            },
          },
          Batches: {
            select: {
              Name: true,
            },
          },
        },
      });

      const usersWithoutPasswords = users.map(({ Password, ...user }: any) => user);
      res.json({
        data: usersWithoutPasswords,
        message: "Users retrieved successfully",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.get(
  "/users/getByDepartment/:departmentId",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const departmentId = Number(req.params.departmentId);
      const users = await prisma.users.findMany({
        where: {
          DepartmentId: departmentId,
          IsMarkToDelete: false,
        },
        include: {
          Department: {
            select: {
              Name: true,
            },
          },
          Batches: {
            select: {
              Name: true,
            },
          },
        },
      });

      const usersWithoutPasswords = users.map(({ Password, ...user }: any) => user);
      res.json({
        data: usersWithoutPasswords,
        message: "Users retrieved successfully",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.get(
  "/users/get/:id",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = Number(req.params.id);
      const user = await prisma.users.findUnique({
        where: { Id: userId },
        include: {
          Department: {
            select: {
              Name: true,
              Code: true,
            },
          },
          Batches: {
            select: {
              Name: true,
            },
          },
          Roles: {
            select: {
              Name: true,
            },
          },
        },
      });
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      const { Password, ...userWithoutPassword } = user;

      res.json({
        data: userWithoutPassword,
        message: "User retrieved successfully",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/users/create",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        RoleId,
        Name,
        Email,
        StudentId,
        Password,
        DepartmentId,
        BatchId,
      } = req.body;
      const hashedPassword = await bcrypt.hash(Password, 10);
      const newUser = await prisma.users.create({
        data: {
          RoleId,
          Name,
          Email,
          StudentId,
          Password: hashedPassword,
          DepartmentId,
          BatchId,
        },
      });
      res
        .status(201)
        .json({ data: newUser, message: "User created successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { Name, Email, Password, RoleId, Role } = req.body;


    const existingUser = await prisma.users.findUnique({
      where: { Email },
    });
    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(Password, 10);
    const newUser = await prisma.users.create({
      data: {
        RoleId: RoleId ? Number(RoleId) : (Role ? Number(Role) : 2),
        Name,
        Email,
        StudentId: '',
        Password: hashedPassword,
        DepartmentId: 1,
        IsMarkToDelete: false,
      },
    });
    res
      .status(201)
      .json({ data: newUser, message: "User created successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post(
  "/user/create/admin",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { Name, Email, StudentId, Password, RoleId } = req.body;
      const DepartmentId = Number(req.body.DepartmentId);
      const BatchId = Number(req.body.BatchId);

      const existingUser = await prisma.users.findUnique({
        where: { Email },
      });
      if (existingUser) {
        res.status(400).json({ message: "Email already exists" });
        return;
      }

      const hashedPassword = await bcrypt.hash(Password, 10);
      const newUser = await prisma.users.create({
        data: {
          RoleId: Number(RoleId),
          Name,
          Email,
          StudentId,
          Password: hashedPassword,
          DepartmentId,
          BatchId,
          IsMarkToDelete: false,
        },
      });
      res
        .status(201)
        .json({ data: newUser, message: "User created successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.put(
  "/users/update/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = Number(req.params.id);
      const { Name, StudentId, RoleId, DepartmentId, BatchId, Password } = req.body;

      const updatedUser = await prisma.users.findFirst({
        where: { Id: userId },
      });
      if (!updatedUser) {
        return res.status(401).json({ message: "user not found!" });
      }

      const updateData: any = {
        Name: Name,
        StudentId: StudentId,
        RoleId: RoleId,
        DepartmentId: DepartmentId,
        BatchId: BatchId,
      };

      if (Password && Password.trim() !== "") {
        updateData.Password = await bcrypt.hash(Password, 10);
      }

      const update = await prisma.users.update({
        data: updateData,
        where: {
          Id: userId,
        },
      });
      return res.status(201).json({
        data: update,
        message: "User updated successfully",
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: "An error occurred while updating the user" });
    }
  },
);

router.put(
  "/users/change-password",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await prisma.users.findUnique({
        where: { Id: userId },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.Password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect current password" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.users.update({
        where: { Id: userId },
        data: { Password: hashedPassword },
      });

      return res.status(200).json({
        message: "Password updated successfully",
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
);

router.put(
  "/users/update/image/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = Number(req.params.id);
      const { ImageUrl } = req.body;

      const updatedUser = await prisma.users.findFirst({
        where: { Id: userId },
      });
      if (!updatedUser) {
        return res.status(401).json({ message: "user not found!" });
      }

      const update = await prisma.users.update({
        data: {
          ImageUrl: ImageUrl,
        },
        where: {
          Id: userId,
        },
      });
      return res.status(201).json({
        data: update,
        message: "User updated successfully",
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: "An error occurred while updating the user" });
    }
  },
);

router.put(
  "/users/delete/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req.params.id);
      const userafterDelete = await prisma.users.update({
        where: { Id: id },
        data: { IsMarkToDelete: true },
      });
      if (!userafterDelete) {
        return res.status(404).json({ message: "User not found!" });
      }
      return res.status(200).json({
        user: userafterDelete,
        message: "User deleted successfully",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "An error occurred while deleting the user" });
    }
  },
);

// Send verification email OTP
router.post(
  "/users/send-verification",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const user = await prisma.users.findUnique({
        where: { Id: userId },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now
      otpStore.set(userId, { otp, expiresAt });

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // use STARTTLS
        auth: {
          user: GRPConfig.mailConfig.userEmail,
          pass: GRPConfig.mailConfig.userPass,
        },
      });

      const mailOptions = {
        from: GRPConfig.mailConfig.userEmail,
        to: user.Email,
        subject: "Verify Your Email Address - Academic Submission System",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 20px; border-radius: 8px 8px 0 0; text-align: center; color: #ffffff;">
              <h2 style="margin: 0; font-size: 24px; font-weight: 700;">Email Verification</h2>
            </div>
            <div style="padding: 24px; line-height: 1.6;">
              <p style="margin-top: 0; font-size: 16px; color: #1f2937;">Dear ${user.Name},</p>
              <p style="font-size: 15px; color: #4b5563;">You have requested to verify your email address. Please use the following 6-digit verification code (OTP) to complete the verification process:</p>
              <div style="font-size: 32px; font-weight: 800; background: #f3f4f6; padding: 18px; text-align: center; border-radius: 8px; margin: 24px 0; letter-spacing: 6px; color: #1e3a8a; border: 1px dashed #bfdbfe;">
                ${otp}
              </div>
              <p style="font-size: 14px; color: #ef4444; font-weight: 500;">This code is valid for 10 minutes. If you did not request this, you can safely ignore this email.</p>
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 13px; color: #9ca3af;">
              <p style="margin: 0 0 4px 0;">Best regards,</p>
              <p style="margin: 0; font-weight: 600; color: #4b5563;">Academic Submission System Team</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Verification code sent successfully" });
      return;
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      res.status(500).json({ error: "Failed to send verification code" });
      return;
    }
  }
);

// Confirm verification email OTP
router.post(
  "/users/confirm-verification",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      const { otp } = req.body;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      if (!otp) {
        res.status(400).json({ message: "OTP code is required" });
        return;
      }

      const storedData = otpStore.get(userId);
      if (!storedData) {
        res.status(400).json({ message: "No active verification request found" });
        return;
      }

      if (Date.now() > storedData.expiresAt) {
        otpStore.delete(userId);
        res.status(400).json({ message: "Verification code has expired" });
        return;
      }

      if (storedData.otp !== otp) {
        res.status(400).json({ message: "Invalid verification code" });
        return;
      }

      // Update user in DB
      await prisma.users.update({
        where: { Id: userId },
        data: { IsEmailVerified: true } as any,
      });

      // Clear code from store
      otpStore.delete(userId);

      res.status(200).json({
        message: "Email verified successfully",
        data: { IsEmailVerified: true },
      });
      return;
    } catch (error: any) {
      console.error("Error confirming email verification:", error);
      res.status(500).json({ error: "An error occurred during verification" });
      return;
    }
  }
);

module.exports = router;
