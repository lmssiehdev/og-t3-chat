"use client";

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
import { GitBranch, MessageSquare } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router";

export function SearchThreads() {
	const [open, setOpen] = React.useState(false);
	const naviate = useNavigate();
	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
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
			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Search threads..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Threads">
						{threads?.threads.map((thread, i) => (
							<CommandItem
								key={thread.id}
								// @hack: this is a hack to make the title unique
								value={`${thread.title}-${i}`} 
								onSelect={() => {
									naviate(`/chat/${thread.id}`);
									setOpen(false);
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
