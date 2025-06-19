import million from "million/compiler";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	redirects: async () => {
		return [
			{
				source: "/go-home",
				destination: "/chat/",
				permanent: true,
			},
		];
	},
	rewrites: async () => {
		return [
			{
				source: "/chat/:slug*",
				destination: "/static-app-shell",
			},
			{
				source: "/gallery/:slug*",
				destination: "/static-app-shell",
			},
			{
				source: "/",
				destination: "/static-app-shell",
			},
		];
	},
	eslint: {
		// !! using biome for linting instead
		ignoreDuringBuilds: true,
	},
	reactStrictMode: true,
};

const millionConfig = {
	// auto: true,
};

// @ts-expect-error
export default million.next(nextConfig, { log: "info" });
