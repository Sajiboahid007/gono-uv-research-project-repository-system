import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../authenticate";
import { AuthenticatedRequest } from "../interface";

const prisma = new PrismaClient();
const router = express.Router();

router.get(
  "/batches/get",
  authenticate,
  async (_req: AuthenticatedRequest, res) => {
    try {
      const batches = await prisma.batches.findMany({
        where: {
          IsMarkToDelete: false,
        },
        include: {
          Department: {
            select: {
              Name: true,
            },
          },
        },
      });
      res.json({ data: batches, message: "Batches retrieved successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.get(
  "/batches/get/department/:departmentId",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const departmentId = Number(req.params.departmentId);
      const batches = await prisma.batches.findMany({
        where: { DepartmentId: departmentId, IsMarkToDelete: false },
      });
      res.json({ data: batches, message: "Batches retrieved successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.get(
  "/batches/get/:id",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const batchId = Number(req.params.id);
      const batch = await prisma.batches.findFirst({
        where: { Id: batchId, IsMarkToDelete: false },
        include: {
          Department: {
            select: {
              Name: true,
            },
          },
        },
      });
      if (!batch) {
        res.status(404).json({ error: "Batch not found" });
        return;
      }
      res.json({ data: batch, message: "Batch retrieved successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/batches/create",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { Name, DepartmentId } = req.body;
      const Year = Number(req.body.Year);
      const batch = await prisma.batches.create({
        data: {
          Name,
          Year,
          DepartmentId,
          IsMarkToDelete: false,
          CreatedBy: req.userEmail || "Unknown",
        },
      });
      res.json({ data: batch, message: "Batch created successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.put(
  "/batches/update/:id",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const batchId = Number(req.params.id);
      const { Name, Year, DepartmentId } = req.body;
      const updatedBatch = await prisma.batches.update({
        where: { Id: batchId },
        data: { Name, Year, DepartmentId },
      });
      res.json({ data: updatedBatch, message: "Batch updated successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.put(
  "/batches/delete/:id",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const batchId = Number(req.params.id);
      const deletedBatch = await prisma.batches.update({
        where: { Id: batchId },
        data: { IsMarkToDelete: true },
      });
      res.json({
        data: deletedBatch,
        message: "Batch marked for deletion successfully",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);
module.exports = router;
