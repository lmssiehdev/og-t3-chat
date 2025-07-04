"use client";
import { MemoizedMarkdownBlock } from "@/components/memoized-markdown";
import { type Message, deleteThread } from "@/db/mutators";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import "highlight.js/styles/vs2015.css";
import {
	FileArchiveIcon,
	FileAudioIcon,
	FileCodeIcon,
	FileCogIcon,
	FileIcon,
	FileTextIcon,
	FileVideoIcon,
	GitBranch,
	LucideCopy,
	MessageSquare,
	PinIcon,
} from "lucide-react";
import { memo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

import { useCopyToClipboard } from "usehooks-ts";
import { Link } from "./chat-link";
// in their raw html form aka their purest
export const ChatUiMessageWithImageSupport = memo(
	function ChatUiMessageWithImageSupport({
		message,
		onBranching,
		showChatButtons = true,
	}: {
		showChatButtons?: boolean;
		message: UIMessage & { metadata?: Message["metadata"] };
		onBranching?: (messageId: string) => void;
	}) {
		const [editable, setEditable] = useState(false);
		const [inputValue, setInputValue] = useState("");
		const hasImage = message?.metadata?.imageUrl;
		const isUser = message.role === "user";

		return (
			<div className={`mb-4 ${isUser ? "text-right" : "text-left"}`}>
				<div
					className={cn(
						{
							"bg-[#1D1D1D]! border inset-shadow-2xs": editable,
							"bg-[#2D2D2D]": isUser,
						},
						"group relative rounded-2xl p-4 inline-block text-left max-w-[80%] mb-8 break-words",
					)}
				>
					{editable ? (
						<div>
							<input
								autoFocus
								className="outline-none"
								value={inputValue}
								onChange={(e) => {
									setInputValue(e.target.value);
								}}
							/>
						</div>
					) : (
						<div key={message.id} className="space-y-2">
							<MemoizedMarkdownBlock content={message.content} />
							{isUser &&
								message.metadata &&
								message.metadata?.attachments?.length > 0 &&
								message.metadata?.attachments.map((attachment) => (
									<div
										key={attachment.name}
										className="truncate font-normal text-[13px] leading-snug flex items-center gap-1 bg-accent p-2 rounded w-full max-w-30"
									>
										<div className="[&>svg]:size-4">
											<AttachementFileIcon
												contentType={attachment.contentType}
												name={attachment.name}
											/>
										</div>
										{attachment.name}
									</div>
								))}
							{/* Display image attachments */}
							{hasImage && <img src={hasImage} alt="Attachment" />}
						</div>
					)}
					{showChatButtons && (
						<div className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 text-secondary-foreground shadow-sm h-8 rounded-md px-3 text-xs absolute -bottom-8 right-2 opacity-0 transition-opacity group-hover:opacity-100 mt-4 z-10 bg-transparent">
							{message.role !== "user" && (
								<CreateBranchButton
									onBranching={() => {
										if (onBranching) onBranching(message.id);
									}}
								/>
							)}
							<CopyThreadButton content={message.content} />
						</div>
					)}
				</div>
			</div>
		);
	},
	(prev, next) => prev.message.content === next.message.content,
);

function CreateBranchButton({ onBranching }: { onBranching?: () => void }) {
	return (
		<button
			className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-8 rounded-md px-3 text-xs transition-opacity group-hover:opacity-100 mt-4 z-10"
			onClick={onBranching}
		>
			<GitBranch className="mr-2 h-4 w-4" />
			Create branch{" "}
		</button>
	);
}
export const ThreadLink = memo(
	({
		threadId,
		title,
		isBranch,
		isPinned,
		useCustomLink = true,
	}: {
		useCustomLink?: boolean;
		threadId: string;
		title: string;
		isPinned?: boolean;
		isBranch?: boolean;
	}) => {
		const { pathname } = useLocation();
		const navigate = useNavigate();

		const CustomLink = useCustomLink ? Link : NavLink;
		return (
			<CustomLink
				to={`/chat/${threadId}`}
				className={({ isActive }) =>
					`group/item relative flex items-start rounded-sm hover:bg-[#2D2D2D]/40 ${isActive ? "bg-[#2D2D2D]/60" : ""}`
				}
			>
				<div className="flex flex-row gap-2 rounded-sm px-2 py-1 pr-8 overflow-hidden">
					{isPinned && (
						<PinIcon className="block mt-1.5 size-3 shrink-0 text-neutral-400" />
					)}
					{isBranch ? (
						<GitBranch className="mt-1.5 size-3 shrink-0 text-neutral-400" />
					) : (
						<MessageSquare className="mt-1.5 size-3 shrink-0 text-neutral-400" />
					)}

					<div className="line-clamp-2 overflow-hidden text-ellipsis">
						{title}
					</div>
				</div>
				<button
					onMouseDown={(e) => {
						e.stopPropagation();
					}}
					onClick={async (e) => {
						e.stopPropagation();
						e.preventDefault();

						if (pathname.includes(threadId)) navigate("/chat");
						await deleteThread(threadId);
					}}
					className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 hover:text-red-500 group-hover/item:opacity-100"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
			</CustomLink>
		);
	},
);

export function CopyThreadButton({ content }: { content: string }) {
	const [_, copy] = useCopyToClipboard();

	const handleCopy = (text: string) => {
		copy(text)
			.then(() => {
				toast.success("Copied!");
			})
			.catch((error) => {
				toast.error("Failed to copy!");
			});
	};

	return (
		<button
			onClick={() => {
				handleCopy(content);
			}}
			className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-8 rounded-md px-3 text-xs transition-opacity group-hover:opacity-100 mt-4 z-10"
		>
			<LucideCopy className=" mr-2 h-4 w-4 text-xs" />
			Copy
		</button>
	);
}

function AttachementFileIcon({
	contentType,
	name,
}: { contentType: string; name: string }) {
	const type = contentType;
	const extension = name.split(".").pop()?.toLowerCase() ?? "";

	if (type.startsWith("video/")) {
		return <FileVideoIcon />;
	}

	if (type.startsWith("audio/")) {
		return <FileAudioIcon />;
	}

	if (
		type.startsWith("text/") ||
		["txt", "md", "rtf", "pdf"].includes(extension)
	) {
		return <FileTextIcon />;
	}

	if (
		[
			"html",
			"css",
			"js",
			"jsx",
			"ts",
			"tsx",
			"json",
			"xml",
			"php",
			"py",
			"rb",
			"java",
			"c",
			"cpp",
			"cs",
		].includes(extension)
	) {
		return <FileCodeIcon />;
	}

	if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(extension)) {
		return <FileArchiveIcon />;
	}

	if (
		["exe", "msi", "app", "apk", "deb", "rpm"].includes(extension) ||
		type.startsWith("application/")
	) {
		return <FileCogIcon />;
	}

	return <FileIcon />;
}
