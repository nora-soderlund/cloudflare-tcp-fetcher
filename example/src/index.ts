import { fetchUsingTcp } from "../../src/index";

export default {
	async fetch(request: Request, env: never, ctx: ExecutionContext): Promise<Response> {
		const response = await fetchUsingTcp("https://httpbin.org/delete", {
			method: "DELETE"
		});

		return Response.json({
			body: await response.json()
		});
	},
};
