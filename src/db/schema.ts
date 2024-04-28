import { text, sqliteTable } from "drizzle-orm/sqlite-core";

export const rtmAuthor = sqliteTable("rtmAuthor", {
  authorId: text('authorId').notNull(),
  mergerId: text('mergerId').notNull(),
});
