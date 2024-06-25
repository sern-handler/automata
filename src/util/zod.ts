import { z } from "zod";

export const ZFeedbackSchema = z.object({
    turnstileToken: z.string(),
    feedback: z.union([z.literal('up'), z.literal('down')]),
    inputText: z.string(),
    route: z.string(),
})