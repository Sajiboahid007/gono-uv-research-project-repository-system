import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/batches/get", async (_, res) => {
  try {
    const batches = await prisma.batches.findMany({
      where: {
        IsMarkToDelete: false,
      },
    });
    res.json({ batches, message: "Batches retrieved successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/batches/get/department/:departmentId", async (req, res) => {
  try {
    const departmentId = Number(req.params.departmentId);
    const batches = await prisma.batches.findMany({
      where: { DepartmentId: departmentId, IsMarkToDelete: false },
    });
    res.json({ batches, message: "Batches retrieved successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/batches/get/:id", async (req, res) => {
  try {
    const batchId = Number(req.params.id);
    const batch = await prisma.batches.findFirst({
      where: { Id: batchId, IsMarkToDelete: false },
    });
    if (!batch) {
      res.status(404).json({ error: "Batch not found" });
      return;
    }
    res.json({ batch, message: "Batch retrieved successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/batches/create", async (req, res) => {
  try {
    const { Name, Year, DepartmentId } = req.body;
    const batch = await prisma.batches.create({
      data: { Name, Year, DepartmentId, IsMarkToDelete: false },
    });
    res.json({ batch, message: "Batch created successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/batches/update/:id", async (req, res) => {
  try {
    const batchId = Number(req.params.id);
    const { Name, Year, DepartmentId } = req.body;
    const updatedBatch = await prisma.batches.update({
      where: { Id: batchId },
      data: { Name, Year, DepartmentId },
    });
    res.json({ batch: updatedBatch, message: "Batch updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/batches/delete/:id", async (req, res) => {
  try {
    const batchId = Number(req.params.id);
    const deletedBatch = await prisma.batches.update({
      where: { Id: batchId },
      data: { IsMarkToDelete: true },
    });
    res.json({
      batch: deletedBatch,
      message: "Batch marked for deletion successfully",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
