"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SUPPORTED_MODELS, modelsInfo } from "@/constants";
import { ChevronDown, ImageIcon } from "lucide-react";

export function ModelSelector({
	position,
	setPosition,
}: {
	position: string;
	setPosition: (position: string) => void;
}) {
	return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						className="rounded-sm flex items-center justify-center text-xs h-auto p-1"
					>
						{modelsInfo[position as (typeof SUPPORTED_MODELS)[number]]?.name}{" "}
						<ChevronDown className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className=" ">
					<DropdownMenuLabel>Select Model</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
						{SUPPORTED_MODELS.map((model, i) => (
							<DropdownMenuRadioItem key={model} value={model}>
								<ModelName message={model} idx={i} />
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
	);
}

function ModelName({ message, idx }: { message: string; idx: number }) {
	return (
		<div className="w-full flex justify-between items-center gap-2">
			{modelsInfo[message]?.name}
			<div className="flex gap-2">
				{modelsInfo[message]?.supportsImageGeneration && (
					<div className=" text-pink-400 text-xs">
						<ImageIcon className="text-pink-400 text-xs" />
					</div>
				)}

				{modelsInfo[message]?.requireApiKey && (
					<div className=" text-xs font-bold">Pro</div>
				)}
			</div>
		</div>
	);
}
