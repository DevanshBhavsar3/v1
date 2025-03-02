import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();
console.log(process.env);
const app = express();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

app.get("/", async (req, res) => {
  const response = await model.generateContent("Hi");

  res.json({ msg: response.response.text() });
});

app.listen(3000, () => console.log("Server started on PORT: 3000"));
