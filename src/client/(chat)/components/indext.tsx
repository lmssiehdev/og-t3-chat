import { db } from "@/db/instant";
import { createNewBranch } from "@/db/mutators";
import { useInstantAuth } from "@/providers/instant-auth";
import { type UseChatHelpers, useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useCallback, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { FileUploadChatInputDemo } from "./input";
import { ChatUiMessageWithImageSupport } from "./t3-chat";

export function ChatComponent({
	threadId,
	shouldCreateThread = false,
}: {
	threadId: string;
	shouldCreateThread?: boolean;
}) {
	const [lastStreamingClientId, setLastStreamingClientId] = useState<
		string | null
	>(null);
	const { userAuthId } = useInstantAuth();
	const [completedMessageIds, setCompletedMessageIds] = useState(
		new Set<string>(),
	);
	const { pathname } = useLocation();
	const navigate = useNavigate();

	const {
		messages,
		input,
		handleSubmit,
		handleInputChange,
		status,
		isLoading,
		stop,
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
		onResponse: async (response) => {
			// Access headers
			const customId = response.headers.get("X-Custom-Id");
			setLastStreamingClientId(customId);
		},
		onFinish: ({ id }: { id: string }) => {
			setCompletedMessageIds((c) => {
				const newSet = new Set(c);
				newSet.add(id);
				return newSet;
			});
			if (!shouldCreateThread) return;
			if (!pathname.includes(threadId)) navigate(`/chat/${threadId}`);
		},
	});
	const { data: dbMessages, isLoading: isDbMessagesLoading } = db.useQuery({
		threads: {
			$: { where: { id: threadId } },
			messages: {
				$: {
					order: {
						createdAt: "asc",
					},
				},
			},
		},
	});

	const messagesEndRef = useRef<HTMLDivElement>(
		null,
	) as React.RefObject<HTMLDivElement>;

	// // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	// const activeStreamingMessages = useMemo(() => {
	// 	if (!messages || messages?.length === 0) return undefined;
	// 	const lastMessage = messages[messages.length - 1];

	// 	if (
	// 		!completedMessageIds.has(lastMessage.id) &&
	// 		lastMessage.role !== "user"
	// 	) {
	// 		return lastMessage;
	// 	}

	// 	return undefined;
	// }, [messages, completedMessageIds]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const activeStreamingMessages = useMemo(() => {
		if (!messages || messages?.length === 0) return undefined;

		const lastMessage = messages[messages.length - 1];
		const lastDbMessage =
			dbMessages?.threads[0]?.messages[
				dbMessages?.threads[0]?.messages.length - 1
			];

		if (
			!lastStreamingClientId ||
			lastMessage.role === "user" ||
			lastDbMessage?.id === lastStreamingClientId
		)
			return undefined;

		messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
		return lastMessage;
	}, [messages, completedMessageIds, isLoading, dbMessages, lastStreamingClientId]);

	// useEffect(() => {
	// 	messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
	// }, [messages]);

	const thread = dbMessages?.threads[0];

	const onBranching = useCallback(
		async (messageId: string) => {
			if (!thread) return;
			const newThreadId = await createNewBranch(
				thread,
				thread.messages,
				userAuthId,
				messageId,
			);
			navigate(`/chat/${newThreadId}`);
		},
		[thread, userAuthId, navigate],
	);

	if (!dbMessages?.threads[0]?.messages) {
		if (!shouldCreateThread) return null;
		return (
			<div className="flex flex-col h-full relative w-full">
				<div className="flex-1 mx-auto flex w-full max-w-3xl flex-col space-y-12 h-[calc(100dvh-120px)]">
					<div className="flex-1 mb-4" />
					<FileUploadChatInputDemo
						ref={messagesEndRef}
						shouldCreateThread={shouldCreateThread}
						threadId={threadId}
						useChat={{
							messages,
							input,
							handleSubmit,
							handleInputChange,
							status,
							stop,
						} as UseChatHelpers}
					/>
				</div>
			</div>
		);
	}

	if (!dbMessages?.threads[0]?.messages) {
		return null;
	}
	return (
		<div className="flex flex-col h-full relative w-full">
			<div className="flex-1 mx-auto flex w-full max-w-3xl flex-col space-y-12 h-[calc(100dvh-120px)]">
				<div className="flex-1 mb-4">
					{dbMessages.threads[0].messages
						.map((m) => ({ ...m, content: m.text }))
						.map((message) => (
							<ChatUiMessageWithImageSupport
								onBranching={onBranching}
								key={message.id}
								message={message as unknown as UIMessage}
							/>
						))}
					{activeStreamingMessages?.content.length && (
						<ChatUiMessageWithImageSupport
							isStreaming={true}
							onBranching={onBranching}
							message={activeStreamingMessages}
						/>
					)}

					{isLoading && (
						<div className="text-left">
							<span className="animate-pulse">▊</span>
						</div>
					)}
				</div>
			</div>
			<FileUploadChatInputDemo
				ref={messagesEndRef}
				shouldCreateThread={shouldCreateThread}
				threadId={threadId}
				useChat={
					{
						messages,
						input,
						handleSubmit,
						handleInputChange,
						status,
						stop,
					} as UseChatHelpers
				}
			/>
		</div>
	);
}
