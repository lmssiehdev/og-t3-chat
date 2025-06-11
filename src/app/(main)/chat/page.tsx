"use client";

import { db } from "@/db/instant";
import { useInstantAuth } from "@/providers/instant-auth";
import { id } from "@instantdb/react";
import { useState } from "react";
import { ChatComponent } from "../_components";

export default function Page() {
    const { userAuthId } = useInstantAuth();
    const [attemptedCreation, setAttemptedCreation] = useState(false);
    const [threadId, setThreadId] = useState<string | undefined>();
    const { data: threadData, error: threadError, isLoading: threadIsLoading } = db.useQuery({ threads: {
        $: {
            limit: 1
        }
    }});

    const createThread = async (userAuthId: string, title: string) => {
        if ( userAuthId === undefined) return;
        const threadId = id();
        
        await db.transact([
          db.tx.threads[threadId].update({
            createdAt: Date.now(),
            title,
            updatedAt: Date.now(),
            metadata: {},
            userAuthId,
          }),
          // Link the thread to the user
          db.tx.$users[userAuthId].link({ threads: threadId })
        ]);
        return threadId;
      };

    if ( !userAuthId ) return null;
    if ( !threadId && threadData?.threads?.length === 0) return <div>No thread found</div>;

      return (
        <>
        <button onClick={() => createThread(userAuthId, "My Triple AI Conversation")}>
            Create Thread
        </button>
        <ChatComponent threadId={threadId ?? threadData?.threads[0]?.id!} />
        </>
    )
}    
