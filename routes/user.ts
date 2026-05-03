import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { AuthenticatedRequest } from "../interface";

const prisma = new PrismaClient();

const router = express.Router();

router.get("/users/get", async (_req, res) => {
  try {
    const users = await prisma.users.findMany({
      where: {
        IsMarkToDelete: false,
      },
    });
    res.json({ data: users, message: "Users retrieved successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/users/getByDepartment/:departmentId", async (req, res) => {
  try {
    const departmentId = Number(req.params.departmentId);
    const users = await prisma.users.findMany({
      where: {
        DepartmentId: departmentId,
        IsMarkToDelete: false,
      },
    });
    res.json({ data: users, message: "Users retrieved successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/users/get/:id", async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const user = await prisma.users.findUnique({
      where: { Id: userId },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ data: user, message: "User retrieved successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/users/create", async (req: Request, res: Response) => {
  try {
    const { RoleId, Name, Email, StudentId, Password, DepartmentId } = req.body;
    const hashedPassword = await bcrypt.hash(Password, 10);
    const newUser = await prisma.users.create({
      data: {
        RoleId,
        Name,
        Email,
        StudentId,
        Password: hashedPassword,
        DepartmentId,
      },
    });
    res
      .status(201)
      .json({ data: newUser, message: "User created successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put(
  "/users/update/:id",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = Number(req.params.id);
      const { Name, Email, DepartmentId } = req.body;

      const updatedUser = await prisma.users.findFirst({
        where: { Id: userId },
      });
      if (!updatedUser) {
        return res.status(401).json({ message: "user not found!" });
      }

      const update = await prisma.users.update({
        data: {
          Name: Name,
          Email: Email,
          DepartmentId: DepartmentId,
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

module.exports = router;
