import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import 'dotenv/config'
import * as schema from './schema.js'
import { migrate } from "drizzle-orm/libsql/migrator";

const turso = createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_TOKEN!,
})
const db = drizzle(turso, { schema });
await migrate(db, { migrationsFolder: './drizzle/migrations' })
turso.close()