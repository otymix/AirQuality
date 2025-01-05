import express, { Request, Response } from "express";
import { findDataByField } from "../db/sqlite";
import { isValidField, validFields } from "../utils/helpers";

const router = express.Router();

router.get(
  "/:parameter",
  async (req: Request, res: Response): Promise<any> => {
    const { parameter } = req.params;
    console.info(`Calling timeseries endpoint with param: ${parameter}`);
    if (!parameter) {
      return res.status(400).json({ error: "Parameter is required" });
    }

    // Validate parameter against valid columns

    if (!isValidField(parameter)) {
      return res
        .status(400)
        .send(
          `Invalid parameter. Valid parameters are: ${validFields.join(", ")}`
        );
    }

    try {
      const rows = await findDataByField(parameter);
      res.json(rows);
    } catch (error) {
      console.error("Error fetching data by date range:", error);
      return res.status(500).send("Error fetching data.");
    }
  }
);

export default router; // Export the router
