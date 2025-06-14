"use client";
import { ChatMesssageUi, Message } from "@/component/llm-ui";
import { DropdownMenuRadioGroupDemo } from "@/component/model-selector";
import { SUPPORTED_MODELS } from "@/constants";
import { db } from "@/db/instant";
import { useInstantAuth } from "@/providers/instant-auth";
import { useChat } from "@ai-sdk/react";
import { id } from "@instantdb/react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
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
	const chatConfig = useMemo(
		() => ({
			api: "/api/chat",
			body: {
				threadId,
				userAuthId,
				shouldCreateThread,
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
		}),
		[threadId, userAuthId, shouldCreateThread, pathname, router],
	);

	const { messages, append, isLoading } = useChat(chatConfig);
	const { data: dbMessages } = db.useQuery({
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

	const onSubmit = async (
		message: string,
		additionalData: Record<string, unknown> = {},
	) => {
		if (!message.trim()) return;
		try {
			await append(
				{ role: "user", content: message },
				{
					body: {
						...additionalData,
					},
				},
			);
		} catch (error) {
			console.error("Failed to send message:", error);
		}
	};

	if (!dbMessages?.threads[0]?.messages) {
		return (
			<ChartInput
				isLoading={isLoading}
				payload={{ threadId, userAuthId }}
				onSubmit={onSubmit}
			/>
		);
	}

	return (
		<div>
			<div className="flex-1">
				<h1>Chat</h1>
			</div>
			<div className="flex flex-col">
				<div className="min-h-[400px] overflow-y-auto p-4 mb-4">
					{dbMessages.threads[0].messages.map((m) => (
						<Message
							role={m.role!}
							key={m.id}
							message={m.text}
							isStreamFinished={true}
						/>
					))}
					{ activeStreamingMessages?.content.length &&
						<ChatMesssageUi role={"ai"}>
						{activeStreamingMessages?.content}
					</ChatMesssageUi>
}
					{isLoading && (
					<div className="text-left">
						<div className="inline-block p-3 rounded-lg bg-gray-200">
							Thinking...
						</div>
					</div>
					)}
				</div>
			</div>
			<ChartInput
				isLoading={isLoading}
				payload={{ threadId, userAuthId }}
				onSubmit={onSubmit}
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
	const [modelInStorage, setModelInStorage] = useLocalStorage<string>(
		"last-model",
		SUPPORTED_MODELS[0],
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
				onSubmit(message, { model: selectedModel });
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
				<textarea
					name="message"
					disabled={isLoading}
					className="focus-none border-none w-full flex-grow resize-none bg-transparent text-base leading-6 h-[72px] text-neutral-100 outline-none mb-8"
					placeholder="Type your message here..."
				/>
				<div className="absolute bottom-0 left-0">
					<DropdownMenuRadioGroupDemo
						position={selectedModel}
						sestPosition={(v) => {
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

async function createMessage(
	threadId: string,
	userAuthId: string,
	text: string,
	role: "user" | "ai",
) {
	const messageId = id();
	await db.transact([
		db.tx.messages[messageId].update({
			createdAt: Date.now(),
			text,
			role,
			metadata: {},
			userAuthId,
		}),
		//  Linking, there is one extra, remove it
		db.tx.$users[userAuthId].link({ messages: messageId }),
		db.tx.messages[messageId].link({ thread: threadId }),
		db.tx.threads[threadId].link({ messages: messageId }),
	]);

	return messageId;
}
