import { z } from "zod";

export const FeedbackRequestBodySchema = z.object({
    turnstileToken: z.string().min(1),
    feedback: z.enum(['up', 'down']),
    inputText: z.string().optional(),
    route: z.string(),
})
export type FeedbackRequestBody = z.infer<typeof FeedbackRequestBodySchema>

export interface Logs {
    timestamp: Date;
    message: string;
    level: 'info' | 'error';
}