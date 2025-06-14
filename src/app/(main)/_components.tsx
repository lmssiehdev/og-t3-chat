"use client";
import { DropdownMenuRadioGroupDemo } from "@/component/model-selector";
import { FileUploadChatInputDemo } from "@/components/chat-input";
import { ChatUiMessageWithImageSupport } from "@/components/t3-components";
import {
	type AvailableModels,
	SUPPORTED_MODELS,
	modelsInfo,
} from "@/constants";
import { db } from "@/db/instant";
import { createMessage } from "@/db/mutators";
import { useInstantAuth } from "@/providers/instant-auth";
import { type UseChatHelpers, useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";

export function ChatComponent({
	threadId,
	shouldCreateThread = false,
}: {
	threadId: string;
	shouldCreateThread?: boolean;
}) {
	const { userAuthId } = useInstantAuth();
	const [completedMessageIds, setCompletedMessageIds] = useState(
		new Set<string>(),
	);
	const pathname = usePathname();
	const router = useRouter();

	const {
		messages,
		input,
		handleSubmit,
		handleInputChange,
		status,
		isLoading,
	} = useChat({
		api: "/api/chat",
		body: {
			threadId,
			userAuthId,
			shouldCreateThread,
		},
		onError: (error) => {
			console.error("Error streaming text:", error, error.message);
			if (error?.message.startsWith("3:")) {
				toast.error(error.message.substring(2).replaceAll('"', ""));
			} else {
				toast.error(error.message);
			}
		},
		onFinish: ({ id }: { id: string }) => {
			setCompletedMessageIds((c) => {
				const newSet = new Set(c);
				newSet.add(id);
				return newSet;
			});
			if (!shouldCreateThread) return;
			if (!pathname.includes(threadId)) router.push(`/chat/${threadId}`);
		},
	});
	const { data: dbMessages, isLoading: isDbMessagesLoading } = db.useQuery({
		threads: {
			$: { where: { id: threadId } },
			messages: {},
		},
	});

	const activeStreamingMessages = useMemo(() => {
		if (!messages || messages?.length === 0) return undefined;

		const lastMessage = messages[messages.length - 1];

		if (
			!completedMessageIds.has(lastMessage.id) &&
			lastMessage.role !== "user"
		) {
			return lastMessage;
		}

		return undefined;
	}, [messages, completedMessageIds]);

	if (!dbMessages?.threads[0]?.messages) {
		if (isDbMessagesLoading) return null;
		if (!shouldCreateThread) return <div>No thread found</div>;
		return (
			<FileUploadChatInputDemo
				threadId={threadId}
				useChat={
					{
						messages,
						input,
						handleSubmit,
						handleInputChange,
						status,
					} as UseChatHelpers
				}
			/>
		);
	}

	if (!dbMessages?.threads[0]?.messages) {
		return null;
	}

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 mx-auto flex w-full max-w-3xl flex-col space-y-12 p-4 pb-16">
				<div className="min-h-[400px] overflow-y-auto p-4 mb-4">
					{dbMessages.threads[0].messages
						.map((m) => ({ ...m, content: m.text }))
						.map((m) => (
							<ChatUiMessageWithImageSupport
								key={m.id}
								message={m as unknown as UIMessage}
							/>
						))}
					{activeStreamingMessages?.content.length && (
						<ChatUiMessageWithImageSupport message={activeStreamingMessages} />
					)}

					{isLoading && (
						<div className="text-left">
							<span className="animate-pulse">▊</span>
						</div>
					)}
				</div>
			</div>
			<FileUploadChatInputDemo
				threadId={threadId}
				useChat={
					{
						messages,
						input,
						handleSubmit,
						handleInputChange,
						status,
					} as UseChatHelpers
				}
			/>
		</div>
	);
}

function ChartInput({
	onSubmit,
	isLoading,
	payload,
}: {
	onSubmit: (message: string, additionalData: Record<string, unknown>) => void;
	isLoading: boolean;
	payload: {
		threadId: string;
		userAuthId: string;
	};
}) {
	const [apiKeyInLocalStorage, setApiKeyInLocalStorage] =
		useLocalStorage<string>("api-key", "");
	const [modelInStorage, setModelInStorage] = useLocalStorage<string>(
		"last-model",
		modelsInfo[SUPPORTED_MODELS[0]].name,
	);
	const [selectedModel, setSelectedModel] = useState<string>(modelInStorage);

	const { threadId, userAuthId } = payload;

	const handleFormSubmit = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			const formData = new FormData(e.target as HTMLFormElement);
			const message = formData.get("message") as string;

			if (!message.trim()) return;

			(e.target as HTMLFormElement).reset();

			try {
				createMessage(threadId, userAuthId!, message, "user");
				// get it directly from local storage
				const currentApiKey = JSON.parse(
					localStorage.getItem("api-key") || '""',
				);
				onSubmit(message, { model: selectedModel, apiKey: currentApiKey });
			} catch (error) {
				console.error("Failed to send message:", error);
			}
		},
		[threadId, userAuthId, onSubmit, selectedModel],
	);

	return (
		<form
			onSubmit={handleFormSubmit}
			className="mx-auto mt-auto flex w-full items-stretch gap-2 rounded-t-xl bg-[#2D2D2D] px-3 py-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] sm:max-w-3xl"
		>
			<div className="relative flex-grow">
				{apiKeyInLocalStorage}
				<textarea
					name="message"
					disabled={isLoading}
					className="focus-none border-none w-full flex-grow resize-none bg-transparent text-base leading-6 h-[72px] text-neutral-100 outline-none mb-8"
					placeholder="Type your message here..."
				/>
				<div className="absolute bottom-0 left-0">
					<DropdownMenuRadioGroupDemo
						position={selectedModel}
						setPosition={(v) => {
							if (modelsInfo[v as AvailableModels].requireApiKey) {
								const data = prompt(
									"This model requires an API key",
									apiKeyInLocalStorage,
								);
								if (!data?.trim()) return;
								setApiKeyInLocalStorage(data);
							}
							setSelectedModel(v);
							setModelInStorage(v);
						}}
					/>
				</div>
			</div>
			<button
				type="submit"
				disabled={isLoading}
				className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
			>
				Send
			</button>
		</form>
	);
}
