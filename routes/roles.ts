import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/roles/get", async (_, res) => {
  try {
    const roles = await prisma.roles.findMany({});
    res.json({ roles, message: "Roles retrieved successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/roles/get/:id", async (req, res) => {
  try {
    const roleId = Number(req.params.id);
    const role = await prisma.roles.findFirst({
      where: { Id: roleId },
    });
    if (!role) {
      res.status(404).json({ error: "Role not found" });
      return;
    }
    res.json({ role, message: "Role retrieved successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/roles/create", async (req, res) => {
  try {
    const { Name } = req.body;
    const role = await prisma.roles.create({
      data: { Name },
    });
    res.json({ role, message: "Role created successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/roles/update/:id", async (req, res) => {
  try {
    const roleId = Number(req.params.id);
    const { Name } = req.body;
    const updatedRole = await prisma.roles.update({
      where: { Id: roleId },
      data: { Name },
    });
    res.json({ role: updatedRole, message: "Role updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/roles/delete/:id", async (req, res) => {
  try {
    const roleId = Number(req.params.id);
    await prisma.roles.delete({
      where: { Id: roleId },
    });
    res.json({ message: "Role deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
