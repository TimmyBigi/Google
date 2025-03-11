import { google } from "googleapis";
import fs from "fs";
import dotenv from "dotenv";
import userSchema from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const credentials = JSON.parse(
  fs.readFileSync("task-453209-f3d170414f75.json")
);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});


function validateUserInput(data) {
  const { error, value } = userSchema.validate(data, { abortEarly: false });

  if (error) {
    console.error(
      "Validation errors:",
      error.details.map((err) => err.message).join(", ")
    );
    throw new Error("Invalid user input");
  }

  return value;
}


async function saveToGoogleSheet(userData) {
  const sheets = google.sheets({ version: "v4", auth });

  const values = [
    userData.firstName,
    userData.lastName,
    userData.email,
    userData.password, 
    userData.phone,
    userData.plan,
    userData.premium_amount,
    new Date(userData.start_policy_date).toISOString().split("T")[0], 
    new Date(userData.end_policy_date).toISOString().split("T")[0],
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A2",
      valueInputOption: "RAW",
      requestBody: { values: [values] },
    });

    console.log("Data saved successfully!");
  } catch (error) {
    console.error("Error saving data to Google Sheet:", error);
    throw error;
  }
}

async function findUserByEmail(email) {
  const sheets = google.sheets({ version: "v4", auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A2:I",
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return null;
    }

    for (const row of rows) {
      if (row[2] === email) {
        return {
          firstName: row[0],
          lastName: row[1],
          email: row[2],
          password: row[3],
          phone: row[4],
          plan: row[5],
          premium_amount: row[6],
          start_policy_date: row[7],
          end_policy_date: row[8],
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw error;
  }
}

export const signup = async (req, res) => {
    try {
      console.log("Incoming request body:", req.body);
  
      const { firstName, lastName, email, password, phone, plan, premium_amount, start_policy_date, end_policy_date } = req.body;
  
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const validatedData = validateUserInput({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        plan,
        premium_amount,
        start_policy_date,  
        end_policy_date,
      });
  
      await saveToGoogleSheet(validatedData);
  
      res.status(200).json({
        message: "User data saved successfully!",
        user: {
          ...validatedData,
          start_policy_date: new Date(validatedData.start_policy_date)
      .toISOString()
      .split("T")[0], 
    end_policy_date: new Date(validatedData.end_policy_date)
      .toISOString()
      .split("T")[0],
        },
      });
    } catch (error) {
      console.error("Error in signup:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const payload = {
        id: user._id,
        email: user.email,
      };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ message: "Login successful!", token });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
