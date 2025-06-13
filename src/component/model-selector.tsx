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
import { SUPPORTED_MODELS } from "@/constants";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { useLocalStorage } from "usehooks-ts";

export function DropdownMenuRadioGroupDemo({
	position,
	sestPosition,
}: {
	position: string;
	sestPosition: (position: string) => void;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className="flex items-center justify-center text-sm font-medium"
				>
					{position} <ChevronDown className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<DropdownMenuLabel>Pick Model </DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuRadioGroup value={position} onValueChange={sestPosition}>
					{SUPPORTED_MODELS.map((m, i) => (
						<DropdownMenuRadioItem key={m} value={m}>
							{m}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
