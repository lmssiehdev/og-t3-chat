// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

// npx instant-cli@latest push schema
const _schema = i.schema({
	entities: {
		$files: i.entity({
			path: i.string().unique().indexed(),
			url: i.string(),
		}),
		$users: i.entity({
			id: i.string().unique().indexed().optional(),
			email: i.string().unique().indexed().optional(),
		}),
		messages: i.entity({
			id: i.string().unique().indexed(),
			role: i.string<"user" | "ai">().optional(),
			createdAt: i.number().indexed(),
			text: i.string(),
			metadata: i.json(),
			userAuthId: i.string().indexed(),
			isBranch: i.boolean().optional(),
			originalId: i.string().optional(),
		}),
		threads: i.entity({
			id: i.string().unique().indexed(),
			createdAt: i.number().indexed(),
			title: i.string(),
			updatedTitle: i.boolean().optional(),
			updatedAt: i.date(),
			metadata: i.json(),
			isBranch: i.boolean(),
			userAuthId: i.string().indexed(),
		}),
	},
	links: {
		threadMessages: {
			forward: {
				on: "messages",
				has: "one",
				label: "thread",
				onDelete: "cascade",
			},
			reverse: { on: "threads", has: "many", label: "messages" },
		},
		userMessages: {
			forward: {
				on: "messages",
				has: "one",
				label: "user",
				onDelete: "cascade",
			},
			reverse: { on: "$users", has: "many", label: "messages" },
		},
		userThreads: {
			forward: {
				on: "threads",
				has: "one",
				label: "user",
				onDelete: "cascade",
			},
			reverse: { on: "$users", has: "many", label: "threads" },
		},
	},
	rooms: {},
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
