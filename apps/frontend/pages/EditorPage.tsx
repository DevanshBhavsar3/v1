import { useEffect } from "react"
import TerminalComponent from "../components/Terminal.tsx"
import Explorer from "../components/Explorer.tsx"
import Editor from "../components/Editor.tsx"
import { io } from "socket.io-client"
import { useSocket } from "../store/useSocket.ts"

export default function EditorPage() {
  const setSocketState = useSocket((state) => state.setSocket)

  useEffect(() => {
    const socket = io("ws://localhost:8080")
    setSocketState(socket)

    return () => {
      socket.disconnect()
    }
  }, [])

  return <div style={{ width: "100vw", height: "100vh" }}>
    <div style={{ display: "flex" }}>
      <Explorer />
      <Editor />
    </div>
    <TerminalComponent />
  </div>
}
