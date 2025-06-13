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
