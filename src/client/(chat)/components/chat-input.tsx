"use client";

import type { RouteParams } from "@/app/api/utils";
import { ModelSelector } from "@/components/model-selector";
import { Button } from "@/components/ui/button";
import {
	FileUpload,
	FileUploadDropzone,
	FileUploadItem,
	FileUploadItemDelete,
	FileUploadItemMetadata,
	FileUploadItemPreview,
	FileUploadItemProgress,
	FileUploadList,
	type FileUploadProps,
	FileUploadTrigger,
} from "@/components/ui/file-upload";
import { Toggle } from "@/components/ui/toggle";
import {
	type AvailableModels,
	SUPPORTED_MODELS,
	modelsInfo,
} from "@/constants";
import { createMessage, createThread } from "@/db/mutators";
import { randomItemFromArray } from "@/lib/utils";
import { useInstantAuth } from "@/providers/instant-auth";
import type { UseChatHelpers } from "@ai-sdk/react";
import { SignedIn } from "@clerk/nextjs";
import {
	ArrowDown,
	ArrowUp,
	LoaderCircle,
	Paperclip,
	Search,
	Upload,
	X,
} from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
type FileUploadChatInputProps = {
	threadId: string;
	shouldCreateThread?: boolean;
	showScrollButton: boolean;
	scrollToBottom: () => void;
	onStop: () => void;
} & {
	useChat: UseChatHelpers;
};

