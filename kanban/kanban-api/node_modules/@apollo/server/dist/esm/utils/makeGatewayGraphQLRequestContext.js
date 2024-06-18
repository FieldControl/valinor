export function makeGatewayGraphQLRequestContext(as4RequestContext, server, internals) {
    const request = {};
    if ('query' in as4RequestContext.request) {
        request.query = as4RequestContext.request.query;
    }
    if ('operationName' in as4RequestContext.request) {
        request.operationName = as4RequestContext.request.operationName;
    }
    if ('variables' in as4RequestContext.request) {
        request.variables = as4RequestContext.request.variables;
    }
    if ('extensions' in as4RequestContext.request) {
        request.extensions = as4RequestContext.request.extensions;
    }
    if (as4RequestContext.request.http) {
        const as4http = as4RequestContext.request.http;
        const needQuestion = as4http.search !== '' && !as4http.search.startsWith('?');
        request.http = {
            method: as4http.method,
            url: `https://unknown-url.invalid/${needQuestion ? '?' : ''}${as4http.search}`,
            headers: new FetcherHeadersForHeaderMap(as4http.headers),
        };
    }
    const response = {
        http: {
            headers: new FetcherHeadersForHeaderMap(as4RequestContext.response.http.headers),
            get status() {
                return as4RequestContext.response.http.status;
            },
            set status(newStatus) {
                as4RequestContext.response.http.status = newStatus;
            },
        },
    };
    return {
        request,
        response,
        logger: server.logger,
        schema: as4RequestContext.schema,
        schemaHash: 'schemaHash no longer exists in Apollo Server 4',
        context: as4RequestContext.contextValue,
        cache: server.cache,
        queryHash: as4RequestContext.queryHash,
        document: as4RequestContext.document,
        source: as4RequestContext.source,
        operationName: as4RequestContext.operationName,
        operation: as4RequestContext.operation,
        errors: as4RequestContext.errors,
        metrics: as4RequestContext.metrics,
        debug: internals.includeStacktraceInErrorResponses,
        overallCachePolicy: as4RequestContext.overallCachePolicy,
        requestIsBatched: as4RequestContext.requestIsBatched,
    };
}
class FetcherHeadersForHeaderMap {
    constructor(map) {
        this.map = map;
    }
    append(name, value) {
        if (this.map.has(name)) {
            this.map.set(name, this.map.get(name) + ', ' + value);
        }
        else {
            this.map.set(name, value);
        }
    }
    delete(name) {
        this.map.delete(name);
    }
    get(name) {
        return this.map.get(name) ?? null;
    }
    has(name) {
        return this.map.has(name);
    }
    set(name, value) {
        this.map.set(name, value);
    }
    entries() {
        return this.map.entries();
    }
    keys() {
        return this.map.keys();
    }
    values() {
        return this.map.values();
    }
    [Symbol.iterator]() {
        return this.map.entries();
    }
}
//# sourceMappingURL=makeGatewayGraphQLRequestContext.js.map