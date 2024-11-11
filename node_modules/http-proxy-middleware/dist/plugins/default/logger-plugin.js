"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerPlugin = void 0;
const logger_1 = require("../../logger");
const loggerPlugin = (proxyServer, options) => {
    const logger = (0, logger_1.getLogger)(options);
    proxyServer.on('error', (err, req, res, target) => {
        const hostname = req?.headers?.host;
        const requestHref = `${hostname}${req?.url}`;
        const targetHref = `${target?.href}`; // target is undefined when websocket errors
        const errorMessage = '[HPM] Error occurred while proxying request %s to %s [%s] (%s)';
        const errReference = 'https://nodejs.org/api/errors.html#errors_common_system_errors'; // link to Node Common Systems Errors page
        logger.error(errorMessage, requestHref, targetHref, err.code || err, errReference);
    });
    /**
     * Log request and response
     * @example
     * ```shell
     * [HPM] GET /users/ -> http://jsonplaceholder.typicode.com/users/ [304]
     * ```
     */
    proxyServer.on('proxyRes', (proxyRes, req, res) => {
        // BrowserSync uses req.originalUrl
        // Next.js doesn't have req.baseUrl
        const originalUrl = req.originalUrl ?? `${req.baseUrl || ''}${req.url}`;
        const exchange = `[HPM] ${req.method} ${originalUrl} -> ${proxyRes.req.protocol}//${proxyRes.req.host}${proxyRes.req.path} [${proxyRes.statusCode}]`;
        logger.info(exchange);
    });
    /**
     * When client opens WebSocket connection
     */
    proxyServer.on('open', (socket) => {
        logger.info('[HPM] Client connected: %o', socket.address());
    });
    /**
     * When client closes WebSocket connection
     */
    proxyServer.on('close', (req, proxySocket, proxyHead) => {
        logger.info('[HPM] Client disconnected: %o', proxySocket.address());
    });
};
exports.loggerPlugin = loggerPlugin;
