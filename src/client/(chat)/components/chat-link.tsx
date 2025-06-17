import { useCallback, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { PrefetchThread } from "./chat-sidebar";
function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
import { enableMapSet } from "immer";
enableMapSet();
interface PrefetchStore {
	hoveredThreads: Set<string>;
	prefetchingThreads: Set<string>;
	completedThreads: Set<string>;
	startHover: (threadId: string) => void;
	endHover: (threadId: string) => void;
	startPrefetch: (threadId: string) => void;
	completePrefetch: (threadId: string) => void;
	shouldPrefetch: (threadId: string) => boolean;
}

const usePrefetchStore = create<PrefetchStore>()(
	immer((set, get) => ({
		hoveredThreads: new Set(),
		prefetchingThreads: new Set(),
		completedThreads: new Set(),

		startHover: (threadId) =>
			set((state) => {
				state.hoveredThreads.add(threadId);
			}),

		endHover: (threadId) =>
			set((state) => {
				state.hoveredThreads.delete(threadId);
			}),

		startPrefetch: (threadId) => {
			const { hoveredThreads, completedThreads, prefetchingThreads } = get();
			if (
				hoveredThreads.has(threadId) &&
				!completedThreads.has(threadId) &&
				!prefetchingThreads.has(threadId)
			) {
				set((state) => {
					state.prefetchingThreads.add(threadId);
				});
			}
		},

		completePrefetch: (threadId) =>
			set((state) => {
				state.prefetchingThreads.delete(threadId);
				state.completedThreads.add(threadId);
			}),

		shouldPrefetch: (threadId) => get().prefetchingThreads.has(threadId),
	})),
);

export const Link: typeof NavLink = (({ children, ...props }) => {
	// @ts-expect-error
	const threadId = props.to.split("/")[2];
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const {
		startHover,
		endHover,
		startPrefetch,
		completePrefetch,
		shouldPrefetch,
	} = usePrefetchStore();
	const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

	const shouldRenderPrefetch = shouldPrefetch(threadId);

	const handleMouseEnter = useCallback(() => {
		startHover(threadId);
		hoverTimerRef.current = setTimeout(() => startPrefetch(threadId), 300);
	}, [startHover, startPrefetch, threadId]);

	const handleMouseLeave = useCallback(() => {
		endHover(threadId);
		if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
	}, [endHover, threadId]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(
		() => () => {
			if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
		},
		[pathname],
	);

	const c= children as React.ReactElement;

	return (
		<NavLink
			ref={props.ref}
			prefetch={"none"}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onMouseDown={(e) => {
				const url = new URL(String(props.to), window.location.href);
				if (
					url.origin === window.location.origin &&
					e.button === 0 &&
					!e.altKey &&
					!e.ctrlKey &&
					!e.metaKey &&
					!e.shiftKey
				) {
					e.preventDefault();
					navigate(String(props.to));
				}
			}}
			onClick={(e) => {
				const url = new URL(String(props.to), window.location.href);
				if (
					url.origin === window.location.origin &&
					e.button === 0 &&
					!e.altKey &&
					!e.ctrlKey &&
					!e.metaKey &&
					!e.shiftKey
				) {
					e.preventDefault();
					e.stopPropagation();
					navigate(String(props.to));
				}
			}}
			{...props}
		>
			  {c}
			{shouldRenderPrefetch && (
				<PrefetchThread
					threadId={threadId}
					onFetched={() => completePrefetch(threadId)}
				/>
			)}
		</NavLink>
	);
}) as typeof NavLink;
