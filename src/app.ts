import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { convertToPDF } from "./convert";

const app = express();

if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

const upload = multer({ dest: "uploads/" });

app.post("/convert", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const inputPath = path.resolve(req.file.path);
        const outputDir = path.resolve("uploads");

        const pdfPath = await convertToPDF(inputPath, outputDir);

        if (!fs.existsSync(pdfPath)) {
            console.error("PDF not found:", pdfPath);
            return res.status(500).json({ error: "PDF generation failed" });
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${path.basename(pdfPath)}"`
        );

        const fileStream = fs.createReadStream(pdfPath);
        fileStream.pipe(res);

        fileStream.on("close", () => {
            try {
                fs.unlinkSync(inputPath);
                fs.unlinkSync(pdfPath);
            } catch (cleanupErr) {
                console.error("Cleanup error:", cleanupErr);
            }
        });

    } catch (err) {
        console.error("Conversion failed:", err);
        return res.status(500).json({ error: "Conversion failed" });
    }
});

app.listen(8090, "0.0.0.0", () => console.log("Word2PDF running on port 8090"));