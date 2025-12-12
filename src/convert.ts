import { exec } from "child_process";
import path from "path";

export const convertToPDF = (inputPath: string, outputDir: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const cmd = `libreoffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;

        exec(cmd, (error, stdout, stderr) => {
            console.log("STDOUT:", stdout);
            console.log("STDERR:", stderr);

            if (error) {
                return reject(error);
            }

            const base = path.basename(inputPath);
            const pdfName = base + ".pdf";
            const pdfPath = path.join(outputDir, pdfName);

            resolve(pdfPath);
        });
    });
};