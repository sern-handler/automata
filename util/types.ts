export interface FeedbackRequestBody {
    turnstileToken?: string;
    feedback: 'up' | 'down';
    inputText?: string;
    route: string;
}
