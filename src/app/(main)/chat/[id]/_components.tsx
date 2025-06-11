"use client";
import { db } from "@/db/instant";
import { ChatComponent } from "../page";

export function Content({threadId}: { threadId: string}) {
    const { data: threadData, error: threadError, isLoading: threadIsLoading } = db.useQuery({ threads: {
        $: {
            limit: 1,
            where: {
                id: threadId
            }
        }
    }});
    return (
        <>
        <div>My Chat: {threadId}</div>
        <pre>
            { JSON.stringify(threadData) }
        </pre>
        <ChatComponent threadId={threadId} />
        </>
    )
}