import express from "express";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { TerminalManager } from "./utils/terminalManager";
import { ExplorerManager } from "./utils/explorerManager";

const terminalManager = new TerminalManager();
const explorerManager = new ExplorerManager();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  const host = socket.handshake.headers.host;
  const sessionId = host?.split(".")[0];

  if (!sessionId) {
    socket.disconnect();
    terminalManager.exit(socket.id);
    return;
  }

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
    terminalManager.createTerminal(socket.id, sessionId, (data) => {
      socket.emit("terminalData", { data: Buffer.from(data, "utf-8") });
    });
  });

  socket.on("writeTerminal", ({ data }) => {
    terminalManager.write(socket.id, data);
  });
});

server.listen(8080, () => console.log("Server started on PORT: 8080"));
