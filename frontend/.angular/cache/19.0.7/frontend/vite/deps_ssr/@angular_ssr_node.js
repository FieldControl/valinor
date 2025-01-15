import { createRequire } from 'module';const require = createRequire(import.meta.url);
import {
  AngularAppEngine,
  InlineCriticalCssProcessor
} from "./chunk-63XCLGWX.js";
import {
  SERVER_CONTEXT,
  renderApplication,
  renderModule
} from "./chunk-7S67FSBT.js";
import "./chunk-PD2WLXKN.js";
import "./chunk-RH7RRVL4.js";
import "./chunk-SBSJKP5C.js";
import "./chunk-WEC3A5L3.js";
import "./chunk-6JA6SQ4L.js";
import {
  __async,
  __spreadValues
} from "./chunk-YHCV7DAQ.js";

// node_modules/@angular/ssr/fesm2022/node.mjs
import * as fs from "fs";
import { dirname, join, normalize, resolve } from "path";
import { URL as URL$1, fileURLToPath } from "url";
import { readFile } from "fs/promises";
import { argv } from "process";
var CommonEngineInlineCriticalCssProcessor = class {
  resourceCache = /* @__PURE__ */ new Map();
  process(html, outputPath) {
    return __async(this, null, function* () {
      const beasties = new InlineCriticalCssProcessor((path) => __async(this, null, function* () {
        let resourceContent = this.resourceCache.get(path);
        if (resourceContent === void 0) {
          resourceContent = yield readFile(path, "utf-8");
          this.resourceCache.set(path, resourceContent);
        }
        return resourceContent;
      }), outputPath);
      return beasties.process(html);
    });
  }
};
var PERFORMANCE_MARK_PREFIX = "🅰️";
function printPerformanceLogs() {
  let maxWordLength = 0;
  const benchmarks = [];
  for (const {
    name,
    duration
  } of performance.getEntriesByType("measure")) {
    if (!name.startsWith(PERFORMANCE_MARK_PREFIX)) {
      continue;
    }
    const step = name.slice(PERFORMANCE_MARK_PREFIX.length + 1) + ":";
    if (step.length > maxWordLength) {
      maxWordLength = step.length;
    }
    benchmarks.push([step, `${duration.toFixed(1)}ms`]);
    performance.clearMeasures(name);
  }
  console.log("********** Performance results **********");
  for (const [step, value] of benchmarks) {
    const spaces = maxWordLength - step.length + 5;
    console.log(step + " ".repeat(spaces) + value);
  }
  console.log("*****************************************");
}
function runMethodAndMeasurePerf(label, asyncMethod) {
  return __async(this, null, function* () {
    const labelName = `${PERFORMANCE_MARK_PREFIX}:${label}`;
    const startLabel = `start:${labelName}`;
    const endLabel = `end:${labelName}`;
    try {
      performance.mark(startLabel);
      return yield asyncMethod();
    } finally {
      performance.mark(endLabel);
      performance.measure(labelName, startLabel, endLabel);
      performance.clearMarks(startLabel);
      performance.clearMarks(endLabel);
    }
  });
}
function noopRunMethodAndMeasurePerf(label, asyncMethod) {
  return asyncMethod();
}
var SSG_MARKER_REGEXP = /ng-server-context=["']\w*\|?ssg\|?\w*["']/;
var CommonEngine = class {
  options;
  templateCache = /* @__PURE__ */ new Map();
  inlineCriticalCssProcessor = new CommonEngineInlineCriticalCssProcessor();
  pageIsSSG = /* @__PURE__ */ new Map();
  constructor(options) {
    this.options = options;
  }
  /**
   * Render an HTML document for a specific URL with specified
   * render options
   */
  render(opts) {
    return __async(this, null, function* () {
      const enablePerformanceProfiler = this.options?.enablePerformanceProfiler;
      const runMethod = enablePerformanceProfiler ? runMethodAndMeasurePerf : noopRunMethodAndMeasurePerf;
      let html = yield runMethod("Retrieve SSG Page", () => this.retrieveSSGPage(opts));
      if (html === void 0) {
        html = yield runMethod("Render Page", () => this.renderApplication(opts));
        if (opts.inlineCriticalCss !== false) {
          const content = yield runMethod("Inline Critical CSS", () => (
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.inlineCriticalCss(html, opts)
          ));
          html = content;
        }
      }
      if (enablePerformanceProfiler) {
        printPerformanceLogs();
      }
      return html;
    });
  }
  inlineCriticalCss(html, opts) {
    const outputPath = opts.publicPath ?? (opts.documentFilePath ? dirname(opts.documentFilePath) : "");
    return this.inlineCriticalCssProcessor.process(html, outputPath);
  }
  retrieveSSGPage(opts) {
    return __async(this, null, function* () {
      const {
        publicPath,
        documentFilePath,
        url
      } = opts;
      if (!publicPath || !documentFilePath || url === void 0) {
        return void 0;
      }
      const {
        pathname
      } = new URL$1(url, "resolve://");
      const pagePath = join(publicPath, pathname, "index.html");
      if (this.pageIsSSG.get(pagePath)) {
        return fs.promises.readFile(pagePath, "utf-8");
      }
      if (!pagePath.startsWith(normalize(publicPath))) {
        return void 0;
      }
      if (pagePath === resolve(documentFilePath) || !(yield exists(pagePath))) {
        this.pageIsSSG.set(pagePath, false);
        return void 0;
      }
      const content = yield fs.promises.readFile(pagePath, "utf-8");
      const isSSG = SSG_MARKER_REGEXP.test(content);
      this.pageIsSSG.set(pagePath, isSSG);
      return isSSG ? content : void 0;
    });
  }
  renderApplication(opts) {
    return __async(this, null, function* () {
      const moduleOrFactory = this.options?.bootstrap ?? opts.bootstrap;
      if (!moduleOrFactory) {
        throw new Error("A module or bootstrap option must be provided.");
      }
      const extraProviders = [{
        provide: SERVER_CONTEXT,
        useValue: "ssr"
      }, ...opts.providers ?? [], ...this.options?.providers ?? []];
      let document = opts.document;
      if (!document && opts.documentFilePath) {
        document = yield this.getDocument(opts.documentFilePath);
      }
      const commonRenderingOptions = {
        url: opts.url,
        document
      };
      return isBootstrapFn(moduleOrFactory) ? renderApplication(moduleOrFactory, __spreadValues({
        platformProviders: extraProviders
      }, commonRenderingOptions)) : renderModule(moduleOrFactory, __spreadValues({
        extraProviders
      }, commonRenderingOptions));
    });
  }
  /** Retrieve the document from the cache or the filesystem */
  getDocument(filePath) {
    return __async(this, null, function* () {
      let doc = this.templateCache.get(filePath);
      if (!doc) {
        doc = yield fs.promises.readFile(filePath, "utf-8");
        this.templateCache.set(filePath, doc);
      }
      return doc;
    });
  }
};
function exists(path) {
  return __async(this, null, function* () {
    try {
      yield fs.promises.access(path, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  });
}
function isBootstrapFn(value) {
  return typeof value === "function" && !("ɵmod" in value);
}
var HTTP2_PSEUDO_HEADERS = /* @__PURE__ */ new Set([":method", ":scheme", ":authority", ":path", ":status"]);
function createWebRequestFromNodeRequest(nodeRequest) {
  const {
    headers,
    method = "GET"
  } = nodeRequest;
  const withBody = method !== "GET" && method !== "HEAD";
  return new Request(createRequestUrl(nodeRequest), {
    method,
    headers: createRequestHeaders(headers),
    body: withBody ? nodeRequest : void 0,
    duplex: withBody ? "half" : void 0
  });
}
function createRequestHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (HTTP2_PSEUDO_HEADERS.has(name)) {
      continue;
    }
    if (typeof value === "string") {
      headers.append(name, value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    }
  }
  return headers;
}
function createRequestUrl(nodeRequest) {
  const {
    headers,
    socket,
    url = "",
    originalUrl
  } = nodeRequest;
  const protocol = getFirstHeaderValue(headers["x-forwarded-proto"]) ?? ("encrypted" in socket && socket.encrypted ? "https" : "http");
  const hostname = getFirstHeaderValue(headers["x-forwarded-host"]) ?? headers.host ?? headers[":authority"];
  if (Array.isArray(hostname)) {
    throw new Error("host value cannot be an array.");
  }
  let hostnameWithPort = hostname;
  if (!hostname?.includes(":")) {
    const port = getFirstHeaderValue(headers["x-forwarded-port"]);
    if (port) {
      hostnameWithPort += `:${port}`;
    }
  }
  return new URL(originalUrl ?? url, `${protocol}://${hostnameWithPort}`);
}
function getFirstHeaderValue(value) {
  return value?.toString().split(",", 1)[0]?.trim();
}
var AngularNodeAppEngine = class {
  angularAppEngine = new AngularAppEngine();
  /**
   * Handles an incoming HTTP request by serving prerendered content, performing server-side rendering,
   * or delivering a static file for client-side rendered routes based on the `RenderMode` setting.
   *
   * This method adapts Node.js's `IncomingMessage` or `Http2ServerRequest`
   * to a format compatible with the `AngularAppEngine` and delegates the handling logic to it.
   *
   * @param request - The incoming HTTP request (`IncomingMessage` or `Http2ServerRequest`).
   * @param requestContext - Optional context for rendering, such as metadata associated with the request.
   * @returns A promise that resolves to the resulting HTTP response object, or `null` if no matching Angular route is found.
   *
   * @remarks A request to `https://www.example.com/page/index.html` will serve or render the Angular route
   * corresponding to `https://www.example.com/page`.
   */
  handle(request, requestContext) {
    return __async(this, null, function* () {
      const webRequest = createWebRequestFromNodeRequest(request);
      return this.angularAppEngine.handle(webRequest, requestContext);
    });
  }
};
function createNodeRequestHandler(handler) {
  handler["__ng_node_request_handler__"] = true;
  return handler;
}
function writeResponseToNodeResponse(source, destination) {
  return __async(this, null, function* () {
    const {
      status,
      headers,
      body
    } = source;
    destination.statusCode = status;
    let cookieHeaderSet = false;
    for (const [name, value] of headers.entries()) {
      if (name === "set-cookie") {
        if (cookieHeaderSet) {
          continue;
        }
        destination.setHeader(name, headers.getSetCookie());
        cookieHeaderSet = true;
      } else {
        destination.setHeader(name, value);
      }
    }
    if (!body) {
      destination.end();
      return;
    }
    try {
      const reader = body.getReader();
      destination.on("close", () => {
        reader.cancel().catch((error) => {
          console.error(`An error occurred while writing the response body for: ${destination.req.url}.`, error);
        });
      });
      while (true) {
        const {
          done,
          value
        } = yield reader.read();
        if (done) {
          destination.end();
          break;
        }
        destination.write(value);
      }
    } catch {
      destination.end("Internal server error.");
    }
  });
}
function isMainModule(url) {
  return url.startsWith("file:") && argv[1] === fileURLToPath(url);
}
export {
  AngularNodeAppEngine,
  CommonEngine,
  createNodeRequestHandler,
  createWebRequestFromNodeRequest,
  isMainModule,
  writeResponseToNodeResponse
};
//# sourceMappingURL=@angular_ssr_node.js.map
