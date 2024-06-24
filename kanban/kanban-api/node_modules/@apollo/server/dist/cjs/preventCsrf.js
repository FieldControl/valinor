"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preventCsrf = exports.recommendedCsrfPreventionRequestHeaders = void 0;
const whatwg_mimetype_1 = __importDefault(require("whatwg-mimetype"));
const internalErrorClasses_js_1 = require("./internalErrorClasses.js");
exports.recommendedCsrfPreventionRequestHeaders = [
    'x-apollo-operation-name',
    'apollo-require-preflight',
];
const NON_PREFLIGHTED_CONTENT_TYPES = [
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'text/plain',
];
function preventCsrf(headers, csrfPreventionRequestHeaders) {
    const contentType = headers.get('content-type');
    if (contentType !== undefined) {
        const contentTypeParsed = whatwg_mimetype_1.default.parse(contentType);
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
    throw new internalErrorClasses_js_1.BadRequestError(`This operation has been blocked as a potential Cross-Site Request Forgery ` +
        `(CSRF). Please either specify a 'content-type' header (with a type that ` +
        `is not one of ${NON_PREFLIGHTED_CONTENT_TYPES.join(', ')}) or provide ` +
        `a non-empty value for one of the following headers: ${csrfPreventionRequestHeaders.join(', ')}\n`);
}
exports.preventCsrf = preventCsrf;
//# sourceMappingURL=preventCsrf.js.map