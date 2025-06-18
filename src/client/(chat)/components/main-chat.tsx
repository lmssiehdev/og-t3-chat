import { db } from "@/db/instant";
import { createNewBranch } from "@/db/mutators";
import useScrollToBottom from "@/hooks/use-scroll-to-bottom";
import { useInstantAuth } from "@/providers/instant-auth";
import { type UseChatHelpers, useChat } from "@ai-sdk/react";
import { id } from "@instantdb/react";
import type { UIMessage } from "ai";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { FileUploadChatInputDemo } from "./chat-input";
import { ChatUiMessageWithImageSupport } from "./t3-chat";

//! TODO: split this bad boy
export function ChatComponent({
	threadId,
	shouldCreateThread = false,
}: {
	threadId: string;
	shouldCreateThread?: boolean;
}) {
	const { showScrollButton, scrollToBottom } = useScrollToBottom();
	const [lastStreamingClientId, setLastStreamingClientId] = useState<{
		messageId: string;
		threadId: string;
	}>({ messageId: "", threadId: "" });
	const { userAuthId } = useInstantAuth();
	const { pathname } = useLocation();
	const navigate = useNavigate();

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

	const initialMessages = useMemo(() => {
		if (!dbMessages?.threads[0]?.messages || pathname === "/chat") return [];
		return dbMessages.threads[0].messages.map(
			({ id, text, createdAt, role }) =>
				({
					id,
					content: text,
					createdAt: new Date(createdAt),
					role: role === "user" ? "user" : "assistant",
				}) as const,
		);
	}, [dbMessages, pathname]);

	const {
		messages,
		input,
		handleSubmit,
		handleInputChange,
		status,
		isLoading,
		stop,
		setMessages,
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
			const messageId = response.headers.get("X-Message-Id")!;
			const threadId = response.headers.get("X-Thread-Id")!;
			setLastStreamingClientId({ messageId, threadId });
		},
		onFinish: () => {
			if (!shouldCreateThread) return;
			if (!pathname.includes(threadId)) navigate(`/chat/${threadId}`);
		},
	});

	useEffect(() => {
		setMessages(initialMessages);
	}, [initialMessages, setMessages]);

	const activeStreamingMessages = useMemo(() => {
		if (
			!messages ||
			messages?.length === 0 ||
			!lastStreamingClientId.messageId ||
			!lastStreamingClientId.threadId
		)
			return undefined;
		const lastMessage = messages[messages.length - 1];

		const dbMessageIds = new Set(
			dbMessages?.threads[0]?.messages.map((m) => m.id),
		);

		const { messageId, threadId: streamingMessageThreadId } =
			lastStreamingClientId;

		if (dbMessageIds.has(messageId!)) {
			setLastStreamingClientId({ messageId: "", threadId: "" });
			return undefined;
		}

		if (threadId !== streamingMessageThreadId) {
			return undefined;
		}

		if (!dbMessageIds.has(messageId) && lastMessage.role !== "user") {
			return lastMessage;
		}

		return undefined;
	}, [messages, lastStreamingClientId, dbMessages, threadId]);

	const onBranching = useCallback(
		async (messageId: string) => {
			const thread = dbMessages?.threads[0];
			if (!thread) return;
			const newThreadId = id();
			navigate(`/chat/${newThreadId}`);
			await createNewBranch(
				newThreadId,
				thread,
				thread.messages,
				userAuthId,
				messageId,
			);
		},
		[dbMessages, userAuthId, navigate],
	);

	if (!dbMessages?.threads[0]?.messages || pathname === "/chat") {
		if (!shouldCreateThread) return null;

		return (
			<div className="flex flex-col h-full relative w-full">
				<div className="flex-1 mx-auto flex w-full max-w-3xl flex-col space-y-12 h-[calc(100dvh-120px)]">
					<div className="flex-1 mb-4" />
					<FileUploadChatInputDemo
						showScrollButton={showScrollButton}
						scrollToBottom={scrollToBottom}
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
						.map((message, i) => (
							<Fragment key={message.id}>
								<ChatUiMessageWithImageSupport
									onBranching={onBranching}
									message={message as unknown as UIMessage}
								/>
							</Fragment>
						))}
					{activeStreamingMessages?.content.length && (
						<ChatUiMessageWithImageSupport
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
				showScrollButton={showScrollButton}
				scrollToBottom={scrollToBottom}
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
