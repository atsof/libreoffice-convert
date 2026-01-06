import path from "path";
import { spawn } from "child_process";

export const convertToPDF = (inputPath: string, outputDir: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const proc = spawn("libreoffice", [
            "--headless",
            "--nologo",
            "--nofirststartwizard",
            "--convert-to", "pdf",
            "--outdir", outputDir,
            inputPath
        ]);

        proc.on("error", reject);

        proc.on("close", (code) => {
            if (code !== 0) {
                return reject(new Error(`LibreOffice exit code ${code}`));
            }

            const base = path.basename(inputPath);
            const pdfPath = path.join(outputDir, base + ".pdf");
            resolve(pdfPath);
        });
    });
};