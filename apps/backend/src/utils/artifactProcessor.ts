import fs from "fs";
import { WORK_DIR } from "@repo/common";

export class ArtifactProcessor {
  public response: string = "";
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

    this.processArtifact();
  }

  processArtifact() {
    const artifactStartRegex =
      /<v1Action type="([^"]+)"( filePath="([^"]+)")?\s*>/;
    const artifactStartMatch = this.response.match(artifactStartRegex);
    const artifactEndIdx = this.response.indexOf("</v1Action>");

    if (artifactStartMatch && artifactEndIdx !== -1) {
      const startIdx = artifactStartMatch.index || 0;
      const endOfStartTag = startIdx + artifactStartMatch[0].length;

      if (artifactEndIdx > endOfStartTag) {
        const artifactType = artifactStartMatch[1];
        const artifactPath = artifactStartMatch[3];
        const artifactContent = this.response
          .substring(endOfStartTag, artifactEndIdx)
          .trim();

        if (artifactType === "shell") {
          this.onCommand(artifactContent + "\n");
        } else {
          if (artifactPath) {
            this.onFileUpdate(artifactContent, WORK_DIR + "/" + artifactPath);
          }
        }

        // Remove the processed artifact from response
        this.response = this.response.substring(
          artifactEndIdx + "</v1Action>".length
        );

        // Continue parsing in case there are more complete tags
        this.processArtifact();
      }
    }
  }
}
