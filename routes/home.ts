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
            }),
            prisma.papers.findMany({
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
        })
        res.json({ data: journals, message: "Journals retrieved successfully" })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})


module.exports = router;