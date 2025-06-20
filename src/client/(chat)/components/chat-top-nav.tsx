import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { type Thread, pinThread, updateTitle } from "@/db/mutators";
import { cn } from "@/lib/utils";
import { CopyIcon, EditIcon, PinIcon, ShareIcon } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";

export function ChatTopNav({ thread }: { thread: Thread }) {
	const { pathname } = useLocation();
	return (
		<div className="p-2 flex justify-between items-center mb-3 bg-background sticky top-0 z-10">
			<SidebarTrigger className="rounded-sm size-10 cursor-pointer ml-1" />
			{pathname !== "/chat" && pathname.includes("/chat") && (
				<div>
					<PinThreadButton isPinned={thread.isPinned} threadId={thread.id} />
					{thread.title && (
						<EditThreadButton
							threadId={thread.id}
							originalTitle={thread.title}
						/>
					)}
					<ShareButton />
				</div>
			)}
		</div>
	);
}

export function PinThreadButton({
	threadId,
	isPinned,
}: { threadId: string; isPinned?: boolean }) {
	return (
		<Button
			onClick={async () => {
				await pinThread(threadId, !isPinned);
				toast.success("Pinned thread!");
			}}
			variant={"ghost"}
			size={"icon"}
			className={cn("rounded-sm size-10 cursor-pointer ml-1", {
				"bg-accent/100": isPinned,
			})}
		>
			<PinIcon className="size-5" />
		</Button>
	);
}
export function EditThreadButton({
	threadId,
	originalTitle,
}: { threadId: string; originalTitle: string }) {
	const [input, setInput] = useState(originalTitle);
	const [open, setOpen] = useState(false);

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				if (open) {
					setInput(originalTitle);
				}

				setOpen((c) => !c);
			}}
		>
			<DialogTrigger asChild>
				<Button
					variant={"ghost"}
					size={"icon"}
					className="rounded-sm size-10 cursor-pointer ml-1"
				>
					<EditIcon className="size-5" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit title</DialogTitle>
					{/* <DialogDescription> */}
					{/* Anyone with this link would be able to view this thread. */}
					{/* </DialogDescription> */}
				</DialogHeader>
				<div className="flex items-center gap-2">
					<div className="grid flex-1 gap-2">
						<Label htmlFor="link" className="sr-only">
							Link
						</Label>
						<div className="flex gap-2 items-center">
							<Input
								id="link"
								value={input}
								onChange={(e) => setInput(e.target.value)}
							/>
						</div>
					</div>
				</div>
				<DialogFooter className="sm:justify-start gap-2">
					<Button
						onClick={() => {
							setOpen(false);
						}}
						type="button"
						variant="secondary"
					>
						Close
					</Button>
					<Button
						onClick={async () => {
							setOpen(false);
							await updateTitle(threadId, input)
							
							toast.success("Title updated!");
						}}
						type="button"
						variant="default"
					>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
export function ShareButton() {
	const [open, setOpen] = useState(false);
	const [_, copy] = useCopyToClipboard();

	const sharableLink = window.location.href.replace("/chat", "/share");

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				setOpen((c) => !c);
			}}
		>
			<DialogTrigger asChild>
				<Button
					variant={"ghost"}
					size={"icon"}
					className="rounded-sm size-10 cursor-pointer ml-1"
				>
					<ShareIcon className="size-5" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Share link</DialogTitle>
					<DialogDescription>
						Anyone with this link would be able to view this thread.
					</DialogDescription>
				</DialogHeader>
				<div className="flex items-center gap-2">
					<div className="grid flex-1 gap-2">
						<Label htmlFor="link" className="sr-only">
							Link
						</Label>
						<div className="flex gap-2 items-center">
							<Input id="link" defaultValue={sharableLink} readOnly />
							<Button
								variant={"outline"}
								size={"icon"}
								className="rounded-sm size-10 cursor-pointer ml-1"
								onClick={() => {
									setOpen(false);
									setTimeout(() => {
										copy(sharableLink).then(() => {
											toast.success("Copied!");
										});
									}, 200);
								}}
							>
								<CopyIcon className="text-muted-foreground text-xs" />
							</Button>
						</div>
					</div>
				</div>
				<DialogFooter className="sm:justify-start">
					<Button
						onClick={() => setOpen(false)}
						type="button"
						variant="secondary"
					>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
