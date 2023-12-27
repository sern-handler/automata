import 'dotenv/config';
import * as schema from '../dist/schema.js';
declare const _default: import("drizzle-orm/postgres-js").PostgresJsDatabase<typeof schema>;
export default _default;
