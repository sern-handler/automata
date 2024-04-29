import { Context, Hono } from 'hono'
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from './db/schema'
import { IssueCommentEvent } from '@octokit/webhooks-types';
import { Octokit } from 'octokit';

const octokit = new Octokit({ auth: `personal-access-token123` });

export type Bindings = {
  TURSO_URL: string,
  TURSO_TOKEN: string,
  GITHUB_API_TOKEN: string,
}

const app = new Hono()

app.get('/', async (c) => {
  const { db } = importLibs(c)
  const fetch = await db.insert(schema.rtmAuthor).values({
    authorId: '1',
    mergerId: '2',
  }).execute()
  return c.json(fetch.toJSON())
})

app.post('/ev/readyToMerge', async (c) => {
  const body = await c.req.json() as IssueCommentEvent
  const bodyUrl = body.issue.html_url.split('/')
  const { db, octokit } = importLibs(c)
  let isRTM = false

  if (bodyUrl[bodyUrl.length - 2] !== 'pull')
    return c.json({ ok: false, message: 'not a pull request' }, 418)
  if (!body.comment.body.toLowerCase().includes('ready to merge')) {
    isRTM = true
    return c.json({ ok: false, message: 'does not contain what i\'m looking for' }, 418)
  }
  if (!body.comment.body.toLowerCase().includes('approve merge'))
    return c.json({ ok: false, message: 'does not contain what i\'m looking for' }, 418)

  switch (isRTM ? 'readyToMerge' : 'approval') {
    case 'readyToMerge':
      await db.insert(schema.rtmAuthor).values({
        authorId: body.comment.user.id.toString(),
      }).execute()
      await octokit.rest.issues.createComment({
        body: `Hey @${body.sender.login}`,
        issue_number: body.issue.number,
        owner: body.repository.owner.login,
        repo: body.repository.name,
      })
      break
    case 'approval':
      break
  }

  return c.json({ ok: true })
})

export default app
function importLibs(c: Context) {
  const turso = createClient({
    url: c.env.TURSO_URL!,
    authToken: c.env.TURSO_TOKEN!,
  })
  const octokit = new Octokit({ auth: c.env.GITHUB_API_TOKEN! });
  return { db: drizzle(turso, { schema }), octokit: octokit };
}
