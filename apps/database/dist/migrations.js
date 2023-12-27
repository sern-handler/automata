import { drizzle } from "drizzle-orm/postgres-js/driver";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import 'dotenv/config';
// this will automatically run needed migrations on the database
const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
migrate(drizzle(migrationClient), { migrationsFolder: "./drizzle" })
    .then(() => {
    console.log("Migrations complete!");
    process.exit(0);
})
    .catch((err) => {
    console.error("Migrations failed!", err);
    process.exit(1);
});
