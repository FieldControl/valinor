import cors from 'cors';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '../express4/index.js';
import { ApolloServerPluginDrainHttpServer } from '../plugin/drainHttpServer/index.js';
import { urlForHttpServer } from '../utils/urlForHttpServer.js';
export async function startStandaloneServer(server, options) {
    const app = express();
    const httpServer = http.createServer(app);
    server.addPlugin(ApolloServerPluginDrainHttpServer({ httpServer: httpServer }));
    await server.start();
    const context = options?.context ?? (async () => ({}));
    app.use(cors(), express.json({ limit: '50mb' }), expressMiddleware(server, { context }));
    const listenOptions = options?.listen ?? { port: 4000 };
    await new Promise((resolve) => {
        httpServer.listen(listenOptions, resolve);
    });
    return { url: urlForHttpServer(httpServer) };
}
//# sourceMappingURL=index.js.map