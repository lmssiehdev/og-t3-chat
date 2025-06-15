import { ChatUiMessageWithImageSupport } from "@/component/llm-ui";
import { init } from "@instantdb/admin";
import type { UIMessage } from "ai";
import schema from "../../../../instant.schema";

const db = init({
	appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
	adminToken: process.env.INSTANT_APP_ADMIN_TOKEN!,
	schema,
});

export default async function Page({
	params,
}: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const dbMessages = await db.query({
		threads: {
			$: {
				where: {
					id,
				},
				limit: 1,
			},
			messages: {
				$: {
					order: {
						createdAt: "asc",
					},
				},
			},
		},
	});

	if (!dbMessages || !dbMessages?.threads[0]) return <div>No thread found</div>;

	const messages = dbMessages.threads[0].messages;
	return (
		<div className="w-full max-w-lg mx-auto">
			<h1 className="font-bold p-2 text-center">
				{(dbMessages.threads[0].title as string) ?? "No title"}
			</h1>
			<div>
				{messages
					.map(
						(m) =>
							Object.assign(m, { content: m.text }) as unknown as UIMessage,
					)
					.map((m) => (
						<ChatUiMessageWithImageSupport message={m} key={m.id} />
					))}
			</div>
		</div>
	);
}
