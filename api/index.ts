import { createClient } from '@libsql/client';
import { IssueCommentEvent } from '@octokit/webhooks-types';
import { drizzle } from 'drizzle-orm/libsql';
import { Hono } from 'hono'
import { handle } from '@hono/node-server/vercel'
import { Octokit } from 'octokit';
import * as schema from '../db/schema.js'

export const config = {
  api: {
    bodyParser: false,
  },
}

const turso = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_TOKEN!,
})
const octokit = new Octokit({ auth: process.env.GITHUB_API_TOKEN! });
const db = drizzle(turso, { schema })

const app = new Hono().basePath('/api')

app.get('/', (c) => {
  return c.json({ message: 'Hello Hono!' })
})

app.post('/ev/readyToMerge', async (c) => {
  const body = await c.req.json() as IssueCommentEvent
  const bodyUrl = body.issue.html_url.split('/')
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

export default handle(app)
