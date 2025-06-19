import { modelsInfo } from "@/constants";
import { fal } from "@ai-sdk/fal";
import { id } from "@instantdb/admin";
import {
	type LanguageModelV1,
	createOpenRouter,
} from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { experimental_generateImage as generateImage } from "ai";
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
			search
		} = parsedBody.data;

		if (modelsInfo[model]?.requireApiKey && !clientApiKey) {
			return new Response(JSON.stringify({ error: "Missing API key" }), {
				status: 400,
			});
		}

		let errorMessageKey: keyof typeof errorToMsg = "default_error";
		const apiKey = clientApiKey?.trim() ?? process.env.OPENROUTER_API_KEY;

		const generatingAnImage = modelsInfo[model]?.supportsImageGeneration;

		const openrouter = createOpenRouter({

			apiKey: apiKey || process.env.OPENROUTER_API_KEY,
		});

		const messageId = id();
		const processedMessages = await processMessages(messages);

		if (generatingAnImage) {
			try {
				const prompt = messages[messages.length - 1]?.content.trim();

				if (!prompt) {
					return new Response("No prompt provided", { status: 400 });
				}
				await generateFalImage({
					prompt,
					userAuthId,
					threadId,
					timestamp,
				});

				if (shouldCreateThread) {
					after(async () => {
						await generateTitleFromUserMessage({
							openRouterModel: openrouter.chat("qwen/qwen2.5-vl-32b-instruct"),
							message: prompt,
							threadId,
						});
					});
				}

				// we sync to the db and return an empty response
				return new Response("", {
					status: 200,
					headers: {
						"Content-Type": "text/plain; charset=utf-8",
						"X-Message-Id": messageId,
						"X-Thread-Id": threadId,
					},
				});

			} catch (imageError) {
				console.error("Image generation error:", imageError);

				// Return error as streaming response
				const encoder = new TextEncoder();
				const stream = new ReadableStream({
					start(controller) {
						controller.enqueue(
							encoder.encode(
								`Error: Failed to generate image - ${imageError instanceof Error ? imageError.message : "Unknown error"}`,
							),
						);
						controller.close();
					},
				});

				return new Response(stream, {
					status: 200,
					headers: { "Content-Type": "text/plain; charset=utf-8" },
				});
			}
		}
		const openRouterModel: LanguageModelV1 = openrouter.chat(model);

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
			onStepFinish: async (data) => {
				const { stepType } = data;
				console.log('Step finished:', stepType, data);
			},
			onFinish: async (data) => {
				const { text, finishReason, response } = data;
				console.log('Finish:', data);
				await db.transact([
					db.tx.messages[messageId].update({
						hasImage: false,
						createdAt: timestamp,
						text,
						role: "ai",
						metadata: {
							// annotations: response?.annotations || []
						},
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
		// result.consumeStream();

		return result.toDataStreamResponse({
			status: errorMessageKey === "default_error" ? 200 : 500,
			headers: {
				"X-Message-Id": messageId,
				"X-Thread-Id": threadId,
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

async function generateFalImage({
	prompt,
	userAuthId,
	threadId,
	timestamp
}: {
	prompt: string;
	userAuthId: string;
	threadId: string;
	timestamp?: number;
}) {
	// Generate image using Vercel AI SDK
	const { image } = await generateImage({
		model: fal.image("fal-ai/flux/schnell"),
		prompt: prompt,
	});

	const imageUrl =
		// @ts-expect-error image is not typed
		image?.url || `data:${image.mimeType};base64,${image.base64}`;
	const messageId = id();

	await db.transact([
		db.tx.messages[messageId].update({
			searchableImagePrompt: prompt.substring(0, 400),
			hasImage: true,
			createdAt: timestamp,
			text: `Generated image for: "${prompt}"`,
			role: "ai",
			metadata: {
				type: "image",
				imageUrl: imageUrl,
				prompt: prompt,
				model: "fal-ai/flux/schnell",
				mimeType: image.mimeType,
			},
			userAuthId,
		}),
		db.tx.$users[userAuthId].link({ messages: messageId }),
		db.tx.messages[messageId].link({ thread: threadId }),
		db.tx.threads[threadId].link({ messages: messageId }),
	]);
}
