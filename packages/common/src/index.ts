import * as z from "zod";

export const Prompt = z.object({
  prompt: z.string(),
});

export const WORK_DIR_NAME = "project";
export const WORK_DIR = `/home/devansh/CodePlayground/${WORK_DIR_NAME}`;
