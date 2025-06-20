"use client";

import { db } from "@/db/instant";
import { useAuth, useUser } from "@clerk/nextjs";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const instantAuthContext = createContext(
	{} as {
		userAuthId: string;
	},
);

export function useInstantAuth() {
	const context = useContext(instantAuthContext);
	if (!context) {
		throw new Error(
			"useInstantAuth must be used within an InstantAuthProvider",
		);
	}
	return context;
}

export function InstantAuthProvider({
	children,
}: { children: React.ReactNode }) {
	const [userAuthId, setUserAuthId] = useState<string | undefined>();
	const { isSignedIn, isLoaded } = useUser();
	const { getToken } = useAuth();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (isSignedIn) {
			getToken()
				.then(async (token) => {
					// Create a long-lived session with Instant for your Clerk user
					// It will look up the user by email or create a new user with
					// the email address in the session token.
					await db.auth.signInWithIdToken({
						clientName: process.env.NEXT_PUBLIC_CLERK_CLIENT_NAME as string,
						idToken: token as string,
					});

					const auth = await db.getAuth();
					setUserAuthId(auth?.id);
				})
				.catch((error) => {
					console.error("Error signing in with Instant", error);
				});
		} else {
			db.auth.signOut();
		}
	}, [isSignedIn, getToken, isLoaded]);

	const value = useMemo(
		() => ({
			userAuthId: userAuthId!,
		}),
		[userAuthId],
	);

	return (
		<instantAuthContext.Provider value={value}>
			{children}
		</instantAuthContext.Provider>
	);
}
