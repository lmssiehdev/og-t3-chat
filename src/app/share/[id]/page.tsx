import { init } from "@instantdb/admin";
import schema from "../../../../instant.schema";
import { ChatMesssageUi } from "@/component/llm-ui";

const db = init({
	appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
	adminToken: process.env.INSTANT_APP_ADMIN_TOKEN!,
	schema,
});

export default async function Page({ params }: { params: { id: string } }) {
	const { id } = await params;
	const dbMessages = await db.query({
		threads: {
			$: {
				where: {
					id,
				},
				limit: 1,
			},
			messages: {},
		},
	});

	if (!dbMessages || !dbMessages?.threads[0]) return <div>No thread found</div>;

	const messages = dbMessages.threads[0].messages;
	return (
		<div className="w-full max-w-lg mx-auto">
			<h1 className="font-bold p-2 text-center">{dbMessages.threads[0].title}</h1>
            <div>

			{messages.map((m) => (
                <ChatMesssageUi role={m.role} key={m.id}>
					{m.text}
				</ChatMesssageUi>
			))}
            </div>
		</div>
	);
}
