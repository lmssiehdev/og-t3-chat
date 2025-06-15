import million from "million/compiler";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	rewrites: async () => {
		return [
		  {
			source: "/chat/:slug*",
			destination: "/static-app-shell",
		  },
		  {
			source: "/",
			destination: "/static-app-shell"
		  }
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

export default million.next(nextConfig as any, { log: "info" });
