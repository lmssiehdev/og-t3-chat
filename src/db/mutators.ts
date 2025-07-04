import { type InstaQLResult, id } from "@instantdb/react";
import { toast } from "sonner";
import type { AppSchema } from "../../instant.schema";
import { db } from "./instant";

export const createThread = async (
	threadId: string,
	userAuthId: string,
	title: string,
) => {
	try {
		await db.transact([
			db.tx.threads[threadId].update({
				createdAt: Date.now(),
				title,
				updatedAt: Date.now(),
				metadata: {},
				userAuthId,
				isBranch: false,
				isPinned: false,
			}),
			// Link the thread to the user
			db.tx.$users[userAuthId].link({ threads: threadId }),
		]);
		return threadId;
	} catch (e) {
		console.error(
			"Failed to create thread",
			{
				threadId,
				userAuthId,
				title,
			},
			e,
		);
		toast.error("Failed to create thread");
		return undefined;
	}
};

export async function createMessage(
	threadId: string,
	userAuthId: string,
	text: string,
	role: "user" | "ai",
	metadata = {},
) {
	try {
		const messageId = id();
		await db.transact([
			db.tx.messages[messageId].update({
				createdAt: Date.now(),
				text,
				role,
				// @ts-expect-error
				metadata,
				userAuthId,
			}),
			//  Linking, there is one extra, remove it
			db.tx.$users[userAuthId].link({ messages: messageId }),
			db.tx.messages[messageId].link({ thread: threadId }),
			db.tx.threads[threadId].link({ messages: messageId }),
			db.tx.threads[threadId].update({
				updatedAt: Date.now(),
			}),
		]);

		return messageId;
	} catch (e) {
		console.error(
			"Failed to create message",
			{
				threadId,
				userAuthId,
				text,
				role,
				metadata,
			},
			e,
		);
		toast.error("Failed to create message");
		return undefined;
	}
}

export async function pinThread(threadId: string, isPinned: boolean) {
	try {
		await db.transact([
			db.tx.threads[threadId].update({
				isPinned,
			}),
		]);
	} catch (e) {
		console.error(
			"Failed to pin thread",
			{
				threadId,
				isPinned,
			},
			e,
		);
		toast.error("Failed to pin thread");
	}
}

export async function updateTitle(threadId: string, title: string) {
	try {
		await db.transact([
			db.tx.threads[threadId].update({
				title,
			}),
		]);
	} catch (e) {
		console.error(
			"Failed to update title",
			{
				threadId,
				title,
			},
			e,
		);
		toast.error("Failed to update title");
	}
}

export async function deleteThread(threadId: string) {
	try {
		await db.transact(db.tx.threads[threadId].delete());
	} catch (e) {
		console.error(
			"Failed to delete thread",
			{
				threadId,
			},
			e,
		);
		toast.error("Failed to delete thread");
	}
}

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type Thread = InstaQLResult<AppSchema, { threads: {} }>["threads"][0];

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type Message = InstaQLResult<AppSchema, { messages: {} }>["messages"][0];
const batchSize = 100;
export async function createNewBranch(
	newThreadId: string,
	data: Thread,
	messages: Message[],
	userAuthId: string,
	messageId: string,
) {
	try {
		const baseTimestamp = Date.now();

		// create new thread
		await db.transact([
			db.tx.threads[newThreadId].update({
				createdAt: baseTimestamp,
				updatedAt: baseTimestamp,
				metadata: {},
				title: data.title ?? "New Branch",
				userAuthId,
				isBranch: true,
			}),
		]);

		let currentBatch = [];
		const batches = [];

		for (let i = 0; i < messages.length; i++) {
			const message = messages[i];
			const newMessageId = id();

			currentBatch.push(
				db.tx.messages[newMessageId].update({
					createdAt: message.createdAt,
					text: message.text,
					role: message.role,
					metadata: message.metadata,
					userAuthId,
					originalId: message.originalId ?? newMessageId,
				}),
				db.tx.$users[userAuthId].link({ messages: newMessageId }),
				db.tx.messages[newMessageId].link({ thread: newThreadId }),
				db.tx.threads[newThreadId].link({ messages: newMessageId }),
			);

			if (currentBatch.length >= batchSize) {
				batches.push(currentBatch);
				currentBatch = [];
			}
			if (message.id === messageId) {
				break;
			}
		}

		if (currentBatch.length) {
			batches.push(currentBatch);
		}

		for (const batch of batches) {
			await db.transact(batch);
		}

		return newThreadId;
	} catch (e) {
		console.error(
			"Failed to create new branch",
			{
				newThreadId,
				data,
				messages,
				userAuthId,
				messageId,
			},
			e,
		);
		toast.error("Failed to create new branch");
		return undefined;
	}
}
