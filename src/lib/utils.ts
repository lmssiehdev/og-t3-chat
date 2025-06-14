import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function randomItemFromArray<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}
