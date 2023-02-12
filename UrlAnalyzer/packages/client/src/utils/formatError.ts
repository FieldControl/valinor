export function formatOAuthError(err: string) {
	switch (err) {
		case 'invalid_request':
			return 'The request is malformed.';
		case 'unauthorized_client':
			return 'The client is unauthorized.';
		case 'access_denied':
			return 'The request was denied by the resource owner.';
		case 'unsupported_response_type':
			return 'The response type is not supported.';
		case 'invalid_scope':
			return 'The requested scope is invalid.';
		case 'server_error':
			return 'The server encountered an error.';
		case 'temporarily_unavailable':
			return 'The server is temporarily unavailable.';
		case 'invalid_client':
			return 'The client authentication failed.';
		case 'invalid_grant':
			return 'The authorization grant is invalid.';
		case 'invalid_token':
			return 'The access token is invalid.';
		default:
			return err;
	}
}
