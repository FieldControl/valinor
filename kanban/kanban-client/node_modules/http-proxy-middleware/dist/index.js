"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProxyMiddleware = void 0;
const http_proxy_middleware_1 = require("./http-proxy-middleware");
function createProxyMiddleware(options) {
    const { middleware } = new http_proxy_middleware_1.HttpProxyMiddleware(options);
    return middleware;
}
exports.createProxyMiddleware = createProxyMiddleware;
__exportStar(require("./handlers"), exports);
/**
 * Default plugins
 */
__exportStar(require("./plugins/default"), exports);
/**
 * Legacy exports
 */
__exportStar(require("./legacy"), exports);
