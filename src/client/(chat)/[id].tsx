import { useParams } from "react-router";
import { ChatComponent } from "./components/indext";
import { id } from "@instantdb/react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { LoggedoutChatComponent } from "./components/logged-out";

export function ChatPageWithId() {
	const params = useParams<{ id: string }>();
	const newThreadId = id();

	const threadId = params.id ?? newThreadId;

	return (
		<>
			<SignedIn>
				<ChatComponent threadId={threadId} shouldCreateThread={!params.id} />
			</SignedIn>
			<SignedOut>
				<LoggedoutChatComponent />
			</SignedOut>
		</>
	);
}