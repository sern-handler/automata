import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import 'dotenv/config'

const client = postgres(process.env.DATABASE_URL!);

export default drizzle(client);