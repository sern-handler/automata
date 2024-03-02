import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  json,
  bigserial
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
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: text("name").notNull(),
  steps: json("steps").notNull(),
  sernbinid: text("sernbinid").notNull(),
})

// types
interface JobLog {
  timestamp: Date;
  message: string;
  level: 'info' | 'error';
}