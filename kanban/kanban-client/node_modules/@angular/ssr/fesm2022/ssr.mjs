import { ɵSERVER_CONTEXT as _SERVER_CONTEXT, renderApplication, renderModule } from '@angular/platform-server';
import * as fs from 'node:fs';
import { dirname, join, normalize, resolve } from 'node:path';
import { URL } from 'node:url';
import Critters from 'critters';
import { readFile } from 'node:fs/promises';

/**
 * Pattern used to extract the media query set by Critters in an `onload` handler.
 */
const MEDIA_SET_HANDLER_PATTERN = /^this\.media=["'](.*)["'];?$/;
/**
 * Name of the attribute used to save the Critters media query so it can be re-assigned on load.
 */
const CSP_MEDIA_ATTR = 'ngCspMedia';
/**
 * Script text used to change the media value of the link tags.
 *
 * NOTE:
 * We do not use `document.querySelectorAll('link').forEach((s) => s.addEventListener('load', ...)`
 * because this does not always fire on Chome.
 * See: https://github.com/angular/angular-cli/issues/26932 and https://crbug.com/1521256
 */
const LINK_LOAD_SCRIPT_CONTENT = [
    '(() => {',
    `  const CSP_MEDIA_ATTR = '${CSP_MEDIA_ATTR}';`,
    '  const documentElement = document.documentElement;',
    '  const listener = (e) => {',
    '    const target = e.target;',
    `    if (!target || target.tagName !== 'LINK' || !target.hasAttribute(CSP_MEDIA_ATTR)) {`,
    '     return;',
    '    }',
    '    target.media = target.getAttribute(CSP_MEDIA_ATTR);',
    '    target.removeAttribute(CSP_MEDIA_ATTR);',
    // Remove onload listener when there are no longer styles that need to be loaded.
    '    if (!document.head.querySelector(`link[${CSP_MEDIA_ATTR}]`)) {',
    `      documentElement.removeEventListener('load', listener);`,
    '    }',
    '  };',
    //  We use an event with capturing (the true parameter) because load events don't bubble.
    `  documentElement.addEventListener('load', listener, true);`,
    '})();',
].join('\n');
class CrittersExtended extends Critters {
    optionsExtended;
    resourceCache;
    warnings = [];
    errors = [];
    initialEmbedLinkedStylesheet;
    addedCspScriptsDocuments = new WeakSet();
    documentNonces = new WeakMap();
    constructor(optionsExtended, resourceCache) {
        super({
            logger: {
                warn: (s) => this.warnings.push(s),
                error: (s) => this.errors.push(s),
                info: () => { },
            },
            logLevel: 'warn',
            path: optionsExtended.outputPath,
            publicPath: optionsExtended.deployUrl,
            compress: !!optionsExtended.minify,
            pruneSource: false,
            reduceInlineStyles: false,
            mergeStylesheets: false,
            // Note: if `preload` changes to anything other than `media`, the logic in
            // `embedLinkedStylesheetOverride` will have to be updated.
            preload: 'media',
            noscriptFallback: true,
            inlineFonts: true,
        });
        this.optionsExtended = optionsExtended;
        this.resourceCache = resourceCache;
        // We can't use inheritance to override `embedLinkedStylesheet`, because it's not declared in
        // the `Critters` .d.ts which means that we can't call the `super` implementation. TS doesn't
        // allow for `super` to be cast to a different type.
        this.initialEmbedLinkedStylesheet = this.embedLinkedStylesheet;
        this.embedLinkedStylesheet = this.embedLinkedStylesheetOverride;
    }
    async readFile(path) {
        let resourceContent = this.resourceCache.get(path);
        if (resourceContent === undefined) {
            resourceContent = await readFile(path, 'utf-8');
            this.resourceCache.set(path, resourceContent);
        }
        return resourceContent;
    }
    /**
     * Override of the Critters `embedLinkedStylesheet` method
     * that makes it work with Angular's CSP APIs.
     */
    embedLinkedStylesheetOverride = async (link, document) => {
        if (link.getAttribute('media') === 'print' && link.next?.name === 'noscript') {
            // Workaround for https://github.com/GoogleChromeLabs/critters/issues/64
            // NB: this is only needed for the webpack based builders.
            const media = link.getAttribute('onload')?.match(MEDIA_SET_HANDLER_PATTERN);
            if (media) {
                link.removeAttribute('onload');
                link.setAttribute('media', media[1]);
                link?.next?.remove();
            }
        }
        const returnValue = await this.initialEmbedLinkedStylesheet(link, document);
        const cspNonce = this.findCspNonce(document);
        if (cspNonce) {
            const crittersMedia = link.getAttribute('onload')?.match(MEDIA_SET_HANDLER_PATTERN);
            if (crittersMedia) {
                // If there's a Critters-generated `onload` handler and the file has an Angular CSP nonce,
                // we have to remove the handler, because it's incompatible with CSP. We save the value
                // in a different attribute and we generate a script tag with the nonce that uses
                // `addEventListener` to apply the media query instead.
                link.removeAttribute('onload');
                link.setAttribute(CSP_MEDIA_ATTR, crittersMedia[1]);
                this.conditionallyInsertCspLoadingScript(document, cspNonce, link);
            }
            // Ideally we would hook in at the time Critters inserts the `style` tags, but there isn't
            // a way of doing that at the moment so we fall back to doing it any time a `link` tag is
            // inserted. We mitigate it by only iterating the direct children of the `<head>` which
            // should be pretty shallow.
            document.head.children.forEach((child) => {
                if (child.tagName === 'style' && !child.hasAttribute('nonce')) {
                    child.setAttribute('nonce', cspNonce);
                }
            });
        }
        return returnValue;
    };
    /**
     * Finds the CSP nonce for a specific document.
     */
    findCspNonce(document) {
        if (this.documentNonces.has(document)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this.documentNonces.get(document);
        }
        // HTML attribute are case-insensitive, but the parser used by Critters is case-sensitive.
        const nonceElement = document.querySelector('[ngCspNonce], [ngcspnonce]');
        const cspNonce = nonceElement?.getAttribute('ngCspNonce') || nonceElement?.getAttribute('ngcspnonce') || null;
        this.documentNonces.set(document, cspNonce);
        return cspNonce;
    }
    /**
     * Inserts the `script` tag that swaps the critical CSS at runtime,
     * if one hasn't been inserted into the document already.
     */
    conditionallyInsertCspLoadingScript(document, nonce, link) {
        if (this.addedCspScriptsDocuments.has(document)) {
            return;
        }
        if (document.head.textContent.includes(LINK_LOAD_SCRIPT_CONTENT)) {
            // Script was already added during the build.
            this.addedCspScriptsDocuments.add(document);
            return;
        }
        const script = document.createElement('script');
        script.setAttribute('nonce', nonce);
        script.textContent = LINK_LOAD_SCRIPT_CONTENT;
        // Prepend the script to the head since it needs to
        // run as early as possible, before the `link` tags.
        document.head.insertBefore(script, link);
        this.addedCspScriptsDocuments.add(document);
    }
}
class InlineCriticalCssProcessor {
    options;
    resourceCache = new Map();
    constructor(options) {
        this.options = options;
    }
    async process(html, options) {
        const critters = new CrittersExtended({ ...this.options, ...options }, this.resourceCache);
        const content = await critters.process(html);
        return {
            content,
            errors: critters.errors.length ? critters.errors : undefined,
            warnings: critters.warnings.length ? critters.warnings : undefined,
        };
    }
}

const PERFORMANCE_MARK_PREFIX = '🅰️';
function printPerformanceLogs() {
    let maxWordLength = 0;
    const benchmarks = [];
    for (const { name, duration } of performance.getEntriesByType('measure')) {
        if (!name.startsWith(PERFORMANCE_MARK_PREFIX)) {
            continue;
        }
        // `🅰️:Retrieve SSG Page` -> `Retrieve SSG Page:`
        const step = name.slice(PERFORMANCE_MARK_PREFIX.length + 1) + ':';
        if (step.length > maxWordLength) {
            maxWordLength = step.length;
        }
        benchmarks.push([step, `${duration.toFixed(1)}ms`]);
        performance.clearMeasures(name);
    }
    /* eslint-disable no-console */
    console.log('********** Performance results **********');
    for (const [step, value] of benchmarks) {
        const spaces = maxWordLength - step.length + 5;
        console.log(step + ' '.repeat(spaces) + value);
    }
    console.log('*****************************************');
    /* eslint-enable no-console */
}
async function runMethodAndMeasurePerf(label, asyncMethod) {
    const labelName = `${PERFORMANCE_MARK_PREFIX}:${label}`;
    const startLabel = `start:${labelName}`;
    const endLabel = `end:${labelName}`;
    try {
        performance.mark(startLabel);
        return await asyncMethod();
    }
    finally {
        performance.mark(endLabel);
        performance.measure(labelName, startLabel, endLabel);
        performance.clearMarks(startLabel);
        performance.clearMarks(endLabel);
    }
}
function noopRunMethodAndMeasurePerf(label, asyncMethod) {
    return asyncMethod();
}

const SSG_MARKER_REGEXP = /ng-server-context=["']\w*\|?ssg\|?\w*["']/;
/**
 * A common engine to use to server render an application.
 */
class CommonEngine {
    options;
    templateCache = new Map();
    inlineCriticalCssProcessor;
    pageIsSSG = new Map();
    constructor(options) {
        this.options = options;
        this.inlineCriticalCssProcessor = new InlineCriticalCssProcessor({
            minify: false,
        });
    }
    /**
     * Render an HTML document for a specific URL with specified
     * render options
     */
    async render(opts) {
        const enablePerformanceProfiler = this.options?.enablePerformanceProfiler;
        const runMethod = enablePerformanceProfiler
            ? runMethodAndMeasurePerf
            : noopRunMethodAndMeasurePerf;
        let html = await runMethod('Retrieve SSG Page', () => this.retrieveSSGPage(opts));
        if (html === undefined) {
            html = await runMethod('Render Page', () => this.renderApplication(opts));
            if (opts.inlineCriticalCss !== false) {
                const { content, errors, warnings } = await runMethod('Inline Critical CSS', () => 
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.inlineCriticalCss(html, opts));
                html = content;
                // eslint-disable-next-line no-console
                warnings?.forEach((m) => console.warn(m));
                // eslint-disable-next-line no-console
                errors?.forEach((m) => console.error(m));
            }
        }
        if (enablePerformanceProfiler) {
            printPerformanceLogs();
        }
        return html;
    }
    inlineCriticalCss(html, opts) {
        return this.inlineCriticalCssProcessor.process(html, {
            outputPath: opts.publicPath ?? (opts.documentFilePath ? dirname(opts.documentFilePath) : ''),
        });
    }
    async retrieveSSGPage(opts) {
        const { publicPath, documentFilePath, url } = opts;
        if (!publicPath || !documentFilePath || url === undefined) {
            return undefined;
        }
        const { pathname } = new URL(url, 'resolve://');
        // Do not use `resolve` here as otherwise it can lead to path traversal vulnerability.
        // See: https://portswigger.net/web-security/file-path-traversal
        const pagePath = join(publicPath, pathname, 'index.html');
        if (this.pageIsSSG.get(pagePath)) {
            // Serve pre-rendered page.
            return fs.promises.readFile(pagePath, 'utf-8');
        }
        if (!pagePath.startsWith(normalize(publicPath))) {
            // Potential path traversal detected.
            return undefined;
        }
        if (pagePath === resolve(documentFilePath) || !(await exists(pagePath))) {
            // View matches with prerender path or file does not exist.
            this.pageIsSSG.set(pagePath, false);
            return undefined;
        }
        // Static file exists.
        const content = await fs.promises.readFile(pagePath, 'utf-8');
        const isSSG = SSG_MARKER_REGEXP.test(content);
        this.pageIsSSG.set(pagePath, isSSG);
        return isSSG ? content : undefined;
    }
    async renderApplication(opts) {
        const moduleOrFactory = this.options?.bootstrap ?? opts.bootstrap;
        if (!moduleOrFactory) {
            throw new Error('A module or bootstrap option must be provided.');
        }
        const extraProviders = [
            { provide: _SERVER_CONTEXT, useValue: 'ssr' },
            ...(opts.providers ?? []),
            ...(this.options?.providers ?? []),
        ];
        let document = opts.document;
        if (!document && opts.documentFilePath) {
            document = await this.getDocument(opts.documentFilePath);
        }
        const commonRenderingOptions = {
            url: opts.url,
            document,
        };
        return isBootstrapFn(moduleOrFactory)
            ? renderApplication(moduleOrFactory, {
                platformProviders: extraProviders,
                ...commonRenderingOptions,
            })
            : renderModule(moduleOrFactory, { extraProviders, ...commonRenderingOptions });
    }
    /** Retrieve the document from the cache or the filesystem */
    async getDocument(filePath) {
        let doc = this.templateCache.get(filePath);
        if (!doc) {
            doc = await fs.promises.readFile(filePath, 'utf-8');
            this.templateCache.set(filePath, doc);
        }
        return doc;
    }
}
async function exists(path) {
    try {
        await fs.promises.access(path, fs.constants.F_OK);
        return true;
    }
    catch {
        return false;
    }
}
function isBootstrapFn(value) {
    // We can differentiate between a module and a bootstrap function by reading compiler-generated `ɵmod` static property:
    return typeof value === 'function' && !('ɵmod' in value);
}

export { CommonEngine };
//# sourceMappingURL=ssr.mjs.map
