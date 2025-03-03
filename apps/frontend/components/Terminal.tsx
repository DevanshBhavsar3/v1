import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import React, { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import "@xterm/xterm/css/xterm.css";

const fitAddon = new FitAddon();
const OPTIONS_TERM = {
  useStyle: true,
  screenKeys: true,
  cursorBlink: true,
  cols: 200,
  fontSize: 16,
  theme: {
    background: "black"
  },
};

export default function TerminalComponent({ socket }: { socket: Socket }) {
  const terminalRef = useRef<null | HTMLElement>(null);
  const didInit = useRef<boolean>(false);

  useEffect(() => {
    // Return if terminal is already rendered or the ref is not set 
    if (didInit.current) return;
    if (!terminalRef.current) return;

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

    // TODO: Add Cleanup Logic
  }, [terminalRef]);

  return <div ref={terminalRef as React.RefObject<HTMLDivElement>}></div>;
}
