import express, { Request, Response } from "express";
import { db as DB } from "../db/sqlite";

// Basic conversion
const convertToTimestamp = (dateStr: string) => {
  // Split the date string into day, month, year
  const [day, month, year] = dateStr.split("/");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  // Get timestamp in milliseconds
  return date.getTime() / 1000;
};

const router = express.Router();

router.get("/", (req: Request, res: Response): any => {
  const { startDate, endDate } = req.query;

  const s = convertToTimestamp(startDate as string);
  const e = convertToTimestamp(endDate as string);

  console.info(
    `Calling data endpoint with params: ${startDate} and  ${endDate}`
  );

  if (!s || !e) {
    return res
      .status(400)
      .send(
        "Please provide both startDate and endDate in the query parameters."
      );
  }

  const query = `
    SELECT * 
    FROM air_quality_test
    WHERE date >= ${s} AND date <= ${e}
    ORDER BY DATETIME(date || ' ' || time)

  `;

  console.info(`The used SQLite query: ${query}`);

  DB.all(query, (err, rows) => {
    if (err) {
      console.error("Error fetching data by date range:", err.message);
      return res.status(500).send("Error fetching data.");
    }
    res.json(rows);
  });
});

export default router;
