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
import { modelsInfo, SUPPORTED_MODELS } from "@/constants";
import { ChevronDown } from "lucide-react";
import * as React from "react";

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
					variant="outline"
					className="flex items-center justify-center text-sm font-medium"
				>
					{modelsInfo[position as typeof SUPPORTED_MODELS[number]].name} <ChevronDown className="size-4" />
				</Button>
			</DropdownMenuTrigger>	
			<DropdownMenuContent className="w-fit">
				<DropdownMenuLabel>Pick Model</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
					{SUPPORTED_MODELS.map((m) => (
						<DropdownMenuRadioItem key={m} value={m}>
							{modelsInfo[m].name} { modelsInfo[m].requireApiKey && <span className="ml-2 text-red-500 text-xs">(Requires API Key)</span> }
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
