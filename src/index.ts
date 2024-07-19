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
import { react, Reaction } from './util/react.js';
import { ZFeedbackSchema } from './util/zod.js';

const devTeam = [
  'SrIzan10',
  'jacoobes',
  'EvolutionX-10',
  'Murtatrxx',
  'DuroCodes'
]

const turso = createClient({
  url: process.env.DB_URL!,
  authToken: process.env.DB_TOKEN!,
})
export const octokit = new Octokit({ auth: process.env.GH_API_TOKEN! });
export const db = drizzle(turso, { schema })

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
  const lcComment = body.comment.body.toLowerCase()

  if (!lcComment.includes('@sernbot'))
    return c.json({ ok: false, message: 'not mentioned' }, 418)
  if (!devTeam.includes(body.comment.user.login))
    return c.json({ ok: false, message: 'not part of devteam' }, 418)

  const bodyUrl = body.issue.html_url.split('/')
  let isRTM = null

  if (bodyUrl[bodyUrl.length - 2] !== 'pull')
    return c.json({ ok: false, message: 'not a pull request' }, 418)
  if (lcComment.includes('ready to merge')) {
    isRTM = true
  } else if (lcComment.includes('approve merge')) {
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
      if (body.issue.draft) {
        return octokit.rest.issues.createComment({
          body: `Please change the draft status of the PR and re-run the command to merge.`,
          issue_number: body.issue.number,
          owner: body.repository.owner.login,
          repo: body.repository.name,
        })
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
        merge_method: 'squash',
      })
      break;
  }

  return c.json({ ok: true })
})

app.post('/web/updateWebsite', async (c) => {
  if (c.req.header('Authorization') !== process.env.UPDATEWEBSITE_TOKEN)
    return c.json({ success: false, error: 'Invalid token' }, 401)
  await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
    owner: 'sern-handler',
    repo: 'website',
    workflow_id: 'github-pages.yml',
    ref: 'main',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })
  return c.json({ success: true })
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

  await fetch('https://automata.sern.dev/web/updateWebsite', {
    method: 'POST',
    headers: {
      'Authorization': process.env.UPDATEWEBSITE_TOKEN!
    }
  })

  /*await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
      owner: 'sern-handler',
      repo: 'automata',
      workflow_id: 'website-bot-update.yml',
      ref: 'main',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
  })*/
  return c.json({ success: true })
})

app.post('/web/feedback', async (c) => {
  const zodValidate = ZFeedbackSchema.safeParse(await c.req.json())
  if (!zodValidate.success)
    return c.json({ success: false, error: zodValidate.error }, 400)
  const body = zodValidate.data

  const turnstileFormData = new URLSearchParams()
  turnstileFormData.append('response', body.turnstileToken)
  turnstileFormData.append('secret', process.env.TURNSTILE_SECRET!)
  const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		body: turnstileFormData
	}).then(res => res.json())
  if (!turnstileResponse.success)
    return c.json({ success: false, error: 'Unsuccessful turnstile verification'}, 403)

  const { turnstileToken, ...dbFeedback } = body
  db.insert(schema.feedback).values(dbFeedback).execute()
})

const port = Number(process.env.PORT || 3000)
export default {
  port,
  fetch: app.fetch
}

process.stdin.on('data', async (data) => {
  if (data.toString().trim() === 'test thing') {
    console.log('Testing thing')
    // leaving for other testing purposes
  }
})
