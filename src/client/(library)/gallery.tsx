import { Input } from "@/components/ui/input";
import { db } from "@/db/instant";
import { useMemo, useState } from "react";

const query = {
	messages: {
		$: {
			where: {
				hasImage: true,
			},
			limit: 10,
		},
	},
};

export function Gallery() {
	const [search, setSearch] = useState("");
	const { isLoading, error, data } = db.useQuery(query);

	const imagesToShow = useMemo(() => {
		return search.length !== 0
			? data?.messages.filter((message) => {
					return message.searchableImagePrompt
						?.toLocaleLowerCase()
						?.includes(search.toLocaleLowerCase());
				})
			: (data?.messages ?? []);
	}, [search, data?.messages]);

	if (isLoading) {
		return <div>Getting images...</div>;
	}

	if (error) {
		return <div>Error: {error.message}</div>;
	}

	// if ( imagesToShow?.length === 0 ) {
	//     // if ( search ) return <div>No images found for this term.</div>;
	//     // return <div>No images found, please generate some first.</div>;
	// }

	return (
		<>
			<div className="text-xl my-4">Images</div>
			<div className="mb-4">
				<Input
					value={search}
					onChange={(e) => setSearch(e.target.value.trim())}
					placeholder="Search images by prompt"
				/>
			</div>
			<div className="grid grid-cols-3 gap-4">
				{imagesToShow?.length === 0 ? (
					search.length === 0 ? (
						<div>No images found, please generate some first.</div>
					) : (
						<div>No images found for this term.</div>
					)
				) : (
					<>
						{(imagesToShow ?? []).map((message) => (
							<div key={message.id} className="rounded-md overflow-hidden">
								<img
									className="w-full h-full object-cover"
									src={message.metadata.imageUrl}
									alt={message.metadata.imageUrl}
								/>
							</div>
						))}
					</>
				)}
			</div>
		</>
	);
}
