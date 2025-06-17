import { db } from "@/db/instant";
import { createNewBranch } from "@/db/mutators";
import { useInstantAuth } from "@/providers/instant-auth";
import { type UseChatHelpers, useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { Fragment, useCallback, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { FileUploadChatInputDemo } from "./chat-input";
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
			const customId = response.headers.get("X-Custom-Id");
			setLastStreamingClientId(customId);
		},
		onFinish: () => {
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

	const activeStreamingMessages = useMemo(() => {
		if (!messages || messages?.length === 0 || !lastStreamingClientId)
			return undefined;
		const lastMessage = messages[messages.length - 1];

		const dbMessageIds = new Set(
			dbMessages?.threads[0]?.messages.map((m) => m.id),
		);

		if (dbMessageIds.has(lastStreamingClientId!)) {
			setLastStreamingClientId(null);
			return undefined;
		}

		if (
			!dbMessageIds.has(lastStreamingClientId) &&
			lastMessage.role !== "user"
		) {
			return lastMessage;
		}

		return undefined;
	}, [messages, lastStreamingClientId, dbMessages]);

	const onBranching = useCallback(
		async (messageId: string) => {
			const thread = dbMessages?.threads[0];
			if (!thread) return;
			const newThreadId = await createNewBranch(
				thread,
				thread.messages,
				userAuthId,
				messageId,
			);
			navigate(`/chat/${newThreadId}`);
		},
		[dbMessages, userAuthId, navigate],
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
