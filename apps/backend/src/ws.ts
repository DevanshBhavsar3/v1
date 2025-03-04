import express from "express"
import { Server } from "socket.io"
import { createServer } from "node:http"
import { TerminalManager } from "./terminalManager"

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
