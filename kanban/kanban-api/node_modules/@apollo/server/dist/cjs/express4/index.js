"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressMiddleware = void 0;
const url_1 = require("url");
const HeaderMap_js_1 = require("../utils/HeaderMap.js");
function expressMiddleware(server, options) {
    server.assertStarted('expressMiddleware()');
    const defaultContext = async () => ({});
    const context = options?.context ?? defaultContext;
    return (req, res, next) => {
        if (!req.body) {
            res.status(500);
            res.send('`req.body` is not set; this probably means you forgot to set up the ' +
                '`json` middleware before the Apollo Server middleware.');
            return;
        }
        const headers = new HeaderMap_js_1.HeaderMap();
        for (const [key, value] of Object.entries(req.headers)) {
            if (value !== undefined) {
                headers.set(key, Array.isArray(value) ? value.join(', ') : value);
            }
        }
        const httpGraphQLRequest = {
            method: req.method.toUpperCase(),
            headers,
            search: (0, url_1.parse)(req.url).search ?? '',
            body: req.body,
        };
        server
            .executeHTTPGraphQLRequest({
            httpGraphQLRequest,
            context: () => context({ req, res }),
        })
            .then(async (httpGraphQLResponse) => {
            for (const [key, value] of httpGraphQLResponse.headers) {
                res.setHeader(key, value);
            }
            res.statusCode = httpGraphQLResponse.status || 200;
            if (httpGraphQLResponse.body.kind === 'complete') {
                res.send(httpGraphQLResponse.body.string);
                return;
            }
            for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
                res.write(chunk);
                if (typeof res.flush === 'function') {
                    res.flush();
                }
            }
            res.end();
        })
            .catch(next);
    };
}
exports.expressMiddleware = expressMiddleware;
//# sourceMappingURL=index.js.map