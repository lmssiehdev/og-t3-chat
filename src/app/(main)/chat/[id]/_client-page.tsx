"use client";
import { useParams } from "next/navigation";
import { ChatComponent } from "../../_components";

export default function Page() {
	const params = useParams<{ id: string }>();

	return <ChatComponent threadId={params.id} />;
}
