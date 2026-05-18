import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../authenticate";
import { AuthenticatedRequest } from "../interface";

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

router.get("/paper/getById/:id", authenticate, async (req: AuthenticatedRequest, res) => {
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
})

router.post("/paper/create", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { Title, Abstract, Year, FileUrl } = req.body;
    const { UserId, CategoryId, SubcategoryId, DepartmentId, BatchId, } = req.body;
    const createPapers = await prisma.papers.create({
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
        CreatedDate: new Date(),
        CreatedBy: req.userEmail || "Unknown",
      },
    });
    res.json({
      data: createPapers,
      message: "Paper created successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
})

router.get("/paper/getbycategoryId/:id", authenticate, async (req: AuthenticatedRequest, res) => {
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
})

router.get("/paper/getbySubcategoryId/:id", authenticate, async (req: AuthenticatedRequest, res) => {
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
})

router.get("/paper/getbyDepartmentId/:id", authenticate, async (req: AuthenticatedRequest, res) => {
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
})

router.get("/paper/getbyUserId/:id", authenticate, async (req: AuthenticatedRequest, res) => {
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
})

router.put("/paper/update/:id", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const id = Number(req.params.id);
    const { Title, Abstract, Year, FileUrl } = req.body;
    const { UserId, CategoryId, SubcategoryId, DepartmentId, BatchId, } = req.body;
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
})

router.put("/paper/delete/:id", authenticate, async (req: AuthenticatedRequest, res) => {
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
})

module.exports = router;