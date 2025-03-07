// @ts-ignore
import { fork, IPty } from "node-pty";

interface terminal {
  terminal: IPty,
  sessionId: string
}

export class TerminalManager {
  private sessions: Record<string, terminal> = {};

  createTerminal(socketId: string, sessionId: string, onData: (data: string) => void) {
    const terminal = fork("bash", [], {
      name: "xterm",
      cols: 100,
      cwd: "/",
    });

    this.sessions[socketId] = { terminal, sessionId }

    // Add event to send commands to client
    terminal.onData((data: string) => onData(data))
  }

  write(socketId: string, command: string) {
    // Write commands to server's terminal
    this.sessions[socketId]?.terminal.write(command)
  }

  exit(socketId: string) {
    this.sessions[socketId]?.terminal.kill()
  }
}
