import * as z from "zod";

export const Prompt = z.object({
  prompt: z.string(),
});

export const EditPrompt = z.object({
  prompt: z.string(),
  context: z.string(),
});

export const SignUpSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().email(),
});

export const LogInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const WORK_DIR_NAME = "project";
export const WORK_DIR = `/home/devansh/CodePlayground/${WORK_DIR_NAME}`;
