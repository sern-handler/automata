/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
    async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: `${process.env.API_URL}/:path*`,
			},
		]
	},
};

export default config;
