"use client";

import type { useChat } from "@ai-sdk/react";
import type { CodeToHtmlOptions } from "@llm-ui/code";
import {
	allLangs,
	allLangsAlias,
	codeBlockLookBack,
	findCompleteCodeBlock,
	findPartialCodeBlock,
	loadHighlighter,
	useCodeBlockToHtml,
} from "@llm-ui/code";
import { markdownLookBack } from "@llm-ui/markdown";
import { type LLMOutputComponent, useLLMOutput } from "@llm-ui/react";
import parseHtml from "html-react-parser";
import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getHighlighterCore } from "shiki/core";
import { bundledLanguagesInfo } from "shiki/langs";

import githubDark from "shiki/themes/github-dark.mjs";
import getWasm from "shiki/wasm";

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

// -------Step 2: Create a code block component-------

const highlighter = loadHighlighter(
	getHighlighterCore({
		langs: allLangs(bundledLanguagesInfo),
		langAlias: allLangsAlias(bundledLanguagesInfo),
		themes: [githubDark],
		loadWasm: getWasm,
	}),
);

const codeToHtmlOptions: CodeToHtmlOptions = {
	theme: "github-dark",
};

// Customize this component with your own styling
const CodeBlock: LLMOutputComponent = ({ blockMatch }) => {
	const { html, code } = useCodeBlockToHtml({
		markdownCodeBlock: blockMatch.output,
		highlighter,
		codeToHtmlOptions,
	});
	if (!html) {
		// fallback to <pre> if Shiki is not loaded yet
		return (
			<pre className="shiki p-2">
				<code>{code}</code>
			</pre>
		);
	}
	return <>{parseHtml(html)}</>;
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
		console.log("rendering message with id", message.substring(0, 10));
		const { blockMatches } = useLLMOutput({
			llmOutput: message,
			fallbackBlock: {
				component: MarkdownComponent,
				lookBack: markdownLookBack(),
			},
			blocks: [
				{
					component: CodeBlock,
					findCompleteMatch: findCompleteCodeBlock(),
					findPartialMatch: findPartialCodeBlock(),
					lookBack: codeBlockLookBack(),
				},
			],
			isStreamFinished,
		});

		return (
			<>
				<div className={`mb-4 ${role === "user" ? "text-right" : "text-left"}`}>
					<div
						className={`inline-block p-3 rounded-lg ${
							role === "user"
								? "bg-blue-500 text-white"
								: "bg-gray-200 text-black"
						}`}
					>
						{blockMatches.map((blockMatch, index) => {
							const Component = blockMatch.block.component;
							return <Component key={index} blockMatch={blockMatch} />;
						})}
					</div>
				</div>
			</>
		);
	},
);

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
