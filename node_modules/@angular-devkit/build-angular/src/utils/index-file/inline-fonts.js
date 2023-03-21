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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineFontsProcessor = void 0;
const cacache = __importStar(require("cacache"));
const fs = __importStar(require("fs"));
const https = __importStar(require("https"));
const https_proxy_agent_1 = __importDefault(require("https-proxy-agent"));
const path_1 = require("path");
const url_1 = require("url");
const package_version_1 = require("../package-version");
const html_rewriting_stream_1 = require("./html-rewriting-stream");
const SUPPORTED_PROVIDERS = {
    'fonts.googleapis.com': {
        preconnectUrl: 'https://fonts.gstatic.com',
    },
    'use.typekit.net': {
        preconnectUrl: 'https://use.typekit.net',
    },
};
class InlineFontsProcessor {
    constructor(options) {
        this.options = options;
        const { path: cacheDirectory, enabled } = this.options.cache || {};
        if (cacheDirectory && enabled) {
            this.cachePath = (0, path_1.join)(cacheDirectory, 'angular-build-fonts');
        }
    }
    async process(content) {
        var _a;
        const hrefList = [];
        const existingPreconnect = new Set();
        // Collector link tags with href
        const { rewriter: collectorStream, transformedContent: initCollectorStream } = await (0, html_rewriting_stream_1.htmlRewritingStream)(content);
        collectorStream.on('startTag', (tag) => {
            const { tagName, attrs } = tag;
            if (tagName !== 'link') {
                return;
            }
            let hrefValue;
            let relValue;
            for (const { name, value } of attrs) {
                switch (name) {
                    case 'rel':
                        relValue = value;
                        break;
                    case 'href':
                        hrefValue = value;
                        break;
                }
                if (hrefValue && relValue) {
                    switch (relValue) {
                        case 'stylesheet':
                            // <link rel="stylesheet" href="https://example.com/main.css">
                            hrefList.push(hrefValue);
                            break;
                        case 'preconnect':
                            // <link rel="preconnect" href="https://example.com">
                            existingPreconnect.add(hrefValue.replace(/\/$/, ''));
                            break;
                    }
                    return;
                }
            }
        });
        initCollectorStream().catch(() => {
            // We don't really care about any errors here because it just initializes
            // the rewriting stream, as we are waiting for `finish` below.
        });
        await new Promise((resolve) => collectorStream.on('finish', resolve));
        // Download stylesheets
        const hrefsContent = new Map();
        const newPreconnectUrls = new Set();
        for (const hrefItem of hrefList) {
            const url = this.createNormalizedUrl(hrefItem);
            if (!url) {
                continue;
            }
            const content = await this.processHref(url);
            if (content === undefined) {
                continue;
            }
            hrefsContent.set(hrefItem, content);
            // Add preconnect
            const preconnectUrl = (_a = this.getFontProviderDetails(url)) === null || _a === void 0 ? void 0 : _a.preconnectUrl;
            if (preconnectUrl && !existingPreconnect.has(preconnectUrl)) {
                newPreconnectUrls.add(preconnectUrl);
            }
        }
        if (hrefsContent.size === 0) {
            return content;
        }
        // Replace link with style tag.
        const { rewriter, transformedContent } = await (0, html_rewriting_stream_1.htmlRewritingStream)(content);
        rewriter.on('startTag', (tag) => {
            const { tagName, attrs } = tag;
            switch (tagName) {
                case 'head':
                    rewriter.emitStartTag(tag);
                    for (const url of newPreconnectUrls) {
                        rewriter.emitRaw(`<link rel="preconnect" href="${url}" crossorigin>`);
                    }
                    break;
                case 'link':
                    const hrefAttr = attrs.some(({ name, value }) => name === 'rel' && value === 'stylesheet') &&
                        attrs.find(({ name, value }) => name === 'href' && hrefsContent.has(value));
                    if (hrefAttr) {
                        const href = hrefAttr.value;
                        const cssContent = hrefsContent.get(href);
                        rewriter.emitRaw(`<style type="text/css">${cssContent}</style>`);
                    }
                    else {
                        rewriter.emitStartTag(tag);
                    }
                    break;
                default:
                    rewriter.emitStartTag(tag);
                    break;
            }
        });
        return transformedContent();
    }
    async getResponse(url) {
        var _a;
        const key = `${package_version_1.VERSION}|${url}`;
        if (this.cachePath) {
            const entry = await cacache.get.info(this.cachePath, key);
            if (entry) {
                return fs.promises.readFile(entry.path, 'utf8');
            }
        }
        let agent;
        const httpsProxy = (_a = process.env.HTTPS_PROXY) !== null && _a !== void 0 ? _a : process.env.https_proxy;
        if (httpsProxy) {
            agent = (0, https_proxy_agent_1.default)(httpsProxy);
        }
        const data = await new Promise((resolve, reject) => {
            let rawResponse = '';
            https
                .get(url, {
                agent,
                rejectUnauthorized: false,
                headers: {
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
                },
            }, (res) => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Inlining of fonts failed. ${url} returned status code: ${res.statusCode}.`));
                    return;
                }
                res.on('data', (chunk) => (rawResponse += chunk)).on('end', () => resolve(rawResponse));
            })
                .on('error', (e) => reject(new Error(`Inlining of fonts failed. An error has occurred while retrieving ${url} over the internet.\n` +
                e.message)));
        });
        if (this.cachePath) {
            await cacache.put(this.cachePath, key, data);
        }
        return data;
    }
    async processHref(url) {
        const provider = this.getFontProviderDetails(url);
        if (!provider) {
            return undefined;
        }
        let cssContent = await this.getResponse(url);
        if (this.options.minify) {
            cssContent = cssContent
                // Comments.
                .replace(/\/\*([\s\S]*?)\*\//g, '')
                // New lines.
                .replace(/\n/g, '')
                // Safe spaces.
                .replace(/\s?[{:;]\s+/g, (s) => s.trim());
        }
        return cssContent;
    }
    getFontProviderDetails(url) {
        return SUPPORTED_PROVIDERS[url.hostname];
    }
    createNormalizedUrl(value) {
        // Need to convert '//' to 'https://' because the URL parser will fail with '//'.
        const normalizedHref = value.startsWith('//') ? `https:${value}` : value;
        if (!normalizedHref.startsWith('http')) {
            // Non valid URL.
            // Example: relative path styles.css.
            return undefined;
        }
        const url = new url_1.URL(normalizedHref);
        // Force HTTPS protocol
        url.protocol = 'https:';
        return url;
    }
}
exports.InlineFontsProcessor = InlineFontsProcessor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lLWZvbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfYW5ndWxhci9zcmMvdXRpbHMvaW5kZXgtZmlsZS9pbmxpbmUtZm9udHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFSCxpREFBbUM7QUFDbkMsdUNBQXlCO0FBQ3pCLDZDQUErQjtBQUMvQiwwRUFBMkM7QUFDM0MsK0JBQTRCO0FBQzVCLDZCQUEwQjtBQUUxQix3REFBNkM7QUFDN0MsbUVBQThEO0FBVzlELE1BQU0sbUJBQW1CLEdBQXdDO0lBQy9ELHNCQUFzQixFQUFFO1FBQ3RCLGFBQWEsRUFBRSwyQkFBMkI7S0FDM0M7SUFDRCxpQkFBaUIsRUFBRTtRQUNqQixhQUFhLEVBQUUseUJBQXlCO0tBQ3pDO0NBQ0YsQ0FBQztBQUVGLE1BQWEsb0JBQW9CO0lBRS9CLFlBQW9CLE9BQTJCO1FBQTNCLFlBQU8sR0FBUCxPQUFPLENBQW9CO1FBQzdDLE1BQU0sRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUNuRSxJQUFJLGNBQWMsSUFBSSxPQUFPLEVBQUU7WUFDN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFBLFdBQUksRUFBQyxjQUFjLEVBQUUscUJBQXFCLENBQUMsQ0FBQztTQUM5RDtJQUNILENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWU7O1FBQzNCLE1BQU0sUUFBUSxHQUFhLEVBQUUsQ0FBQztRQUM5QixNQUFNLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFFN0MsZ0NBQWdDO1FBQ2hDLE1BQU0sRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLGtCQUFrQixFQUFF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c0IsQ0FBQyxHQUFRO1FBQ3JDLE9BQU8sbUJBQW1CLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFTyxtQkFBbUIsQ0FBQyxLQUFhO1FBQ3ZDLGlGQUFpRjtRQUNqRixNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDekUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDdEMsaUJBQWlCO1lBQ2pCLHFDQUFxQztZQUNyQyxPQUFPLFNBQVMsQ0FBQztTQUNsQjtRQUVELE1BQU0sR0FBRyxHQUFHLElBQUksU0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3BDLHVCQUF1QjtRQUN2QixHQUFHLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUV4QixPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7Q0FDRjtBQW5PRCxvREFtT0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgY2FjYWNoZSBmcm9tICdjYWNhY2hlJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIGh0dHBzIGZyb20gJ2h0dHBzJztcbmltcG9ydCBwcm94eUFnZW50IGZyb20gJ2h0dHBzLXByb3h5LWFnZW50JztcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IFVSTCB9IGZyb20gJ3VybCc7XG5pbXBvcnQgeyBOb3JtYWxpemVkQ2FjaGVkT3B0aW9ucyB9IGZyb20gJy4uL25vcm1hbGl6ZS1jYWNoZSc7XG5pbXBvcnQgeyBWRVJTSU9OIH0gZnJvbSAnLi4vcGFja2FnZS12ZXJzaW9uJztcbmltcG9ydCB7IGh0bWxSZXdyaXRpbmdTdHJlYW0gfSBmcm9tICcuL2h0bWwtcmV3cml0aW5nLXN0cmVhbSc7XG5cbmludGVyZmFjZSBGb250UHJvdmlkZXJEZXRhaWxzIHtcbiAgcHJlY29ubmVjdFVybDogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElubGluZUZvbnRzT3B0aW9ucyB7XG4gIG1pbmlmeT86IGJvb2xlYW47XG4gIGNhY2hlPzogTm9ybWFsaXplZENhY2hlZE9wdGlvbnM7XG59XG5cbmNvbnN0IFNVUFBPUlRFRF9QUk9WSURFUlM6IFJlY29yZDxzdHJpbmcsIEZvbnRQcm92aWRlckRldGFpbHM+ID0ge1xuICAnZm9udHMuZ29vZ2xlYXBpcy5jb20nOiB7XG4gICAgcHJlY29ubmVjdFVybDogJ2h0dHBzOi8vZm9udHMuZ3N0YXRpYy5jb20nLFxuICB9LFxuICAndXNlLnR5cGVraXQubmV0Jzoge1xuICAgIHByZWNvbm5lY3RVcmw6ICdodHRwczovL3VzZS50eXBla2l0Lm5ldCcsXG4gIH0sXG59O1xuXG5leHBvcnQgY2xhc3MgSW5saW5lRm9udHNQcm9jZXNzb3Ige1xuICBwcml2YXRlIHJlYWRvbmx5IGNhY2hlUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG9wdGlvbnM6IElubGluZUZvbnRzT3B0aW9ucykge1xuICAgIGNvbnN0IHsgcGF0aDogY2FjaGVEaXJlY3RvcnksIGVuYWJsZWQgfSA9IHRoaXMub3B0aW9ucy5jYWNoZSB8fCB7fTtcbiAgICBpZiAoY2FjaGVEaXJlY3RvcnkgJiYgZW5hYmxlZCkge1xuICAgICAgdGhpcy5jYWNoZVBhdGggPSBqb2luKGNhY2hlRGlyZWN0b3J5LCAnYW5ndWxhci1idWlsZC1mb250cycpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHByb2Nlc3MoY29udGVudDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBocmVmTGlzdDogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBleGlzdGluZ1ByZWNvbm5lY3QgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICAgIC8vIENvbGxlY3RvciBsaW5rIHRhZ3Mgd2l0aCBocmVmXG4gICAgY29uc3QgeyByZXdyaXRlcjogY29sbGVjdG9yU3RyZWFtLCB0cmFuc2Zvcm1lZENvbnRlbnQ6IGluaXRDb2xsZWN0b3JTdHJlYW0gfSA9XG4gICAgICBhd2FpdCBodG1sUmV3cml0aW5nU3RyZWFtKGNvbnRlbnQpO1xuXG4gICAgY29sbGVjdG9yU3RyZWFtLm9uKCdzdGFydFRhZycsICh0YWcpID0+IHtcbiAgICAgIGNvbnN0IHsgdGFnTmFtZSwgYXR0cnMgfSA9IHRhZztcblxuICAgICAgaWYgKHRhZ05hbWUgIT09ICdsaW5rJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxldCBocmVmVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAgIGxldCByZWxWYWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgICAgZm9yIChjb25zdCB7IG5hbWUsIHZhbHVlIH0gb2YgYXR0cnMpIHtcbiAgICAgICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgICAgY2FzZSAncmVsJzpcbiAgICAgICAgICAgIHJlbFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgJ2hyZWYnOlxuICAgICAgICAgICAgaHJlZlZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChocmVmVmFsdWUgJiYgcmVsVmFsdWUpIHtcbiAgICAgICAgICBzd2l0Y2ggKHJlbFZhbHVlKSB7XG4gICAgICAgICAgICBjYXNlICdzdHlsZXNoZWV0JzpcbiAgICAgICAgICAgICAgLy8gPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCJodHRwczovL2V4YW1wbGUuY29tL21haW4uY3NzXCI+XG4gICAgICAgICAgICAgIGhyZWZMaXN0LnB1c2goaHJlZlZhbHVlKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ3ByZWNvbm5lY3QnOlxuICAgICAgICAgICAgICAvLyA8bGluayByZWw9XCJwcmVjb25uZWN0XCIgaHJlZj1cImh0dHBzOi8vZXhhbXBsZS5jb21cIj5cbiAgICAgICAgICAgICAgZXhpc3RpbmdQcmVjb25uZWN0LmFkZChocmVmVmFsdWUucmVwbGFjZSgvXFwvJC8sICcnKSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaW5pdENvbGxlY3RvclN0cmVhbSgpLmNhdGNoKCgpID0+IHtcbiAgICAgIC8vIFdlIGRvbid0IHJlYWxseSBjYXJlIGFib3V0IGFueSBlcnJvcnMgaGVyZSBiZWNhdXNlIGl0IGp1c3QgaW5pdGlhbGl6ZXNcbiAgICAgIC8vIHRoZSByZXdyaXRpbmcgc3RyZWFtLCBhcyB3ZSBhcmUgd2FpdGluZyBmb3IgYGZpbmlzaGAgYmVsb3cuXG4gICAgfSk7XG5cbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gY29sbGVjdG9yU3RyZWFtLm9uKCdmaW5pc2gnLCByZXNvbHZlKSk7XG5cbiAgICAvLyBEb3dubG9hZCBzdHlsZXNoZWV0c1xuICAgIGNvbnN0IGhyZWZzQ29udGVudCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgY29uc3QgbmV3UHJlY29ubmVjdFVybHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICAgIGZvciAoY29uc3QgaHJlZkl0ZW0gb2YgaHJlZkxpc3QpIHtcbiAgICAgIGNvbnN0IHVybCA9IHRoaXMuY3JlYXRlTm9ybWFsaXplZFVybChocmVmSXRlbSk7XG4gICAgICBpZiAoIXVybCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMucHJvY2Vzc0hyZWYodXJsKTtcbiAgICAgIGlmIChjb250ZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGhyZWZzQ29udGVudC5zZXQoaHJlZkl0ZW0sIGNvbnRlbnQpO1xuXG4gICAgICAvLyBBZGQgcHJlY29ubmVjdFxuICAgICAgY29uc3QgcHJlY29ubmVjdFVybCA9IHRoaXMuZ2V0Rm9udFByb3ZpZGVyRGV0YWlscyh1cmwpPy5wcmVjb25uZWN0VXJsO1xuICAgICAgaWYgKHByZWNvbm5lY3RVcmwgJiYgIWV4aXN0aW5nUHJlY29ubmVjdC5oYXMocHJlY29ubmVjdFVybCkpIHtcbiAgICAgICAgbmV3UHJlY29ubmVjdFVybHMuYWRkKHByZWNvbm5lY3RVcmwpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChocmVmc0NvbnRlbnQuc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfVxuXG4gICAgLy8gUmVwbGFjZSBsaW5rIHdpdGggc3R5bGUgdGFnLlxuICAgIGNvbnN0IHsgcmV3cml0ZXIsIHRyYW5zZm9ybWVkQ29udGVudCB9ID0gYXdhaXQgaHRtbFJld3JpdGluZ1N0cmVhbShjb250ZW50KTtcbiAgICByZXdyaXRlci5vbignc3RhcnRUYWcnLCAodGFnKSA9PiB7XG4gICAgICBjb25zdCB7IHRhZ05hbWUsIGF0dHJzIH0gPSB0YWc7XG5cbiAgICAgIHN3aXRjaCAodGFnTmFtZSkge1xuICAgICAgICBjYXNlICdoZWFkJzpcbiAgICAgICAgICByZXdyaXRlci5lbWl0U3RhcnRUYWcodGFnKTtcbiAgICAgICAgICBmb3IgKGNvbnN0IHVybCBvZiBuZXdQcmVjb25uZWN0VXJscykge1xuICAgICAgICAgICAgcmV3cml0ZXIuZW1pdFJhdyhgPGxpbmsgcmVsPVwicHJlY29ubmVjdFwiIGhyZWY9XCIke3VybH1cIiBjcm9zc29yaWdpbj5gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnbGluayc6XG4gICAgICAgICAgY29uc3QgaHJlZkF0dHIgPVxuICAgICAgICAgICAgYXR0cnMuc29tZSgoeyBuYW1lLCB2YWx1ZSB9KSA9PiBuYW1lID09PSAncmVsJyAmJiB2YWx1ZSA9PT0gJ3N0eWxlc2hlZXQnKSAmJlxuICAgICAgICAgICAgYXR0cnMuZmluZCgoeyBuYW1lLCB2YWx1ZSB9KSA9PiBuYW1lID09PSAnaHJlZicgJiYgaHJlZnNDb250ZW50Lmhhcyh2YWx1ZSkpO1xuICAgICAgICAgIGlmIChocmVmQXR0cikge1xuICAgICAgICAgICAgY29uc3QgaHJlZiA9IGhyZWZBdHRyLnZhbHVlO1xuICAgICAgICAgICAgY29uc3QgY3NzQ29udGVudCA9IGhyZWZzQ29udGVudC5nZXQoaHJlZik7XG4gICAgICAgICAgICByZXdyaXRlci5lbWl0UmF3KGA8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+JHtjc3NDb250ZW50fTwvc3R5bGU+YCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJld3JpdGVyLmVtaXRTdGFydFRhZyh0YWcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJld3JpdGVyLmVtaXRTdGFydFRhZyh0YWcpO1xuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdHJhbnNmb3JtZWRDb250ZW50KCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGdldFJlc3BvbnNlKHVybDogVVJMKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBrZXkgPSBgJHtWRVJTSU9OfXwke3VybH1gO1xuXG4gICAgaWYgKHRoaXMuY2FjaGVQYXRoKSB7XG4gICAgICBjb25zdCBlbnRyeSA9IGF3YWl0IGNhY2FjaGUuZ2V0LmluZm8odGhpcy5jYWNoZVBhdGgsIGtleSk7XG4gICAgICBpZiAoZW50cnkpIHtcbiAgICAgICAgcmV0dXJuIGZzLnByb21pc2VzLnJlYWRGaWxlKGVudHJ5LnBhdGgsICd1dGY4Jyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGFnZW50OiBwcm94eUFnZW50Lkh0dHBzUHJveHlBZ2VudCB8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBodHRwc1Byb3h5ID0gcHJvY2Vzcy5lbnYuSFRUUFNfUFJPWFkgPz8gcHJvY2Vzcy5lbnYuaHR0cHNfcHJveHk7XG5cbiAgICBpZiAoaHR0cHNQcm94eSkge1xuICAgICAgYWdlbnQgPSBwcm94eUFnZW50KGh0dHBzUHJveHkpO1xuICAgIH1cblxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCByYXdSZXNwb25zZSA9ICcnO1xuICAgICAgaHR0cHNcbiAgICAgICAgLmdldChcbiAgICAgICAgICB1cmwsXG4gICAgICAgICAge1xuICAgICAgICAgICAgYWdlbnQsXG4gICAgICAgICAgICByZWplY3RVbmF1dGhvcml6ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAndXNlci1hZ2VudCc6XG4gICAgICAgICAgICAgICAgJ01vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzE1XzYpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS84NS4wLjQxODMuMTIxIFNhZmFyaS81MzcuMzYnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIChyZXMpID0+IHtcbiAgICAgICAgICAgIGlmIChyZXMuc3RhdHVzQ29kZSAhPT0gMjAwKSB7XG4gICAgICAgICAgICAgIHJlamVjdChcbiAgICAgICAgICAgICAgICBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICBgSW5saW5pbmcgb2YgZm9udHMgZmFpbGVkLiAke3VybH0gcmV0dXJuZWQgc3RhdHVzIGNvZGU6ICR7cmVzLnN0YXR1c0NvZGV9LmAsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlcy5vbignZGF0YScsIChjaHVuaykgPT4gKHJhd1Jlc3BvbnNlICs9IGNodW5rKSkub24oJ2VuZCcsICgpID0+IHJlc29sdmUocmF3UmVzcG9uc2UpKTtcbiAgICAgICAgICB9LFxuICAgICAgICApXG4gICAgICAgIC5vbignZXJyb3InLCAoZSkgPT5cbiAgICAgICAgICByZWplY3QoXG4gICAgICAgICAgICBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIGBJbmxpbmluZyBvZiBmb250cyBmYWlsZWQuIEFuIGVycm9yIGhhcyBvY2N1cnJlZCB3aGlsZSByZXRyaWV2aW5nICR7dXJsfSBvdmVyIHRoZSBpbnRlcm5ldC5cXG5gICtcbiAgICAgICAgICAgICAgICBlLm1lc3NhZ2UsXG4gICAgICAgICAgICApLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5jYWNoZVBhdGgpIHtcbiAgICAgIGF3YWl0IGNhY2FjaGUucHV0KHRoaXMuY2FjaGVQYXRoLCBrZXksIGRhdGEpO1xuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBwcm9jZXNzSHJlZih1cmw6IFVSTCk6IFByb21pc2U8c3RyaW5nIHwgdW5kZWZpbmVkPiB7XG4gICAgY29uc3QgcHJvdmlkZXIgPSB0aGlzLmdldEZvbnRQcm92aWRlckRldGFpbHModXJsKTtcbiAgICBpZiAoIXByb3ZpZGVyKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGxldCBjc3NDb250ZW50ID0gYXdhaXQgdGhpcy5nZXRSZXNwb25zZSh1cmwpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5taW5pZnkpIHtcbiAgICAgIGNzc0NvbnRlbnQgPSBjc3NDb250ZW50XG4gICAgICAgIC8vIENvbW1lbnRzLlxuICAgICAgICAucmVwbGFjZSgvXFwvXFwqKFtcXHNcXFNdKj8pXFwqXFwvL2csICcnKVxuICAgICAgICAvLyBOZXcgbGluZXMuXG4gICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJycpXG4gICAgICAgIC8vIFNhZmUgc3BhY2VzLlxuICAgICAgICAucmVwbGFjZSgvXFxzP1t7OjtdXFxzKy9nLCAocykgPT4gcy50cmltKCkpO1xuICAgIH1cblxuICAgIHJldHVybiBjc3NDb250ZW50O1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRGb250UHJvdmlkZXJEZXRhaWxzKHVybDogVVJMKTogRm9udFByb3ZpZGVyRGV0YWlscyB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIFNVUFBPUlRFRF9QUk9WSURFUlNbdXJsLmhvc3RuYW1lXTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlTm9ybWFsaXplZFVybCh2YWx1ZTogc3RyaW5nKTogVVJMIHwgdW5kZWZpbmVkIHtcbiAgICAvLyBOZWVkIHRvIGNvbnZlcnQgJy8vJyB0byAnaHR0cHM6Ly8nIGJlY2F1c2UgdGhlIFVSTCBwYXJzZXIgd2lsbCBmYWlsIHdpdGggJy8vJy5cbiAgICBjb25zdCBub3JtYWxpemVkSHJlZiA9IHZhbHVlLnN0YXJ0c1dpdGgoJy8vJykgPyBgaHR0cHM6JHt2YWx1ZX1gIDogdmFsdWU7XG4gICAgaWYgKCFub3JtYWxpemVkSHJlZi5zdGFydHNXaXRoKCdodHRwJykpIHtcbiAgICAgIC8vIE5vbiB2YWxpZCBVUkwuXG4gICAgICAvLyBFeGFtcGxlOiByZWxhdGl2ZSBwYXRoIHN0eWxlcy5jc3MuXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwobm9ybWFsaXplZEhyZWYpO1xuICAgIC8vIEZvcmNlIEhUVFBTIHByb3RvY29sXG4gICAgdXJsLnByb3RvY29sID0gJ2h0dHBzOic7XG5cbiAgICByZXR1cm4gdXJsO1xuICB9XG59XG4iXX0=