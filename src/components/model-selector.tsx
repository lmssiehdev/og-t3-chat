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
import { ChevronDown, EyeIcon } from "lucide-react";

export function DropdownMenuRadioGroupDemo({
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
			<DropdownMenuContent className="w-fit ">
				<DropdownMenuLabel>Select Model</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
					{SUPPORTED_MODELS.toReversed().map((m, i) => (
						<DropdownMenuRadioItem key={m} value={m} defaultChecked={i === 0}>
							<div className="w-full flex justify-between items-center gap-2">
								{modelsInfo[m].name}
								<div className="flex gap-2">
								{modelsInfo[m]?.supportsImageGeneration && (
										<div className=" text-pink-400 text-xs">
											<EyeIcon className="text-pink-400 text-xs" />
										</div>
									)}
									
									{modelsInfo[m]?.requireApiKey && (
										<div className=" text-xs font-bold">Pro</div>
									)}
	
								</div>
							</div>
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
