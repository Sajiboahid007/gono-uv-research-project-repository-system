import { reviewPaper } from "../google-service";
import express from "express";

const router = express.Router();

router.post("/review", async (req, res) => {
    try {
        const result = await reviewPaper(req.body.fileUri as string);
        res.json({ data: JSON.parse(result as string) });
    } catch (error: any) {
        console.error("Error reviewing paper:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;