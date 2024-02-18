export function parseResponse(data: any) {
	// Split into (head, body)
	const splitIndex = data.indexOf('\r\n\r\n');
	if (splitIndex === -1) {
		throw new Error('Data does not contain CRLFCRLF');
	}
	const headData = data.slice(0, splitIndex);
	const rawBodyData = data.slice(splitIndex + 4);
	const headText = headData.toString('ascii');
	const headLines = headText.split('\r\n');

	// First line
	const firstLine = headLines[0];
	const match = firstLine.match(/^HTTP\/1\.[01] (\d{3}) (.*)$/);
	if (!match) {
		throw new Error('Invalid status line');
	}
	const statusCode = Number.parseInt(match[1], 10);
	const statusMessage = match[2];

	// Headers
	const headers: Record<string, string> = {};
	for (const line of headLines.slice(1)) {
		// TODO: support alternate whitespace after first ":"?
		const i = line.indexOf(': ');
		if (i === -1) {
			throw new Error('Header line does not contain ": "');
		}
		const key = line.slice(0, Math.max(0, i)).toLowerCase();
		const val = line.slice(i + 2);
		headers[key] = val;
	}

	let bodyData;

	const contentLengthText = headers['content-length'];
	if (contentLengthText) {
		if (!/^[1-9]\d*$/.test(contentLengthText)) {
			throw new Error('Content-Length does not match /^[1-9][0-9]*$/');
		}
		const contentLength = Number.parseInt(contentLengthText, 10);
		if (contentLength !== rawBodyData.length) {
			throw new Error('Content-Length does not match the length of the body data we have');
		}
		bodyData = rawBodyData;
	} else {
		throw new Error('Unable to determine Content-Length');
	}

	return {
		statusCode,
		statusMessage,
		headers: new Headers(headers),
		bodyData
	};
}
