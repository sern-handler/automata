export interface FeedbackRequestBody {
    turnstileToken?: string;
    feedback: 'up' | 'down';
    inputText?: string;
    route: string;
}

// https://discord.com/developers/docs/resources/user#get-current-user-guilds-example-partial-guild
export interface DiscordGuilds {
    id: string;
    name: string;
    icon: string;
    owner: boolean;
    permissions: number;
    permissions_new: string;
    features: string[];
    approximate_member_count?: number;
    approximate_presence_count?: number;
}