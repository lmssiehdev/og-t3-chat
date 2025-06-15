"use client";
import { db } from "@/db/instant";
import { GitBranch } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";


export function ThreadLink({
	threadId,
	title,
	isBranch,
}: { threadId: string; title: string; isBranch?: boolean }) {
	const pathname = usePathname();
	const router = useRouter();
	const isActive = pathname.includes(threadId);

	async function deleteThread() {
		// TODO: moddal confirmation
		if (pathname.includes(threadId)) await router.push("/chat");
		setTimeout(() => {
			db.transact(db.tx.threads[threadId].delete());
		}, 200);
	}

	return (
		<Link
			href={`/chat/${threadId}`}
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
		</Link>
	);
}
