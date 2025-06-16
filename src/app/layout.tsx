"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";
import { Toaster } from "sonner";

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
				<body>
					{children}
					<Toaster />
				</body>
			</ClerkProvider>
		</html>
	);
}

