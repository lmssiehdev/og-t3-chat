"use client";

import { CopyThreadButton } from "@/components/t3-components";
import type { UIMessage } from "ai";

export function ChatUiMessageWithImageSupport({
	message,
}: { message: UIMessage }) {
	const hasImages = message.experimental_attachments?.filter((attachment) =>
		attachment.contentType?.startsWith("image/"),
	);
	return (
		<div
			className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}
		>
			<div className="group relative bg-[#2D2D2D] rounded-2xl p-4 inline-block text-left max-w-[80%] break-words">
				<div key={message.id}>
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
				<CopyThreadButton content={message.content} />
			</div>
		</div>
	);
}
