"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<head>
				<link rel="icon" href="/favicon.svg" />
			</head>
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
