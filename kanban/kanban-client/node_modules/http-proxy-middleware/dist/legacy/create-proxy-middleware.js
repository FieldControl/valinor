"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.legacyCreateProxyMiddleware = void 0;
const __1 = require("..");
const debug_1 = require("../debug");
const options_adapter_1 = require("./options-adapter");
const debug = debug_1.Debug.extend('legacy-create-proxy-middleware');
function legacyCreateProxyMiddleware(legacyContext, legacyOptions) {
    debug('init');
    const options = (0, options_adapter_1.legacyOptionsAdapter)(legacyContext, legacyOptions);
    const proxyMiddleware = (0, __1.createProxyMiddleware)(options);
    // https://github.com/chimurai/http-proxy-middleware/pull/731/files#diff-07e6ad10bda0df091b737caed42767657cd0bd74a01246a1a0b7ab59c0f6e977L118
    debug('add marker for patching req.url (old behavior)');
    proxyMiddleware.__LEGACY_HTTP_PROXY_MIDDLEWARE__ = true;
    return proxyMiddleware;
}
exports.legacyCreateProxyMiddleware = legacyCreateProxyMiddleware;
