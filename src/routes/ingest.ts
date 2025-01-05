import express, { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import { parse } from "fast-csv";
import { convertToTimestamp } from "../utils/helpers";
import { AirQualityData } from "../types/AirQuality";
import { insertSingleAirData } from "../db/sqlite";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/",
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    console.log(" /ingest hit...");
    const file = req.file;

    if (!file) {
      res.status(400).send("No file uploaded.");
      return;
    }

    const filePath = file.path;
    const airQualityData: AirQualityData[] = [];

    try {
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(parse({ headers: true, delimiter: ";" }))
          .on("error", (error) => {
            console.error("Error parsing CSV:", error.message);
            reject(new Error("Error parsing CSV file."));
          })
          .on("data", (row) => {
            try {
              const parsedRow: AirQualityData = {
                date: convertToTimestamp(row["Date"] as string),
                time: row["Time"].replace(".", ":"),
                co: parseFloat(row["CO(GT)"]?.replace(",", ".")),
                pt08_s1_co: parseFloat(row["PT08.S1(CO)"]?.replace(",", ".")),
                nmhc: parseFloat(row["NMHC(GT)"]?.replace(",", ".")),
                benzene: parseFloat(row["C6H6(GT)"]?.replace(",", ".")),
                pt08_s2_nmhc: parseFloat(
                  row["PT08.S2(NMHC)"]?.replace(",", ".")
                ),
                nox: parseFloat(row["NOx(GT)"]?.replace(",", ".")),
                pt08_s3_nox: parseFloat(row["PT08.S3(NOx)"]?.replace(",", ".")),
                no2: parseFloat(row["NO2(GT)"]?.replace(",", ".")),
                pt08_s4_no2: parseFloat(row["PT08.S4(NO2)"]?.replace(",", ".")),
                pt08_s5_o3: parseFloat(row["PT08.S5(O3)"]?.replace(",", ".")),
                temperature: parseFloat(row["T"]?.replace(",", ".")),
                relative_humidity: parseFloat(row["RH"]?.replace(",", ".")),
                absolute_humidity: parseFloat(row["AH"]?.replace(",", ".")),
              };
              airQualityData.push(parsedRow);
            } catch (err) {
              console.warn("Skipping invalid row:", row, err);
            }
          })
          .on("end", resolve);
      });

      const results = await Promise.all(
        airQualityData.map(async (record) => {
          try {
            await insertSingleAirData(record);
            return { success: true, record, error: null };
          } catch (err) {
            console.error("Error inserting record:", record, err);
            return { success: false, record, error: err };
          }
        })
      );

      const failedInserts = results.filter(
        (result) => result.success === false
      );
      const successCount = results.length - failedInserts.length;

      // Remove the uploaded file
      fs.unlinkSync(filePath);

      res.status(200).json({
        message: "CSV file processed.",
        successCount,
        failedInserts,
      });
    } catch (err) {
      console.error("Error processing file:", err);
      res.status(500).send("Failed to process CSV file.");
    }
  }
);

router.get("/", (req: Request, res: Response): void => {
  res.status(200).json({ message: "File received successfully!" });
});

export default router;
