"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

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
				<body>{children}</body>
			</ClerkProvider>
		</html>
	);
}
