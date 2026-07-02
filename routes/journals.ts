import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../authenticate";
import { AuthenticatedRequest } from "../interface";
import { GRPConfig } from "../GRPConfig";

const prisma = new PrismaClient();
const router = express.Router();

router.get('/journal/get', authenticate, async (_req: AuthenticatedRequest, res) => {
    try {
        const journals = await prisma.journals.findMany({
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
                Users: {
                    select: {
                        Name: true,
                    },
                },
                PaperApprovals: {
                    select: {
                        Status: true,
                        Remarks: true
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
        res.json({ data: journals, message: "Journals retrieved successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
})

router.get('/journal/getTotal', async (_req: AuthenticatedRequest, res) => {
    try {
        const total = await prisma.journals.count({
            where: {
                IsMarkToDelete: false,
            },
        });
        res.json({ data: total, message: "Total journals retrieved successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
})

router.get('/keyword/get', authenticate, async (_req: AuthenticatedRequest, res) => {
    try {
        const journal = await prisma.journals.findMany({
            where: {
                IsMarkToDelete: false,
            },
            orderBy: {
                Id: "desc",
            },
            select: {
                Keywords: true,
            },
        });
        const distinctKeywords = [...new Set(journal.map(j => j.Keywords).filter(Boolean))];
        res.json({ data: distinctKeywords, message: "Keywords retrieved successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
})

router.get("/author/get", authenticate, async (_req: AuthenticatedRequest, res) => {
    try {
        const users = await prisma.users.findMany({
            where: {
                IsMarkToDelete: false,
                Roles: {
                    is: {
                        Name: {
                            in: ["Teacher", "Admin", "Super-Admin"]
                        }
                    }
                },
            },
            orderBy: {
                Name: "asc",
            },
            select: {
                Name: true,
                ImageUrl: true,
            },
        });

        const distinctAuthors = [
            ...new Set(users.map((u) => u.Name).filter(Boolean)),
        ];

        res.json({
            data: distinctAuthors,
            message: "Authors retrieved successfully",
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/journal/getById/:id', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        const id = Number(req.params.id);
        const journal = await prisma.journals.findUnique({
            where: {
                Id: id,
                IsMarkToDelete: false
            },
        });

        res.json({ data: journal, message: "Journal retrieved successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
})

router.get(
    "/journal/getByUserId/:id",
    authenticate,
    async (req: AuthenticatedRequest, res) => {
        try {
            const id = Number(req.params.id);
            const journals = await prisma.journals.findMany({
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
                    Users: {
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
                data: journals,
                message: "Successfully get journals",
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
);

router.post(
    "/journal/create",
    authenticate,
    async (req: AuthenticatedRequest, res) => {
        try {
            const {
                Title,
                Abstract,
                CategoryId,
                SubcategoryId,
                Name,
                Affiliation,
                Keywords,
                AuthorDeclaration,
                Volume,
                IssueNumber,
                DOI,
                Year,
                FileUrl,
            } = req.body;
            const TeacherIds = req.body.authorsIds || [];
            const userId = req.userId;

            const result = await prisma.$transaction(async (tx) => {
                // Create Journal
                const createJournal = await tx.journals.create({
                    data: {
                        Title,
                        Abstract,
                        UserId: Number(userId),
                        CategoryId: Number(CategoryId),
                        SubcategoryId: SubcategoryId ? Number(SubcategoryId) : null,
                        Name,
                        Affiliation,
                        Keywords,
                        AuthorDeclaration,
                        Volume,
                        IssueNumber,
                        DOI,
                        Year,
                        FileUrl,
                        CreatedBy: req.userEmail || "Unknown",
                    },
                });

                for (const teacher of TeacherIds) {
                    await tx.paperGroups.create({
                        data: {
                            JournalId: createJournal.Id,
                            UserId: Number(teacher),
                            UserType: GRPConfig.RoleName.Teacher,
                            CreatedBy: req.userEmail || "Unknown",
                        },
                    });
                }

                // Create Journal Approval
                const journalApproval = await tx.paperApprovals.create({
                    data: {
                        JournalId: createJournal.Id,
                        Status: GRPConfig.ApprovalStatus.Draft,
                        CreatedBy: req.userEmail || "Unknown",
                    },
                });

                // Create Approval History
                await tx.paperApprovalHistories.create({
                    data: {
                        PaperApprovalId: journalApproval.Id,
                        JournalId: createJournal.Id,
                        Status: journalApproval.Status,
                        Remarks: "journal submission initialization",
                        ApprovedByUser: req.userEmail || "Unknown",
                        CreatedBy: req.userEmail || "Unknown",
                    },
                });

                return createJournal;
            });

            res.json({
                data: result,
                message: "Journal created successfully",
            });
        } catch (error) {
            res.status(500).json({
                error,
            });
        }
    }
);

router.put(
    "/journal/update/:id",
    authenticate,
    async (req: AuthenticatedRequest, res) => {
        try {
            const id = Number(req.params.id);
            const { Title, Abstract, CategoryId, SubcategoryId, Name, Authors, Affiliation, Keywords, AuthorDeclaration, Volume, IssueNumber, DOI, Year, FileUrl } = req.body;
            const result = await prisma.journals.update({
                where: {
                    Id: id,
                    IsMarkToDelete: false,
                },
                data: {
                    Title,
                    Abstract,
                    CategoryId: Number(CategoryId),
                    SubcategoryId: Number(SubcategoryId),
                    Name,
                    Authors,
                    Affiliation,
                    Keywords,
                    AuthorDeclaration,
                    Volume,
                    IssueNumber,
                    DOI,
                    Year,
                    FileUrl,
                    UpdatedBy: req.userEmail || "Unknown",
                },
            });
            res.json({
                data: result,
                message: "Journal updated successfully",
            });
        } catch (error) {
            res.status(500).json({
                error,
            });
        }
    }
)

router.put(
    "/journal/delete",
    authenticate,
    async (req: AuthenticatedRequest, res) => {
        try {
            const { Id } = req.body;
            const result = await prisma.journals.update({
                where: {
                    Id,
                    IsMarkToDelete: false,
                },
                data: {
                    IsMarkToDelete: true,
                    UpdatedBy: req.userEmail || "Unknown",
                },
            });
            res.json({
                data: result,
                message: "Journal deleted successfully",
            });
        } catch (error) {
            res.status(500).json({
                error,
            });
        }
    }
)

module.exports = router;
