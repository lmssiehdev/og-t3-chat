import { SUPPORTED_MODELS, modelsInfo } from "@/constants";
import { type UpdateParams, id, init } from "@instantdb/admin";
import {
	type LanguageModelV1,
	createOpenRouter,
} from "@openrouter/ai-sdk-provider";
import { type CoreMessage, type UIMessage, generateText, streamText } from "ai";
import { after } from "next/server";
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
	apiKey: z.string().min(2).optional(),
	timestamp: z.number().optional(),
});

export type RouteParams = z.infer<typeof zRouteParams>;

const errorToMsg = {
	invalid_api_key: {
		status: 401,
		error: "Invalid API key provided",
	},
	default_error: {
		status: 500,
		error: "Failed to process chat request",
	},
};

const processMessages = async (messages: UIMessage[]) => {
	const processedMessages: CoreMessage[] = [];

	for (const message of messages) {
		if (
			!message.experimental_attachments ||
			message.experimental_attachments.length === 0
		) {
			processedMessages.push({
				role: message.role as "user" | "assistant" | "system",
				content: message.content,
			});
			continue;
		}

		const content: (
			| { type: "text"; text: string }
			| { type: "image"; image: string }
		)[] = [{ type: "text", text: message.content }];

		for (const attachment of message.experimental_attachments) {
			if (!attachment || !attachment.contentType) continue;

			if (attachment.contentType.startsWith("image/")) {
				content.push({
					type: "image",
					image: attachment.url,
				});
			} else if (attachment.contentType.startsWith("text/")) {
				try {
					if (attachment.url.startsWith("data:")) {
						const base64Data = attachment.url.split(",")[1];
						const textContent = atob(base64Data);
						content.push({
							type: "text",
							text: `File: ${attachment.name}\n\n${textContent}`,
						});
					}
				} catch (error) {
					console.error("Error processing text attachment:", error);
					content.push({
						type: "text",
						text: `[Could not process file: ${attachment.name}]`,
					});
				}
			} else {
				// we only add metadata for other file types
				const fileSize = attachment.url
					? Math.round((attachment.url.length * 0.75) / 1024)
					: 0;
				content.push({
					type: "text",
					text: `[Attached file: ${attachment.name} (${attachment.contentType}, ~${fileSize}KB)]`,
				});
			}
		}

		processedMessages.push({
			// @ts-expect-error look into it later
			role: message.role,
			content: content,
		});
	}

	return processedMessages;
};

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

		const payload: UpdateParams<AppSchema, "threads"> = {
			createdAt: timestamp,
			updatedAt: timestamp,
		};

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

		// Process messages with attachments
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
				const messageId = id();
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

async function generateTitleFromUserMessage({
	openRouterModel,
	message,
	threadId,
}: { openRouterModel: LanguageModelV1; message: string; threadId: string }) {
	try {
		const { text: title } = await generateText({
			model: openRouterModel,
			system: `
	- you will generate a short title based on the first message a user begins a conversation with
	- ensure it is not more than 80 characters long
	- the title should be a summary of the user's message
	- do not use quotes or colons`,
			prompt: JSON.stringify(message),
		});
		await db.transact([
			db.tx.threads[threadId].update({
				title,
				updatedTitle: true,
			}),
		]);
	} catch (titleError) {
		console.error("Error updating title:", titleError);
	}
}
