"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { InstantAuthProvider } from "@/providers/instant-auth";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { AppSidebar } from "./sidebar";

export function ChatLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<SignedOut>
				<SignInButton />
			</SignedOut>
			<SignedIn>
				<SidebarProvider>
					<AppSidebar />
					<InstantAuthProvider>
						<main className="flex flex-col w-full">
							<div className="pt-2">
								<SidebarTrigger className="rounded-sm size-10 cursor-pointer ml-1" />
							</div>
							{children}
						</main>
					</InstantAuthProvider>
				</SidebarProvider>
			</SignedIn>
		</>
	);
}
