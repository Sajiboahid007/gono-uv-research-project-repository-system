import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../authenticate";
import { AuthenticatedRequest } from "../interface";
import { GRPConfig } from "../GRPConfig";

const prisma = new PrismaClient();
const router = express.Router();

router.get(
  "/paper/get",
  authenticate,
  async (_req: AuthenticatedRequest, res) => {
    try {
      const getPapers = await prisma.papers.findMany({
        where: {
          IsMarkToDelete: false,
        },
        orderBy: {
          Id: "desc",
        },
        include: {
          Category: {
            select: {
              Name: true,
            },
          },
          SubCategory: {
            select: {
              Name: true,
            },
          },
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
          Users: {
            select: {
              Name: true,
            },
          },
          PaperApprovals: {
            select: {
              Status: true,
            },
          },
        },
      });
      res.json({
        data: getPapers,
        message: "Fail to get papers",
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
);

router.get(
  "/paper/getById/:id",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const getPapers = await prisma.papers.findUnique({
        where: {
          Id: id,
          IsMarkToDelete: false,
        },
      });
      res.json({
        data: getPapers,
        message: "Fail to get papers",
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
);

router.post(
  "/paper/create",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { Title, Abstract, Year, FileUrl } = req.body;
      const { CategoryId, SubcategoryId, DepartmentId, BatchId } = req.body;
      const { StudentIds, TeacherIds } = req.body;

      let userId = req.userId;

      // Start interactive transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create the paper
        const createPapers = await tx.papers.create({
          data: {
            Title,
            Abstract,
            CategoryId: Number(CategoryId),
            SubcategoryId: Number(SubcategoryId),
            DepartmentId: Number(DepartmentId),
            BatchId: Number(BatchId),
            UserId: Number(userId),
            Year,
            FileUrl,
            CreatedBy: req.userEmail || "Unknown",
          },
        });

        // 2. Create paper groups for students
        for (const student of StudentIds) {
          await tx.paperGroups.create({
            data: {
              PaperId: createPapers.Id,
              UserId: Number(student),
              UserType: GRPConfig.RoleName.Student,
              CreatedBy: req.userEmail || "Unknown",
            },
          });
        }

        // 3. Create paper groups for teachers
        for (const teacher of TeacherIds) {
          await tx.paperGroups.create({
            data: {
              PaperId: createPapers.Id,
              UserId: Number(teacher),
              UserType: GRPConfig.RoleName.Teacher,
              CreatedBy: req.userEmail || "Unknown",
            },
          });
        }

        // 4. Create paper approval
        const paperAproval = await tx.paperApprovals.create({
          data: {
            PaperId: createPapers.Id,
            Status: GRPConfig.ApprovalStatus.Draft,
            CreatedBy: req.userEmail || "Unknown",
          },
        });

        await tx.paperApprovalHistories.create({
          data: {
            PaperApprovalId: paperAproval.Id,
            PaperId: createPapers.Id,
            Status: paperAproval.Status,
            Remarks: "academic paper submission initialization",
            ApprovedByUser: req.userEmail || "Unknown",
            CreatedBy: req.userEmail || "Unknown",
          },
        });

        // Return the paper data (or anything you need)
        return createPapers;
      });

      // If we get here, everything succeeded
      res.json({
        data: result,
        message: "Paper created successfully",
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
);

router.get(
  "/paper/getbycategoryId/:id",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const getPapers = await prisma.papers.findMany({
        where: {
          CategoryId: id,
          IsMarkToDelete: false,
        },
        include: {
          Category: {
            select: {
              Name: true,
            },
          },
        },
      });
      res.json({
        data: getPapers,
        message: "Fail to get papers",
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
);

router.get(
  "/paper/getbySubcategoryId/:id",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const getPapers = await prisma.papers.findMany({
        where: {
          SubcategoryId: id,
          IsMarkToDelete: false,
        },
        include: {
          SubCategory: {
            select: {
              Name: true,
            },
          },
        },
      });
      res.json({
        data: getPapers,
        message: "Fail to get papers",
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
);

router.get(
  "/paper/getbyDepartmentId/:id",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const getPapers = await prisma.papers.findMany({
        where: {
          DepartmentId: id,
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
      res.json({
        data: getPapers,
        message: "Fail to get papers",
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
);

router.get(
  "/paper/getbyUserId/:id",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const getPapers = await prisma.papers.findMany({
        where: {
          UserId: id,
          IsMarkToDelete: false,
        },
        orderBy: {
          Id: "desc",
        },
        include: {
          Users: {
            select: {
              Name: true,
            },
          },
        },
      });
      res.json({
        data: getPapers,
        message: "Fail to get papers",
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
);

router.put(
  "/paper/update/:id",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { Title, Abstract, Year, FileUrl } = req.body;
      const { UserId, CategoryId, SubcategoryId, DepartmentId, BatchId } =
        req.body;
      const updatePapers = await prisma.papers.update({
        where: {
          Id: id,
          IsMarkToDelete: false,
        },
        data: {
          Title,
          Abstract,
          CategoryId: Number(CategoryId),
          SubcategoryId: Number(SubcategoryId),
          DepartmentId: Number(DepartmentId),
          BatchId: Number(BatchId),
          UserId: Number(UserId),
          Year,
          FileUrl,
          IsMarkToDelete: false,
          UpdatedDate: new Date(),
          UpdatedBy: req.userEmail || "Unknown",
        },
      });
      res.json({
        data: updatePapers,
        message: "Fail to update papers",
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
);

router.put(
  "/paper/delete/:id",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const deletePapers = await prisma.papers.update({
        where: {
          Id: id,
          IsMarkToDelete: false,
        },
        data: {
          IsMarkToDelete: true,
        },
      });
      res.json({
        data: deletePapers,
        message: "Fail to delete papers",
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
);

router.get(
  "/paper/getPapersByUserId/:id",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const papers = await prisma.papers.findMany({
        where: {
          PaperGroups: {
            some: {
              UserId: id,
            },
          },
        },
        include: {
          Category: {
            select: {
              Name: true,
            },
          },
          SubCategory: {
            select: {
              Name: true,
            },
          },
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
          PaperGroups: {
            select: {
              Id: true,
              UserId: true,
              UserType: true,
            },
          },
          PaperApprovals: {
            select: {
              Id: true,
              Status: true,
              Remarks: true,
              ApprovedByUserId: true,
              ApprovedDate: true,
            },
          },
        },
      });

      res.json({
        data: papers,
        message: "Fail to get papers",
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
);

module.exports = router;
