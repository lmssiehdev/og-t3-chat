import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
	const { userId } = await auth();
	if (userId) return redirect("/chat");
	return (
		<div className="flex min-h-screen items-center justify-center p-8">
			<div className="space-y-2">
				<SignInButton>
					<GoogleSignInButton />
				</SignInButton>
				<span className=" block text-center text-xs w-fit text-neutral-400">
					button just for show <br />
					we support email and github using clerk
				</span>
			</div>
		</div>
	);
}

function GoogleSignInButton() {
	return (
		<Button
			type="submit"
			variant="outline"
			size="lg"
			className="cursor-pointer h-14 w-full px-0 border-neutral-700 text-lg text-white transition-colors hover:bg-neutral-800"
		>
			<svg
				className="mr-3 h-6 w-6"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fill="#4285F4"
					d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
				/>
				<path
					fill="#34A853"
					d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
				/>
				<path
					fill="#FBBC05"
					d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
				/>
				<path
					fill="#EA4335"
					d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
				/>
			</svg>
			Continue with Google
		</Button>
	);
}
