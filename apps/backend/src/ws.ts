import express from "express"
import { Server } from "socket.io"
import { createServer } from "node:http"
import { TerminalManager } from "./terminalManager"
import fs from "fs"

const BASE_DIR = "/home/devansh/CodePlayground"

const terminalManager = new TerminalManager()
const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST",]
  }
})

io.on("connection", (socket) => {
  const host = socket.handshake.headers.host
  const sessionId = host?.split(".")[0]

  if (!sessionId) {
    socket.disconnect()
    terminalManager.exit(socket.id)
    return;
  }

  socket.on("getFiles", (path, callback) => {
    fs.readdir(path, { withFileTypes: true }, (err, data) => {
      if (err) {
        console.error(err)
        return err;
      }

      const files = data.map(file => ({ type: file.isDirectory() ? "dir" : "file", path: `${path}/${file.name}`, name: file.name }))
      callback(files)
    })
  })

  socket.on("getContent", (path, callback) => {
    fs.readFile(path, "utf-8", (err, data) => {
      if (err) {
        console.error(err)
        return err;
      }

      callback(data)
    })
  })

  socket.on("createTerminal", () => {
    terminalManager.createTerminal(socket.id, sessionId, (data) => {
      socket.emit("terminalData", { data: Buffer.from(data, "utf-8") })
    })
  })

  socket.on("writeTerminal", ({ data }) => {
    terminalManager.write(socket.id, data)
  })
})

server.listen(8080, () => console.log("Server started on PORT: 8080"))
