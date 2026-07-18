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
          PaperApprovals: {
            some: {
              Status: "Approved",
            },
          },
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
            where: {
              Status: "Approved"
            },
            select: {
              Status: true,
            },
          },
          PaperGroups: {
            select: {
              UserId: true,
              UserType: true,
              Users: {
                select: {
                  Name: true,
                }
              }
            },
          },
        },
      });
      res.json({
        data: getPapers,
        message: "Success to get papers",
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
);


router.get('/papers/getTotal', async (_req: AuthenticatedRequest, res) => {
  try {
    const total = await prisma.papers.count({
      where: {
        IsMarkToDelete: false,
      },
    });
    res.json({ data: total, message: "Total papers retrieved successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
})


router.get(
  "/paper/non_approval/get",
  authenticate,
  async (_req: AuthenticatedRequest, res) => {
    try {
      const getPapers = await prisma.papers.findMany({
        where: {
          IsMarkToDelete: false,
          PaperApprovals: {
            none: {
              Status: "Approved",
            },
          },
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
              Remarks: true,
              ApprovedDate: true,
            },
          },
          PaperGroups: {
            select: {
              UserId: true,
              UserType: true,
              Users: {
                select: {
                  Name: true,
                }
              }
            },
          },
        },
      });
      res.json({
        data: getPapers,
        message: "Success to get papers",
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
);

router.get(
  "/paper/getPaperApprovalByUserId",
  authenticate,
  async (_req: AuthenticatedRequest, res) => {
    try {
      const userRole = _req?.role;
      let paperApprovalGroup: any = {
        select: {
          UserId: true,
          UserType: true,
          Users: {
            select: {
              Name: true,
            }
          }
        },
      };

      if (
        userRole === GRPConfig.RoleName?.Student ||
        userRole === GRPConfig.RoleName?.Teacher
      ) {
        paperApprovalGroup = {
          where: {
            UserId: _req.userId || 0,
          },
          select: {
            UserId: true,
            UserType: true,
            Users: {
              select: {
                Name: true,
              }
            }
          },
        };
      }

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
          PaperGroups: paperApprovalGroup,
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
      const { Title, Abstract, Authors, Year, FileUrl } = req.body;
      const { CategoryId, SubcategoryId, DepartmentId, BatchId } = req.body;
      const { StudentIds, TeacherIds } = req.body;

      let userId = req.userId;

      // Start interactive transaction
      const result = await prisma.$transaction(async (tx: any) => {
        // 1. Create the paper
        const createPapers = await tx.papers.create({
          data: {
            Title,
            Abstract,
            Authors,
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
        message: "Successfully get papers",
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
        message: "Successfully update papers",
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
        message: "Successfully delete papers",
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
          IsMarkToDelete: false,
          PaperApprovals: {
            none: {
              Status: "Approved",
            },
          },
          PaperGroups: {
            some: {
              UserId: id,
            },
          },

        },
        orderBy: {
          Id: "desc", // or CreatedAt: "desc"
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
              Users: {
                select: {
                  Name: true,
                }
              }
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
        message: "Successfully get papers",
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
);

router.get(
  "/paper/getPapersById/:id",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const papers = await prisma.papers.findMany({
        where: {
          UserId: id,
          IsMarkToDelete: false,
        },
        orderBy: {
          Id: "desc", // or CreatedAt: "desc"
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
              Users: {
                select: {
                  Name: true,
                }
              }
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
        message: "Successfully get papers",
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
);


router.get(
  "/paper/getPapersByUserIdforProfile/:id",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);
      const papers = await prisma.papers.findMany({
        where: {
          IsMarkToDelete: false,
          PaperGroups: {
            some: {
              UserId: id,
            },
          },

        },
        orderBy: {
          Id: "desc", // or CreatedAt: "desc"
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
              Users: {
                select: {
                  Name: true,
                }
              }
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
        message: "Successfully get papers",
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
);

module.exports = router;
