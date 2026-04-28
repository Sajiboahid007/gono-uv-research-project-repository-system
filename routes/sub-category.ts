import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/subcategories/get", async (_req, res) => {
  try {
    const categories = await prisma.subCategory.findMany({
      where: {
        IsMarkToDelete: false,
      },
    });
    res.json({
      data: categories,
      message: "Sub Categories retrieved successfully",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/subcategories/get/:id", async (req, res) => {
  try {
    const subCategoryId = Number(req.params.id);
    const category = await prisma.subCategory.findFirst({
      where: { Id: subCategoryId, IsMarkToDelete: false },
    });
    if (!category) {
      res.status(404).json({ error: "Sub Category not found" });
      return;
    }
    res.json({
      data: category,
      message: "Sub Category retrieved successfully",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/subcategories/create", async (req, res) => {
  try {
    const { Name, CategoryId, Code, CreatedBy } = req.body;
    const category = await prisma.subCategory.create({
      data: {
        Name,
        Code,
        CreatedBy,
        IsMarkToDelete: false,
        CategoryId: Number(CategoryId),
      },
    });
    res.json({
      data: category,
      message: "Sub Category created successfully",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/subcategories/update/:id", async (req, res) => {
  try {
    const subCategoryId = Number(req.params.id);
    const { Name, CategoryId, Code } = req.body;
    const updatedCategory = await prisma.subCategory.update({
      where: { Id: subCategoryId },
      data: {
        Name,
        Code,
        CategoryId: Number(CategoryId),
      },
    });
    res.json({
      data: updatedCategory,
      message: "Sub Category updated successfully",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/subcategories/delete/:id", async (req, res) => {
  try {
    const subcCategoryId = Number(req.params.id);
    const category = await prisma.subCategory.findFirst({
      where: { Id: subcCategoryId, IsMarkToDelete: false },
    });
    if (!category) {
      res.status(404).json({ error: "Sub Category not found" });
      return;
    }
    const updatedCategory = await prisma.subCategory.update({
      where: { Id: subcCategoryId },
      data: {
        IsMarkToDelete: true,
      },
    });
    res.json({
      data: updatedCategory,
      message: "Sub Category deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
