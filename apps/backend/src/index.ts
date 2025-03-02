import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import { Prompt } from "@repo/common";
import { SystemPrompt } from "./prompts";

dotenv.config();
const app = express();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

app.use(express.json());

app.post("/template", async (req, res) => {
  try {
    const parsedBody = Prompt.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(400).json({ error: "Invalid Prompt" });
      return;
    }

    const { prompt } = parsedBody.data;

    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You have to give project type for the user prompt by default if possible in NextJS. Example., User: Create me tic tac toe app. YOU: NextJS. User: Create a full-stack app with express. You: Node. Just give me the project name that is either Node or NextJS nothing more. User asked: ${prompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 8192,
      },
    });

    res.status(200).json({ msg: response.response.text() });
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: "Something went wrong" });
    return;
  }
});

app.listen(3000, () => console.log("Server started on PORT: 3000"));
