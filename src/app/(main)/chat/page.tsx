"use client";

import { db } from "@/db/instant";
import { createThread } from "@/db/mutators";
import { useInstantAuth } from "@/providers/instant-auth";
import { id } from "@instantdb/react";
import { useState } from "react";
import { ChatComponent } from "../_components";

export default function Page() {
	const { userAuthId } = useInstantAuth();

	if (!userAuthId) return null;
	// if (!threadId && threadData?.threads?.length === 0)
	// 	return <div>No thread found</div>;

	// !HACK = we create a thread for every time you visit the page
	const threadId = id();

	return (
		<>
			<ChatComponent threadId={threadId} shouldCreateThread={true} />
		</>
	);
}
