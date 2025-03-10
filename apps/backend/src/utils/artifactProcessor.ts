import fs from "fs";
import { WORK_DIR } from "@repo/common";

export class ArtifactProcessor {
  public response: string = "";
  private buffer: string = "";
  private onCommand: (command: string) => void;
  private onFileUpdate: (content: string, path: string) => void;

  constructor(
    onCommand: (command: string) => void,
    onFileUpdate: (content: string, path: string) => void
  ) {
    this.onCommand = onCommand;
    this.onFileUpdate = onFileUpdate;
  }

  append(chunk: string) {
    this.response += chunk;
    this.buffer += chunk;

    fs.appendFile(__dirname + "/../../tmp/response.txt", chunk, (err) =>
      console.error(err)
    );

    this.parseBuffer();
  }

  parseBuffer() {
    this.processShellCommands();
    this.processArtifact();
  }

  processShellCommands() {
    // Check for complete ShellCommand tags
    const shellStartIdx = this.buffer.indexOf("<ShellCommand>");
    const shellEndIdx = this.buffer.indexOf("</ShellCommand>");

    if (
      shellStartIdx !== -1 &&
      shellEndIdx !== -1 &&
      shellEndIdx > shellStartIdx
    ) {
      // We have a complete shell command
      const commandContent = this.buffer
        .substring(shellStartIdx + "<ShellCommand>".length, shellEndIdx)
        .trim();

      if (commandContent) {
        this.onCommand(commandContent + "\n");
      }

      // Remove the processed command from buffer
      this.buffer = this.buffer.substring(
        shellEndIdx + "</ShellCommand>".length
      );

      // Continue parsing in case there are more complete tags
      this.parseBuffer();
    }
  }

  processArtifact() {
    const artifactStartRegex = /<Artifact type="([^"]+)" path="([^"]+)">/;
    const artifactStartMatch = this.buffer.match(artifactStartRegex);
    const artifactEndIdx = this.buffer.indexOf("</Artifact>");

    if (artifactStartMatch && artifactEndIdx !== -1) {
      const startIdx = artifactStartMatch.index || 0;
      const endOfStartTag = startIdx + artifactStartMatch[0].length;

      if (artifactEndIdx > endOfStartTag) {
        const artifactPath = artifactStartMatch[2];
        const artifactContent = this.buffer
          .substring(endOfStartTag, artifactEndIdx)
          .trim();

        if (artifactPath) {
          this.onFileUpdate(artifactContent, WORK_DIR + "/" + artifactPath);
        }

        // Remove the processed artifact from buffer
        this.buffer = this.buffer.substring(
          artifactEndIdx + "</Artifact>".length
        );

        // Continue parsing in case there are more complete tags
        this.parseBuffer();
      }
    }
  }
}
