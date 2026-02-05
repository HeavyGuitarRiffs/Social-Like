//validators\feedback.ts

import { z } from "zod";

export const feedbackSchema = z.object({
  email: z.string().email(),
  message: z.string().min(5),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
