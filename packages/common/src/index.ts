import * as z from "zod";

export const Prompt = z.object({
  prompt: z.string(),
});
