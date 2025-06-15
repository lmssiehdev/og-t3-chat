import { db } from "@/db/instant";
import { createNewBranch } from "@/db/mutators";
import { useInstantAuth } from "@/providers/instant-auth";
import { type UseChatHelpers, useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useMemo, useState } from "react";
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
		if (!shouldCreateThread) return <div>No thread found</div>;
		return (
			<div className="flex flex-col h-full relative w-full">
				<div className="flex-1 mx-auto flex w-full max-w-3xl flex-col space-y-12 h-[calc(100dvh-120px)]">
					<div className="flex-1 mb-4" />
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
			</div>
		);
	}

	if (!dbMessages?.threads[0]?.messages) {
		return null;
	}
	const thread = dbMessages?.threads[0];
	return (
		<div className="flex flex-col h-full relative w-full">
			<div className="flex-1 mx-auto flex w-full max-w-3xl flex-col space-y-12 h-[calc(100dvh-120px)]">
				<div className="flex-1 mb-4">
					{dbMessages.threads[0].messages
						.map((m) => ({ ...m, content: m.text }))
						.map((m) => (
							<ChatUiMessageWithImageSupport
								onBranching={async (messageId: string) => {
									const newThreadId = await createNewBranch(
										thread,
										thread.messages,
										userAuthId,
										messageId,
									);
									navigate(`/chat/${newThreadId}`);
								}}
								key={m.id}
								message={m as unknown as UIMessage}
							/>
						))}
					{activeStreamingMessages?.content.length && (
						<ChatUiMessageWithImageSupport
							onBranching={async (messageId: string) => {
								const newThreadId = await createNewBranch(
									thread,
									thread.messages,
									userAuthId,
									messageId,
								);
								navigate(`/chat/${newThreadId}`);
							}}
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
