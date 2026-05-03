import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../authenticate";
import { AuthenticatedRequest } from "../interface";

const prisma = new PrismaClient();
const router = express.Router();

router.get(
  "/categories/get",
  authenticate,
  async (_req: AuthenticatedRequest, res) => {
    try {
      const categories = await prisma.category.findMany({
        where: {
          IsMarkToDelete: false,
        },
      });
      res.json({
        data: categories,
        message: "Categories retrieved successfully",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.get(
  "/categories/get/:id",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const categoryId = Number(req.params.id);
      const category = await prisma.category.findFirst({
        where: { Id: categoryId, IsMarkToDelete: false },
      });
      if (!category) {
        res.status(404).json({ error: "Category not found" });
        return;
      }
      res.json({
        data: category,
        message: "Category retrieved successfully",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/categories/create",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { Name, Code } = req.body;
      const categoryData = await prisma.category.create({
        data: {
          Name,
          Code,
          IsMarkToDelete: false,
        },
      });
      res.json({
        data: categoryData,
        message: "Category created successfully",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.put(
  "/categories/update/:id",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const categoryId = Number(req.params.id);
      const { Name, Code } = req.body;

      const category = await prisma.category.findFirst({
        where: { Id: categoryId, IsMarkToDelete: false },
      });

      if (!category) {
        res.status(404).json({ error: "Category not found" });
        return;
      }

      const updatedCategory = await prisma.category.update({
        where: { Id: categoryId },
        data: {
          Name,
          Code,
        },
      });

      res.json({
        data: updatedCategory,
        message: "Category updated successfully",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.put(
  "/categories/delete/:id",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const categoryId = Number(req.params.id);
      const category = await prisma.category.findFirst({
        where: { Id: categoryId, IsMarkToDelete: false },
      });

      if (!category) {
        res.status(404).json({ error: "Category not found" });
        return;
      }

      const updatedCategory = await prisma.category.update({
        where: { Id: categoryId, IsMarkToDelete: false },
        data: {
          IsMarkToDelete: true,
        },
      });

      res.json({
        data: updatedCategory,
        message: "Category marked for deletion successfully",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

module.exports = router;
