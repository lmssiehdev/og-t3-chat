"use client";
import { db } from "@/db/instant"
import { useInstantAuth } from "@/providers/instant-auth";
import { id } from "@instantdb/react";
import { useEffect, useState } from "react";

export default function ChatPage() {
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

export function ChatComponent({threadId}: { children?: React.ReactNode, threadId: string }) {
    const {userAuthId} = useInstantAuth();

    const { data, error, isLoading } = db.useQuery({ threads: {
        $: {
            where: {
                id: threadId
            }
        },
        messages: {}
    }});

    const [messsage, setMessage] = useState<string>("");

    if ( !data ) return null;

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        console.log("SUBMITTING", threadId);
        e.preventDefault();
        createMessage(threadId, userAuthId!, messsage);
        setMessage("")
    }

    const createMessage = async (threadId: string, userAuthId: string, text: string) => {
        const messageId = id();
        await db.transact([
          db.tx.messages[messageId].update({
            createdAt: Date.now(),
            text,
            metadata: {},
            userAuthId,
          }),
            //   // Link the message to the thread
            //   db.tx.threads[threadId].link({ messages: messageId }),
            //   // Link the message to the user
            db.tx.$users[userAuthId].link({ messages: messageId }),
            db.tx.messages[messageId].link({ thread: threadId }),
            db.tx.threads[threadId].link({ messages: messageId })
        ]);
        
        return messageId;
      };

     
      
    return (
        <>
            <div className="flex-1">
                <h1>Chat</h1>
            </div>
            <form onSubmit={handleSubmit} className="mx-auto mt-auto flex w-full items-stretch gap-2 rounded-t-xl bg-[#2D2D2D] px-3 py-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] sm:max-w-3xl">
                <textarea value={messsage} onChange={(e) => setMessage(e.target.value)} className="focus-none border-none flex-grow resize-none bg-transparent text-base leading-6 h-[72px] text-neutral-100 outline-none" placeholder="Type your message here..." />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">Send</button>
            </form>
        </>
    )
}