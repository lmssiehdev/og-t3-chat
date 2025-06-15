"use client";
import { MessageSquarePlus } from "lucide-react";

import { ThreadLink } from "@/components/t3-components";
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
import Link from "next/link";

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
	const { data: threadData } = db.useQuery({
		threads: {
			$: {
				order: {
					createdAt: "desc",
				},
			},
		},
	});

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
				<SidebarGroup className="p-0 space-y-2">
					<h2 className="font-semibold text-neutral-400 ">Recent Threads</h2>
					<SidebarGroupContent>
						<SidebarMenu>
							{(threadData?.threads ?? []).map((item) => (
								<SidebarMenuItem key={item.id}>
									<ThreadLink
										isBranch={item.isBranch}
										threadId={item.id}
										title={item.title}
									/>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SideBarUserArea />
		</Sidebar>
	);
}
function SideBarUserArea() {
	const { isSignedIn, user } = useUser();

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
				<div className="font-semibold">{user?.fullName ?? "No name"}</div>
				<div className="text-gray-400/70 text-sm font-semibold">Noob</div>
			</div>
		</div>
	);
}
