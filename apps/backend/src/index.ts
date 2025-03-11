import { GoogleGenerativeAI } from "@google/generative-ai";
import { EditPrompt } from "@repo/common";
import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { EDIT_PROMPT, SYSTEM_PROMPT } from "./prompts";
import { ArtifactProcessor } from "./utils/artifactProcessor";
import { ExplorerManager } from "./utils/explorerManager";
import { TerminalManager } from "./utils/terminalManager";
import * as dotenv from "dotenv";

dotenv.config();

const systemPrompt = SYSTEM_PROMPT("NEXTJS");
const terminalManager = new TerminalManager();
const explorerManager = new ExplorerManager();
const app = express();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  // check for the project type
  systemInstruction: systemPrompt,
});

app.use(express.json());
app.use(cors());

app.post("/prompt", async (req, res) => {
  try {
    const parsedBody = EditPrompt.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(400).json({ error: "Invalid Prompt" });
      return;
    }

    const { prompt, context } = parsedBody.data;
    terminalManager.createTerminal((data) => {});

    const parser = new ArtifactProcessor(
      (command: string) => {
        terminalManager.write(command);
      },
      (content: string, path: string) => {
        explorerManager.writeContent({ path, content });
      }
    );

    const editPrompt = EDIT_PROMPT(prompt, context);
    const response = await model.generateContent(editPrompt);
    parser.append(response.response.text());

    res.json({ msg: "Generation Successfull." });
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: "Something went wrong." });
    return;
  }
});

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // const host = socket.handshake.headers.host;
  // const sessionId = "1"; // host?.split(".")[0];

  // if (!sessionId) {
  //   socket.disconnect();
  //   // terminalManager.exit(socket.id);
  //   terminalManager.exit();
  //   return;
  // }

  socket.on("getFiles", (path, callback) => {
    explorerManager.watchFiles(path, () => {
      explorerManager.getFiles(path, (files) => {
        socket.emit("updateFiles", { path, files });
      });
    });

    explorerManager.getFiles(path, callback);
  });

  socket.on("getContent", (path, callback) => {
    explorerManager.watchFiles(path, () => {
      explorerManager.getContent(path, (data) => {
        socket.emit("updateContent", { path, data });
      });
    });

    explorerManager.getContent(path, callback);
  });

  socket.on("writeContent", (file, callback) => {
    explorerManager.writeContent(file, callback);
  });

  socket.on("createTerminal", () => {
    // terminalManager.createTerminal(socket.id, sessionId, (data) => {
    terminalManager.createTerminal((data) => {
      socket.emit("terminalData", { data: Buffer.from(data, "utf-8") });
    });
  });

  socket.on("writeTerminal", ({ data }) => {
    // terminalManager.write(socket.id, data);
    terminalManager.write(data);
  });
});

server.listen(8080, () => console.log("Server started on PORT: 8080"));
