import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	eslint: {
		// !! gonne use biome instead :)
		ignoreDuringBuilds: true,
	},
};

export default nextConfig;
