import fs from "fs";

export class ArtifactProcessor {
  public response: string = "";
  private latestArtifact = "";
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

    fs.appendFile(__dirname + "/../../tmp/response.txt", chunk, (err) =>
      console.error(err)
    );

    this.parse(chunk);
  }

  parse(chunk: string) {
    // Look for shell commands
    const shellCommandRegex = /<ShellCommand>([\s\S]*?)<\/ShellCommand>/g;
    let shellMatch;
    while ((shellMatch = shellCommandRegex.exec(chunk)) !== null) {
      const commandContent = shellMatch[1]!.trim();
      if (commandContent) {
        this.onCommand(commandContent + "\n");
      }
    }

    // Look for artifacts with type and path attributes
    const artifactRegex =
      /<Artifact type="([^"]+)" path="([^"]+)">([\s\S]*?)<\/Artifact>/g;
    let artifactMatch;
    while ((artifactMatch = artifactRegex.exec(chunk)) !== null) {
      const artifactType = artifactMatch[1];
      const artifactPath = artifactMatch[2];
      const artifactContent = artifactMatch[3]!.trim();

      if (artifactType === "file" && artifactPath) {
        this.onFileUpdate(artifactContent, artifactPath);
      }

      // Store the latest artifact info if needed
      this.latestArtifact = artifactContent;
    }
  }
}
