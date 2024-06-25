import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";

export const rtmAuthor = sqliteTable("rtmAuthor", {
  id: integer('id').primaryKey(),
  authorId: text('authorId').notNull(),
  mergerId: text('mergerId'),
  repo: text('repo').notNull(),
  issueNumber: text('issueNumber').notNull(),
});

export const feedback = sqliteTable("feedback", {
  id: integer('id').primaryKey(),
  feedback: text('feedback').notNull(),
  inputText: text('inputText').notNull(),
  route: text('route').notNull(),
});