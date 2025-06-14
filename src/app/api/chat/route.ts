import { AvailableModels, modelsInfo, SUPPORTED_MODELS } from "@/constants";
import { type UpdateParams, id, init } from "@instantdb/admin";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { type UIMessage, generateText, streamText } from "ai";
import { z } from "zod";
import schema, { type AppSchema } from "../../../../instant.schema";

const db = init({
	appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
	adminToken: process.env.INSTANT_APP_ADMIN_TOKEN!,
	schema,
});

const zRouteParams = z.object({
	threadId: z.string(),
	userAuthId: z.string(),
	messages: z.any(),
	model: z.enum(SUPPORTED_MODELS),
	shouldCreateThread: z.boolean().default(false),
	apiKey: z.string().optional(),
});

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const parsedBody = zRouteParams.safeParse(body);
		
		if (!parsedBody.success) {
			const error = parsedBody.error.message;
			console.log({ error });
			return new Response(JSON.stringify({ error }), {
				status: 400,
			});
		}
		const { apiKey: clientApiKey, messages, model, threadId, userAuthId, shouldCreateThread } =
			parsedBody.data;


		if ( modelsInfo[model].requireApiKey && !clientApiKey ) {
			return new Response(JSON.stringify({ error: "Missing API key" }), {
				status: 400,
			});
		}
		// Get the latest user message for title generation
		const latestMessage = messages[messages.length - 1];

		const payload: UpdateParams<AppSchema, "threads"> = {
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};

		if (shouldCreateThread) {
			payload.title = "New Chat!";
			payload.userAuthId = userAuthId;
			payload.metadata = {};
		}

		await db.transact([
			db.tx.threads[threadId].update(payload),
			db.tx.$users[userAuthId].link({ threads: threadId }),
		]);

		const apiKey = clientApiKey ?? process.env.OPENROUTER_API_KEY;
		
		console.log({ clientApiKey, apiKey, model})
		const openrouter = createOpenRouter({
			apiKey: apiKey || process.env.OPENROUTER_API_KEY,
		});

		const errorToMsg = {
			"invalid_api_key": {
				status: 401,
				error: "Invalid API key provided"
			},
			"default_error": {
				status: 500,
				error: "Failed to process chat request"
			}
		}
		let errorMessageKey: keyof typeof errorToMsg= "default_error";

		const result = streamText({
			model: openrouter.chat(model),
			messages,
			onError: ({ error }) => {
				console.error("Error streaming text:", error);

				// Store the error message to be used later
				// @ts-expect-error error is not typed
				if (error?.status === 401 || error?.statusCode === 401) {
					errorMessageKey = "invalid_api_key";
				}
			},
			onFinish: async ({ text }) => {
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

		// Return the stream response with error handling
		return result.toDataStreamResponse({
			status: errorMessageKey === "default_error" ? 200 : 500,
			getErrorMessage(error) {
				return errorToMsg[errorMessageKey].error;
			},
		});
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
}

const createThread = async (
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
