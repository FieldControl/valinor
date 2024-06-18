"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_APOLLO_SERVER_LANDING_PAGE_VERSION = exports.DEFAULT_EMBEDDED_SANDBOX_VERSION = exports.DEFAULT_EMBEDDED_EXPLORER_VERSION = exports.ApolloServerPluginLandingPageProductionDefault = exports.ApolloServerPluginLandingPageLocalDefault = void 0;
const getEmbeddedHTML_js_1 = require("./getEmbeddedHTML.js");
const packageVersion_js_1 = require("../../../generated/packageVersion.js");
const utils_createhash_1 = require("@apollo/utils.createhash");
const uuid_1 = require("uuid");
function ApolloServerPluginLandingPageLocalDefault(options = {}) {
    const { version, __internal_apolloStudioEnv__, ...rest } = {
        embed: true,
        ...options,
    };
    return ApolloServerPluginLandingPageDefault(version, {
        isProd: false,
        apolloStudioEnv: __internal_apolloStudioEnv__,
        ...rest,
    });
}
exports.ApolloServerPluginLandingPageLocalDefault = ApolloServerPluginLandingPageLocalDefault;
function ApolloServerPluginLandingPageProductionDefault(options = {}) {
    const { version, __internal_apolloStudioEnv__, ...rest } = options;
    return ApolloServerPluginLandingPageDefault(version, {
        isProd: true,
        apolloStudioEnv: __internal_apolloStudioEnv__,
        ...rest,
    });
}
exports.ApolloServerPluginLandingPageProductionDefault = ApolloServerPluginLandingPageProductionDefault;
function encodeConfig(config) {
    return JSON.stringify(encodeURIComponent(JSON.stringify(config)));
}
const getNonEmbeddedLandingPageHTML = (cdnVersion, config, apolloServerVersion, nonce) => {
    const encodedConfig = encodeConfig(config);
    return `
 <div class="fallback">
  <h1>Welcome to Apollo Server</h1>
  <p>The full landing page cannot be loaded; it appears that you might be offline.</p>
</div>
<script nonce="${nonce}">window.landingPage = ${encodedConfig};</script>
<script nonce="${nonce}" src="https://apollo-server-landing-page.cdn.apollographql.com/${encodeURIComponent(cdnVersion)}/static/js/main.js?runtime=${apolloServerVersion}"></script>`;
};
exports.DEFAULT_EMBEDDED_EXPLORER_VERSION = 'v3';
exports.DEFAULT_EMBEDDED_SANDBOX_VERSION = 'v2';
exports.DEFAULT_APOLLO_SERVER_LANDING_PAGE_VERSION = '_latest';
function ApolloServerPluginLandingPageDefault(maybeVersion, config) {
    const explorerVersion = maybeVersion ?? exports.DEFAULT_EMBEDDED_EXPLORER_VERSION;
    const sandboxVersion = maybeVersion ?? exports.DEFAULT_EMBEDDED_SANDBOX_VERSION;
    const apolloServerLandingPageVersion = maybeVersion ?? exports.DEFAULT_APOLLO_SERVER_LANDING_PAGE_VERSION;
    const apolloServerVersion = `@apollo/server@${packageVersion_js_1.packageVersion}`;
    const scriptSafeList = [
        'https://apollo-server-landing-page.cdn.apollographql.com',
        'https://embeddable-sandbox.cdn.apollographql.com',
        'https://embeddable-explorer.cdn.apollographql.com',
    ].join(' ');
    const styleSafeList = [
        'https://apollo-server-landing-page.cdn.apollographql.com',
        'https://embeddable-sandbox.cdn.apollographql.com',
        'https://embeddable-explorer.cdn.apollographql.com',
        'https://fonts.googleapis.com',
    ].join(' ');
    const iframeSafeList = [
        'https://explorer.embed.apollographql.com',
        'https://sandbox.embed.apollographql.com',
        'https://embed.apollo.local:3000',
    ].join(' ');
    return {
        __internal_installed_implicitly__: false,
        async serverWillStart(server) {
            if (config.precomputedNonce) {
                server.logger.warn("The `precomputedNonce` landing page configuration option is deprecated. Removing this option is strictly an improvement to Apollo Server's landing page Content Security Policy (CSP) implementation for preventing XSS attacks.");
            }
            return {
                async renderLandingPage() {
                    const encodedASLandingPageVersion = encodeURIComponent(apolloServerLandingPageVersion);
                    async function html() {
                        const nonce = config.precomputedNonce ??
                            (0, utils_createhash_1.createHash)('sha256').update((0, uuid_1.v4)()).digest('hex');
                        const scriptCsp = `script-src 'self' 'nonce-${nonce}' ${scriptSafeList}`;
                        const styleCsp = `style-src 'nonce-${nonce}' ${styleSafeList}`;
                        const imageCsp = `img-src https://apollo-server-landing-page.cdn.apollographql.com`;
                        const manifestCsp = `manifest-src https://apollo-server-landing-page.cdn.apollographql.com`;
                        const frameCsp = `frame-src ${iframeSafeList}`;
                        return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="${scriptCsp}; ${styleCsp}; ${imageCsp}; ${manifestCsp}; ${frameCsp}" />
    <link
      rel="icon"
      href="https://apollo-server-landing-page.cdn.apollographql.com/${encodedASLandingPageVersion}/assets/favicon.png"
    />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro&display=swap"
      rel="stylesheet"
    />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Apollo server landing page" />
    <link
      rel="apple-touch-icon"
      href="https://apollo-server-landing-page.cdn.apollographql.com/${encodedASLandingPageVersion}/assets/favicon.png"
    />
    <link
      rel="manifest"
      href="https://apollo-server-landing-page.cdn.apollographql.com/${encodedASLandingPageVersion}/manifest.json"
    />
    <title>Apollo Server</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="react-root">
      <style nonce=${nonce}>
        body {
          margin: 0;
          overflow-x: hidden;
          overflow-y: hidden;
        }
        .fallback {
          opacity: 0;
          animation: fadeIn 1s 1s;
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
          padding: 1em;
        }
        @keyframes fadeIn {
          0% {opacity:0;}
          100% {opacity:1; }
        }
      </style>
    ${config.embed
                            ? 'graphRef' in config && config.graphRef
                                ? (0, getEmbeddedHTML_js_1.getEmbeddedExplorerHTML)(explorerVersion, config, apolloServerVersion, nonce)
                                : !('graphRef' in config)
                                    ? (0, getEmbeddedHTML_js_1.getEmbeddedSandboxHTML)(sandboxVersion, config, apolloServerVersion, nonce)
                                    : getNonEmbeddedLandingPageHTML(apolloServerLandingPageVersion, config, apolloServerVersion, nonce)
                            : getNonEmbeddedLandingPageHTML(apolloServerLandingPageVersion, config, apolloServerVersion, nonce)}
    </div>
  </body>
</html>
          `;
                    }
                    return { html };
                },
            };
        },
    };
}
//# sourceMappingURL=index.js.map