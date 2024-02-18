import { fetchUsingTcp } from "cloudflare-tcp-fetcher";

export default {
	async fetch(request: Request, env: never, ctx: ExecutionContext): Promise<Response> {
		return fetchUsingTcp("https://google.com");
	},
};
