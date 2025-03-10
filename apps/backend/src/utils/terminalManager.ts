import { WORK_DIR } from "@repo/common";
// @ts-ignore
import { fork, IPty } from "node-pty";

interface terminal {
  terminal: IPty;
  sessionId: string;
}

export class TerminalManager {
  private session: IPty | null = null;

  createTerminal(onData: (data: string) => void) {
    if (!this.session) {
      this.session = fork("bash", [], {
        name: "xterm",
        cols: 100,
        cwd: WORK_DIR,
      });
    }
    // Add event to send commands to client
    this.session!.onData((data: string) => onData(data));
  }

  write(command: string) {
    // Write commands to server's terminal
    // this.sessions[socketId]?.terminal.write(command);
    this.session!.write(command);
  }

  exit() {
    // this.sessions[socketId]?.terminal.kill();
    this.session!.kill();
  }
}
