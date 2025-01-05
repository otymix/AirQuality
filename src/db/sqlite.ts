import sqlite3 from "sqlite3";

export const db = new sqlite3.Database("./air_quality_test.db", (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

// db/index.ts
import { Database } from "sqlite3";
import { AirQualityModel } from "../models/AirQualityModel";
import { AirQualityData } from "../types/AirQuality";

const deb = new Database("air_quality_test.db");
const airQualityModel = new AirQualityModel(deb);

async function initializeDatabase(): Promise<AirQualityModel> {
  try {
    await airQualityModel.initialize();
    console.log("Database initialized successfully");
    return airQualityModel;
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}

initializeDatabase();

export const findDataByRange = async (
  start: string,
  end: string
): Promise<AirQualityData[]> => {
  try {
    const result = await airQualityModel.findByDateRange(start, end);
    console.info("Database range searched successfully");
    return result;
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
};

export const insertSingleAirData = async (
  data: AirQualityData
): Promise<number> => {
  try {
    const result = await airQualityModel.insert(data);
    console.info(
      "Database inserting a single data successfully with id",
      result
    );
    return result;
  } catch (error) {
    console.error("Database inserting a single failed:", error);
    throw error;
  }
};

export const findDataByField = async (
  field: string
): Promise<AirQualityData[]> => {
  try {
    const result = await airQualityModel.findByField(field);
    console.info("Database search by field successfully");
    return result;
  } catch (error) {
    console.error("Database search by field failed:", error);
    throw error;
  }
};
