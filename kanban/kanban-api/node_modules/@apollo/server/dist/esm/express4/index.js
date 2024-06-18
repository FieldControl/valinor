import { parse as urlParse } from 'url';
import { HeaderMap } from '../utils/HeaderMap.js';
export function expressMiddleware(server, options) {
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
        const headers = new HeaderMap();
        for (const [key, value] of Object.entries(req.headers)) {
            if (value !== undefined) {
                headers.set(key, Array.isArray(value) ? value.join(', ') : value);
            }
        }
        const httpGraphQLRequest = {
            method: req.method.toUpperCase(),
            headers,
            search: urlParse(req.url).search ?? '',
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
//# sourceMappingURL=index.js.map