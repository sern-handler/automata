import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import dotenv from 'dotenv'
import * as schema from './schema.js'
import { migrate } from "drizzle-orm/libsql/migrator";
dotenv.config({ path: './.dev.vars' })

const turso = createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_TOKEN!,
})
const db = drizzle(turso, { schema });
await migrate(db, { migrationsFolder: './drizzle/migrations' })
turso.close()