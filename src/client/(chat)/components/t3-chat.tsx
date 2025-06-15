"use client";
import { db } from "@/db/instant";
import type { UIMessage } from "ai";
import { GitBranch } from "lucide-react";
import { memo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";

// in their raw html form aka their purest
export const ChatUiMessageWithImageSupport = memo(
    function ChatUiMessageWithImageSupport({
        message,
        onBranching,
    }: { message: UIMessage; onBranching?: (messageId: string) => void }) {
        const hasImages = message.experimental_attachments?.filter((attachment) =>
            attachment.contentType?.startsWith("image/"),
        );
        return (
            <div
                className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}
            >
                <div className="group relative bg-[#2D2D2D] rounded-2xl p-4 inline-block text-left max-w-[80%] break-words">
                    <div key={message.id} className="space-y-2">
                        <div>{message.content}</div>
                        {/* Display image attachments */}
                        {hasImages && (
                            <div className="flex flex-wrap gap-2">
                                {hasImages.map((attachment, index) => (
                                    <img
                                        key={`${message.id}-${index}`}
                                        src={attachment.url}
                                        alt={attachment.name || "Attachment"}
                                        className="max-w-xs rounded-lg"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
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
                </div>
            </div>
        );
    },
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

export function ThreadLink({
    threadId,
    title,
    isBranch,
}: { threadId: string; title: string; isBranch?: boolean }) {
    const {pathname} = useLocation();
    const navigate = useNavigate();
    const isActive = pathname.includes(threadId);

    async function deleteThread() {
        // TODO: moddal confirmation
        if (pathname.includes(threadId)) await navigate("/chat");
        setTimeout(() => {
            db.transact(db.tx.threads[threadId].delete());
        }, 200);
    }

    return (
        <NavLink
            to={`/chat/${threadId}`}
            className={`group/item relative flex items-start rounded-sm hover:bg-[#2D2D2D]/40 ${isActive ? "bg-[#2D2D2D]/60" : ""}`}
        >
            <div className="flex flex-row gap-2 rounded-sm px-2 py-1 pr-8">
                {isBranch ? (
                    <GitBranch className="mt-1.5 size-3 shrink-0 text-neutral-400" />
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-message-square mt-1.5 size-3 shrink-0 text-neutral-400"
                    >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                )}

                <div className="line-clamp-2 overflow-hidden text-ellipsis">
                    {title}
                </div>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    deleteThread();
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
        </NavLink>
    );
}

export function CopyThreadButton({ content }: { content: string }) {
    const [_, copy] = useCopyToClipboard();

    const handleCopy = (text: string) => {
        copy(text)
            .then(() => {
                console.log("Copied!");
                toast.success("Copied!");
            })
            .catch((error) => {
                toast.error("Failed to copy!");
            });
    };

    return (
        <button
            onClick={() => {
                console.log("content", content);
                handleCopy(content);
            }}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-8 rounded-md px-3 text-xs transition-opacity group-hover:opacity-100 mt-4 z-10"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-copy mr-2 h-4 w-4"
            >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            Copy response
        </button>
    );
}
