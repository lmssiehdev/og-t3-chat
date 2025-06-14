"use client";

import type { useChat } from "@ai-sdk/react";
import { markdownLookBack } from "@llm-ui/markdown";
import { type LLMOutputComponent, useLLMOutput } from "@llm-ui/react";
import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


// -------Step 1: Create a markdown component-------

// Customize this component with your own styling
const MarkdownComponent: LLMOutputComponent = ({ blockMatch }) => {
	const markdown = blockMatch.output;
	return (
		<ReactMarkdown className={"markdown"} remarkPlugins={[remarkGfm]}>
			{markdown}
		</ReactMarkdown>
	);
};

// -------Step 3: Render markdown and code with llm-ui-------

export const Message = memo(
	({
		message,
		role,
		isStreamFinished,
	}: {
		message: string;
		role: "user" | "ai";
		isStreamFinished: boolean;
	}) => {
		const { blockMatches } = useLLMOutput({
			llmOutput: message,
			fallbackBlock: {
				component: MarkdownComponent,
				lookBack: markdownLookBack(),
			},
			isStreamFinished,
		});

		return (
			<>
			<ChatMesssageUi role={role}>
				{blockMatches.map((blockMatch, index) => {
					const Component = blockMatch.block.component;
					return <Component key={index} blockMatch={blockMatch} />;
				})}
			</ChatMesssageUi>
			</>
		);
	},
);

export function ChatMesssageUi({ role, children }: { role: "user" | "ai"; children: React.ReactNode }) {
	return 				<div className={`mb-4 ${role === "user" ? "text-right" : "text-left"}`}>
	<div
		className={`inline-block p-3 rounded-lg ${
			role === "user"
				? "bg-blue-500 text-white"
				: "bg-gray-200 text-black"
		}`}
	>
		{children}
	</div>
</div>
};

type R = ReturnType<typeof useChat>;
type Props = {
	message?: R["messages"][number];
	isLoading: R["isLoading"];
};
export const StreamingMessages = ({ message, isLoading }: Props) => {
	if (!message || message.role === "user") return null;
	return (
		<div className="flex flex-col stretch flex-1 overflow-y-auto">
			<div className="whitespace-pre-wrap">
				<Message
					role={"ai"}
					message={message.content}
					isStreamFinished={!isLoading}
				/>
			</div>
			{isLoading && (
				<div className="text-left">
					<div className="inline-block p-3 rounded-lg bg-gray-200">
						Thinking...
					</div>
				</div>
			)}
		</div>
	);
};
