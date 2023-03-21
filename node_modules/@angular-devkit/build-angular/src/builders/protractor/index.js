"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = void 0;
const architect_1 = require("@angular-devkit/architect");
const core_1 = require("@angular-devkit/core");
const path_1 = require("path");
const url = __importStar(require("url"));
const utils_1 = require("../../utils");
const error_1 = require("../../utils/error");
function runProtractor(root, options) {
    const additionalProtractorConfig = {
        baseUrl: options.baseUrl,
        specs: options.specs && options.specs.length ? options.specs : undefined,
        suite: options.suite,
        jasmineNodeOpts: {
            grep: options.grep,
            invertGrep: options.invertGrep,
        },
    };
    // TODO: Protractor manages process.exit itself, so this target will allways quit the
    // process. To work around this we run it in a subprocess.
    // https://github.com/angular/protractor/issues/4160
    return (0, utils_1.runModuleAsObservableFork)(root, 'protractor/built/launcher', 'init', [
        (0, path_1.resolve)(root, options.protractorConfig),
        additionalProtractorConfig,
    ]).toPromise();
}
async function updateWebdriver() {
    var _a;
    // The webdriver-manager update command can only be accessed via a deep import.
    const webdriverDeepImport = 'webdriver-manager/built/lib/cmds/update';
    let path;
    try {
        const protractorPath = require.resolve('protractor');
        path = require.resolve(webdriverDeepImport, { paths: [protractorPath] });
    }
    catch (error) {
        (0, error_1.assertIsError)(error);
        if (error.code !== 'MODULE_NOT_FOUND') {
            throw error;
        }
    }
    if (!path) {
        throw new Error(core_1.tags.stripIndents `
      Cannot automatically find webdriver-manager to update.
      Update webdriver-manager manually and run 'ng e2e --no-webdriver-update' instead.
    `);
    }
    const webdriverUpdate = await (_a = path, Promise.resolve().then(() => __importStar(require(_a))));
    // const webdriverUpdate = await import(path) as typeof import ('webdriver-manager/built/lib/cmds/update');
    // run `webdriver-manager update --standalone false --gecko false --quiet`
    // if you change this, update the command comment in prev line
    return webdriverUpdate.program.run({
        standalone: false,
        gecko: false,
        quiet: true,
    });
}
/**
 * @experimental Direct usage of this function is considered experimental.
 */
