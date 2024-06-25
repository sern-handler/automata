import { octokit } from "../index.js";

export async function react(owner: string, repo: string, commentId: number, reaction: Reaction) {
    return octokit.request('POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions', {
      owner,
      repo,
      comment_id: commentId,
      content: reaction,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
}
  
export enum Reaction {
    PLUS_ONE = '+1',
    MINUS_ONE = '-1',
    LAUGH = 'laugh',
    CONFUSED = 'confused',
    HEART = 'heart',
    HOORAY = 'hooray',
    ROCKET = 'rocket',
    EYES = 'eyes',
}