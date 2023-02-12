import { URL } from 'node:url';

export function generateUrl(urlString: string, query: Record<string, string> = {}) {
	const url = new URL(urlString);
	for (const [key, value] of Object.entries(query)) {
		url.searchParams.set(key, value);
	}

	return url.toString();
}
