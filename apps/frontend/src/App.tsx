import { useEffect, useState } from "react"
import TerminalComponent from "../components/Terminal.tsx"
import { io, Socket } from "socket.io-client"

export default function App() {
  const [socket, setSocket] = useState<Socket>()

  useEffect(() => {
    const socket = io("ws://localhost:8080")
    setSocket(socket)

    return () => {
      socket.disconnect()
    }
  }, [])

  return <div style={{ width: "100vw", height: "100vh" }}>
    {socket ? <TerminalComponent socket={socket} /> : "Socket Loading..."}
  </div>
}
