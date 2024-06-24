import MIMEType from 'whatwg-mimetype';
import { BadRequestError } from './internalErrorClasses.js';
export const recommendedCsrfPreventionRequestHeaders = [
    'x-apollo-operation-name',
    'apollo-require-preflight',
];
const NON_PREFLIGHTED_CONTENT_TYPES = [
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'text/plain',
];
export function preventCsrf(headers, csrfPreventionRequestHeaders) {
    const contentType = headers.get('content-type');
    if (contentType !== undefined) {
        const contentTypeParsed = MIMEType.parse(contentType);
        if (contentTypeParsed === null) {
            return;
        }
        if (!NON_PREFLIGHTED_CONTENT_TYPES.includes(contentTypeParsed.essence)) {
            return;
        }
    }
    if (csrfPreventionRequestHeaders.some((header) => {
        const value = headers.get(header);
        return value !== undefined && value.length > 0;
    })) {
        return;
    }
    throw new BadRequestError(`This operation has been blocked as a potential Cross-Site Request Forgery ` +
        `(CSRF). Please either specify a 'content-type' header (with a type that ` +
        `is not one of ${NON_PREFLIGHTED_CONTENT_TYPES.join(', ')}) or provide ` +
        `a non-empty value for one of the following headers: ${csrfPreventionRequestHeaders.join(', ')}\n`);
}
//# sourceMappingURL=preventCsrf.js.map