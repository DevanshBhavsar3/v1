import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import cors from "cors";
import { Prompt } from "@repo/common";
import { SYSTEM_PROMPT } from "./prompts";
import { ArtifactProcessor } from "./utils/artifactProcessor";
import { TerminalManager } from "./utils/terminalManager";

dotenv.config();
const app = express();

const terminalManager = new TerminalManager();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: SYSTEM_PROMPT,
});

app.use(express.json());
app.use(cors());

// app.post("/template", async (req, res) => {
//   try {
//     const parsedBody = Prompt.safeParse(req.body);

//     if (!parsedBody.success) {
//       res.status(400).json({ error: "Invalid Prompt" });
//       return;
//     }

//     const { prompt } = parsedBody.data;

//     const response = await model.generateContent({
//       contents: [
//         {
//           role: "user",
//           parts: [
//             {
//               text: `You have to give project type for the user prompt by default if possible in NextJS. Example., User: Create me tic tac toe app. YOU: NextJS. User: Create a full-stack app with express. You: Node. Just give me the project name that is either Node or NextJS nothing more. User asked: ${prompt}`,
//             },
//           ],
//         },
//       ],
//       generationConfig: {
//         maxOutputTokens: 8192,
//       },
//     });

//     res.status(200).json({ msg: response.response.text() });
//   } catch (e) {
//     console.log(e);
//     res.status(400).json({ error: "Something went wrong." });
//     return;
//   }
// });

app.post("/prompt", async (req, res) => {
  try {
    const parsedBody = Prompt.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(400).json({ error: "Invalid Prompt" });
      return;
    }

    const { prompt } = parsedBody.data;

    const parser = new ArtifactProcessor(
      (command: string) => {
        // terminalManager.write(1, command);
      },
      (content: string) => console.log(content)
    );
    const response = await model.generateContentStream(prompt);

    for await (const chunk of response.stream) {
      const chunkText = chunk.text();
      parser.append(chunkText);
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: "Something went wrong." });
    return;
  }
});

app.listen(3000, () => console.log("Server started on PORT: 3000"));
