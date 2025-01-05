// models/AirQualityModel.ts
import { Database } from "sqlite3";
import { AirQualityData, AirQualityDataNoId } from "../types/AirQuality";

export class AirQualityModel {
  private db: Database;
  private tableName: string = "air_quality_test";

  constructor(db: Database) {
    this.db = db;
  }

  private static schema: Record<keyof AirQualityDataNoId, string> = {
    date: "TEXT",
    time: "TEXT",
    co: "REAL",
    pt08_s1_co: "REAL",
    nmhc: "REAL",
    benzene: "REAL",
    pt08_s2_nmhc: "REAL",
    nox: "REAL",
    pt08_s3_nox: "REAL",
    no2: "REAL",
    pt08_s4_no2: "REAL",
    pt08_s5_o3: "REAL",
    temperature: "REAL",
    relative_humidity: "REAL",
    absolute_humidity: "REAL",
  };

  public async initialize(): Promise<void> {
    const schemaEntries = Object.entries(AirQualityModel.schema)
      .map(([column, type]) => `${column} ${type}`)
      .join(",\n    ");

    const query = `
            CREATE TABLE IF NOT EXISTS ${this.tableName} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ${schemaEntries}
            )
        `;

    return new Promise((resolve, reject) => {
      this.db.run(query, (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  public async insert(data: Omit<AirQualityData, "id">): Promise<number> {
    const columns = Object.keys(data).join(", ");
    const placeholders = Object.keys(data)
      .map(() => "?")
      .join(", ");
    const values = Object.values(data);

    const query = `
            INSERT INTO ${this.tableName} (${columns})
            VALUES (${placeholders})
        `;

    return new Promise((resolve, reject) => {
      this.db.run(query, values, function(err: Error | null) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  public async findAll(): Promise<AirQualityData[] | void> {
    return new Promise((resolve, reject) => {
      this.db.all<AirQualityData>(
        `SELECT * FROM ${this.tableName}`,
        (err: Error | null, rows: AirQualityData[]) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  public async findByDateRange(
    startDate: string,
    endDate: string
  ): Promise<AirQualityData[]> {
    const query = `
    SELECT * 
    FROM  ${this.tableName}
    WHERE date >= ${startDate} AND date <= ${endDate}
    ORDER BY DATETIME(date || ' ' || time)
  `;

    return new Promise((resolve, reject) => {
      this.db.all<AirQualityData>(
        query,
        (err: Error | null, rows: AirQualityData[]) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  public async findByField(parameter: string): Promise<AirQualityData[]> {
    const query = `SELECT date, time, ${parameter} FROM air_quality_test ORDER BY DATETIME(date || ' ' || time)`;

    return new Promise((resolve, reject) => {
      this.db.all<AirQualityData>(
        query,
        (err: Error | null, rows: AirQualityData[]) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
}
