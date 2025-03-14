import { CopyObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ProjectType } from "../../types";

export class S3Manager {
  private client;

  constructor() {
    this.client = new S3Client({
      region: "ap-south-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESSKEY || "",
        secretAccessKey: process.env.S3_SECRETACESSKEY || "",
      },
    });
  }

  async copyTemplate(projectId: number, template: ProjectType) {
    try {
      const command = new CopyObjectCommand({
        Bucket: `user-codes/${projectId}`,
        CopySource: `templates/${template}`,
        Key: `${projectId}-${template}_template`,
      });

      const result = await this.client.send(command);
    } catch (e) {
      console.log(e);
      throw new Error("Template copy failed.");
    }
  }
}
