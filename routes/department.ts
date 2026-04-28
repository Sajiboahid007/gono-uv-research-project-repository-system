import express from "express";
import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcrypt";
//import { AuthenticatedRequest } from "../interface";

const prisma = new PrismaClient();

const router = express.Router();

router.get("/departments/get", async (_, res) => {
  try {
    const departments = await prisma.department.findMany({
      where: {
        IsMarkToDelete: false,
      },
    });
    res.json({ departments, message: "Departments retrieved successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/departments/get/:id", async (req, res) => {
  try {
    const departmentId = Number(req.params.id);
    const department = await prisma.department.findFirst({
      where: { Id: departmentId },
    });
    if (!department) {
      res.status(404).json({ error: "Department not found" });
      return;
    }
    res.json({ department, message: "Department retrieved successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/departments/create", async (req, res) => {
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
      department: depData,
      message: "Department created successfully",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/departments/update/:id", async (req, res) => {
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
      department: updatedDepartment,
      message: "Department updated successfully",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/departments/delete/:id", async (req, res) => {
  try {
    const departmentId = Number(req.params.id);
    const deletedDepartment = await prisma.department.update({
      where: { Id: departmentId },
      data: { IsMarkToDelete: true, UpdatedAt: new Date() },
    });
    res.json({
      department: deletedDepartment,
      message: "Department marked for deletion successfully",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
