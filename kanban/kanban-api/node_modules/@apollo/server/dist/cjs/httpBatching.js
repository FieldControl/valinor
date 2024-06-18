"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPotentiallyBatchedHttpQuery = void 0;
const runHttpQuery_js_1 = require("./runHttpQuery.js");
const internalErrorClasses_js_1 = require("./internalErrorClasses.js");
async function runBatchedHttpQuery({ server, batchRequest, body, contextValue, schemaDerivedData, internals, }) {
    if (body.length === 0) {
        throw new internalErrorClasses_js_1.BadRequestError('No operations found in request.');
    }
    const sharedResponseHTTPGraphQLHead = (0, runHttpQuery_js_1.newHTTPGraphQLHead)();
    const responseBodies = await Promise.all(body.map(async (bodyPiece) => {
        const singleRequest = {
            ...batchRequest,
            body: bodyPiece,
        };
        const response = await (0, runHttpQuery_js_1.runHttpQuery)({
            server,
            httpRequest: singleRequest,
            contextValue,
            schemaDerivedData,
            internals,
            sharedResponseHTTPGraphQLHead,
        });
        if (response.body.kind === 'chunked') {
            throw Error('Incremental delivery is not implemented for batch requests');
        }
        return response.body.string;
    }));
    return {
        ...sharedResponseHTTPGraphQLHead,
        body: { kind: 'complete', string: `[${responseBodies.join(',')}]` },
    };
}
async function runPotentiallyBatchedHttpQuery(server, httpGraphQLRequest, contextValue, schemaDerivedData, internals) {
    if (!(httpGraphQLRequest.method === 'POST' &&
        Array.isArray(httpGraphQLRequest.body))) {
        return await (0, runHttpQuery_js_1.runHttpQuery)({
            server,
            httpRequest: httpGraphQLRequest,
            contextValue,
            schemaDerivedData,
            internals,
            sharedResponseHTTPGraphQLHead: null,
        });
    }
    if (internals.allowBatchedHttpRequests) {
        return await runBatchedHttpQuery({
            server,
            batchRequest: httpGraphQLRequest,
            body: httpGraphQLRequest.body,
            contextValue,
            schemaDerivedData,
            internals,
        });
    }
    throw new internalErrorClasses_js_1.BadRequestError('Operation batching disabled.');
}
exports.runPotentiallyBatchedHttpQuery = runPotentiallyBatchedHttpQuery;
//# sourceMappingURL=httpBatching.js.map