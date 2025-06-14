import { db } from "@/db/instant";
import { createContext, useContext } from "react";

const instantDataContext = createContext<
	| {
			id: string;
			createdAt: number;
			metadata: any;
			userAuthId: string;
			title: string;
			updatedAt: string | number;
			updatedTitle?: boolean | undefined;
	  }[]
	| undefined
>(undefined);

export function useInstantData() {
	const context = useContext(instantDataContext);
	if (!context) {
		throw new Error(
			"useInstantData must be used within an InstantDataProvider",
		);
	}
	return context;
}

const prefetched = false;
export function InstantDataProvider({
	children,
}: { children: React.ReactNode }) {
	const { data: threadData } = db.useQuery({
		threads: {
			$: {},
		},
	});
	const firstFiveThreads = threadData?.threads?.slice(0, 5) ?? [];

	// const firstId = firstFiveThreads[0]?.id;
	// if ( !prefetched ) {
	//     db.queryOnce({
	//     threads: {
	//         $: {
	//             where: {
	//                 id: firstId,
	//             },
	//         },
	//     },
	// });
	//     prefetched = true;
	// }
	// console.log("prefetching", firstId);
	return (
		<instantDataContext.Provider value={threadData?.threads}>
			{children}
		</instantDataContext.Provider>
	);
}
