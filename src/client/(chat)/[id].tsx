import { useParams } from "react-router";
import { ChatComponent } from "./components/indext";
import { id } from "@instantdb/react";

export function ChatPageWithId() {
    const params = useParams<{ id: string }>();
    const newThreadId = id();

    const threadId = params.id ?? newThreadId;
    console.log(threadId)
    return <ChatComponent threadId={threadId} shouldCreateThread={!params.id} />;
}