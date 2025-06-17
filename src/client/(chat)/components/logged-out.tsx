import type { UseChatHelpers } from "@ai-sdk/react";
import { MessageSquarePlus } from "lucide-react";
import { FileUploadChatInputDemo } from "./chat-input";

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
import { PageData, sidebarLoggedoutThreads } from "./welcome";

export function LoggedoutChatComponent() {
	const { id } = useParams<{ id: string }>();
	if (!id || !Object.keys(PageData).includes(id)) {
		return null;
	}

	const { component, input } = PageData[id as keyof typeof PageData];

	return (
		<>
			{component}
			<FileUploadChatInputDemo
				scrollToBottom={() => {}}
				showScrollButton={false}
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
							{sidebarLoggedoutThreads.map((item) => (
								<SidebarMenuItem key={item.url}>
									<ThreadLink
										useCustomLink={false}
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
			<div className="flex flex-row items-center border-t-2 p-4">
				<a href="/login">Login</a>
			</div>
		</Sidebar>
	);
}
