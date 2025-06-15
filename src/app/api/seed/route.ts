import { id, init } from "@instantdb/admin";
import { faker } from "@faker-js/faker";
import schema, { type AppSchema } from "../../../../instant.schema";

const db = init({
	appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
	adminToken: process.env.INSTANT_APP_ADMIN_TOKEN!,
	schema,
});

export async function GET() {
	if (process.env.NODE_ENV !== "development")
		return new Response("Not allowed", { status: 403 });
	try {
		const userAuthId = "feee5e90-0fda-468a-ad2e-e627f6dd558f";
		const threadId = id();
		await db.transact([
			db.tx.threads[threadId].update({
				createdAt: Date.now(),
				updatedAt: Date.now(),
				metadata: {},
				title: "New Chat!",
				userAuthId,
				isBranch: false,
			}),
		]);

		const batchSize = 50;
		let currentBatch = [];
		const batches = [];

		const date = Date.now();
		let isUser = true;
		for (let i = 0; i < 400; i++) {
			const min = isUser ? 2 : 10;
			const max = isUser ? 50 : 1000;

			const text = faker.lorem.sentence({ min, max });
			const messageId = id();

			currentBatch.push(
				db.tx.messages[messageId].update({
					createdAt: date + i,
					text: text,
					role: isUser ? "user" : "ai",
					metadata: {},
					userAuthId,
				}),
				db.tx.$users[userAuthId].link({ messages: messageId }),
				db.tx.messages[messageId].link({ thread: threadId }),
				db.tx.threads[threadId].link({ messages: messageId }),
			);

			if (currentBatch.length >= batchSize) {
				batches.push(currentBatch);
				currentBatch = [];
			}
			isUser = !isUser;
		}

		if (currentBatch.length) {
			batches.push(currentBatch);
		}

		for (const batch of batches) {
			await db.transact(batch);
		}
	} catch (error) {
		console.error("Error in seed API:", error);
		return new Response(
			JSON.stringify({ error: "Failed to process seed request" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
