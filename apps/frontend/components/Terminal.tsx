import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import React, { useEffect, useRef } from "react";
import "@xterm/xterm/css/xterm.css";
import { useSocket } from "../store/useSocket.ts";

const fitAddon = new FitAddon();
const OPTIONS_TERM = {
  useStyle: true,
  screenKeys: true,
  cursorBlink: true,
  cols: 200,
  fontSize: 16,
  theme: {
    background: "black",
  },
};

export default function TerminalComponent() {
  const socket = useSocket((state) => state.socket);

  const terminalRef = useRef<null | HTMLElement>(null);
  const didInit = useRef<boolean>(false);

  useEffect(() => {
    // Return if terminal is already rendered or the ref is not set
    if (didInit.current || !terminalRef.current || !socket) return;

    // Create terminal on the server
    socket.emit("createTerminal");

    // Create terminal on client
    const terminal = new Terminal(OPTIONS_TERM);
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);
    fitAddon.fit();

    // Catch events from server and display it on client terminal
    socket.on("terminalData", ({ data }: { data: ArrayBuffer }) => {
      const decoder = new TextDecoder();
      const command = decoder.decode(new Uint8Array(data));
      terminal.write(command);
    });

    // Send text written in terminal to server
    terminal.onData((data) => {
      socket.emit("writeTerminal", { data });
    });

    didInit.current = true;

    return () => {
      terminal.clear();
    };
  }, [terminalRef, socket]);

  return (
    <div
      ref={terminalRef as React.RefObject<HTMLDivElement>}
      className="h-1/3"
    ></div>
  );
}
