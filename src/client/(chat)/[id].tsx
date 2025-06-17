import { SignedIn, SignedOut } from "@clerk/nextjs";
import { id } from "@instantdb/react";
import { useParams } from "react-router";
import { LoggedoutChatComponent } from "./components/logged-out";
import { ChatComponent } from "./components/main-chat";

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
