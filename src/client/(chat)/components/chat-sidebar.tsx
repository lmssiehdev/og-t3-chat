"use client";
import { MessageSquarePlus, Search } from "lucide-react";

import { SearchThreads } from "@/components/search";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { db } from "@/db/instant";
import { UserButton, useUser } from "@clerk/nextjs";
import { memo, useEffect, useState } from "react";
import { NavLink } from "react-router";
import { ThreadLink } from "./t3-chat";
import { Button } from "@/components/ui/button";

export const PrefetchThread = memo(
	({ threadId, onFetched }: { threadId: string; onFetched?: () => void }) => {
		db.useQuery({
			threads: {
				$: {
					where: {
						id: threadId,
					},
					limit: 1,
				},
			},
		});
		useEffect(() => {
			onFetched?.();
		}, [onFetched]);
		return null;
	},
);
export function AppSidebar() {
	const [searchOpen, setSearchOpen] = useState(false);
	const { data: threadData } = db.useQuery({
		threads: {
			$: {
				order: {
					updatedAt: "desc",
				},
			},
		},
	});
	return (
		<>
			<SearchThreads open={searchOpen} setOpen={setSearchOpen} />
			<Sidebar>
				{/* // TODO: change border radius default in shadcn */}

				<SidebarContent className="p-4 clas">
					<h2 className="text-lg font-semibold">
						<a
							className="flex items-center gap-2"
							href="/"
							data-discover="true"
						>
							<span className="text-xl font-light text-neutral-200">
								OG T3 Chat
							</span>
						</a>
					</h2>
					<div className="pb-2 pt-4">
						<NavLink
							to="/chat"
							className="group flex flex-row items-center gap-2 text-pink-400 hover:opacity-80"
						>
							<MessageSquarePlus className="size-4" />
							<span className="">New Chat</span>
						</NavLink>
					</div>
					<SidebarGroup className="p-0 space-y-2">
						<h2 className="flex justify-between items-center font-semibold text-neutral-400 ">
							Recent Threads
							<Button onClick={() => setSearchOpen(true)} variant={"ghost"} size={"icon"}>
								<Search className="size-4.5" />
							</Button>
						</h2>
						<SidebarGroupContent>
							<SidebarMenu>
								{(threadData?.threads ?? []).map((item, i, arr) => {
									const ranking = arr.length - i;
									return (
										<SidebarMenuItem key={item.id}>
											<ThreadLink
												key={item.title}
												isBranch={item.isBranch}
												threadId={item.id}
												title={item.title}
											/>
											{/* {ranking > arr.length - 5 && (
											<PrefetchThread threadId={item.title} />
										)} */}
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
				<div className="flex flex-col gap-2 p-2 border-t-2">
					<p className="font-semibold">Keyboard shortcuts</p>
					<p className="flex justify-between items-center text-muted-foreground text-sm">
						Search{" "}
						<kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
							<span className="text-xs">ctrl +</span>K
						</kbd>
					</p>
					<p className="flex justify-between items-center text-muted-foreground text-sm">
						Toggle sidebar{" "}
						<kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
							<span className="text-xs">ctrl +</span>B
						</kbd>
					</p>
					<p className="flex justify-between items-center text-muted-foreground text-sm">
						New Chat{" "}
						<kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
							<span className="text-xs">ctrl +</span>O
						</kbd>
					</p>
				</div>
				<SideBarUserArea />
			</Sidebar>
		</>
	);
}
function SideBarUserArea() {
	const { isSignedIn, user } = useUser();
	console.log(user);
	return (
		<div className="p-4 flex gap-3 h-20 border-t-2">
			<UserButton
				appearance={{
					elements: {
						avatarBox: "h-10! w-10!",
					},
				}}
			/>
			<div className="">
				<div className="font-semibold">
					{user?.fullName ?? user?.username ?? "No name"}
				</div>
				<div className="text-gray-400/70 text-sm font-semibold">Noob</div>
			</div>
		</div>
	);
}
