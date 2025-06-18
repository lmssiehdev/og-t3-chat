"use client";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { InstantAuthProvider } from "@/providers/instant-auth";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ShareIcon } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
import { AppSidebar } from "./chat-sidebar";
import { LoggedoutAppSidebar } from "./logged-out";

export function ChatLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const navigate = useNavigate();
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "o" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				navigate("/chat");
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	return (
		<>
			<SignedOut>
				<SidebarProvider>
					<LoggedoutAppSidebar />
					<main className="flex flex-col w-full px-2	">
						<div className="pt-2">
							<SidebarTrigger className="rounded-sm size-10 cursor-pointer ml-1" />
						</div>
						{children}
					</main>
				</SidebarProvider>
			</SignedOut>
			<SignedIn>
				<SidebarProvider>
					<AppSidebar />
					<InstantAuthProvider>
						<main className="flex flex-col w-full px-2 ">
							<div className="pt-2 flex justify-between items-center mb-3	">
								<SidebarTrigger className="rounded-sm size-10 cursor-pointer ml-1" />
								<ShareButton />
							</div>
							{children}
						</main>
					</InstantAuthProvider>
				</SidebarProvider>
			</SignedIn>
		</>
	);
}

function ShareButton() {
	const [_, copy] = useCopyToClipboard();

	return (
		<Button
			onClick={() => {
				const sharableLink = window.location.href.replace("/chat", "/share");
				copy(sharableLink)
					.then(() => {
						toast.success("Copied! You can now share this link.");
					})
					.catch((error) => {
						window.open(sharableLink, "_blank");
					});
			}}
			variant={"ghost"}
			size={"icon"}
			className="rounded-sm size-10 cursor-pointer ml-1"
		>
			<ShareIcon className="size-5" />
		</Button>
	);
}
