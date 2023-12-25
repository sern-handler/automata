import { z } from "zod";

/* export interface FeedbackRequestBody {
    turnstileToken?: string;
    feedback: 'up' | 'down';
    inputText?: string;
    route: string;
} */
export const FeedbackRequestBodySchema = z.object({
    turnstileToken: z.string().min(1),
    feedback: z.enum(['up', 'down']),
    inputText: z.string().optional(),
    route: z.string(),
})
export type FeedbackRequestBody = z.infer<typeof FeedbackRequestBodySchema>
