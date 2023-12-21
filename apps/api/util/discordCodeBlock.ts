// definitely not stolen from discord.js :clueless:
export function codeBlock(language: string, content?: string): string {
	return content === undefined ? `\`\`\`\n${language}\n\`\`\`` : `\`\`\`${language}\n${content}\n\`\`\``;
}