"use client";

import { DropdownMenuRadioGroupDemo } from "@/component/model-selector";
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
import {
	type AvailableModels,
	SUPPORTED_MODELS,
	modelsInfo,
} from "@/constants";
import { createMessage } from "@/db/mutators";
import { randomItemFromArray } from "@/lib/utils";
import { useInstantAuth } from "@/providers/instant-auth";
import type { UseChatHelpers } from "@ai-sdk/react";
import { ArrowUp, Paperclip, Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";

type FileUploadChatInputProps = {
	threadId: string;
} & {
	useChat: UseChatHelpers;
};

export function FileUploadChatInputDemo({
	threadId,
	useChat,
}: FileUploadChatInputProps) {
	const { userAuthId } = useInstantAuth();
	const { input, handleSubmit, handleInputChange, status } = useChat;
	const [files, setFiles] = React.useState<File[]>([]);
	const [isUploading, setIsUploading] = React.useState(false);
	const [apiKeyInLocalStorage, setApiKeyInLocalStorage] =
		useLocalStorage<string>("api-key", "");
	const [modelInStorage, setModelInStorage] = useLocalStorage<string>(
		"last-model",
		SUPPORTED_MODELS[0],
	);
	const [selectedModel, setSelectedModel] =
		React.useState<string>(modelInStorage);

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

	const onSubmit = React.useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			const formData = new FormData(event.target as HTMLFormElement);
			const message = formData.get("message") as string;

			if (!message.trim()) {
				console.error("No message provided");
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

			// create message locally
			await createMessage(threadId, userAuthId!, message, "user");

			handleSubmit(event, {
				body: {
					model: selectedModel ?? SUPPORTED_MODELS[0],
					apiKey: modelsInfo[selectedModel as AvailableModels].requireApiKey
						? JSON.parse(localStorage.getItem("api-key") || '""')
						: undefined,
				},
				experimental_attachments: attachments, // Now in correct format
			});

			// Clear files after submission
			setFiles([]);
		},
		[files, handleSubmit, selectedModel, userAuthId, threadId],
	);

	return (
		<>
			<CheekyPhrases />
			<div className="flex flex-col gap-4 mt-auto">
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
						className=" relative flex w-full items-stretch gap-2 rounded-t-xl bg-[#2D2D2D] px-3 py-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] sm:max-w-3xl"
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
							name="message"
							value={input}
							onChange={handleInputChange}
							placeholder="Type your message here..."
							className="w-full resize-none bg-transparent pb-8 text-base leading-6 text-neutral-100 outline-none "
							disabled={isUploading || status !== "ready"}
						/>

						<div className="absolute justify-between w-full right-[8px] bottom-[7px] flex flex-row-reverse items-center gap-1.5 pl-2">
							<div>
								<Button
									size="icon"
									className="size-10 rounded-sm"
									disabled={!input.trim() || isUploading || status !== "ready"}
									type="submit"
								>
									<ArrowUp className="size-3.5" />
									<span className="sr-only">Send message</span>
								</Button>
							</div>
							<div className="flex items-center gap-1.5 w-full justify-between">
								<DropdownMenuRadioGroupDemo
									position={selectedModel}
									setPosition={(v) => {
										if (modelsInfo[v as AvailableModels].requireApiKey) {
											const data = prompt(
												"This model requires an API key",
												apiKeyInLocalStorage,
											);
											if (!data?.trim()) return;
											setApiKeyInLocalStorage(data);
										}
										setSelectedModel(v);
										setModelInStorage(v);
									}}
								/>
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
					</form>
				</FileUpload>
			</div>
		</>
	);
}

const CheekyPhrases = React.memo(function CheekyPhrases() {
	const cheekyPhrases = [
		"what big t3.chat doesn't want you to see",
		"where the old t3.chat gets to shine",
		"the t3.chat they tried to bury",
		"t3.chat for people with taste",
		"clearly someone has to preserve good taste",
		"mainstream t3.chat could never",
		"t3.chat classic edition (unauthorized)",
		"what t3.chat used to look like when it was cool",
		"the t3.chat they don't want you to remember",
		"inspired by t3.chat's better days",
		"what t3.chat wishes it still looked like",
	];

	return (
		<span className=" text-sm text-center text-neutral-400">
			{randomItemFromArray(cheekyPhrases)}
		</span>
	);
});
