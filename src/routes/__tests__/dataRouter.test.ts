import request from "supertest";
import express from "express";
import router from "../data"; // Adjust path to your router file
import { findDataByRange } from "../../db/sqlite";
import { convertToTimestamp } from "../../utils/helpers";

// Mock dependencies
jest.mock("../../db/sqlite", () => ({
  findDataByRange: jest.fn(),
}));

jest.mock("../../utils/helpers", () => ({
  convertToTimestamp: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use("/", router);

describe("GET / (dataRouter)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 if startDate or endDate is missing", async () => {
    const response = await request(app)
      .get("/")
      .query({});
    expect(response.status).toBe(400);
    expect(response.text).toBe(
      "Please provide both startDate and endDate in the query parameters."
    );
  });

  test("should return data for valid startDate and endDate", async () => {
    // Mock helper and database functions
    (convertToTimestamp as jest.Mock)
      .mockImplementationOnce(() => 1622518800) // Mock startDate conversion
      .mockImplementationOnce(() => 1625100800); // Mock endDate conversion

    (findDataByRange as jest.Mock).mockResolvedValue([
      { id: 1, date: "2023-01-01", value: 100 },
    ]);

    const response = await request(app)
      .get("/")
      .query({ startDate: "2023-01-01", endDate: "2023-01-10" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 1, date: "2023-01-01", value: 100 }]);
    expect(findDataByRange).toHaveBeenCalledWith(1622518800, 1625100800);
  });

  test("should return 500 if findDataByRange throws an error", async () => {
    (convertToTimestamp as jest.Mock)
      .mockImplementationOnce(() => 1622518800) // Mock startDate conversion
      .mockImplementationOnce(() => 1625100800); // Mock endDate conversion;

    (findDataByRange as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const response = await request(app)
      .get("/")
      .query({ startDate: "2023-01-01", endDate: "2023-01-10" });

    expect(response.status).toBe(500);
    expect(response.text).toBe("Error fetching data.");
    expect(findDataByRange).toHaveBeenCalledWith(1622518800, 1625100800);
  });
});
