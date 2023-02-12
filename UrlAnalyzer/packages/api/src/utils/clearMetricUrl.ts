function removeIdFromUrl(url: string) {
	return url.replaceAll(/\/[\da-f]{17,21}/g, '/:id');
}

function removeQueryParams(url: string) {
	return url.replace(/\?.*/, '?query');
}

function removeTokenFromUrl(url: string) {
	// eslint-disable-next-line unicorn/no-unsafe-regex
	return url.replaceAll(/(?:[\w+/=]*\.){2}\w*/g, ':token');
}

export function clearMetricUrl(url: string) {
	return [removeIdFromUrl, removeQueryParams, removeTokenFromUrl].reduce((acc, fn) => fn(acc), url);
}
