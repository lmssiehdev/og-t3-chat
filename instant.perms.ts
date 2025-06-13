// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
	threads: {
		bind: ["isOwner", "auth.id != null && auth.id == data.userAuthId"],
		allow: {
			$default: "isOwner",
		},
	},
	messages: {
		bind: ["isOwner", "auth.id != null && auth.id == data.userAuthId"],
		allow: {
			$default: "isOwner",
		},
	},
} satisfies InstantRules;

export default rules;
