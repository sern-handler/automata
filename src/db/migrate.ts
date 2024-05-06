import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import 'dotenv/config'
import * as schema from './schema.js'
import { migrate } from "drizzle-orm/libsql/migrator";

const dbUrl = process.env.DB_URL!
const dbToken = process.env.DB_TOKEN!
const turso = createClient({
    url: dbUrl,
    authToken: dbToken,
    
})
const db = drizzle(turso, { schema });
await migrate(db, { migrationsFolder: './drizzle/migrations' })
turso.close()