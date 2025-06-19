"use client";
import { useEffect } from "react";

export default async function LoginPage() {
	useEffect(() => {
		window.location.href = "/chat";
	}, []);
	return (
		<div className="flex min-h-screen items-center justify-center p-8">
			<div className="space-y-2">
				<span className=" block text-center w-fit text-neutral-400">
					Login successful, redirecting to chat...
				</span>
			</div>
		</div>
	);
}
