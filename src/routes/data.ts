import express, { Request, Response } from "express";
import { findDataByRange } from "../db/sqlite";
import { convertToTimestamp } from "../utils/helpers";

const router = express.Router();

router.get(
  "/",
  async (req: Request, res: Response): Promise<any> => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .send(
          "Please provide both startDate and endDate in the query parameters."
        );
    }
    const s = convertToTimestamp(startDate as string);
    const e = convertToTimestamp(endDate as string);

    console.info(
      `Calling data endpoint with params: ${startDate} and  ${endDate}`
    );

    try {
      const rows = await findDataByRange(s, e);
      res.json(rows);
    } catch (error) {
      console.error("Error fetching data by date range:", error);
      return res.status(500).send("Error fetching data.");
    }
  }
);

export default router;
