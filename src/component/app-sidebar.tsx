"use client";
import { MessageSquare, MessageSquarePlus, XIcon } from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { db } from "@/db/instant";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// Menu items.
const items = [
	{
		title: "Welcome to OG T3 Chat",
		url: "#",
	},
	{
		title: "Why OG T3 Chat?",
		url: "#",
	},

	{
		title: "FAQ",
		url: "#",
	},
];

export function AppSidebar() {
	const { isSignedIn, user } = useUser();
	const path = usePathname();
	const router = useRouter();

	const {
		data: threadData,
		error: threadError,
		isLoading: threadIsLoading,
	} = db.useQuery({
		threads: {
			$: {},
		},
	});

	async function deleteThread(threadId: string) {
		// TODO: moddal confirmation
		if (path.includes(threadId)) await router.push("/chat");
		setTimeout(() => {
			db.transact(db.tx.threads[threadId].delete());
		}, 200)
	}

	return (
		<Sidebar>
			{/* // TODO: change border radius default in shadcn */}
			<SidebarContent className="p-4 clas">
				<h2 className="text-lg font-semibold">
					<a className="flex items-center gap-2" href="/" data-discover="true">
						<span className="text-xl font-light text-neutral-200">
							OG T3 Chat
						</span>
					</a>
				</h2>
				<div className="pb-2 pt-4">
					<Link
						href="/chat"
						className="group flex flex-row items-center gap-2 text-pink-400 hover:opacity-80"
					>
						<MessageSquarePlus className="size-4" />
						<span className="">New Chat</span>
					</Link>
				</div>
				<SidebarGroup className="p-0">
					<SidebarGroupLabel className="p-0 my-2">
						Recent Threads
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{(threadData?.threads ?? []).map((item) => (
								<SidebarMenuItem key={item.id}>
									<SidebarMenuButton
										className="justify-between px-2 group/button"
										asChild
									>
										<div className="flex w-full">
											<Link
												href={`/chat/${item.id}`}
												className="flex flex-row gap-2 rounded-sm flex-1 overflow-hidden"
											>
												<div className="p-1">
													<MessageSquare className="size-3" />
												</div>
												<div className="line-clamp-2 overflow-hidden text-ellipsis">
													{item.title}
												</div>
											</Link>

											<button
												className="flex items-center gap-1 ml-2"
												onClick={(e) => {
													e.stopPropagation();
													deleteThread(item.id);
												}}
											>
												<XIcon className="cursor-pointer size-4 hover:text-red-500 opacity-0 group-hover/button:opacity-100 transition-opacity duration-200" />
											</button>
										</div>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<div>
				{isSignedIn ? (
					<div className="p-4 flex gap-3 h-20">
						<UserButton
							appearance={{
								elements: {
									avatarBox: "h-10! w-10!",
								},
							}}
						/>
						<div className="">
							<div className="font-semibold">{user.fullName}</div>
							<div className="text-gray-400/70 text-sm font-semibold">Noob</div>
						</div>
					</div>
				) : (
					<div className="mt-auto flex flex-row justify-between border-t border-neutral-700 p-4">
						<a href="/login">Login</a>
					</div>
				)}
			</div>
		</Sidebar>
	);
}
