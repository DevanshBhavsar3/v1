import express from "express"
import { Server } from "socket.io"
import { createServer } from "node:http"
// @ts-ignore
import { fork, IPty } from "node-pty"

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST",]
  }
})
let terminal: IPty;

// Create terminal on connection
io.on("connection", (socket) => {
  socket.on("createTerminal", () => {
    terminal = fork("bash", [], {
      name: 'xterm',
      cols: 100,
      cwd: "/",
    })

    // Send serever's terminal results to client
    terminal.onData((data: string) => {
      socket.emit("terminalData", { data: Buffer.from(data, "utf-8") })
    })
  })

  // Write commands to server terminal 
  socket.on("writeTerminal", ({ data }) => {
    terminal.write(data)
  })

  // TODO: delete terminal here 
  // terminal.onExit(() => terminal = null)
})

server.listen(8080, () => console.log("Server started on PORT: 8080"))
