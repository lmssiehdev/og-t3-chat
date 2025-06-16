import { SUPPORTED_MODELS } from "@/constants";
import { init } from "@instantdb/admin";
import type { LanguageModelV1 } from "@openrouter/ai-sdk-provider";
import { type CoreMessage, type UIMessage, generateText } from "ai";
import { z } from "zod";
import schema from "../../../instant.schema";

export const db = init({
	appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
	adminToken: process.env.INSTANT_APP_ADMIN_TOKEN!,
	schema,
});

export const zRouteParams = z.object({
	threadId: z.string(),
	userAuthId: z.string(),
	messages: z.any(),
	model: z.enum(SUPPORTED_MODELS),
	shouldCreateThread: z.boolean().default(false),
	apiKey: z.string().min(2).optional(),
	timestamp: z.number().optional(),
});

export type RouteParams = z.infer<typeof zRouteParams>;

export const errorToMsg = {
	invalid_api_key: {
		status: 401,
		error: "Invalid API key provided",
	},
	default_error: {
		status: 500,
		error: "Failed to process chat request",
	},
};

/*
Process messages with attachments
*/
export const processMessages = async (messages: UIMessage[]) => {
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

export async function generateTitleFromUserMessage({
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