async function execute(options, context) {
    context.logger.warn('Protractor has been deprecated including its support in the Angular CLI. For additional information and alternatives, please see https://github.com/angular/protractor/issues/5502.');
    // ensure that only one of these options is used
    if (options.devServerTarget && options.baseUrl) {
        throw new Error(core_1.tags.stripIndents `
    The 'baseUrl' option cannot be used with 'devServerTarget'.
    When present, 'devServerTarget' will be used to automatically setup 'baseUrl' for Protractor.
    `);
    }
    if (options.webdriverUpdate) {
        await updateWebdriver();
    }
    let baseUrl = options.baseUrl;
    let server;
    try {
        if (options.devServerTarget) {
            const target = (0, architect_1.targetFromTargetString)(options.devServerTarget);
            const serverOptions = await context.getTargetOptions(target);
            const overrides = {
                watch: false,
                liveReload: false,
            };
            if (options.host !== undefined) {
                overrides.host = options.host;
            }
            else if (typeof serverOptions.host === 'string') {
                options.host = serverOptions.host;
            }
            else {
                options.host = overrides.host = 'localhost';
            }
            if (options.port !== undefined) {
                overrides.port = options.port;
            }
            else if (typeof serverOptions.port === 'number') {
                options.port = serverOptions.port;
            }
            server = await context.scheduleTarget(target, overrides);
            const result = await server.result;
            if (!result.success) {
                return { success: false };
            }
            if (typeof serverOptions.publicHost === 'string') {
                let publicHost = serverOptions.publicHost;
                if (!/^\w+:\/\//.test(publicHost)) {
                    publicHost = `${serverOptions.ssl ? 'https' : 'http'}://${publicHost}`;
                }
                const clientUrl = url.parse(publicHost);
                baseUrl = url.format(clientUrl);
            }
            else if (typeof result.baseUrl === 'string') {
                baseUrl = result.baseUrl;
            }
            else if (typeof result.port === 'number') {
                baseUrl = url.format({
                    protocol: serverOptions.ssl ? 'https' : 'http',
                    hostname: options.host,
                    port: result.port.toString(),
                });
            }
        }
        // Like the baseUrl in protractor config file when using the API we need to add
        // a trailing slash when provide to the baseUrl.
        if (baseUrl && !baseUrl.endsWith('/')) {
            baseUrl += '/';
        }
        return await runProtractor(context.workspaceRoot, { ...options, baseUrl });
    }
    catch (_a) {
        return { success: false };
    }
    finally {
        await (server === null || server === void 0 ? void 0 : server.stop());
    }
}
exports.execute = execute;
exports.default = (0, architect_1.createBuilder)(execute);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy9idWlsZGVycy9wcm90cmFjdG9yL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUgseURBS21DO0FBQ25DLCtDQUFrRDtBQUNsRCwrQkFBK0I7QUFDL0IseUNBQTJCO0FBQzNCLHVDQUF3RDtBQUN4RCw2Q0FBa0Q7QUFXbEQsU0FBUyxhQUFhLENBQUMsSUFBWSxFQUFFLE9BQWlDO0lBQ3BFLE1BQU0sMEJBQTBCLEdBQWlFO1FBQy9GLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTztRQUN4QixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUztRQUN4RSxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7UUFDcEIsZUFBZSxFQUFFO1lBQ2YsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVTtTQUMvQjtLQUNGLENBQUM7SUFFRixxRkFBcUY7SUFDckYsMERBQTBEO0lBQzFELG9EQUFvRDtJQUNwRCxPQUFPLElBQUEsaUNBQXlCLEVBQUMsSUFBSSxFQUFFLDJCQUEyQixFQUFFLE1BQU0sRUFBRTtRQUMxRSxJQUFBLGNBQU8sRUFBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLGdCQUFnQixDQUFDO1FBQ3ZDLDBCQUEwQjtLQUMzQixDQUFDLENBQUMsU0FBUyxFQUE0QixDQUFDO0FBQzNDLENBQUM7QUFFRCxLQUFLLFVBQVUsZUFBZTs7SUFDNUIsK0VBQStFO0lBQy9FLE1BQU0sbUJBQW1CLEdBQUcseUNBQXlDLENB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QUVELE9BQU8sTUFBTSxhQUFhLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLEdBQUcsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7S0FDNUU7SUFBQyxXQUFNO1FBQ04sT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQztLQUMzQjtZQUFTO1FBQ1IsTUFBTSxDQUFBLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxJQUFJLEVBQUUsQ0FBQSxDQUFDO0tBQ3RCO0FBQ0gsQ0FBQztBQW5GRCwwQkFtRkM7QUFFRCxrQkFBZSxJQUFBLHlCQUFhLEVBQTJCLE9BQU8sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEJ1aWxkZXJDb250ZXh0LFxuICBCdWlsZGVyT3V0cHV0LFxuICBjcmVhdGVCdWlsZGVyLFxuICB0YXJnZXRGcm9tVGFyZ2V0U3RyaW5nLFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvYXJjaGl0ZWN0JztcbmltcG9ydCB7IGpzb24sIHRhZ3MgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB1cmwgZnJvbSAndXJsJztcbmltcG9ydCB7IHJ1bk1vZHVsZUFzT2JzZXJ2YWJsZUZvcmsgfSBmcm9tICcuLi8uLi91dGlscyc7XG5pbXBvcnQgeyBhc3NlcnRJc0Vycm9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvZXJyb3InO1xuaW1wb3J0IHsgRGV2U2VydmVyQnVpbGRlck9wdGlvbnMgfSBmcm9tICcuLi9kZXYtc2VydmVyL2luZGV4JztcbmltcG9ydCB7IFNjaGVtYSBhcyBQcm90cmFjdG9yQnVpbGRlck9wdGlvbnMgfSBmcm9tICcuL3NjaGVtYSc7XG5cbmludGVyZmFjZSBKYXNtaW5lTm9kZU9wdHMge1xuICBqYXNtaW5lTm9kZU9wdHM6IHtcbiAgICBncmVwPzogc3RyaW5nO1xuICAgIGludmVydEdyZXA/OiBib29sZWFuO1xuICB9O1xufVxuXG5mdW5jdGlvbiBydW5Qcm90cmFjdG9yKHJvb3Q6IHN0cmluZywgb3B0aW9uczogUHJvdHJhY3RvckJ1aWxkZXJPcHRpb25zKTogUHJvbWlzZTxCdWlsZGVyT3V0cHV0PiB7XG4gIGNvbnN0IGFkZGl0aW9uYWxQcm90cmFjdG9yQ29uZmlnOiBQYXJ0aWFsPFByb3RyYWN0b3JCdWlsZGVyT3B0aW9ucz4gJiBQYXJ0aWFsPEphc21pbmVOb2RlT3B0cz4gPSB7XG4gICAgYmFzZVVybDogb3B0aW9ucy5iYXNlVXJsLFxuICAgIHNwZWNzOiBvcHRpb25zLnNwZWNzICYmIG9wdGlvbnMuc3BlY3MubGVuZ3RoID8gb3B0aW9ucy5zcGVjcyA6IHVuZGVmaW5lZCxcbiAgICBzdWl0ZTogb3B0aW9ucy5zdWl0ZSxcbiAgICBqYXNtaW5lTm9kZU9wdHM6IHtcbiAgICAgIGdyZXA6IG9wdGlvbnMuZ3JlcCxcbiAgICAgIGludmVydEdyZXA6IG9wdGlvbnMuaW52ZXJ0R3JlcCxcbiAgICB9LFxuICB9O1xuXG4gIC8vIFRPRE86IFByb3RyYWN0b3IgbWFuYWdlcyBwcm9jZXNzLmV4aXQgaXRzZWxmLCBzbyB0aGlzIHRhcmdldCB3aWxsIGFsbHdheXMgcXVpdCB0aGVcbiAgLy8gcHJvY2Vzcy4gVG8gd29yayBhcm91bmQgdGhpcyB3ZSBydW4gaXQgaW4gYSBzdWJwcm9jZXNzLlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9wcm90cmFjdG9yL2lzc3Vlcy80MTYwXG4gIHJldHVybiBydW5Nb2R1bGVBc09ic2VydmFibGVGb3JrKHJvb3QsICdwcm90cmFjdG9yL2J1aWx0L2xhdW5jaGVyJywgJ2luaXQnLCBbXG4gICAgcmVzb2x2ZShyb290LCBvcHRpb25zLnByb3RyYWN0b3JDb25maWcpLFxuICAgIGFkZGl0aW9uYWxQcm90cmFjdG9yQ29uZmlnLFxuICBdKS50b1Byb21pc2UoKSBhcyBQcm9taXNlPEJ1aWxkZXJPdXRwdXQ+O1xufVxuXG5hc3luYyBmdW5jdGlvbiB1cGRhdGVXZWJkcml2ZXIoKSB7XG4gIC8vIFRoZSB3ZWJkcml2ZXItbWFuYWdlciB1cGRhdGUgY29tbWFuZCBjYW4gb25seSBiZSBhY2Nlc3NlZCB2aWEgYSBkZWVwIGltcG9ydC5cbiAgY29uc3Qgd2ViZHJpdmVyRGVlcEltcG9ydCA9ICd3ZWJkcml2ZXItbWFuYWdlci9idWlsdC9saWIvY21kcy91cGRhdGUnO1xuXG4gIGxldCBwYXRoO1xuICB0cnkge1xuICAgIGNvbnN0IHByb3RyYWN0b3JQYXRoID0gcmVxdWlyZS5yZXNvbHZlKCdwcm90cmFjdG9yJyk7XG5cbiAgICBwYXRoID0gcmVxdWlyZS5yZXNvbHZlKHdlYmRyaXZlckRlZXBJbXBvcnQsIHsgcGF0aHM6IFtwcm90cmFjdG9yUGF0aF0gfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgYXNzZXJ0SXNFcnJvcihlcnJvcik7XG4gICAgaWYgKGVycm9yLmNvZGUgIT09ICdNT0RVTEVfTk9UX0ZPVU5EJykge1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFwYXRoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKHRhZ3Muc3RyaXBJbmRlbnRzYFxuICAgICAgQ2Fubm90IGF1dG9tYXRpY2FsbHkgZmluZCB3ZWJkcml2ZXItbWFuYWdlciB0byB1cGRhdGUuXG4gICAgICBVcGRhdGUgd2ViZHJpdmVyLW1hbmFnZXIgbWFudWFsbHkgYW5kIHJ1biAnbmcgZTJlIC0tbm8td2ViZHJpdmVyLXVwZGF0ZScgaW5zdGVhZC5cbiAgICBgKTtcbiAgfVxuXG4gIGNvbnN0IHdlYmRyaXZlclVwZGF0ZSA9IGF3YWl0IGltcG9ydChwYXRoKTtcbiAgLy8gY29uc3Qgd2ViZHJpdmVyVXBkYXRlID0gYXdhaXQgaW1wb3J0KHBhdGgpIGFzIHR5cGVvZiBpbXBvcnQgKCd3ZWJkcml2ZXItbWFuYWdlci9idWlsdC9saWIvY21kcy91cGRhdGUnKTtcblxuICAvLyBydW4gYHdlYmRyaXZlci1tYW5hZ2VyIHVwZGF0ZSAtLXN0YW5kYWxvbmUgZmFsc2UgLS1nZWNrbyBmYWxzZSAtLXF1aWV0YFxuICAvLyBpZiB5b3UgY2hhbmdlIHRoaXMsIHVwZGF0ZSB0aGUgY29tbWFuZCBjb21tZW50IGluIHByZXYgbGluZVxuICByZXR1cm4gd2ViZHJpdmVyVXBkYXRlLnByb2dyYW0ucnVuKHtcbiAgICBzdGFuZGFsb25lOiBmYWxzZSxcbiAgICBnZWNrbzogZmFsc2UsXG4gICAgcXVpZXQ6IHRydWUsXG4gIH0gYXMgdW5rbm93biBhcyBKU09OKTtcbn1cblxuZXhwb3J0IHsgUHJvdHJhY3RvckJ1aWxkZXJPcHRpb25zIH07XG5cbi8qKlxuICogQGV4cGVyaW1lbnRhbCBEaXJlY3QgdXNhZ2Ugb2YgdGhpcyBmdW5jdGlvbiBpcyBjb25zaWRlcmVkIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGUoXG4gIG9wdGlvbnM6IFByb3RyYWN0b3JCdWlsZGVyT3B0aW9ucyxcbiAgY29udGV4dDogQnVpbGRlckNvbnRleHQsXG4pOiBQcm9taXNlPEJ1aWxkZXJPdXRwdXQ+IHtcbiAgY29udGV4dC5sb2dnZXIud2FybihcbiAgICAnUHJvdHJhY3RvciBoYXMgYmVlbiBkZXByZWNhdGVkIGluY2x1ZGluZyBpdHMgc3VwcG9ydCBpbiB0aGUgQW5ndWxhciBDTEkuIEZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIGFuZCBhbHRlcm5hdGl2ZXMsIHBsZWFzZSBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvcHJvdHJhY3Rvci9pc3N1ZXMvNTUwMi4nLFxuICApO1xuXG4gIC8vIGVuc3VyZSB0aGF0IG9ubHkgb25lIG9mIHRoZXNlIG9wdGlvbnMgaXMgdXNlZFxuICBpZiAob3B0aW9ucy5kZXZTZXJ2ZXJUYXJnZXQgJiYgb3B0aW9ucy5iYXNlVXJsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKHRhZ3Muc3RyaXBJbmRlbnRzYFxuICAgIFRoZSAnYmFzZVVybCcgb3B0aW9uIGNhbm5vdCBiZSB1c2VkIHdpdGggJ2RldlNlcnZlclRhcmdldCcuXG4gICAgV2hlbiBwcmVzZW50LCAnZGV2U2VydmVyVGFyZ2V0JyB3aWxsIGJlIHVzZWQgdG8gYXV0b21hdGljYWxseSBzZXR1cCAnYmFzZVVybCcgZm9yIFByb3RyYWN0b3IuXG4gICAgYCk7XG4gIH1cblxuICBpZiAob3B0aW9ucy53ZWJkcml2ZXJVcGRhdGUpIHtcbiAgICBhd2FpdCB1cGRhdGVXZWJkcml2ZXIoKTtcbiAgfVxuXG4gIGxldCBiYXNlVXJsID0gb3B0aW9ucy5iYXNlVXJsO1xuICBsZXQgc2VydmVyO1xuXG4gIHRyeSB7XG4gICAgaWYgKG9wdGlvbnMuZGV2U2VydmVyVGFyZ2V0KSB7XG4gICAgICBjb25zdCB0YXJnZXQgPSB0YXJnZXRGcm9tVGFyZ2V0U3RyaW5nKG9wdGlvbnMuZGV2U2VydmVyVGFyZ2V0KTtcbiAgICAgIGNvbnN0IHNlcnZlck9wdGlvbnMgPSBhd2FpdCBjb250ZXh0LmdldFRhcmdldE9wdGlvbnModGFyZ2V0KTtcblxuICAgICAgY29uc3Qgb3ZlcnJpZGVzID0ge1xuICAgICAgICB3YXRjaDogZmFsc2UsXG4gICAgICAgIGxpdmVSZWxvYWQ6IGZhbHNlLFxuICAgICAgfSBhcyBEZXZTZXJ2ZXJCdWlsZGVyT3B0aW9ucyAmIGpzb24uSnNvbk9iamVjdDtcblxuICAgICAgaWYgKG9wdGlvbnMuaG9zdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG92ZXJyaWRlcy5ob3N0ID0gb3B0aW9ucy5ob3N0O1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc2VydmVyT3B0aW9ucy5ob3N0ID09PSAnc3RyaW5nJykge1xuICAgICAgICBvcHRpb25zLmhvc3QgPSBzZXJ2ZXJPcHRpb25zLmhvc3Q7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvcHRpb25zLmhvc3QgPSBvdmVycmlkZXMuaG9zdCA9ICdsb2NhbGhvc3QnO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5wb3J0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgb3ZlcnJpZGVzLnBvcnQgPSBvcHRpb25zLnBvcnQ7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZXJ2ZXJPcHRpb25zLnBvcnQgPT09ICdudW1iZXInKSB7XG4gICAgICAgIG9wdGlvbnMucG9ydCA9IHNlcnZlck9wdGlvbnMucG9ydDtcbiAgICAgIH1cblxuICAgICAgc2VydmVyID0gYXdhaXQgY29udGV4dC5zY2hlZHVsZVRhcmdldCh0YXJnZXQsIG92ZXJyaWRlcyk7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzZXJ2ZXIucmVzdWx0O1xuICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSB9O1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHNlcnZlck9wdGlvbnMucHVibGljSG9zdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgbGV0IHB1YmxpY0hvc3QgPSBzZXJ2ZXJPcHRpb25zLnB1YmxpY0hvc3Q7XG4gICAgICAgIGlmICghL15cXHcrOlxcL1xcLy8udGVzdChwdWJsaWNIb3N0KSkge1xuICAgICAgICAgIHB1YmxpY0hvc3QgPSBgJHtzZXJ2ZXJPcHRpb25zLnNzbCA/ICdodHRwcycgOiAnaHR0cCd9Oi8vJHtwdWJsaWNIb3N0fWA7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2xpZW50VXJsID0gdXJsLnBhcnNlKHB1YmxpY0hvc3QpO1xuICAgICAgICBiYXNlVXJsID0gdXJsLmZvcm1hdChjbGllbnRVcmwpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcmVzdWx0LmJhc2VVcmwgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGJhc2VVcmwgPSByZXN1bHQuYmFzZVVybDtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHJlc3VsdC5wb3J0ID09PSAnbnVtYmVyJykge1xuICAgICAgICBiYXNlVXJsID0gdXJsLmZvcm1hdCh7XG4gICAgICAgICAgcHJvdG9jb2w6IHNlcnZlck9wdGlvbnMuc3NsID8gJ2h0dHBzJyA6ICdodHRwJyxcbiAgICAgICAgICBob3N0bmFtZTogb3B0aW9ucy5ob3N0LFxuICAgICAgICAgIHBvcnQ6IHJlc3VsdC5wb3J0LnRvU3RyaW5nKCksXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIExpa2UgdGhlIGJhc2VVcmwgaW4gcHJvdHJhY3RvciBjb25maWcgZmlsZSB3aGVuIHVzaW5nIHRoZSBBUEkgd2UgbmVlZCB0byBhZGRcbiAgICAvLyBhIHRyYWlsaW5nIHNsYXNoIHdoZW4gcHJvdmlkZSB0byB0aGUgYmFzZVVybC5cbiAgICBpZiAoYmFzZVVybCAmJiAhYmFzZVVybC5lbmRzV2l0aCgnLycpKSB7XG4gICAgICBiYXNlVXJsICs9ICcvJztcbiAgICB9XG5cbiAgICByZXR1cm4gYXdhaXQgcnVuUHJvdHJhY3Rvcihjb250ZXh0LndvcmtzcGFjZVJvb3QsIHsgLi4ub3B0aW9ucywgYmFzZVVybCB9KTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UgfTtcbiAgfSBmaW5hbGx5IHtcbiAgICBhd2FpdCBzZXJ2ZXI/LnN0b3AoKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVCdWlsZGVyPFByb3RyYWN0b3JCdWlsZGVyT3B0aW9ucz4oZXhlY3V0ZSk7XG4iXX0=