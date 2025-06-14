import million from "million/compiler";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	eslint: {
		// !! using biome for linting instead
		ignoreDuringBuilds: true,
	},
	reactStrictMode: true,
};

const millionConfig = {
	// auto: true,
};

export default million.next(nextConfig as any, {log: "info"});
