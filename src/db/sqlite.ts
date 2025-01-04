import sqlite3 from "sqlite3";

export const db = new sqlite3.Database("./air_quality_test.db", (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

// Create Table for Air Quality Data
db.run(
  `
  CREATE TABLE IF NOT EXISTS air_quality_test (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    time TEXT,
    co REAL,
    pt08_s1_co REAL,
    nmhc REAL,
    benzene REAL,
    pt08_s2_nmhc REAL,
    nox REAL,
    pt08_s3_nox REAL,
    no2 REAL,
    pt08_s4_no2 REAL,
    pt08_s5_o3 REAL,
    temperature REAL,
    relative_humidity REAL,
    absolute_humidity REAL
  )
  `,
  (err) => {
    if (err) {
      console.error("Error creating table:", err.message);
    } else {
      console.log("Table 'air_quality_test' is ready.");
    }
  }
);
