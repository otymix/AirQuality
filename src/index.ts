import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import ingestRoutes from "./routes/ingest";
import timeseriesRoutes from "./routes/timeseries";
import dataRoutes from "./routes/data";
const cors = require("cors");

const app = express();
const PORT = 3000;
// Enable CORS
app.use(cors());

app.use(express.static(__dirname + "/public"));

// Middleware
app.use(bodyParser.json());

// Health Check Route
app.get("/", (req: Request, res: Response) => {
  console.log(" Main point");
  res.sendFile(__dirname + "/public/index.html");
});

// Use the ingest router
app.use("/api/ingest", ingestRoutes);

// Fetch time series data for a specific parameter
app.use("/api/timeseries/", timeseriesRoutes);

// Fetch data for a specific range
app.use("/api/data/", dataRoutes);

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
