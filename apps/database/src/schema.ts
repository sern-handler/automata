import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  smallserial,
  json
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "@auth/core/adapters";

// automata schemas
export const guideFeedback = pgTable("guideFeedback", {
  id: text("id").notNull().primaryKey(),
  feedback: text("feedback").notNull(),
  route: text("route").notNull(),
  inputText: text("inputText"),
})

export const jobsList = pgTable("jobsList", {
  // note to reviewers:
  // id is a smallserial and smallserials
  // is an autoincrementing 2-byte integer
  // so the max value is 32767
  // is this fine? or should I use a bigserial (8-byte int)?
  // https://orm.drizzle.team/docs/column-types/pg#smallserial
  id: smallserial('id').primaryKey().notNull(),
  name: text("name").notNull(),
  steps: json("steps").notNull(),
})

export const stepLogs = pgTable("jobsLogs", {
  pkey: text("pkey").notNull().primaryKey(),
  id: text("id").notNull(),
  jobId: text("stepId").notNull(),
  logs: json('logs').$type<JobLog[]>().notNull(),
})

// next-auth schema
export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  })
);

// types
interface JobLog {
  timestamp: Date;
  message: string;
  level: 'info' | 'error';
}