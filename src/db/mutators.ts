import { id } from "@instantdb/react";
import { db } from "./instant";

export const createThread = async (
	threadId: string,
	userAuthId: string,
	title: string,
) => {
	if (userAuthId === undefined) return;

	await db.transact([
		db.tx.threads[threadId].update({
			createdAt: Date.now(),
			title,
			updatedAt: Date.now(),
			metadata: {},
			userAuthId,
		}),
		// Link the thread to the user
		db.tx.$users[userAuthId].link({ threads: threadId }),
	]);
	return threadId;
};

export async function createMessage(
	threadId: string,
	userAuthId: string,
	text: string,
	role: "user" | "ai",
) {
	const messageId = id();
	await db.transact([
		db.tx.messages[messageId].update({
			createdAt: Date.now(),
			text,
			role,
			metadata: {},
			userAuthId,
		}),
		//  Linking, there is one extra, remove it
		db.tx.$users[userAuthId].link({ messages: messageId }),
		db.tx.messages[messageId].link({ thread: threadId }),
		db.tx.threads[threadId].link({ messages: messageId }),
	]);

	return messageId;
}
