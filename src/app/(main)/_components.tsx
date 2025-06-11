"use client";
"use client";

import { db } from "@/db/instant";
import { useInstantAuth } from "@/providers/instant-auth";
import { id } from "@instantdb/react";
import { useEffect, useMemo, useState } from "react";
import { useChat } from '@ai-sdk/react';

export function Content({ threadId }: { threadId: string }) {
    const { data: threadData, error: threadError, isLoading: threadIsLoading } = db.useQuery({
        threads: {
            $: {
                limit: 1,
                where: {
                    id: threadId
                }
            }
        }
    });
    return (
        <>
            <ChatComponent threadId={threadId} />
        </>
    )
}

export function ChatComponent({ threadId }: { children?: React.ReactNode, threadId: string }) {
    const { userAuthId } = useInstantAuth();
    
    const { data: dbMessages, error, isLoading: threadIsLoading } = db.useQuery({
        threads: {
            $: {
                where: {
                    id: threadId
                }
            },
            messages: {}
        }
    });

    const [messsage, setMessage] = useState<string>("");

    const [completedMessageIds, setCompletedMessageIds] = useState(new Set());
    const { messages, input, handleInputChange, handleSubmit, isLoading, } = useChat({
        api: '/api/chat',
        body: {
            threadId,
            isFirstMessage: false,
            userAuthId,
        },
        onFinish: ({ id }) => {
            setCompletedMessageIds(new Set([...completedMessageIds, id]));
        }
    });


    const activeStreamingMessages = messages.filter((message) => !completedMessageIds.has(message.id) && message.role == "assistant").map(m => ({
        text: m?.content,
        ...m
    }));

    useEffect(() => {
        if ( !dbMessages ) return;
        const messagesInThread = dbMessages.threads[0].messages;
        const lastDbMessage = messagesInThread[messagesInThread.length - 1];
        const lastStreamedMessage = messages[messages.length - 1];
        
        if ( !lastDbMessage || !lastStreamedMessage ) return;

        if (lastDbMessage.text === lastStreamedMessage?.content) {
            setCompletedMessageIds(new Set([...completedMessageIds, lastDbMessage.id]));
        }
    }, [dbMessages, messages, isLoading]);

    if (!dbMessages) return null;

    const messagesToRender = [...dbMessages.threads[0].messages, ...activeStreamingMessages];

    return (
        <div>
            <div className="flex-1">
                <h1>Chat</h1>
            </div>
            <div className="flex flex-col">
                <div className="min-h-[400px] overflow-y-auto  p-4 mb-4">
                    {(messagesToRender).map((message, index) => (
                        <div key={message.id} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-3 rounded-lg ${message.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-black'
                                }`}>
                                {message.text}
                            </div>
                        </div>
                    ))}
                    {threadIsLoading && (
                        <div className="text-left">
                            <div className="inline-block p-3 rounded-lg bg-gray-200">
                                Thinking...
                            </div>
                        </div>
                    )}
                </div>
                {/* Input form */}
                <form onSubmit={(e) => {
                    e.preventDefault();
                    createMessage(threadId, userAuthId!, messsage, "user");
                    handleSubmit(e);
                    setMessage("")
                }} className="mx-auto mt-auto flex w-full items-stretch gap-2 rounded-t-xl bg-[#2D2D2D] px-3 py-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] sm:max-w-3xl">
                    <textarea value={input}
                        disabled={isLoading}
                        onChange={(e) => {
                            handleInputChange(e);
                            setMessage(e.target.value)
                        }} className="focus-none border-none flex-grow resize-none bg-transparent text-base leading-6 h-[72px] text-neutral-100 outline-none" placeholder="Type your message here..." />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                    >
                        Send
                    </button>            </form>
            </div>
        </div>
    )
}


export async function createMessage(threadId: string, userAuthId: string, text: string, role: "user" | "ai") {
    const messageId = id();
    await db.transact([
        db.tx.messages[messageId].update({
            createdAt: Date.now(),
            text,
            role,
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