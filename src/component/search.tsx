"use client";

import { GitBranch, MessageSquare, Search } from "lucide-react";
import * as React from "react";

import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import { db } from "@/db/instant";
import { useRouter } from "next/navigation";


import Fuse from 'fuse.js';
export function CommandDialogDemo() {
	const [open, setOpen] = React.useState(false);
	const router = useRouter();
	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "y" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	const { data: threads } = db.useQuery({
		threads: {
			$: {
				order: {
					createdAt: "desc",
				},
			},
		},
	});
	return (
		<>
			<p className="text-muted-foreground text-sm">
				Press{" "}
				<kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
					<span className="text-xs">⌘</span>J
				</kbd>
			</p>
			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Type a command or search..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Threads">
						{threads?.threads.map((thread, i) => (
							<CommandItem
								key={thread.id}
								value={thread.id}
								onSelect={() => {
									router.push(`/chat/${thread.id}`);
								}}
							>
								{thread.isBranch ? <GitBranch /> : <MessageSquare />}
								<span>{thread.title}</span>
							</CommandItem>
						))}
					</CommandGroup>
					<CommandSeparator />
				</CommandList>
			</CommandDialog>
		</>
	);
}

export const MessagesSearchComponent = React.memo(function MessagesSearchComponent() {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "l" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const { data: messages } = db.useQuery({
    messages: {
      $: {
        order: {
          createdAt: "asc",
        }
      }
    }
  });

  const fuse = React.useMemo(() => {
    if (!messages?.messages) return null;
    
    return new Fuse(messages.messages, {
      keys: [
        { name: 'text', weight: 1 },
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
    });
  }, [messages?.messages]);

  const filteredMessages = React.useMemo(() => {
    if (!messages?.messages) return [];
    if (!searchQuery.trim()) return messages.messages;
    if (!fuse) return [];

    const results = fuse.search(searchQuery);
    return results.map(result => result.item);
  }, [messages?.messages, searchQuery, fuse]);

  return (
    <>
      <p className="text-muted-foreground text-sm">
        Press{" "}
        <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
          <span className="text-xs">⌘</span>L
        </kbd>
      </p>
	  <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <CommandList>
          {filteredMessages.length === 0 && searchQuery && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No messages found.
            </div>
          )}
          <CommandGroup heading="Messages">
            {filteredMessages.map((message, i) => (
              <CommandItem
                key={message.id}
				value={message.id}
                onSelect={() => {
                  router.push(`/chat/${message.id}`);
                  setOpen(false);
                  setSearchQuery('');
                }}
              >
                {message.isBranch ? <GitBranch /> : <MessageSquare />}
                <div className="flex flex-col gap-1 flex-1">
                  {message.text && (
                    <span className="text-sm text-muted-foreground line-clamp-2">
                      {message.text}
                    </span>
                  )}
                  {/* {message.fuseScore !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      Score: {message.fuseScore.toFixed(3)}
                    </span>
                  )} */}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
});