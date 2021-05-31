"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const architect_1 = require("@angular-devkit/architect");
const core_1 = require("@angular-devkit/core");
const fs = require("fs");
const path = require("path");
const utils_1 = require("../utils");
const inline_critical_css_1 = require("../utils/index-file/inline-critical-css");
const service_worker_1 = require("../utils/service-worker");
const spinner_1 = require("../utils/spinner");
async function _renderUniversal(options, context, browserResult, serverResult, spinner) {
    // Get browser target options.
    const browserTarget = architect_1.targetFromTargetString(options.browserTarget);
    const rawBrowserOptions = (await context.getTargetOptions(browserTarget));
    const browserBuilderName = await context.getBuilderNameForTarget(browserTarget);
    const browserOptions = await context.validateOptions(rawBrowserOptions, browserBuilderName);
    // Initialize zone.js
    const root = context.workspaceRoot;
    const zonePackage = require.resolve('zone.js', { paths: [root] });
    await Promise.resolve().then(() => require(zonePackage));
    const projectName = context.target && context.target.project;
    if (!projectName) {
        throw new Error('The builder requires a target.');
    }
    const projectMetadata = await context.getProjectMetadata(projectName);
    const projectRoot = core_1.resolve(core_1.normalize(root), core_1.normalize(projectMetadata.root || ''));
    const { styles } = utils_1.normalizeOptimization(browserOptions.optimization);
    const inlineCriticalCssProcessor = styles.inlineCritical
        ? new inline_critical_css_1.InlineCriticalCssProcessor({
            minify: styles.minify,
            deployUrl: browserOptions.deployUrl,
        })
        : undefined;
    for (const outputPath of browserResult.outputPaths) {
        const localeDirectory = path.relative(browserResult.baseOutputPath, outputPath);
        const browserIndexOutputPath = path.join(outputPath, 'index.html');
        const indexHtml = await fs.promises.readFile(browserIndexOutputPath, 'utf8');
        const serverBundlePath = await _getServerModuleBundlePath(options, context, serverResult, localeDirectory);
        const { AppServerModule, renderModule } = await Promise.resolve().then(() => require(serverBundlePath));
        const renderModuleFn = renderModule;
        if (!(renderModuleFn && AppServerModule)) {
            throw new Error(`renderModule method and/or AppServerModule were not exported from: ${serverBundlePath}.`);
        }
        // Load platform server module renderer
        const renderOpts = {
            document: indexHtml,
            url: options.route,
        };
        let html = await renderModuleFn(AppServerModule, renderOpts);
        // Overwrite the client index file.
        const outputIndexPath = options.outputIndexPath
            ? path.join(root, options.outputIndexPath)
            : browserIndexOutputPath;
        if (inlineCriticalCssProcessor) {
            const { content, warnings, errors } = await inlineCriticalCssProcessor.process(html, {
                outputPath,
            });
            html = content;
            if (warnings.length || errors.length) {
                spinner.stop();
                warnings.forEach((m) => context.logger.warn(m));
                errors.forEach((m) => context.logger.error(m));
                spinner.start();
            }
        }
        await fs.promises.writeFile(outputIndexPath, html);
        if (browserOptions.serviceWorker) {
            await service_worker_1.augmentAppWithServiceWorker(core_1.normalize(root), projectRoot, core_1.normalize(outputPath), browserOptions.baseHref || '/', browserOptions.ngswConfigPath);
        }
    }
    return browserResult;
}
async function _getServerModuleBundlePath(options, context, serverResult, browserLocaleDirectory) {
    if (options.appModuleBundle) {
        return path.join(context.workspaceRoot, options.appModuleBundle);
    }
    const { baseOutputPath = '' } = serverResult;
    const outputPath = path.join(baseOutputPath, browserLocaleDirectory);
    if (!fs.existsSync(outputPath)) {
        throw new Error(`Could not find server output directory: ${outputPath}.`);
    }
    const re = /^main\.(?:[a-zA-Z0-9]{20}\.)?js$/;
    const maybeMain = fs.readdirSync(outputPath).find((x) => re.test(x));
    if (!maybeMain) {
        throw new Error('Could not find the main bundle.');
    }
    return path.join(outputPath, maybeMain);
}
async function _appShellBuilder(options, context) {
    const browserTarget = architect_1.targetFromTargetString(options.browserTarget);
    const serverTarget = architect_1.targetFromTargetString(options.serverTarget);
    // Never run the browser target in watch mode.
    // If service worker is needed, it will be added in _renderUniversal();
    const browserOptions = (await context.getTargetOptions(browserTarget));
    const optimization = utils_1.normalizeOptimization(browserOptions.optimization);
    optimization.styles.inlineCritical = false;
    const browserTargetRun = await context.scheduleTarget(browserTarget, {
        watch: false,
        serviceWorker: false,
        optimization: optimization,
    });
    const serverTargetRun = await context.scheduleTarget(serverTarget, {
        watch: false,
    });
    let spinner;
    try {
        const [browserResult, serverResult] = await Promise.all([
            browserTargetRun.result,
            serverTargetRun.result,
        ]);
        if (browserResult.success === false || browserResult.baseOutputPath === undefined) {
            return browserResult;
        }
        else if (serverResult.success === false) {
            return serverResult;
        }
        spinner = new spinner_1.Spinner();
        spinner.start('Generating application shell...');
        const result = await _renderUniversal(options, context, browserResult, serverResult, spinner);
        spinner.succeed('Application shell generation complete.');
        return result;
    }
    catch (err) {
        spinner === null || spinner === void 0 ? void 0 : spinner.fail('Application shell generation failed.');
        return { success: false, error: err.message };
    }
    finally {
        // Just be good citizens and stop those jobs.
        await Promise.all([browserTargetRun.stop(), serverTargetRun.stop()]);
    }
}
exports.default = architect_1.createBuilder(_appShellBuilder);
