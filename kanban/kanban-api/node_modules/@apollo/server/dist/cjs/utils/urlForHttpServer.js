"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlForHttpServer = void 0;
const url_1 = require("url");
function urlForHttpServer(httpServer) {
    const { address, port } = httpServer.address();
    const hostname = address === '' || address === '::' ? 'localhost' : address;
    return (0, url_1.format)({
        protocol: 'http',
        hostname,
        port,
        pathname: '/',
    });
}
exports.urlForHttpServer = urlForHttpServer;
//# sourceMappingURL=urlForHttpServer.js.map