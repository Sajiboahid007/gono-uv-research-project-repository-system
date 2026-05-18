import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../authenticate";
import { AuthenticatedRequest } from "../interface";
// import bcrypt from "bcrypt";
//import { AuthenticatedRequest } from "../interface";

const prisma = new PrismaClient();

const router = express.Router();

router.get(
  "/departments/get",
  authenticate,
  async (_req: AuthenticatedRequest, res) => {
    try {
      const departments = await prisma.department.findMany({
        where: {
          IsMarkToDelete: false,
        },
        orderBy: {
          Id: "desc",
        },
      });
      res.json({
        data: departments,
        message: "Departments retrieved successfully",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.get(
  "/departments/get/:id",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const departmentId = Number(req.params.id);
      const department = await prisma.department.findFirst({
        where: { Id: departmentId },
      });
      if (!department) {
        res.status(404).json({ error: "Department not found" });
        return;
      }
      res.json({
        data: department,
        message: "Department retrieved successfully",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/departments/create",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { Name, Code } = req.body;

      const depData = await prisma.department.create({
        data: {
          Name,
          Code,
          IsMarkToDelete: false,
        },
      });

      res.status(201).json({
        data: depData,
        message: "Department created successfully",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.put(
  "/departments/update/:id",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const departmentId = Number(req.params.id);
      const { Name, Code } = req.body;
      const updatedDepartment = await prisma.department.update({
        where: { Id: departmentId },
        data: {
          Name,
          Code,
          UpdatedAt: new Date(),
        },
      });
      res.json({
        data: updatedDepartment,
        message: "Department updated successfully",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.put(
  "/departments/delete/:id",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const departmentId = Number(req.params.id);
      const deletedDepartment = await prisma.department.update({
        where: { Id: departmentId },
        data: { IsMarkToDelete: true, UpdatedAt: new Date() },
      });
      res.json({
        data: deletedDepartment,
        message: "Department marked for deletion successfully",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

module.exports = router;
