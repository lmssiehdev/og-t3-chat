import { id, init } from "@instantdb/admin";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { type UIMessage, generateText, streamText } from "ai";
import schema from "../../../../instant.schema";
import { z } from "zod";
import { SUPPORTED_MODELS } from "@/constants";

const db = init({
	appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
	adminToken: process.env.INSTANT_APP_ADMIN_TOKEN!,
	schema,
});

const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
});

const zRouteParams = z.object({
	threadId: z.string(),
	userAuthId: z.string(),
	messages: z.any(),
	model: z.enum(SUPPORTED_MODELS),
});

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const parsedBody = zRouteParams.safeParse(body);
		
		if ( !parsedBody.success ) {
			const error = parsedBody.error.message;
			console.log({ error})
			return new Response(JSON.stringify({ error }), {
				status: 400
			})
		}
		const { messages, model, threadId, userAuthId } = parsedBody.data; 

		// Get the latest user message for title generation
		const latestMessage = messages[messages.length - 1];

		// Generate title from first message if needed
		await generateTitleFromUserMessage({
			message: latestMessage.content,
			threadId,
		});

		// Stream the AI response using the full conversation history
		const result = streamText({
			model: openrouter.chat(model),
			messages,
			onFinish: async ({ text, finishReason, usage }) => {
				const messageId = id();
				await db.transact([
					db.tx.messages[messageId].update({
						createdAt: Date.now(),
						text,
						role: "ai",
						metadata: {},
						userAuthId,
					}),

					db.tx.$users[userAuthId].link({ messages: messageId }),
					db.tx.messages[messageId].link({ thread: threadId }),
					db.tx.threads[threadId].link({ messages: messageId }),
				]);
			},
		});

		return result.toDataStreamResponse();
	} catch (error) {
		console.error("Error in chat API:", error);
		return new Response(
			JSON.stringify({ error: "Failed to process chat request" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
};

async function generateTitleFromUserMessage({
	message,
	threadId,
}: {
	message: UIMessage;
	threadId: string;
}) {
	const data = await db.query({
		threads: {
			$: {
				where: {
					id: threadId,
				},
				limit: 1,
			},
		},
	});

	if (data.threads[0].updatedTitle) return;

	const { text: title } = await generateText({
		model: openrouter.chat("google/gemma-3-1b-it:free"),
		system: `
- you will generate a short title based on the first message a user begins a conversation with
- ensure it is not more than 80 characters long
- the title should be a summary of the user's message
- do not use quotes or colons`,
		prompt: JSON.stringify(message),
	});

	try {
		await db.transact([
			db.tx.threads[threadId].update({
				title,
				updatedTitle: true,
				updatedAt: Date.now(),
			}),
		]);
	} catch (titleError) {
		console.error("Error updating title:", titleError);
	}
}
