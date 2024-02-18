# cloudflare-tcp-fetcher

A Fetcher implementation using the Cloudflare TCP Sockets API.

## Getting started

### Install the package
```cmd
npm install cloudflare-tcp-fetcher
```

### Using the TcpFetcher class
You can re-use the TcpFetcher class until the worker is closed.

```ts
import { TcpFetcher } from "cloudflare-tcp-fetcher";

export default {
	async fetch(request: Request, env: never, ctx: ExecutionContext): Promise<Response> {
    const fetcher = new TcpFetcher();

    return fetcher.fetch(new Request("https://google.com", {
      method: "GET"
    }));
  }
}
```

### Using the fetchUsingTcp function
You can also input the TcpFetcher in the `init` object to reuse a connection.

```ts
import { fetchUsingTcp } from "cloudflare-tcp-fetcher";

export default {
	async fetch(request: Request, env: never, ctx: ExecutionContext): Promise<Response> {
    return fetchUsingTcp("https://google.com", {
      method: "GET"
    });
  }
}
``` 
