/**
 * Dev Server target options for Build Facade.
 */
export interface Schema {
    /**
     * List of hosts that are allowed to access the dev server.
     */
    allowedHosts?: string[];
    /**
     * Build using Ahead of Time compilation.
     * @deprecated Use the "aot" option in the browser builder instead.
     */
    aot?: boolean;
    /**
     * Base url for the application being built.
     * @deprecated Use the "baseHref" option in the browser builder instead.
     */
    baseHref?: string;
    /**
     * A browser builder target to serve in the format of `project:target[:configuration]`. You
     * can also pass in more than one configuration name as a comma-separated list. Example:
     * `project:target:production,staging`.
     */
    browserTarget: string;
    /**
     * Generate a seperate bundle containing code used across multiple bundles.
     * @deprecated Use the "commonChunk" option in the browser builder instead.
     */
    commonChunk?: boolean;
    /**
     * URL where files will be deployed.
     * @deprecated Use the "deployUrl" option in the browser builder instead.
     */
    deployUrl?: string;
    /**
     * Don't verify connected clients are part of allowed hosts.
     */
    disableHostCheck?: boolean;
    /**
     * Custom HTTP headers to be added to all responses.
     */
    headers?: {
        [key: string]: string;
    };
    /**
     * Enable hot module replacement.
     */
    hmr?: boolean;
    /**
     * Show a warning when the --hmr option is enabled.
     * @deprecated No longer has an effect.
     */
    hmrWarning?: boolean;
    /**
     * Host to listen on.
     */
    host?: string;
    /**
     * Whether to reload the page on change, using live-reload.
     */
    liveReload?: boolean;
    /**
     * Opens the url in default browser.
     */
    open?: boolean;
    /**
     * Enables optimization of the build output. Including minification of scripts and styles,
     * tree-shaking, dead-code elimination, tree-shaking and fonts inlining. For more
     * information, see https://angular.io/guide/workspace-config#optimization-configuration.
     * @deprecated Use the "optimization" option in the browser builder instead.
     */
    optimization?: OptimizationUnion;
    /**
     * Enable and define the file watching poll time period in milliseconds.
     */
    poll?: number;
    /**
     * Port to listen on.
     */
    port?: number;
    /**
     * Log progress to the console while building.
     * @deprecated Use the "progress" option in the browser builder instead.
     */
    progress?: boolean;
    /**
     * Proxy configuration file. For more information, see
     * https://angular.io/guide/build#proxying-to-a-backend-server.
     */
    proxyConfig?: string;
    /**
     * The URL that the browser client (or live-reload client, if enabled) should use to connect
     * to the development server. Use for a complex dev server setup, such as one with reverse
     * proxies.
     */
    publicHost?: string;
    /**
     * The pathname where the app will be served.
     */
    servePath?: string;
    /**
     * Show a warning when deploy-url/base-href use unsupported serve path values.
     * @deprecated No longer has an effect.
     */
    servePathDefaultWarning?: boolean;
    /**
     * Output source maps for scripts and styles. For more information, see
     * https://angular.io/guide/workspace-config#source-map-configuration.
     * @deprecated Use the "sourceMap" option in the browser builder instead.
     */
    sourceMap?: SourceMapUnion;
    /**
     * Serve using HTTPS.
     */
    ssl?: boolean;
    /**
     * SSL certificate to use for serving HTTPS.
     */
    sslCert?: string;
    /**
     * SSL key to use for serving HTTPS.
     */
    sslKey?: string;
    /**
     * Generate a seperate bundle containing only vendor libraries. This option should only used
     * for development.
     * @deprecated Use the "vendorChunk" option in the browser builder instead.
     */
    vendorChunk?: boolean;
    /**
     * Adds more details to output logging.
     */
    verbose?: boolean;
    /**
     * Rebuild on change.
     */
    watch?: boolean;
}
/**
 * Enables optimization of the build output. Including minification of scripts and styles,
 * tree-shaking, dead-code elimination, tree-shaking and fonts inlining. For more
 * information, see https://angular.io/guide/workspace-config#optimization-configuration.
 * @deprecated Use the "optimization" option in the browser builder instead.
 */
export declare type OptimizationUnion = boolean | OptimizationClass;
export interface OptimizationClass {
    /**
     * Enables optimization of the scripts output.
     */
    scripts?: boolean;
    /**
     * Enables optimization of the styles output.
     */
    styles?: boolean;
}
/**
 * Output source maps for scripts and styles. For more information, see
 * https://angular.io/guide/workspace-config#source-map-configuration.
 * @deprecated Use the "sourceMap" option in the browser builder instead.
 */
export declare type SourceMapUnion = boolean | SourceMapClass;
export interface SourceMapClass {
    /**
     * Output source maps used for error reporting tools.
     */
    hidden?: boolean;
    /**
     * Output source maps for all scripts.
     */
    scripts?: boolean;
    /**
     * Output source maps for all styles.
     */
    styles?: boolean;
    /**
     * Resolve vendor packages source maps.
     */
    vendor?: boolean;
}
