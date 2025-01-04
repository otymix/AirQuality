import express, { Request, Response } from "express";
import { db as DB } from "../db/sqlite";

const router = express.Router();

router.get("/:parameter", (req: Request, res: Response): any => {
  const { parameter } = req.params;
  console.info(`Calling timeseries endpoint with param: ${parameter}`);
  if (!parameter) {
    return res.status(400).json({ error: "Parameter is required" });
  }

  // Validate parameter against valid columns
  const validColumns = [
    "co",
    "nmhc",
    "benzene",
    "nox",
    "no2",
    "pt08_s1_co",
    "pt08_s2_nmhc",
    "pt08_s3_nox",
    "pt08_s4_no2",
    "pt08_s5_o3",
    "temperature",
    "relative_humidity",
    "absolute_humidity",
  ];
  if (!validColumns.includes(parameter)) {
    return res
      .status(400)
      .send(
        `Invalid parameter. Valid parameters are: ${validColumns.join(", ")}`
      );
  }

  const query = `SELECT date, time, ${parameter} FROM air_quality_test ORDER BY DATETIME(date || ' ' || time)`;

  DB.all(query, (err, rows) => {
    if (err) {
      console.error("Error fetching time series data:", err.message);
      return res.status(500).send("Error fetching data.");
    }
    res.json(rows);
  });
});

export default router; // Export the router
