import { google } from "googleapis";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const credentials = JSON.parse(
  fs.readFileSync("task-453209-f3d170414f75.json")
);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

async function saveToGoogleSheet(data) {
  const sheets = google.sheets({ version: "v4", auth });

  const values = data.map((item) => [
    item.firstName,
    item.lastName,
    item.email,
    item.phone,
    item.plan,
    item.premium_amount,
    item.start_policy_date,
    item.end_policy_date,
  ]);

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A2",
      valueInputOption: "RAW",
      requestBody: { values },
    });

    console.log("Data saved successfully!");
  } catch (error) {
    console.error("Error saving data to Google Sheet:", error);
  }
}

const exampleData = [
  {
    firstName:"idan",
    lastName: "Drrrrr",
    email: "david@gmail.com",
    phone: "08012345678",
    plan: "God",
    premium_amount: 50000,
    start_policy_date: "2025-01-01",
    end_policy_date: "2026-01-01",
  },
];

async function getDataFromGoogleSheet() {
  try {
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1",
    });

    console.log("API Response:", response.data);
    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.log("No data found.");
      return [];
    }

    const headers = rows[0];
    const data = rows.slice(1).map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || null;
      });
      return obj;
    });

    return data;
  } catch (error) {
    console.error("Error fetching data from Google Sheet:", error);
    throw error;
  }
}

async function main() {
  try {
    await saveToGoogleSheet(exampleData);

    const data = await getDataFromGoogleSheet();
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main();
