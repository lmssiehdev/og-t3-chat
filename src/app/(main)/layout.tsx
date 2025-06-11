"use client";
import { AppSidebar } from "@/component/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { InstantAuthProvider } from "@/providers/instant-auth";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import "../globals.css";

export default function RootLayout({
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
                        <main className="flex flex-col w-full" >
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