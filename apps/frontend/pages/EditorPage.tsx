import React, { useEffect } from "react";
import TerminalComponent from "../components/Terminal.tsx";
import Explorer from "../components/Explorer.tsx";
import Editor from "../components/Editor.tsx";
import Chat from "../components/Chat.tsx";
import { io } from "socket.io-client";
import { useSocket } from "../store/useSocket.ts";

export default function EditorPage() {
  const setSocketState = useSocket((state) => state.setSocket);

  useEffect(() => {
    const socket = io("ws://localhost:8080");
    setSocketState(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="w-full h-screen flex">
      <Chat />
      <div className="w-2/3 h-full">
        <div className="h-2/3 w-full flex overflow-auto">
          <Explorer />
          <Editor />
        </div>
        <TerminalComponent />
      </div>
    </div>
  );
}
