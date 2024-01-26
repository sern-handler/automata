ALTER TABLE "jobsLogs" RENAME COLUMN "log" TO "logs";--> statement-breakpoint
ALTER TABLE "jobsLogs" ALTER COLUMN "logs" SET DATA TYPE json;