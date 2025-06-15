"use client";
import { ChatLayout } from "@/component/chat/chat-layout";
import { useParams } from "next/navigation";
import { ChatComponent } from "../../_components";

export default function Page() {
	const params = useParams<{ id: string }>();

	return (
		<ChatLayout>
			<ChatComponent threadId={params.id} />
		</ChatLayout>
	);
}
