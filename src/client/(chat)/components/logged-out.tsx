import type { UseChatHelpers } from "@ai-sdk/react";
import { MessageSquarePlus } from "lucide-react";
import { FileUploadChatInputDemo } from "./input";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavLink } from "react-router";
import { useParams } from "react-router";
import { ThreadLink } from "./t3-chat";
import { PageData } from "./welcome";

export function LoggedoutChatComponent() {
	const { id } = useParams<{ id: string }>();
	if (!id) return null;

	const { component, input } = PageData[id as keyof typeof PageData];
	return (
		<>
			{component()}
			<FileUploadChatInputDemo
				threadId={""}
				useChat={
					{
						messages: [],
						input: input,
						handleSubmit: () => {},
						handleInputChange: () => {},
						status: "",
					} as unknown as UseChatHelpers
				}
			/>
		</>
	);
}

// Menu items.
const items = [
	{
		title: "Welcome to OG T3 Chat",
		url: "welcome",
	},
	{
		title: "Why OG T3 Chat?",
		url: "why-ot-t3-chat",
	},

	{
		title: "FAQ",
		url: "faq",
	},
];
export function LoggedoutAppSidebar() {
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
					<NavLink
						to="/chat"
						className="group flex flex-row items-center gap-2 text-pink-400 hover:opacity-80"
					>
						<MessageSquarePlus className="size-4" />
						<span className="">New Chat</span>
					</NavLink>
				</div>
				<SidebarGroup className="p-0 space-y-2">
					<h2 className="font-semibold text-neutral-400 ">Recent Threads</h2>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.url}>
									<ThreadLink
										isBranch={false}
										threadId={item.url}
										title={item.title}
									/>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<div>
				<a>Login</a>
			</div>
		</Sidebar>
	);
}
