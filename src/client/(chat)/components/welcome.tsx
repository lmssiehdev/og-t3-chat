export const PageData = {
	welcome: {
		component: WelcomePage,
		input: "No auth wasn't one off the requirements 💅🏻",
	},
	"why-ot-t3-chat": {
		component: WelcomePage,
		input:
			"GitHub or any email works (no validation), what are you waiting for?",
	},
	faq: {
		component: WelcomePage,
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
							<p>What is T3 Chat?</p>
						</div>
					</div>
				</div>
				<div className="flex justify-start">
					<div className="group relative max-w-full w-full break-words">
						<div className="prose prose-neutral prose-invert max-w-none prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
							<h2>T3 Chat is the best AI Chat ever made.</h2>
							<h3>LLMs have gotten great. Their apps have not.</h3>
							<p>
								It's hard to overstate how powerful large language models have
								become. Sadly, the apps we use to talk to them keep getting
								worse.
							</p>
							<p>That's why we built T3 Chat.</p>
							<h3>
								Every AI chat app felt like Slack. This one feels like Linear.
							</h3>
							<p>
								You've never used a faster, more reliable chat app than T3 Chat.
								Want proof? Click that "Why T3 Chat?" thread on the left.
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
								Sorry - had to brag for a second. We poured a lot of time into
								making T3 Chat as fast as possible.
							</p>
							<p>
								No loading spinners. No weird delays. No waiting on a server.
								Everything you do should feel <em>instant</em>. If it doesn't,{" "}
								<a href="#">annoy Theo about it</a>.
							</p>
							<p>
								<strong>
									We wanted an AI chat app that keeps up with power users.
								</strong>{" "}
								It wasn't easy. We ended up building a lot of bespoke tech to
								make this possible.
							</p>
							<p>
								There's still more we want to do, like hotkeys, branching chats,
								model selection, and more. We're just getting started 😊
							</p>
							<p>
								If you want to know more, click the "FAQ" thread on the left.
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
							<p>What else should we know about T3 Chat?</p>
						</div>
					</div>
				</div>
				<div className="flex justify-start">
					<div className="group relative max-w-full w-full break-words">
						<div className="prose prose-neutral prose-invert max-w-none prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
							<h3>Who made T3 Chat?</h3>
							<p>
								T3 Chat is made by Ping Labs, a Y Combinator backed startup run
								by{" "}
								<a href="https://web.archive.org/web/20250111123021mp_/https://x.com/theo">
									Theo
								</a>{" "}
								and{" "}
								<a href="https://web.archive.org/web/20250111123021mp_/https://x.com/r_marked">
									Mark
								</a>
								.
							</p>
							<p>
								We're also the devs behind{" "}
								<a href="https://web.archive.org/web/20250111123021mp_/https://uploadthing.com">
									UploadThing
								</a>
								,{" "}
								<a href="https://web.archive.org/web/20250111123021mp_/https://pic.ping.gg">
									PicThing
								</a>
								, the{" "}
								<a href="https://web.archive.org/web/20250111123021mp_/https://t3.gg">
									T3 Stack
								</a>
								, and the best video call app ever,{" "}
								<a href="https://web.archive.org/web/20250111123021mp_/https://ping.gg">
									Ping.gg
								</a>
								.
							</p>
							<h3>What models does T3 Chat use?</h3>
							<p>
								We're experimenting between a few models, primarily{" "}
								<strong>DeepSeek v3</strong> and <strong>GPT-4o Mini</strong>.
								We plan to introduce model selection in the near future (we love
								Claude!).
							</p>
							<h3>How did you make T3 Chat so fast???</h3>
							<p>
								We built a lot of bespoke tech to make this possible. The big
								difference between T3 Chat and other AI chat apps is that we
								keep all of your data on your device.
							</p>
							<h3>What's next for T3 Chat?</h3>
							<p>
								Great question. Theo has a long list of wishes that he's hoping
								to get added soon, like...
							</p>
							<ul>
								<li>Hotkey support</li>
								<li>Local search</li>
								<li>Branching chats</li>
								<li>Desktop app</li>
							</ul>
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
