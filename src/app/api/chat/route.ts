import { modelsInfo } from "@/constants";
import { id } from "@instantdb/admin";
import {
	type LanguageModelV1,
	createOpenRouter,
} from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { after } from "next/server";
import {
	db,
	errorToMsg,
	generateTitleFromUserMessage,
	processMessages,
	zRouteParams,
} from "../utils";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const parsedBody = zRouteParams.safeParse(body);

		if (!parsedBody.success) {
			const error = parsedBody.error.message;
			return new Response(JSON.stringify({ error }), {
				status: 400,
			});
		}
		const {
			apiKey: clientApiKey,
			messages,
			model,
			threadId,
			userAuthId,
			shouldCreateThread,
			timestamp,
		} = parsedBody.data;

		if (modelsInfo[model].requireApiKey && !clientApiKey) {
			return new Response(JSON.stringify({ error: "Missing API key" }), {
				status: 400,
			});
		}

		// const payload: UpdateParams<AppSchema, "threads"> = {
		// 	createdAt: timestamp,
		// 	updatedAt: timestamp,
		// };

		// if (shouldCreateThread) {
		// 	payload.title = "New Chat!";
		// 	payload.userAuthId = userAuthId;
		// 	payload.metadata = {};
		// 	payload.isBranch = false;
		// 	db.tx.$users[userAuthId].link({ threads: threadId });
		// }

		// await db.transact([db.tx.threads[threadId].update(payload)]);

		let errorMessageKey: keyof typeof errorToMsg = "default_error";
		const apiKey = clientApiKey?.trim() ?? process.env.OPENROUTER_API_KEY;

		const openrouter = createOpenRouter({
			apiKey: apiKey || process.env.OPENROUTER_API_KEY,
		});

		const openRouterModel: LanguageModelV1 = openrouter.chat(model);

		const messageId = id();
		const processedMessages = await processMessages(messages);
		const result = streamText({
			model: openRouterModel,
			messages: processedMessages,
			onError: ({ error }) => {
				console.error("Error streaming text:", error);

				// Store the error message to be used later
				// @ts-expect-error error is not typed
				if (error?.status === 401 || error?.statusCode === 401) {
					errorMessageKey = "invalid_api_key";
				}
			},
			onFinish: async ({ text }) => {
				await db.transact([
					db.tx.messages[messageId].update({
						createdAt: timestamp,
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

		// after the stream is finished, we generate a title from the first message
		if (shouldCreateThread) {
			db.transact([
				db.tx.threads[threadId].update({
					createdAt: timestamp,
					updatedAt: timestamp,
					metadata: {},
					userAuthId,
					isBranch: false,
					title: "Updating...",
				}),
			]);
			const latestMessage = messages[0];
			after(async () => {
				await generateTitleFromUserMessage({
					openRouterModel,
					message: latestMessage?.content,
					threadId,
				});
			});
		}

		// consume the stream to ensure it runs to completion & triggers onFinish
		// even when the client response is aborted;
		result.consumeStream();

		return result.toDataStreamResponse({
			status: errorMessageKey === "default_error" ? 200 : 500,
			headers: {
				"X-Custom-Id": messageId,
			},
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
