import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { InstantAuthProvider } from "@/providers/instant-auth";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
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
						<main className="flex flex-col w-full px-2 ">{children}</main>
					</InstantAuthProvider>
				</SidebarProvider>
			</SignedIn>
		</>
	);
}