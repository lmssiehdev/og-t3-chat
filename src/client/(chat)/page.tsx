import { id } from "@instantdb/react";
import { ChatComponent } from "./components/indext";

export function ChatPageWithoutId() {
	const threadId = id();

	return (
        <ChatComponent threadId={threadId} shouldCreateThread={true} />
	);
}