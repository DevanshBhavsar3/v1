import fs from "fs";

export class ArtifactProcessor {
  public chunks: string = "";
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
    this.chunks += chunk;
    fs.appendFile(__dirname + "/../../tmp/response.txt", chunk, (err) =>
      console.error(err)
    );

    if (chunk.includes("<Artifact")) {
      const tag = chunk.match(/<Artifact type="([^"]+)" path="([^"]+)">/);

      if (tag) {
        const path = tag[2];

        console.log("PATH", path);

        this.latestArtifact += chunk.split(tag[0])[1];
      }
    } else if (chunk.includes("</Artifact>")) {
      this.latestArtifact += chunk.split("</Artifact>")[0];
      console.log("latest", this.latestArtifact);
      this.latestArtifact = "";
    } else {
      if (this.latestArtifact) {
        this.latestArtifact += chunk;
      }
    }
  }
}
