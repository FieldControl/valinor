import { chooseContentTypeForSingleResultResponse, internalExecuteOperation, MEDIA_TYPES, } from './ApolloServer.js';
import { Kind } from 'graphql';
import { BadRequestError } from './internalErrorClasses.js';
import Negotiator from 'negotiator';
import { HeaderMap } from './utils/HeaderMap.js';
function fieldIfString(o, fieldName) {
    const value = o[fieldName];
    if (typeof value === 'string') {
        return value;
    }
    return undefined;
}
function searchParamIfSpecifiedOnce(searchParams, paramName) {
    const values = searchParams.getAll(paramName);
    switch (values.length) {
        case 0:
            return undefined;
        case 1:
            return values[0];
        default:
            throw new BadRequestError(`The '${paramName}' search parameter may only be specified once.`);
    }
}
function jsonParsedSearchParamIfSpecifiedOnce(searchParams, fieldName) {
    const value = searchParamIfSpecifiedOnce(searchParams, fieldName);
    if (value === undefined) {
        return undefined;
    }
    let hopefullyRecord;
    try {
        hopefullyRecord = JSON.parse(value);
    }
    catch {
        throw new BadRequestError(`The ${fieldName} search parameter contains invalid JSON.`);
    }
    if (!isStringRecord(hopefullyRecord)) {
        throw new BadRequestError(`The ${fieldName} search parameter should contain a JSON-encoded object.`);
    }
    return hopefullyRecord;
}
function fieldIfRecord(o, fieldName) {
    const value = o[fieldName];
    if (isStringRecord(value)) {
        return value;
    }
    return undefined;
}
function isStringRecord(o) {
    return (!!o && typeof o === 'object' && !Buffer.isBuffer(o) && !Array.isArray(o));
}
function isNonEmptyStringRecord(o) {
    return isStringRecord(o) && Object.keys(o).length > 0;
}
function ensureQueryIsStringOrMissing(query) {
    if (!query || typeof query === 'string') {
        return;
    }
    if (query.kind === Kind.DOCUMENT) {
        throw new BadRequestError("GraphQL queries must be strings. It looks like you're sending the " +
            'internal graphql-js representation of a parsed query in your ' +
            'request instead of a request in the GraphQL query language. You ' +
            'can convert an AST to a string using the `print` function from ' +
            '`graphql`, or use a client like `apollo-client` which converts ' +
            'the internal representation to a string for you.');
    }
    else {
        throw new BadRequestError('GraphQL queries must be strings.');
    }
}
export async function runHttpQuery({ server, httpRequest, contextValue, schemaDerivedData, internals, sharedResponseHTTPGraphQLHead, }) {
    let graphQLRequest;
    switch (httpRequest.method) {
        case 'POST': {
            if (!isNonEmptyStringRecord(httpRequest.body)) {
                throw new BadRequestError('POST body missing, invalid Content-Type, or JSON object has no keys.');
            }
            ensureQueryIsStringOrMissing(httpRequest.body.query);
            if (typeof httpRequest.body.variables === 'string') {
                throw new BadRequestError('`variables` in a POST body should be provided as an object, not a recursively JSON-encoded string.');
            }
            if (typeof httpRequest.body.extensions === 'string') {
                throw new BadRequestError('`extensions` in a POST body should be provided as an object, not a recursively JSON-encoded string.');
            }
            if ('extensions' in httpRequest.body &&
                httpRequest.body.extensions !== null &&
                !isStringRecord(httpRequest.body.extensions)) {
                throw new BadRequestError('`extensions` in a POST body must be an object if provided.');
            }
            if ('variables' in httpRequest.body &&
                httpRequest.body.variables !== null &&
                !isStringRecord(httpRequest.body.variables)) {
                throw new BadRequestError('`variables` in a POST body must be an object if provided.');
            }
            if ('operationName' in httpRequest.body &&
                httpRequest.body.operationName !== null &&
                typeof httpRequest.body.operationName !== 'string') {
                throw new BadRequestError('`operationName` in a POST body must be a string if provided.');
            }
            graphQLRequest = {
                query: fieldIfString(httpRequest.body, 'query'),
                operationName: fieldIfString(httpRequest.body, 'operationName'),
                variables: fieldIfRecord(httpRequest.body, 'variables'),
                extensions: fieldIfRecord(httpRequest.body, 'extensions'),
                http: httpRequest,
            };
            break;
        }
        case 'GET': {
            const searchParams = new URLSearchParams(httpRequest.search);
            graphQLRequest = {
                query: searchParamIfSpecifiedOnce(searchParams, 'query'),
                operationName: searchParamIfSpecifiedOnce(searchParams, 'operationName'),
                variables: jsonParsedSearchParamIfSpecifiedOnce(searchParams, 'variables'),
                extensions: jsonParsedSearchParamIfSpecifiedOnce(searchParams, 'extensions'),
                http: httpRequest,
            };
            break;
        }
        default:
            throw new BadRequestError('Apollo Server supports only GET/POST requests.', {
                extensions: {
                    http: {
                        status: 405,
                        headers: new HeaderMap([['allow', 'GET, POST']]),
                    },
                },
            });
    }
    const graphQLResponse = await internalExecuteOperation({
        server,
        graphQLRequest,
        internals,
        schemaDerivedData,
        sharedResponseHTTPGraphQLHead,
    }, { contextValue });
    if (graphQLResponse.body.kind === 'single') {
        if (!graphQLResponse.http.headers.get('content-type')) {
            const contentType = chooseContentTypeForSingleResultResponse(httpRequest);
            if (contentType === null) {
                throw new BadRequestError(`An 'accept' header was provided for this request which does not accept ` +
                    `${MEDIA_TYPES.APPLICATION_JSON} or ${MEDIA_TYPES.APPLICATION_GRAPHQL_RESPONSE_JSON}`, { extensions: { http: { status: 406 } } });
            }
            graphQLResponse.http.headers.set('content-type', contentType);
        }
        return {
            ...graphQLResponse.http,
            body: {
                kind: 'complete',
                string: await internals.stringifyResult(orderExecutionResultFields(graphQLResponse.body.singleResult)),
            },
        };
    }
    const acceptHeader = httpRequest.headers.get('accept');
    if (!(acceptHeader &&
        new Negotiator({
            headers: { accept: httpRequest.headers.get('accept') },
        }).mediaType([
            MEDIA_TYPES.MULTIPART_MIXED_NO_DEFER_SPEC,
            MEDIA_TYPES.MULTIPART_MIXED_EXPERIMENTAL,
        ]) === MEDIA_TYPES.MULTIPART_MIXED_EXPERIMENTAL)) {
        throw new BadRequestError('Apollo server received an operation that uses incremental delivery ' +
            '(@defer or @stream), but the client does not accept multipart/mixed ' +
            'HTTP responses. To enable incremental delivery support, add the HTTP ' +
            "header 'Accept: multipart/mixed; deferSpec=20220824'.", { extensions: { http: { status: 406 } } });
    }
    graphQLResponse.http.headers.set('content-type', 'multipart/mixed; boundary="-"; deferSpec=20220824');
    return {
        ...graphQLResponse.http,
        body: {
            kind: 'chunked',
            asyncIterator: writeMultipartBody(graphQLResponse.body.initialResult, graphQLResponse.body.subsequentResults),
        },
    };
}
async function* writeMultipartBody(initialResult, subsequentResults) {
    yield `\r\n---\r\ncontent-type: application/json; charset=utf-8\r\n\r\n${JSON.stringify(orderInitialIncrementalExecutionResultFields(initialResult))}\r\n---${initialResult.hasNext ? '' : '--'}\r\n`;
    for await (const result of subsequentResults) {
        yield `content-type: application/json; charset=utf-8\r\n\r\n${JSON.stringify(orderSubsequentIncrementalExecutionResultFields(result))}\r\n---${result.hasNext ? '' : '--'}\r\n`;
    }
}
function orderExecutionResultFields(result) {
    return {
        errors: result.errors,
        data: result.data,
        extensions: result.extensions,
    };
}
function orderInitialIncrementalExecutionResultFields(result) {
    return {
        hasNext: result.hasNext,
        errors: result.errors,
        data: result.data,
        incremental: orderIncrementalResultFields(result.incremental),
        extensions: result.extensions,
    };
}
function orderSubsequentIncrementalExecutionResultFields(result) {
    return {
        hasNext: result.hasNext,
        incremental: orderIncrementalResultFields(result.incremental),
        extensions: result.extensions,
    };
}
function orderIncrementalResultFields(incremental) {
    return incremental?.map((i) => ({
        hasNext: i.hasNext,
        errors: i.errors,
        path: i.path,
        label: i.label,
        data: i.data,
        items: i.items,
        extensions: i.extensions,
    }));
}
export function prettyJSONStringify(value) {
    return JSON.stringify(value) + '\n';
}
export function newHTTPGraphQLHead(status) {
    return {
        status,
        headers: new HeaderMap(),
    };
}
export function mergeHTTPGraphQLHead(target, source) {
    if (source.status) {
        target.status = source.status;
    }
    if (source.headers) {
        for (const [name, value] of source.headers) {
            target.headers.set(name, value);
        }
    }
}
//# sourceMappingURL=runHttpQuery.js.map