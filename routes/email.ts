import express from "express";
import { GRPConfig } from "../GRPConfig";
const nodemailer = require("nodemailer");
const router = express.Router();


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
    auth: {
        user: GRPConfig.mailConfig.userEmail,
        pass: GRPConfig.mailConfig.userPass,
    },
});

router.post("/send-email", async (req, res) => {
    try {
        await transporter.sendMail({
            from: GRPConfig.mailConfig.userEmail,
            to: req.body.email,
            subject: req.body.subject,
            text: req.body.text,
            attachments: req.body.attachments,
        });
        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: "Failed to send email" });
    }
});

module.exports = router;