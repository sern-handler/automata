CREATE TABLE `rtmAuthor` (
	`id` integer PRIMARY KEY NOT NULL,
	`authorId` text NOT NULL,
	`mergerId` text,
	`repo` text NOT NULL,
	`issueNumber` text NOT NULL
);
