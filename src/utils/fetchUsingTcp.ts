import { TcpFetcher } from "..";

export const fetchUsingTcp: (typeof fetch) = (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> => {
  const fetcher = init?.fetcher ?? new TcpFetcher();

  return fetcher.fetch(new Request(input, init));
}
