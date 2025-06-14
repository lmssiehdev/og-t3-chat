// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
	threads: {
		bind: ["isOwner", "auth.id != null && auth.id == data.userAuthId"],
		allow: {
			$default: "isOwner",
			view: "true",
		},
	},
	messages: {
		bind: ["isOwner", "auth.id != null && auth.id == data.userAuthId"],
		allow: {
			$default: "isOwner",
			view: "true",
		},
	},
} satisfies InstantRules;

export default rules;
