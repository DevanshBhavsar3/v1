import { GoogleGenerativeAI } from "@google/generative-ai";
import { EditPrompt, LogInSchema, Prompt, SignUpSchema } from "@repo/common";
import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { EDIT_PROMPT, SYSTEM_PROMPT } from "./prompts";
import { TerminalManager, ArtifactProcessor, ExplorerManager } from "./utils";
import * as dotenv from "dotenv";
import prisma from "@repo/db/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./auth";
import { JWT_SECRET } from "./config";
import { ProjectType } from "../types";

dotenv.config();

// TODO: Support multiple projects
const terminalManager = new TerminalManager();
terminalManager.createTerminal();
const explorerManager = new ExplorerManager();
const parser = new ArtifactProcessor(
  (command: string) => {
    terminalManager.write(command);
  },
  (content: string, path: string) => {
    explorerManager.writeContent({ path, content });
  }
);
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (origin.includes("localhost:5173")) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

async function getTemplate(prompt: string): Promise<ProjectType> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const response = await model.generateContent(
    `You are a template choose means the user will ask you to create something based on that you have to detetmine which project will it be. Like will it be NEXTJS or REACT_NATIVE or REACT. Remember you should only return the name of the project which should be strictly chosen from NEXTJS or REACT_NATIVE or REACT. If the user doesn't specify then default to NEXTJS.
    USER: ${prompt}`
  );

  const result = response.response.text().trim() as unknown as ProjectType;

  return result;
}

app.post("/signup", async (req, res) => {
  try {
    const parsedBody = SignUpSchema.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(400).json({ error: "Invalid Credentials." });
      return;
    }

    const { username, password } = parsedBody.data;
    const hashedPassword = await bcrypt.hash(password, 7);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.cookie("token", token, {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      domain: ".localhost",
    });

    res.json({ token });
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: "Something went wrong." });
    return;
  }
});

app.post("/login", async (req, res) => {
  try {
    const parsedBody = LogInSchema.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(400).json({ error: "Invalid Credentials." });
      return;
    }

    const { username, password } = parsedBody.data;

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      res.status(400).json({ error: "User doesn't exists." });
      return;
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
      res.status(400).json({ error: "Incorrect password." });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.cookie("token", token, {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      domain: ".localhost",
    });

    res.json({ token });
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: "Something went wrong." });
    return;
  }
});

app.use(authMiddleware);

app.post("/chat", async (req, res) => {
  const userId = req.userId || "";

  try {
    const parsedBody = Prompt.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(400).json({ error: "Invalid Prompt" });
      return;
    }

    const { prompt } = parsedBody.data;

    const template = await getTemplate(prompt);

    const project = await prisma.project.create({
      data: {
        userId,
        type: template,
      },
    });

    const systemPrompt = SYSTEM_PROMPT(template);
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt,
    });

    const response = await model.generateContent(prompt);
    parser.append(response.response.text());

    res.json(project);
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: "Something went wrong." });
    return;
  }
});

app.post("/edit", async (req, res) => {
  try {
    const parsedBody = EditPrompt.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(400).json({ error: "Invalid Prompt" });
      return;
    }

    const { projectId, prompt, context } = parsedBody.data;

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      res.status(400).json({ error: "No project found." });
      return;
    }

    const systemPrompt = SYSTEM_PROMPT(project.type);
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt,
    });

    const response = await model.generateContent(EDIT_PROMPT(prompt, context));
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
