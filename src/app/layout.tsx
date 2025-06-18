"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";
import { Toaster } from "sonner";
import { GeistSans } from "geist/font/sans";


export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<ClerkProvider
				appearance={{
					baseTheme: dark,
				}}
			>
				<body className={GeistSans.className}>
					{children}
					<Toaster />
				</body>
			</ClerkProvider>
		</html>
	);
}
