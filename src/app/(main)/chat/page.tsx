"use client";

import { useInstantAuth } from "@/providers/instant-auth";
import { id } from "@instantdb/react";
import { ChatComponent } from "../_components";

export default function Page() {
	const { userAuthId } = useInstantAuth();

	if (!userAuthId) return null;
	
	const threadId = id();

	return (
		<>
			<ChatComponent threadId={threadId} shouldCreateThread={true} />
		</>
	);
}
