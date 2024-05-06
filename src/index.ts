import { createClient } from '@libsql/client';
import { IssueCommentEvent } from '@octokit/webhooks-types';
import { drizzle } from 'drizzle-orm/libsql';
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { Octokit } from 'octokit';
import * as schema from './db/schema.js'
import 'dotenv/config'
import { and, eq } from 'drizzle-orm';
import validateJsonWebhook from './util/validateJsonWebhook.js';

const devTeam = [
  'SrIzan10',
  'jacoobes',
  'EvolutionX-10',
  'Murtatrxx'
]

const turso = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_TOKEN!,
})
const octokit = new Octokit({ auth: process.env.GH_API_TOKEN! });
const db = drizzle(turso, { schema })

const app = new Hono()

app.get('/', (c) => {
  return c.json({ message: 'Hello Hono!' })
})

app.post('/ev/readyToMerge', async (c) => {
  const validate = await validateJsonWebhook(c)
  if (!validate)
		return c.json({
			success: false,
			error: 'Invalid token'
		}, 401)
  const body = await c.req.json() as IssueCommentEvent

  if (!devTeam.includes(body.comment.user.login)) {
    return c.json({ ok: false, message: 'not part of devteam' }, 418)
  }

  const bodyUrl = body.issue.html_url.split('/')
  let isRTM = null

  if (bodyUrl[bodyUrl.length - 2] !== 'pull')
    return c.json({ ok: false, message: 'not a pull request' }, 418)
  if (body.comment.body.toLowerCase().includes('ready to merge')) {
    isRTM = true
  } else if (body.comment.body.toLowerCase().includes('approve merge')) {
    isRTM = false
  }

  if (typeof isRTM !== 'boolean')
    return c.json({ ok: false, message: 'does not contain what i\'m looking for' }, 418)

  switch (isRTM ? 'readyToMerge' : 'approval') {
    case 'readyToMerge':
      await db.insert(schema.rtmAuthor).values({
        authorId: body.comment.user.id.toString(),
        repo: body.repository.name,
        issueNumber: body.issue.number.toString(),
      }).execute()
      await octokit.rest.issues.createComment({
        body: `Hey @${body.sender.login}! I only need one more approval by the dev team before I can merge this PR.\nJust run the command \`approve merge\`.`,
        issue_number: body.issue.number,
        owner: body.repository.owner.login,
        repo: body.repository.name,
      })
      break
    case 'approval':
      const dbFetch = (await db
        .select()
        .from(schema.rtmAuthor)
        .where(
          and(
            eq(schema.rtmAuthor.issueNumber, body.issue.number.toString()),
            eq(schema.rtmAuthor.repo, body.repository.name)
          )
        )
        .execute())[0];
      if (!dbFetch)
          return c.json({ ok: false, message: 'no PR found' }, 418)
      if (dbFetch.authorId === body.comment.user.login.toString() && !body.comment.body.toLowerCase().includes('force')) {
        await react(body.repository.owner.login, body.repository.name, body.comment.id, Reaction.MINUS_ONE)
        return c.json({ ok: false, message: 'you cannot approve your own PR' }, 418)
      }
      await db.update(schema.rtmAuthor).set({ mergerId: body.comment.user.id.toString() }).where(
        and(
          eq(schema.rtmAuthor.issueNumber, body.issue.number.toString()),
          eq(schema.rtmAuthor.repo, body.repository.name)
        )
      ).execute()
      await react(body.repository.owner.login, body.repository.name, body.comment.id, Reaction.PLUS_ONE)
      await octokit.rest.issues.createComment({
        body: `🚀 PR approved by @${body.comment.user.login}! Merging...`,
        issue_number: body.issue.number,
        owner: body.repository.owner.login,
        repo: body.repository.name,
      })
      await octokit.rest.pulls.merge({
        pull_number: body.issue.number,
        owner: body.repository.owner.login,
        repo: body.repository.name,
      })
      break;
  }

  return c.json({ ok: true })
})

app.post('/ev/updateDocsJson', async (c) => {
  const validate = await validateJsonWebhook(c)
  if (!validate)
		return c.json({
			success: false,
			error: 'Invalid token'
		}, 401)
	if ((await c.req.json()).action !== 'released')
		return c.json({
			success: true,
			error: 'Token valid, but ignoring action...'
		}, 418)
  await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
      owner: 'sern-handler',
      repo: 'automata',
      workflow_id: 'website-bot-update.yml',
      ref: 'main',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
  })
  return c.json({ success: true })
})

serve(app).on('listening', async () => {
  console.log('Hono is listening on port 3000')
  console.log(`Github login as ${(await octokit.rest.users.getAuthenticated()).data.login}`)
})

process.stdin.on('data', async (data) => {
  if (data.toString().trim() === 'test thing') {
    console.log('Testing thing')
    // leaving for other testing purposes
  }
})

async function react(owner: string, repo: string, commentId: number, reaction: Reaction) {
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

enum Reaction {
  PLUS_ONE = '+1',
  MINUS_ONE = '-1',
  LAUGH = 'laugh',
  CONFUSED = 'confused',
  HEART = 'heart',
  HOORAY = 'hooray',
  ROCKET = 'rocket',
  EYES = 'eyes',
}