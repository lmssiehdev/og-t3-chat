import { CommandDialogDemo } from "../search";

export function ChatLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			{<CommandDialogDemo />}
			{children}
		</>
	);
}
