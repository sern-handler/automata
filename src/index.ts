import { Context, Hono } from 'hono'
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from './db/schema'

export type Bindings = {
  TURSO_URL: string,
  TURSO_TOKEN: string,
}

const app = new Hono()

app.get('/', async (c) => {
  const db = importDB(c)
  const fetch = await db.insert(schema.rtmAuthor).values({
    authorId: '1',
    mergerId: '2',
  }).execute()
  return c.json(fetch.toJSON())
})

export default {
  fetch: app.fetch.bind(app),
}

function importDB(c: Context) {
  const turso = createClient({
    url: c.env.TURSO_URL!,
    authToken: c.env.TURSO_TOKEN!,
  })
  return drizzle(turso, { schema });
}