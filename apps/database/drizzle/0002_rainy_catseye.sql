CREATE TABLE IF NOT EXISTS "jobsList" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"steps" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jobsLogs" (
	"id" text PRIMARY KEY NOT NULL,
	"stepId" text NOT NULL,
	"log" text NOT NULL
);
