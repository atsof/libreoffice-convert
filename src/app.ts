import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { convertToPDF } from "./convert";

const app = express();

const API_KEY = process.env.API_KEY || "dev-secret-key";

function apiKeyAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    const auth = req.headers.authorization;

    if (!auth || auth !== `Bearer ${API_KEY}`) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    next();
}

const UPLOAD_DIR = "uploads";

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

const upload = multer({
    dest: UPLOAD_DIR,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

app.post(
    "/convert",
    apiKeyAuth,
    upload.single("file"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }

            if (!req.file.originalname.endsWith(".docx")) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ error: "Only DOCX allowed" });
            }

            const inputPath = path.resolve(req.file.path);
            const outputDir = path.resolve(UPLOAD_DIR);

            const pdfPath = await convertToPDF(inputPath, outputDir);

            if (!fs.existsSync(pdfPath)) {
                return res.status(500).json({ error: "PDF generation failed" });
            }

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${path.basename(pdfPath)}"`
            );

            const stream = fs.createReadStream(pdfPath);
            stream.pipe(res);

            stream.on("close", () => {
                try {
                    fs.unlinkSync(inputPath);
                    fs.unlinkSync(pdfPath);
                } catch (err) {
                    console.error("Cleanup error:", err);
                }
            });

        } catch (err) {
            console.error("Conversion failed:", err);
            return res.status(500).json({ error: "Conversion failed" });
        }
    }
);

app.get("/ping", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(8090, "0.0.0.0", () =>
    console.log("Word2PDF running on port 8090")
);
