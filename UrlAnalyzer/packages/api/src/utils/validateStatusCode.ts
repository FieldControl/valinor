export function validateStatusCode(statusCode: number) {
	return statusCode >= 200 && statusCode < 300;
}
