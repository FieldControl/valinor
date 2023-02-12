import type { HTTPRequest, HTTPResponse } from 'puppeteer';
import type { RequestResult, ResponseResult } from '../types/types.js';

export async function formatHTTPRequest(request: HTTPRequest, nonce?: string): Promise<RequestResult> {
	const redirectChain = request.redirectChain();

	const redirects = [];

	for (const redirect of redirectChain) {
		if (!redirect.response()?.ok()) continue;

		redirects.push(await formatHTTPRequest(redirect));
	}

	return {
		url: request.url(),
		method: request.method(),
		headers: request.headers(),
		post_data: request.postData(),
		resource_type: request.resourceType(),
		response: request.response() ? await formatHTTPResponse(request.response()!) : null,
		redirect_chain: redirects,
		initiator: request.initiator(),
		nonce,
	};
}

export async function formatHTTPResponse(response: HTTPResponse): Promise<ResponseResult> {
	return {
		url: response.url(),
		status: response.status(),
		headers: response.headers(),
		body: await response.text().catch(() => null),
	};
}
