import express, { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import { db as DB } from "../db/sqlite";
import { parse } from "fast-csv";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary storage for uploaded files

// Basic conversion
const convertToTimestamp = (dateStr: string) => {
  // Split the date string into day, month, year
  const [day, month, year] = dateStr.split("/");
  // Create new Date (month is 0-based in JS, so subtract 1)
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  // Get timestamp in milliseconds
  return date.getTime() / 1000;
};

router.post(
  "/",
  upload.single("file"), // Only call once
  (req: Request, res: Response): any => {
    console.log(" /ingest hit...");
    const file = req.file;

    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    const filePath = file.path; // Use the path provided by multer directly
    const airQualityData: any[] = [];

    // Read and Parse the CSV File
    fs.createReadStream(filePath)
      .pipe(parse({ headers: true, delimiter: ";" }))
      .on("error", (error) => {
        console.error("Error parsing CSV:", error.message);
        res.status(500).send("Error parsing CSV file.");
      })
      .on("data", (row) => {
        const parsedRow = {
          date: convertToTimestamp(row["Date"]),
          time: row["Time"] ? row["Time"].replace(".", ":") : null, // Convert Time format
          co: parseFloat(row["CO(GT)"]?.replace(",", ".")) || null,
          pt08_s1_co: parseFloat(row["PT08.S1(CO)"]?.replace(",", ".")) || null,
          nmhc: parseFloat(row["NMHC(GT)"]?.replace(",", ".")) || null,
          benzene: parseFloat(row["C6H6(GT)"]?.replace(",", ".")) || null,
          pt08_s2_nmhc:
            parseFloat(row["PT08.S2(NMHC)"]?.replace(",", ".")) || null,
          nox: parseFloat(row["NOx(GT)"]?.replace(",", ".")) || null,
          pt08_s3_nox:
            parseFloat(row["PT08.S3(NOx)"]?.replace(",", ".")) || null,
          no2: parseFloat(row["NO2(GT)"]?.replace(",", ".")) || null,
          pt08_s4_no2:
            parseFloat(row["PT08.S4(NO2)"]?.replace(",", ".")) || null,
          pt08_s5_o3: parseFloat(row["PT08.S5(O3)"]?.replace(",", ".")) || null,
          temperature: parseFloat(row["T"]?.replace(",", ".")) || null,
          relative_humidity: parseFloat(row["RH"]?.replace(",", ".")) || null,
          absolute_humidity: parseFloat(row["AH"]?.replace(",", ".")) || null,
        };
        airQualityData.push(parsedRow);
      })
      .on("end", () => {
        // Insert Data into SQLite Database
        const insertStmt = DB.prepare(`
      INSERT INTO air_quality_test (
        date, time, co, pt08_s1_co, nmhc, benzene, pt08_s2_nmhc,
        nox, pt08_s3_nox, no2, pt08_s4_no2, pt08_s5_o3,
        temperature, relative_humidity, absolute_humidity
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        console.log({ airQualityData });
        airQualityData.forEach((record) => {
          insertStmt.run([
            record.date,
            record.time,
            record.co,
            record.pt08_s1_co,
            record.nmhc,
            record.benzene,
            record.pt08_s2_nmhc,
            record.nox,
            record.pt08_s3_nox,
            record.no2,
            record.pt08_s4_no2,
            record.pt08_s5_o3,
            record.temperature,
            record.relative_humidity,
            record.absolute_humidity,
          ]);
        });

        insertStmt.finalize();

        // Remove the uploaded file after processing
        fs.unlinkSync(filePath);

        res.status(200).send("CSV file processed and data saved successfully.");
      });
  }
);

router.get("/", (req: Request, res: Response): any => {
  res.status(200).json({ message: "File received successfully!" });
});

export default router;
