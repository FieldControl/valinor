import type { BaseWorkerMessage } from '@app/worker';
import hljs from 'highlight.js/lib/common';
import parserJson from 'prettier/parser-babel';
import parserHtml from 'prettier/parser-html';
import parserCss from 'prettier/parser-postcss';
import parserTypescript from 'prettier/parser-typescript';
import { format } from 'prettier/standalone';
import { generateRandomHash } from './generateRandom';

export interface FormatBodyReturn {
	data: string;
	ok: boolean;
}

export async function formatBody(body: string, resource_type: string, worker: Worker) {
	const nonce = generateRandomHash();

	const postData: BaseWorkerMessage<'formatBody'> = {
		data: {
			data: body,
			resource_type,
		},
		nonce,
		type: 'formatBody',
	};

	worker.postMessage(postData);

	return new Promise<FormatBodyReturn>((resolve) => {
		worker.onmessage = (evt) => {
			if (evt.data.nonce !== nonce) return;
			resolve({
				...evt.data.data,
			});
		};
	});
}

export function jsonFormat(data: string): string {
	const formatted = format(data, {
		parser: 'json',
		plugins: [parserJson],
	});

	return hljs.highlight(formatted, {
		language: 'json',
	}).value;
}

export function httpFormat(data: string) {
	const formatted = format(data, {
		parser: 'html',
		plugins: [parserHtml],
	});

	return hljs.highlight(formatted, {
		language: 'html',
	}).value;
}

export function jsFormat(data: string): string {
	const formatted = format(data, {
		parser: 'typescript',
		plugins: [parserTypescript],
	});

	return hljs.highlight(formatted, {
		language: 'javascript',
	}).value;
}

export function formatCss(data: string): string {
	const formatted = format(data, {
		parser: 'css',
		plugins: [parserCss],
		useTabs: true,
	});

	return hljs.highlight(formatted, {
		language: 'css',
	}).value;
}

export function findFormatter(data: string, resource_type: string) {
	try {
		switch (resource_type) {
			case 'script':
				return {
					data: jsFormat(data),
					ok: true,
				};
			case 'stylesheet':
				return {
					data: formatCss(data),
					ok: true,
				};
			case 'xhr':
			case 'fetch':
				return {
					data: jsonFormat(data),
					ok: true,
				};
			case 'document':
				return {
					data: httpFormat(data),
					ok: true,
				};
			default:
				return {
					data,
					ok: false,
				};
		}
	} catch {
		return {
			data,
			ok: false,
		};
	}
}
