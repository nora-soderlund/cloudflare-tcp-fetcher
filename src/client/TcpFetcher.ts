import { connect } from 'cloudflare:sockets';
import { parseResponse } from '../utils/parseResponse';

export class TcpFetcher implements Fetcher {
  connect(address: string | SocketAddress, options?: SocketOptions | undefined): Socket {
    return connect(address, options);
  }

  async fetch(request: Request): Promise<Response> {
    let url = new URL(request.url);

    if(!url.port.length) {
      url.port = "80";
    }

    const socket = this.connect(url.host, {
      allowHalfOpen: true
    });

    return new Promise((resolve, reject) => {
      socket.opened.then(async () => {
        const writer = socket.writable.getWriter();
        const textEncoder = new TextEncoder();

        function write(text: string) {
          const value = textEncoder.encode(text); 

          writer.write(value);
        }

        write(`GET ${url.pathname}${url.search}${url.hash} HTTP/1.1\r\n`);
        write(`Host: ${url.host}\r\n`);

        request.headers.forEach((value, key) => {
          write(`${key}: ${value}\r\n`);
        });

        write("\r\n");
        
        const reader = socket.readable.getReader();

        const textDecoder = new TextDecoder();

        let decodedText = "";

        function handleRead({ value, done }: ReadableStreamReadResult<any>) {
          const text = textDecoder.decode(value, {
            stream: true
          });

          decodedText += text;

          if(decodedText.includes('\r\n\r\n')) {
            const response = parseResponse(decodedText);

            if(response.headers["content-length"] && response.bodyData) {
              try {
                if(response.bodyData.length >= parseInt(response.headers["content-length"])) {
                  resolve(new Response(response.bodyData, {
                    status: response.statusCode,
                    statusText: response.statusMessage,
                    headers: new Headers(response.headers)
                  }));
                }
              }
              catch(error) {
                console.warn(error);
              }
            }
          }

          if(!done) {
            reader.read().then(handleRead);
          }
          else {
            reject("Reader was finished.");
          }
        }

        reader.read().then(handleRead);
      }, reject);

      setTimeout(() => {
        socket.close();

        reject("Connection timed out (>30s)");
      }, 30000);
    });
  }
}
