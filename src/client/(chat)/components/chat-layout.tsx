"use client";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { InstantAuthProvider } from "@/providers/instant-auth";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { CopyIcon, ShareIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
import { AppSidebar } from "./chat-sidebar";
import { LoggedoutAppSidebar } from "./logged-out";

export function ChatLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { pathname } = useLocation();
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
								{pathname !== "/chat" && <ShareButton />}
							</div>
							{children}
						</main>
					</InstantAuthProvider>
				</SidebarProvider>
			</SignedIn>
		</>
	);
}

export function ShareButton() {
	const [open, setOpen] = useState(false);
	const [_, copy] = useCopyToClipboard();

	const sharableLink = window.location.href.replace("/chat", "/share");

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				setOpen((c) => !c);
			}}
		>
			<DialogTrigger asChild>
				<Button
					variant={"ghost"}
					size={"icon"}
					className="rounded-sm size-10 cursor-pointer ml-1"
				>
					<ShareIcon className="size-5" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Share link</DialogTitle>
					<DialogDescription>
						Anyone with this link would be able to view this thread.
					</DialogDescription>
				</DialogHeader>
				<div className="flex items-center gap-2">
					<div className="grid flex-1 gap-2">
						<Label htmlFor="link" className="sr-only">
							Link
						</Label>
						<div className="flex gap-2 items-center">
							<Input id="link" defaultValue={sharableLink} readOnly />
							<Button
								variant={"outline"}
								size={"icon"}
								className="rounded-sm size-10 cursor-pointer ml-1"
								onClick={() => {
									setOpen(false);
									setTimeout(() => {
										copy(sharableLink).then(() => {
											toast.success("Copied!");
										});
									}, 200);
								}}
							>
								<CopyIcon className="text-muted-foreground text-xs" />
							</Button>
						</div>
					</div>
				</div>
				<DialogFooter className="sm:justify-start">
					<Button
						onClick={() => setOpen(false)}
						type="button"
						variant="secondary"
					>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
