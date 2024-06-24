"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startStandaloneServer = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const index_js_1 = require("../express4/index.js");
const index_js_2 = require("../plugin/drainHttpServer/index.js");
const urlForHttpServer_js_1 = require("../utils/urlForHttpServer.js");
async function startStandaloneServer(server, options) {
    const app = (0, express_1.default)();
    const httpServer = http_1.default.createServer(app);
    server.addPlugin((0, index_js_2.ApolloServerPluginDrainHttpServer)({ httpServer: httpServer }));
    await server.start();
    const context = options?.context ?? (async () => ({}));
    app.use((0, cors_1.default)(), express_1.default.json({ limit: '50mb' }), (0, index_js_1.expressMiddleware)(server, { context }));
    const listenOptions = options?.listen ?? { port: 4000 };
    await new Promise((resolve) => {
        httpServer.listen(listenOptions, resolve);
    });
    return { url: (0, urlForHttpServer_js_1.urlForHttpServer)(httpServer) };
}
exports.startStandaloneServer = startStandaloneServer;
//# sourceMappingURL=index.js.map