export function FileUploadChatInputDemo({
	threadId,
	useChat,
	shouldCreateThread = false,
	showScrollButton,
	scrollToBottom,
	onStop,
}: FileUploadChatInputProps) {
	const navigate = useNavigate();
	const { userAuthId } = useInstantAuth();
	const [searchSelected, setSearchSelected] = React.useState(false);
	const { isLoading, input, handleSubmit, handleInputChange, status } = useChat;
	const [files, setFiles] = React.useState<File[]>([]);
	const [isUploading, setIsUploading] = React.useState(false);
	const [apiKeyInLocalStorage, setApiKeyInLocalStorage] =
		useLocalStorage<string>("api-key", "");
	const [modelInStorage, setModelInStorage] = useLocalStorage<string>(
		"last-model",
		SUPPORTED_MODELS[0],
	);
	const [selectedModel, setSelectedModel] = React.useState<AvailableModels>(
		modelInStorage as AvailableModels,
	);

	const onUpload: NonNullable<FileUploadProps["onUpload"]> = React.useCallback(
		async (files, { onProgress, onSuccess, onError }) => {
			try {
				setIsUploading(true);
				// Process each file individually
				const uploadPromises = files.map(async (file) => {
					try {
						// Simulate file upload with progress
						const totalChunks = 10;
						let uploadedChunks = 0;

						// Simulate chunk upload with delays
						for (let i = 0; i < totalChunks; i++) {
							await new Promise((resolve) =>
								setTimeout(resolve, Math.random() * 200 + 100),
							);

							uploadedChunks++;
							const progress = (uploadedChunks / totalChunks) * 100;
							onProgress(file, progress);
						}

						await new Promise((resolve) => setTimeout(resolve, 500));
						onSuccess(file);
					} catch (error) {
						onError(
							file,
							error instanceof Error ? error : new Error("Upload failed"),
						);
					}
				});

				await Promise.all(uploadPromises);
			} catch (error) {
				console.error("Unexpected error during upload:", error);
			} finally {
				setIsUploading(false);
			}
		},
		[],
	);

	const onFileReject = React.useCallback((file: File, message: string) => {
		toast(message, {
			description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
		});
	}, []);

	const textareaRef = React.useRef<HTMLTextAreaElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const onSubmit = React.useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			if (isLoading) return;

			const formData = new FormData(event.target as HTMLFormElement);
			const message = formData.get("message") as string;

			if (!message.trim()) {
				toast.error("No message provided");
				return;
			}

			// Convert files to the format expected by Vercel AI SDK
			const attachments =
				files.length > 0
					? await Promise.all(
							files.map(async (file) => {
								const base64 = await new Promise<string>((resolve) => {
									const reader = new FileReader();
									reader.onloadend = () => resolve(reader.result as string);
									reader.readAsDataURL(file);
								});

								return {
									name: file.name,
									contentType: file.type,
									url: base64, // This will be a data URL like "data:image/png;base64,..."
								};
							}),
						)
					: undefined;

			if (shouldCreateThread) {
				await createThread(threadId, userAuthId!, "New Chat");
			}
			// create message locally
			await createMessage(threadId, userAuthId!, message, "user", {
				attachments: attachments?.map((attachment) => ({
					contentType: attachment.contentType,
					name: attachment.name,
				})),
			});

			const body = {
				model: selectedModel ?? SUPPORTED_MODELS[0],
				apiKey: modelsInfo[selectedModel as AvailableModels].requireApiKey
					? JSON.parse(localStorage.getItem("api-key") || '""')
					: undefined,
				search: searchSelected && modelsInfo[selectedModel]?.supportsWebSearch,
				timestamp: Date.now(),
			} satisfies Partial<RouteParams>;

			handleSubmit(event, {
				body,
				experimental_attachments: attachments,
			});
			// Clear files after submission
			setFiles([]);

			if (shouldCreateThread) {
				navigate(`/chat/${threadId}`);
			}

			const textarea = textareaRef.current;
			if (textarea) {
				textarea.style.height = "auto";
			}
		},
		[
			files,
			handleSubmit,
			selectedModel,
			userAuthId,
			threadId,
			shouldCreateThread,
			navigate,
		],
	);

	const onInput = React.useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement>) => {
			const target = event.target;
			target.style.height = "auto";

			const MAX_HEIGHT = 200;
			const newHeight = Math.min(target.scrollHeight, MAX_HEIGHT);
			target.style.height = `${newHeight}px`;
			handleInputChange(event);
		},
		[handleInputChange],
	);
	return (
		<div className="mt-auto sticky bottom-0 left-0 w-full z-20">
			<div>
				{showScrollButton && (
					<div className=" w-full">
						<button
							className="mb-2.5 mx-auto bg-[#2D2D2D] shadow-xl border inset-shadow-2xs text-xs flex items-center rounded-xl bg-forground tex-xs  font-semibold p-1.5 text-fore transition-colors"
							onClick={scrollToBottom}
						>
							Scroll to bottom
							<ArrowDown className="size-4" />
						</button>
					</div>
				)}
			</div>

			<div className="bg-background p-1">
				<CheekyPhrases />
			</div>
			<div className="  bg-background flex flex-col gap-4 mt-auto">
				{/* Messages Display */}
				{/* File Upload Chat Input */}
				<FileUpload
					value={files}
					onValueChange={setFiles}
					onUpload={onUpload}
					accept="text/*,image/*"
					onFileReject={onFileReject}
					maxFiles={10}
					maxSize={5 * 1024 * 1024}
					className="relative w-full items-center p-2 pb-0"
					multiple
					disabled={isUploading || status !== "ready"}
				>
					<FileUploadDropzone
						tabIndex={-1}
						onClick={(event) => event.preventDefault()}
						className="absolute top-0 left-0 z-0 flex size-full items-center justify-center rounded-none border-none bg-background/50 p-0 opacity-0 backdrop-blur transition-opacity duration-200 ease-out data-[dragging]:z-10 data-[dragging]:opacity-100"
					>
						<div className="flex flex-col items-center gap-1 text-center">
							<div className="flex items-center justify-center rounded-full border p-2.5">
								<Upload className="size-6 text-muted-foreground" />
							</div>
							<p className="font-medium text-sm">Drag & drop files here</p>
							<p className="text-muted-foreground text-xs">
								Upload max 10 files each up to 5MB
							</p>
						</div>
					</FileUploadDropzone>

					<form
						onSubmit={onSubmit}
						className=" relative w-full items-stretch gap-2 rounded-t-xl bg-[#2D2D2D] px-3 py-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] sm:max-w-3xl"
					>
						<FileUploadList
							orientation="horizontal"
							className="overflow-x-auto px-0 py-1"
						>
							{files.map((file, index) => (
								<FileUploadItem
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									key={index}
									value={file}
									className="max-w-52 p-1.5"
								>
									<FileUploadItemPreview className="size-8 [&>svg]:size-5">
										<FileUploadItemProgress variant="fill" />
									</FileUploadItemPreview>
									<FileUploadItemMetadata size="sm" />
									<FileUploadItemDelete asChild>
										<Button
											variant="secondary"
											size="icon"
											className="-top-1 -right-1 absolute size-4 shrink-0 cursor-pointer rounded-full"
										>
											<X className="size-2.5" />
										</Button>
									</FileUploadItemDelete>
								</FileUploadItem>
							))}
						</FileUploadList>

						<textarea
							ref={textareaRef}
							key={threadId}
							autoFocus
							onFocus={(e) => {
								const val = e.target.value;
								e.target.value = "";
								e.target.value = val;
							}}
							name="message"
							value={input}
							onChange={onInput}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									// @ts-expect-error
									e.target.form.requestSubmit();
								}
							}}
							placeholder="Type your message here..."
							className="w-full resize-none bg-transparent mb-8 text-base leading-6 text-neutral-100 outline-none "
							disabled={isUploading || status !== "ready"}
						/>
						<SignedIn>
							<div className="absolute justify-between w-full right-[8px] bottom-[7px] flex flex-row-reverse items-center gap-1.5 pl-2">
								<div>
									{status !== "ready" ? (
										<>
											<Button
												onClick={async (e) => {
													e.preventDefault();
													e.stopPropagation();
													onStop();
												}}
												size="icon"
												className="size-10 rounded-sm"
											>
												<LoaderCircle className="size-3.5 animate-spin" />
												<span className="sr-only">Stop message</span>
											</Button>
										</>
									) : (
										<Button
											size="icon"
											className="size-10 rounded-sm"
											disabled={
												!input.trim() || isUploading || status !== "ready"
											}
											type="submit"
										>
											<ArrowUp className="size-3.5" />
											<span className="sr-only">Send message</span>
										</Button>
									)}
								</div>
								<div className="flex items-center gap-1.5 w-full justify-between">
									<div className="flex">
										<ModelSelector
											position={selectedModel}
											setPosition={(v) => {
												const model = v as AvailableModels;
												if (modelsInfo[model]?.requireApiKey) {
													const data = prompt(
														"This model requires an openrouter API key",
														apiKeyInLocalStorage,
													);
													if (!data?.trim()) return;
													setApiKeyInLocalStorage(data);
												}
												setSelectedModel(model);
												setModelInStorage(model);
											}}
										/>
										{modelsInfo[selectedModel]?.supportsWebSearch && (
											<Toggle
												pressed={searchSelected}
												onPressedChange={() => setSearchSelected((p) => !p)}
												aria-label="Toggle italic"
												className="flex gap-2 items-center"
											>
												<Search className="size-3.5" />
												Search
											</Toggle>
										)}
									</div>
									<FileUploadTrigger asChild>
										<Button
											type="button"
											size="icon"
											variant="ghost"
											className="size-7 rounded-sm"
											disabled={isUploading || status !== "ready"}
										>
											<Paperclip className="size-3.5" />
											<span className="sr-only">Attach file</span>
										</Button>
									</FileUploadTrigger>
								</div>
							</div>
						</SignedIn>
					</form>
				</FileUpload>
			</div>
		</div>
	);
}

const cheekyPhrases = [
	"what big t3.chat doesn't want you to see",
	"where the old t3.chat gets to shine",
	"the t3.chat they tried to bury",
	"t3.chat for people with taste",
	"clearly someone has to preserve good taste",
	"mainstream t3.chat could never",
	"t3.chat classic edition",
	"what t3.chat used to look like when it was cool",
	"the t3.chat they don't want you to remember",
	"inspired by t3.chat's better days",
	"what t3.chat wishes it still looked like",
];
const phrase = randomItemFromArray(cheekyPhrases);

const CheekyPhrases = React.memo(function CheekyPhrases() {
	return (
		<SignedIn>
			<div className="mt-1 text-sm text-center text-neutral-400">{phrase}</div>
		</SignedIn>
	);
});
