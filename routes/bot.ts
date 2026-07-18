import { reviewPaper } from "../google-service";
import express from "express";

const router = express.Router();

router.post("/review", async (req, res) => {
    try {
        const result = await reviewPaper(req.body.fileUri as string);
        res.json({ data: JSON.parse(result as string) });
    } catch (error: any) {
        console.error("Error reviewing paper:", error);
        
        // Detect validation/bad document errors (from API or our pre-checks)
        const isClientError = 
            error.status === 400 || 
            error.message?.includes("document has no pages") ||
            error.message?.includes("INVALID_ARGUMENT") ||
            error.message?.includes("Failed to fetch file") ||
            error.message?.includes("Invalid file type") ||
            error.message?.includes("empty");
            
        if (isClientError) {
            res.status(400).json({ 
                error: "Invalid document: " + (error.message || "The document has no pages or could not be parsed as a valid PDF.") 
            });
            return;
        }
        
        res.status(500).json({ error: error.message || "An unexpected error occurred while reviewing the paper." });
    }
});

module.exports = router;