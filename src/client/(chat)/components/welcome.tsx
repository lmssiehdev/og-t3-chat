// Menu items.
export const sidebarLoggedoutThreads = [
	{
		title: "Welcome to OG T3 Chat",
		url: "welcome",
	},
	{
		title: "Why OG T3 Chat?",
		url: "why-og-t3-chat",
	},

	{
		title: "FAQ",
		url: "faq",
	},
];

export const PageData = {
	welcome: {
		component: <WelcomePage />,
		input: "No auth wasn't one off the requirements 💅🏻",
	},
	"why-og-t3-chat": {
		component: <WhyT3ChatPage />,
		input:
			"GitHub or any email works (no validation), what are you waiting for?",
	},
	faq: {
		component: <FAQPage />,
		input: "Just... please? The app is actually cool 😭",
	},
};
function WelcomePage() {
	return (
		<>
			<div className="mx-auto flex w-full max-w-3xl flex-col space-y-12 p-4 pb-16">
				<div className="flex justify-end">
					<div className="group relative bg-[#2D2D2D] rounded-2xl p-4 inline-block text-left max-w-[80%] break-words">
						<div className="prose prose-neutral prose-invert max-w-none prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
							<p>What is OG T3 Chat?</p>
						</div>
					</div>
				</div>
				<div className="flex justify-start">
					<div className="group relative max-w-full w-full break-words">
						<div className="prose prose-neutral prose-invert max-w-none prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
							<h2>
								OG T3 Chat is the recreation of what was once the best AI Chat
								ever made.
							</h2>
							<h3>
								LLMs have gotten great. Their apps have not. Some even
								regressed.
							</h3>
							<p>
								It's hard to overstate how powerful large language models have
								become. Sadly, the apps we use to talk to them keep getting
								worse.
							</p>
							<p>That's why I built OG T3 Chat.</p>
							<h3>
								Every AI chat app felt like Slack. This one feels like Linear.
							</h3>
							<p>
								You've never used a faster, more reliable chat app than NOT OG
								T3 Chat. Want proof? Click that "Why OG T3 Chat?" thread on the
								left.
							</p>
						</div>
						<button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-8 rounded-md px-3 text-xs absolute -bottom-8 right-2 opacity-0 transition-opacity group-hover:opacity-100">
							<svg
								className="lucide lucide-copy mr-2 h-4 w-4"
								fill="none"
								height="24"
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								viewBox="0 0 24 24"
								width="24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<rect height="14" rx="2" ry="2" width="14" x="8" y="8" />
								<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
							</svg>
							Copy response
						</button>
					</div>
				</div>
			</div>
		</>
	);
}

function WhyT3ChatPage() {
	return (
		<>
			<div className="mx-auto flex w-full max-w-3xl flex-col space-y-12 p-4 pb-16">
				<div className="flex justify-end">
					<div className="group relative bg-[#2D2D2D] rounded-2xl p-4 inline-block text-left max-w-[80%] break-words">
						<div className="prose prose-neutral prose-invert max-w-none prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
							<p>Okay, I clicked, now what?</p>
						</div>
					</div>
				</div>
				<div className="flex justify-start">
					<div className="group relative max-w-full w-full break-words">
						<div className="prose prose-neutral prose-invert max-w-none prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
							<h2>Did you notice how fast that was?</h2>
							<p>
								SICKE, You got trolled. This is just a static page. To actually
								try the good stuff you need to log in first :)
							</p>
							<p>the chats load so fast you won't be able to tell the diff</p>
							<p>
								But seriously... no loading spinners. No weird delays. No
								waiting on a server. Everything you do should feel{" "}
								<em>instant</em>.
							</p>

							<p>
								We actually did more on top, like hotkeys ✅, branching chats
								✅, model selection ✅, and more. We're basically done 😊
							</p>
							<p>
								If you want to know more, click the "FAQ" thread on the left. No
								more tricks, promise
							</p>
						</div>
						<button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-8 rounded-md px-3 text-xs absolute -bottom-8 right-2 opacity-0 transition-opacity group-hover:opacity-100">
							<svg
								className="lucide lucide-copy mr-2 h-4 w-4"
								fill="none"
								height="24"
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								viewBox="0 0 24 24"
								width="24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<rect height="14" rx="2" ry="2" width="14" x="8" y="8" />
								<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
							</svg>
							Copy response
						</button>
					</div>
				</div>
			</div>
		</>
	);
}

function FAQPage() {
	return (
		<>
			<div className="mx-auto flex w-full max-w-3xl flex-col space-y-12 p-4 pb-16">
				<div className="flex justify-end">
					<div className="group relative bg-[#2D2D2D] rounded-2xl p-4 inline-block text-left max-w-[80%] break-words">
						<div className="prose prose-neutral prose-invert max-w-none prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
							<p>What else should we know about OG T3 Chat?</p>
						</div>
					</div>
				</div>
				<div className="flex justify-start">
					<div className="group relative max-w-full w-full break-words">
						<div className="prose prose-neutral prose-invert max-w-none prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
							<h3>Who made OG T3 Chat?</h3>
							<p>
								OG T3 Chat was created by me,{" "}
								<a href="https://github.com/lmssiehdev/">lmssiehdev</a>. I'm
								perhaps best known for holding the controversial opinion that
								thoe is actually a good designer.
								<br />
								I'm also the dev behind other popular projects like{" "}
								<a href="https://github.com/lmssieh/SUS-link-lengthener">AMONG SUS LINK LENGTHENER</a>
							</p>

							<h3>What optional features did you implement?</h3>
							<div>
								<p>
									<span className="block">✅ Chat Sharing</span>
									to get a shareable link just replace /chat/:id to /share/:id
								</p>
								<p>
									<span className="block">✅ Bring Your Own Key</span>
									models requiring keys will prompt you to enter it, I provided
									a key in the submission for your convenience
								</p>
								<p>
									<span className="block">✅ Attachment Support</span>
									tested with a txt file and an image
								</p>
								<p>
									<span className="block">✅ Web Search</span>
									tested with various queries
								</p>
							</div>

							<h3>How did you make OG T3 Chat so fast???</h3>
							<p>
								I shamelessly relied on a lot of bespoke tech to make this
								possible. The big difference between OG T3 Chat and other AI
								chat apps is that we keep all of your data on your device.
							</p>

							<h3>What's next for OG T3 Chat?</h3>
							<p>
								Nothing.. I'm waiting for your opinion. What are you waiting
								for? Sign up!
							</p>
						</div>
						<button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-8 rounded-md px-3 text-xs absolute -bottom-8 right-2 opacity-0 transition-opacity group-hover:opacity-100">
							<svg
								className="lucide lucide-copy mr-2 h-4 w-4"
								fill="none"
								height="24"
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								viewBox="0 0 24 24"
								width="24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<rect height="14" rx="2" ry="2" width="14" x="8" y="8" />
								<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
							</svg>
							Copy response
						</button>
					</div>
				</div>
			</div>
		</>
	);
}
