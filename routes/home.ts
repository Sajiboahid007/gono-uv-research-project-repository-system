import express from "express";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();
const router = express.Router();

router.get('/home/get', async (_req, res) => {
    try {
        const [journals, papers] = await Promise.all([
            prisma.journals.findMany({
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
            }),
            prisma.papers.findMany({
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
            })
        ])
        res.json({ data: { journals, papers }, message: "Home data retrieved successfully" })

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
})

router.get("/home/papers/get", async (_req, res) => {
    try {
        const papers = await prisma.papers.findMany({
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
        })
        res.json({ data: papers, message: "Papers retrieved successfully" })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

router.get('/home/journal/get', async (_req, res) => {
    try {
        const journals = await prisma.journals.findMany({
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
        })
        res.json({ data: journals, message: "Journals retrieved successfully" })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

router.get('/home/category/get', async (_, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: {
                IsMarkToDelete: false,
            },
            orderBy: {
                Id: "desc",
            },
        })
        res.json({ data: categories, message: "Categories retrieved successfully" })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

router.get('/home/subcategory/get', async (_, res) => {
    try {
        const subCategories = await prisma.subCategory.findMany({
            where: {
                IsMarkToDelete: false,
            },
            orderBy: {
                Id: "desc",
            },
        })
        res.json({ data: subCategories, message: "Sub Categories retrieved successfully" })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

router.get('/home/department/get', async (_req, res) => {
    try {
        const departments = await prisma.department.findMany({
            where: {
                IsMarkToDelete: false,
            },
            orderBy: {
                Id: "desc",
            },
        })
        res.json({ data: departments, message: "Departments retrieved successfully" })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})


router.get("/author/get/all", async (_req, res) => {
    try {
        const users = await prisma.users.findMany({
            where: {
                IsMarkToDelete: false,
                Roles: {
                    is: {
                        Name: {
                            in: ["Teacher", "Admin", "SuperAdmin"]
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
            ...new Set(users.map((u: any) => u.Name).filter(Boolean)),
        ];

        res.json({
            data: distinctAuthors,
            message: "Authors retrieved successfully",
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});


router.get(
    "/paper/getPapersBynewId/:id",
    async (req, res) => {
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