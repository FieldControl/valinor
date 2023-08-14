var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf, __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
}, __copyProps = (to, from, except, desc) => {
  if (from && typeof from == "object" || typeof from == "function")
    for (let key of __getOwnPropNames(from))
      !__hasOwnProp.call(to, key) && key !== except && __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: !0 }) : target,
  mod
)), __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: !0 }), mod);

// css-bundle-update-plugin-ns:/media/vitorcontiz/50B2B5530C4BEE3D2/remix/star-wars-api/node_modules/@remix-run/css-bundle/dist/index.js
var require_dist = __commonJS({
  "css-bundle-update-plugin-ns:/media/vitorcontiz/50B2B5530C4BEE3D2/remix/star-wars-api/node_modules/@remix-run/css-bundle/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: !0 });
    var cssBundleHref2;
    exports.cssBundleHref = cssBundleHref2;
  }
});

// <stdin>
var stdin_exports = {};
__export(stdin_exports, {
  assets: () => assets_manifest_default,
  assetsBuildDirectory: () => assetsBuildDirectory,
  entry: () => entry,
  future: () => future,
  publicPath: () => publicPath,
  routes: () => routes
});
module.exports = __toCommonJS(stdin_exports);

// app/entry.server.tsx
var entry_server_exports = {};
__export(entry_server_exports, {
  default: () => handleRequest
});
var import_node_stream = require("node:stream"), import_node = require("@remix-run/node"), import_react = require("@remix-run/react"), import_isbot = __toESM(require("isbot")), import_server = require("react-dom/server"), import_jsx_dev_runtime = require("react/jsx-dev-runtime"), ABORT_DELAY = 2e4;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  return (0, import_isbot.default)(request.headers.get("user-agent")) ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = !1, { pipe, abort } = (0, import_server.renderToPipeableStream)(
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
        import_react.RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        },
        void 0,
        !1,
        {
          fileName: "app/entry.server.tsx",
          lineNumber: 48,
          columnNumber: 7
        },
        this
      ),
      {
        onAllReady() {
          shellRendered = !0;
          let body = new import_node_stream.PassThrough();
          responseHeaders.set("Content-Type", "text/html"), resolve(
            new import_node.Response(body, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          ), pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500, shellRendered && console.error(error);
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = !1, { pipe, abort } = (0, import_server.renderToPipeableStream)(
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
        import_react.RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        },
        void 0,
        !1,
        {
          fileName: "app/entry.server.tsx",
          lineNumber: 97,
          columnNumber: 7
        },
        this
      ),
      {
        onShellReady() {
          shellRendered = !0;
          let body = new import_node_stream.PassThrough();
          responseHeaders.set("Content-Type", "text/html"), resolve(
            new import_node.Response(body, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          ), pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500, shellRendered && console.error(error);
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}

// app/root.tsx
var root_exports = {};
__export(root_exports, {
  default: () => App,
  links: () => links
});
var import_css_bundle = __toESM(require_dist()), import_react2 = require("@remix-run/react");

// app/tailwind.css
var tailwind_default = "/build/_assets/tailwind-OI2V4U6D.css";

// app/animation.css
var animation_default = "/build/_assets/animation-3TUTWFEY.css";

// app/root.tsx
var import_jsx_dev_runtime2 = require("react/jsx-dev-runtime"), links = () => [
  ...import_css_bundle.cssBundleHref ? [{ rel: "stylesheet", href: import_css_bundle.cssBundleHref }] : [],
  { rel: "stylesheet", href: tailwind_default },
  { rel: "stylesheet", href: animation_default }
];
function App() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("html", { lang: "en", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("head", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("meta", { charSet: "utf-8" }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 23,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("meta", { name: "viewport", content: "width=device-width,initial-scale=1" }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 24,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react2.Meta, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 25,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react2.Links, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 26,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 22,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("body", { className: "bg-gradient-to-r from-gray-700 via-gray-900 to-black flex flex-col items-center justify-center", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react2.Outlet, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 29,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react2.ScrollRestoration, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 30,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react2.Scripts, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 31,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react2.LiveReload, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 32,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 28,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/root.tsx",
    lineNumber: 21,
    columnNumber: 5
  }, this);
}

// app/routes/films.$id.tsx
var films_id_exports = {};
__export(films_id_exports, {
  default: () => FilmInfo,
  loader: () => loader
});
var import_node2 = require("@remix-run/node"), import_react3 = require("@remix-run/react"), import_react4 = require("react");

// app/components/shared/Loading.tsx
var import_jsx_dev_runtime3 = require("react/jsx-dev-runtime"), Loading = () => /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(import_jsx_dev_runtime3.Fragment, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("span", { className: "loader_wrapper", children: [
  /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("svg", { viewBox: "-50 -50 700 700", className: "loader", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("g", { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("title", { children: "Layer 1" }, void 0, !1, {
      fileName: "app/components/shared/Loading.tsx",
      lineNumber: 8,
      columnNumber: 21
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("g", { id: "l1", children: /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("path", { fill: "#000", d: "m299.99999,0c-165.59998,0 -299.99998,134.40004 -299.99998,300.00004c0,165.6 134.39998,300.00004 299.99998,300c165.6,0 300.00002,-134.39996 300.00002,-300c0,-165.60002 -134.40002,-300.00004 -300.00002,-300.00004zm-14.15816,24.87248c0.1688,-0.00856 0.34134,0.00824 0.5102,0l1.27552,20.34438c-17.30332,0.82496 -34.14468,3.34834 -50.38266,7.46174l5.03828,19.8342c-42.62194,10.79592 -80.5854,33.2414 -110.33164,63.7755l-14.6046,-14.2857c-11.87822,12.18596 -22.49774,25.57174 -31.76018,39.92346l-17.09184,-11.28828c46.68098,-72.1773 126.19538,-121.13988 217.34692,-125.7653zm27.80612,0c91.36348,4.46928 171.08974,53.45432 217.85716,125.7653l-17.09184,11.28828c-9.24162,-14.31558 -19.85138,-27.69924 -31.69644,-39.8597l-14.60458,14.22194c-29.75088,-30.5504 -67.7586,-52.97584 -110.3954,-63.7755l5.03826,-19.8342c-16.23798,-4.1134 -33.07932,-6.63678 -50.38266,-7.46174l1.2755,-20.34438zm-13.64796,89.92346c8.67348,-0.01988 17.34698,0.5102 24.48982,1.53064l-11.16072,92.85714c23.45946,3.42092 44.02786,15.6988 58.22704,33.35458l74.48978,-55.86736c9.0481,11.2718 19.30572,28.95476 24.68114,42.34696l-85.58674,36.60712c4.3019,10.62846 6.69644,22.21 6.69644,34.37502c0,11.7196 -2.17876,22.9187 -6.18624,33.22704l84.8852,36.28828c-5.23758,13.47174 -15.3882,31.12314 -24.29846,42.47448l-73.9796,-55.35714c-14.1803,18.0591 -34.98424,30.66998 -58.73726,34.18366l10.96942,91.32654c-14.28572,2.19998 -34.69388,2.1684 -48.9796,0.12756l10.96938,-91.4541c-23.77016,-3.51622 -44.55626,-16.16742 -58.73724,-34.24744l-73.78826,55.35714c-9.04808,-11.2718 -19.3057,-28.95476 -24.68114,-42.34694l85.07654,-36.41582c-3.99384,-10.29306 -6.18622,-21.46466 -6.18622,-33.16326c0,-12.18602 2.38038,-23.79538 6.69642,-34.43878l-85.3954,-36.4796c5.2376,-13.47174 15.3882,-31.12314 24.29848,-42.4745l74.6811,55.93114c14.19918,-17.65578 34.76758,-29.93366 58.22706,-33.35458l-11.16072,-92.72962c7.14286,-1.09998 15.81632,-1.63826 24.48978,-1.65816zm-245.15304,59.4388l18.36734,9.05612c-7.74674,15.01834 -14.08054,30.87462 -18.75,47.44896l19.64286,5.54848c-5.71048,20.26526 -8.80102,41.62812 -8.80102,63.71174c0,22.10504 3.07982,43.49278 8.80102,63.7755l-19.64286,5.54848c4.66624,16.54766 11.01278,32.38996 18.75,47.3852l-18.36734,9.05612c-19.39818,-37.71134 -30.35714,-80.46448 -30.35714,-125.7653c0,-45.30084 10.95896,-88.05396 30.35714,-125.7653zm490.30612,0c19.39818,37.71134 30.3571,80.46446 30.3571,125.7653c0,45.30082 -10.95892,88.05396 -30.3571,125.7653l-18.36736,-9.05612c7.7405,-14.9997 14.08224,-30.83214 18.75002,-47.3852l-19.64286,-5.54848c5.72118,-20.28272 8.80102,-41.67046 8.80102,-63.7755c0,-22.08362 -3.09052,-43.44648 -8.80102,-63.71174l19.64286,-5.54848c-4.66816,-16.5697 -11.00646,-32.43422 -18.75002,-47.44896l18.36736,-9.05612zm-459.56632,263.8393c9.26598,14.35144 19.88144,27.73692 31.76018,39.92346l14.6046,-14.28572c29.74624,30.53408 67.7097,52.9796 110.33164,63.77552l-5.03828,19.83416c16.23798,4.11338 33.07934,6.6368 50.38266,7.46176l-1.27552,20.34438c-91.36344,-4.46932 -171.08972,-53.45436 -217.85712,-125.7653l17.09184,-11.28826zm428.8903,0l17.02806,11.28826c-46.76742,72.31094 -126.49368,121.29598 -217.85716,125.7653l-1.2755,-20.34438c17.30334,-0.82496 34.14468,-3.34838 50.38266,-7.46176l-5.03826,-19.83416c42.6368,-10.7997 80.64452,-33.22514 110.3954,-63.77552l14.60458,14.22194c11.85988,-12.17568 22.5073,-25.52476 31.76022,-39.85968z" }, void 0, !1, {
      fileName: "app/components/shared/Loading.tsx",
      lineNumber: 10,
      columnNumber: 25
    }, this) }, void 0, !1, {
      fileName: "app/components/shared/Loading.tsx",
      lineNumber: 9,
      columnNumber: 21
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/shared/Loading.tsx",
    lineNumber: 7,
    columnNumber: 17
  }, this) }, void 0, !1, {
    fileName: "app/components/shared/Loading.tsx",
    lineNumber: 6,
    columnNumber: 13
  }, this),
  /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("span", { className: "text", children: "Loading" }, void 0, !1, {
    fileName: "app/components/shared/Loading.tsx",
    lineNumber: 14,
    columnNumber: 13
  }, this)
] }, void 0, !0, {
  fileName: "app/components/shared/Loading.tsx",
  lineNumber: 5,
  columnNumber: 9
}, this) }, void 0, !1, {
  fileName: "app/components/shared/Loading.tsx",
  lineNumber: 4,
  columnNumber: 12
}, this), Loading_default = Loading;

// app/http-client.ts
var import_axios = __toESM(require("axios")), HttpClient = class {
  constructor(config = {}) {
    this.instance = import_axios.default.create();
    this.config = config;
  }
  handleError(error) {
    error.response ? console.error("Response error:", error.response.status) : error.request ? console.error("Request error:", error.request) : console.error("Error:", error.message);
  }
  async get(url) {
    try {
      return (await this.instance.get(url, this.config)).data;
    } catch (error) {
      throw this.handleError(error), error;
    }
  }
}, http_client_default = new HttpClient({ baseURL: "https://swapi.dev/api" });

// app/features/films.api.ts
async function getAllFilms() {
  let { results } = await http_client_default.get("/films");
  return results;
}
async function getPaginatedPeople(page = "1") {
  return await http_client_default.get(`/people?page=${page}`);
}

// app/routes/films.$id.tsx
var import_jsx_dev_runtime4 = require("react/jsx-dev-runtime");
async function loader({ params }) {
  let { id } = params, characters = getPaginatedPeople(id);
  return (0, import_node2.defer)({ characters });
}
function findNumberInURL(url = "", paramName = "page") {
  let paramValue = new URL(url).searchParams.get(paramName);
  if (paramValue) {
    let numberMatch = paramValue.match(/\d+/);
    if (numberMatch)
      return parseInt(numberMatch[0]);
  }
  return null;
}
function FilmInfo() {
  let { characters: charactersPromise } = (0, import_react3.useLoaderData)(), history = (0, import_react3.useNavigate)();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react4.Suspense, { fallback: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(Loading_default, {}, void 0, !1, {
    fileName: "app/routes/films.$id.tsx",
    lineNumber: 32,
    columnNumber: 33
  }, this), children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("h2", { className: "text-xl text-gray-300 m-2", children: "Personagens" }, void 0, !1, {
      fileName: "app/routes/films.$id.tsx",
      lineNumber: 33,
      columnNumber: 17
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react3.Await, { errorElement: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { className: "text-xl text-gray-300", children: "Ooops alguma coisa de errado aconteceu enquanto buscavamos os dados, por favor tente novamente" }, void 0, !1, {
      fileName: "app/routes/films.$id.tsx",
      lineNumber: 34,
      columnNumber: 38
    }, this), resolve: charactersPromise, children: (characters) => /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("ul", { className: "space-y-4 text-left text-gray-500 dark:text-gray-400", children: characters.results.map((character) => /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("li", { className: "text-white flex items-center space-x-3", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("svg", { width: "24px", height: "24px", viewBox: "0 0 512 512", xmlns: "http://www.w3.org/2000/svg", fill: "#fffafa", stroke: "#fffafa", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("g", { id: "SVGRepo_bgCarrier", strokeWidth: "0" }, void 0, !1, {
            fileName: "app/routes/films.$id.tsx",
            lineNumber: 41,
            columnNumber: 166
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("g", { id: "SVGRepo_tracerCarrier", strokeLinecap: "round", strokeLinejoin: "round" }, void 0, !1, {
            fileName: "app/routes/films.$id.tsx",
            lineNumber: 41,
            columnNumber: 212
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("g", { id: "SVGRepo_iconCarrier", children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("path", { fill: "#f2f2f2", d: "M256 32C135.1 32 36.06 127.9 32.12 248.7c136.18 13.8 311.58 13.8 447.78 0-.3-10.6-1.4-21.2-3.3-31.7H352v-18h32v-16h32v-16h45.6c-4.5-10.4-9.8-20.4-15.8-30H368v-18h48v-14h-18.7V89H368V73h-48V55h34.9c-30.8-15.14-64.6-23-98.9-23zm-64.3 64h.3c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64c0-35.2 28.5-63.83 63.7-64zM32.26 266.7C37.97 386.1 136.4 480 256 480c10.6-1.4 16 0 43.8-7v-18h59c8.1-4.2 16-8.9 23.5-14H368v-16h-32v-18h85.4c8.5-9.3 16.3-19.4 23.1-30H432v-16h-80v-18h16v-16h48v-16h32v-16h28.5c1.7-9.4 2.7-18.8 3.2-28.3-136.8 13.7-310.6 13.7-447.44 0z" }, void 0, !1, {
            fileName: "app/routes/films.$id.tsx",
            lineNumber: 41,
            columnNumber: 319
          }, this) }, void 0, !1, {
            fileName: "app/routes/films.$id.tsx",
            lineNumber: 41,
            columnNumber: 291
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/films.$id.tsx",
          lineNumber: 41,
          columnNumber: 45
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("span", { className: "m-1", children: character.name }, void 0, !1, {
          fileName: "app/routes/films.$id.tsx",
          lineNumber: 42,
          columnNumber: 45
        }, this)
      ] }, character.name, !0, {
        fileName: "app/routes/films.$id.tsx",
        lineNumber: 40,
        columnNumber: 41
      }, this)) }, void 0, !1, {
        fileName: "app/routes/films.$id.tsx",
        lineNumber: 38,
        columnNumber: 33
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "flex space-x-2 m-2", children: [
        characters.previous && /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("button", { className: "text-white bg-gray-800 hover:bg-gray-400font-bold py-2 px-4 rounded inline-flex items-center", onClick: () => {
          let param = findNumberInURL(characters.previous);
          return history(`/films/${param}`);
        }, children: [
          " ",
          /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("span", { children: [
            "<",
            " Anterior"
          ] }, void 0, !0, {
            fileName: "app/routes/films.$id.tsx",
            lineNumber: 50,
            columnNumber: 41
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/films.$id.tsx",
          lineNumber: 47,
          columnNumber: 61
        }, this),
        characters.next && /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("button", { className: "text-white bg-gray-800 hover:bg-gray-400font-bold py-2 px-4 rounded inline-flex items-center", onClick: () => {
          let param = findNumberInURL(characters.next);
          return history(`/films/${param}`);
        }, children: [
          " ",
          /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("span", { children: [
            "Proximo ",
            ">",
            " "
          ] }, void 0, !0, {
            fileName: "app/routes/films.$id.tsx",
            lineNumber: 54,
            columnNumber: 41
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/films.$id.tsx",
          lineNumber: 51,
          columnNumber: 57
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/films.$id.tsx",
        lineNumber: 46,
        columnNumber: 33
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/films.$id.tsx",
      lineNumber: 37,
      columnNumber: 29
    }, this) }, void 0, !1, {
      fileName: "app/routes/films.$id.tsx",
      lineNumber: 34,
      columnNumber: 17
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/films.$id.tsx",
    lineNumber: 32,
    columnNumber: 13
  }, this) }, void 0, !1, {
    fileName: "app/routes/films.$id.tsx",
    lineNumber: 31,
    columnNumber: 9
  }, this);
}

// app/routes/_index.tsx
var index_exports = {};
__export(index_exports, {
  loader: () => loader2,
  meta: () => meta
});
var import_node3 = require("@remix-run/node"), meta = () => [
  { title: "New Remix App" },
  { name: "description", content: "Welcome to Remix!" }
];
async function loader2({ request }) {
  return (0, import_node3.redirect)("/films/1");
}

// app/routes/films.tsx
var films_exports = {};
__export(films_exports, {
  ErrorBoundary: () => ErrorBoundary,
  default: () => films_default,
  loader: () => loader3
});

// app/assets/star-wars-logo.png
var star_wars_logo_default = "/build/_assets/star-wars-logo-L6TOR4D6.png";

// app/routes/films.tsx
var import_node4 = require("@remix-run/node");
var import_react5 = require("@remix-run/react");

// app/assets/1.png
var __default = "/build/_assets/1-4JIXWVNE.png";

// app/assets/2.png
var __default2 = "/build/_assets/2-ZRGZ4BZC.png";

// app/assets/3.png
var __default3 = "/build/_assets/3-3JLZZWWT.png";

// app/assets/4.png
var __default4 = "/build/_assets/4-OTCG2HZ7.png";

// app/assets/5.png
var __default5 = "/build/_assets/5-V2KEOL4P.png";

// app/assets/6.png
var __default6 = "/build/_assets/6-EBL6G4Y5.png";

// app/components/features/FilmPoster.tsx
var import_jsx_dev_runtime5 = require("react/jsx-dev-runtime"), Posters = [
  __default,
  __default2,
  __default3,
  __default4,
  __default5,
  __default6
], FilmPoster = ({ title, episode_id, release_date }) => /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "flex flex-wrap ", children: /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "w-full md:w-full border border-transparent hover:border-yellow-500 lg:w-1/2 max-w-4xl rounded overflow-hidden shadow-lg m-4 flex justify-between", children: [
  /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "md:flex-shrink-0", children: /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(
    "img",
    {
      className: "md:w-56",
      src: Posters[Posters.length - episode_id],
      alt: "A Quiet Place movie poster"
    },
    void 0,
    !1,
    {
      fileName: "app/components/features/FilmPoster.tsx",
      lineNumber: 27,
      columnNumber: 21
    },
    this
  ) }, void 0, !1, {
    fileName: "app/components/features/FilmPoster.tsx",
    lineNumber: 26,
    columnNumber: 17
  }, this),
  /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "flex flex-col flex-grow px-8 py-4 bg-color-333", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("h3", { className: "font-bold text-4xl md:text-2xl lg:text-2xl text-gray-200 movie--title", children: title }, void 0, !1, {
      fileName: "app/components/features/FilmPoster.tsx",
      lineNumber: 32,
      columnNumber: 21
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("span", { className: "movie--year text-yellow-400 font-bold text-xl lg:text-sm lg:mb-4", children: release_date.split("-")[0] }, void 0, !1, {
      fileName: "app/components/features/FilmPoster.tsx",
      lineNumber: 33,
      columnNumber: 21
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "flex-grow", children: /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("p", { className: "text-xl md:text-base lg:text-base text-gray-100 leading-snug truncate-overflow", children: "A family is forced to live in silence while hiding from creatures that hunt by sound." }, void 0, !1, {
      fileName: "app/components/features/FilmPoster.tsx",
      lineNumber: 35,
      columnNumber: 25
    }, this) }, void 0, !1, {
      fileName: "app/components/features/FilmPoster.tsx",
      lineNumber: 34,
      columnNumber: 21
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/features/FilmPoster.tsx",
    lineNumber: 31,
    columnNumber: 17
  }, this)
] }, void 0, !0, {
  fileName: "app/components/features/FilmPoster.tsx",
  lineNumber: 25,
  columnNumber: 13
}, this) }, void 0, !1, {
  fileName: "app/components/features/FilmPoster.tsx",
  lineNumber: 23,
  columnNumber: 9
}, this), FilmPoster_default = FilmPoster;

// app/routes/films.tsx
var import_react6 = require("react");
var import_jsx_dev_runtime6 = require("react/jsx-dev-runtime");
async function loader3() {
  let filmsPromise = getAllFilms();
  return (0, import_node4.defer)({ filmsPromise });
}
function films_default() {
  let { filmsPromise } = (0, import_react5.useLoaderData)();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(import_jsx_dev_runtime6.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "h-1/4 w-1/4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("img", { className: "fade", src: star_wars_logo_default, alt: "star-wars-logo" }, void 0, !1, {
      fileName: "app/routes/films.tsx",
      lineNumber: 19,
      columnNumber: 17
    }, this) }, void 0, !1, {
      fileName: "app/routes/films.tsx",
      lineNumber: 18,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "flex flex-wrap", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(import_react6.Suspense, { fallback: /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(Loading_default, {}, void 0, !1, {
        fileName: "app/routes/films.tsx",
        lineNumber: 23,
        columnNumber: 41
      }, this), children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("h2", { className: "text-xl text-gray-300 m-2", children: "Filmes" }, void 0, !1, {
          fileName: "app/routes/films.tsx",
          lineNumber: 24,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(import_react5.Await, { errorElement: /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("p", { className: "text-xl text-gray-300", children: "Ooops alguma coisa de errado aconteceu enquanto buscavamos os dados, por favor tente novamente" }, void 0, !1, {
          fileName: "app/routes/films.tsx",
          lineNumber: 25,
          columnNumber: 46
        }, this), resolve: filmsPromise, children: (films) => /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("ul", { children: films.map((film) => /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("li", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(FilmPoster_default, { title: film.title, release_date: film.release_date, episode_id: film.episode_id }, void 0, !1, {
          fileName: "app/routes/films.tsx",
          lineNumber: 32,
          columnNumber: 53
        }, this) }, film.episode_id, !1, {
          fileName: "app/routes/films.tsx",
          lineNumber: 31,
          columnNumber: 49
        }, this)) }, void 0, !1, {
          fileName: "app/routes/films.tsx",
          lineNumber: 29,
          columnNumber: 41
        }, this) }, void 0, !1, {
          fileName: "app/routes/films.tsx",
          lineNumber: 28,
          columnNumber: 37
        }, this) }, void 0, !1, {
          fileName: "app/routes/films.tsx",
          lineNumber: 25,
          columnNumber: 25
        }, this)
      ] }, void 0, !0, {
        fileName: "app/routes/films.tsx",
        lineNumber: 23,
        columnNumber: 21
      }, this) }, void 0, !1, {
        fileName: "app/routes/films.tsx",
        lineNumber: 22,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(import_react5.Outlet, {}, void 0, !1, {
        fileName: "app/routes/films.tsx",
        lineNumber: 42,
        columnNumber: 17
      }, this)
    ] }, void 0, !0, {
      fileName: "app/routes/films.tsx",
      lineNumber: 21,
      columnNumber: 13
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/films.tsx",
    lineNumber: 17,
    columnNumber: 9
  }, this);
}
function ErrorBoundary({ error }) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("h1", { children: "Error" }, void 0, !1, {
      fileName: "app/routes/films.tsx",
      lineNumber: 51,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("p", { children: error.message }, void 0, !1, {
      fileName: "app/routes/films.tsx",
      lineNumber: 52,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("p", { children: "The stack trace is:" }, void 0, !1, {
      fileName: "app/routes/films.tsx",
      lineNumber: 53,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("pre", { children: error.stack }, void 0, !1, {
      fileName: "app/routes/films.tsx",
      lineNumber: 54,
      columnNumber: 13
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/films.tsx",
    lineNumber: 50,
    columnNumber: 9
  }, this);
}

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { entry: { module: "/build/entry.client-32W3Z6UZ.js", imports: ["/build/_shared/chunk-ZWGWGGVF.js", "/build/_shared/chunk-GIAAE3CH.js", "/build/_shared/chunk-RQ7LBGZI.js", "/build/_shared/chunk-XU7DNSPJ.js", "/build/_shared/chunk-BOXFZXVX.js", "/build/_shared/chunk-TCV3N3JT.js", "/build/_shared/chunk-UWV35TSL.js", "/build/_shared/chunk-PNG5AS42.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-6LNOE7TK.js", imports: void 0, hasAction: !1, hasLoader: !1, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/_index": { id: "routes/_index", parentId: "root", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/_index-RADMZH2H.js", imports: ["/build/_shared/chunk-G7CHZRZX.js"], hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/films": { id: "routes/films", parentId: "root", path: "films", index: void 0, caseSensitive: void 0, module: "/build/routes/films-AESNAWAA.js", imports: ["/build/_shared/chunk-CEM3LMQN.js", "/build/_shared/chunk-G7CHZRZX.js"], hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !0 }, "routes/films.$id": { id: "routes/films.$id", parentId: "routes/films", path: ":id", index: void 0, caseSensitive: void 0, module: "/build/routes/films.$id-R3A5NLWJ.js", imports: void 0, hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 } }, version: "047028de", hmr: { runtime: "/build/_shared/chunk-TCV3N3JT.js", timestamp: 1691806243859 }, url: "/build/manifest-047028DE.js" };

// server-entry-module:@remix-run/dev/server-build
var assetsBuildDirectory = "public/build", future = { v2_dev: !0, unstable_postcss: !1, unstable_tailwind: !1, v2_errorBoundary: !0, v2_headers: !0, v2_meta: !0, v2_normalizeFormMethod: !0, v2_routeConvention: !0 }, publicPath = "/build/", entry = { module: entry_server_exports }, routes = {
  root: {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: root_exports
  },
  "routes/films.$id": {
    id: "routes/films.$id",
    parentId: "routes/films",
    path: ":id",
    index: void 0,
    caseSensitive: void 0,
    module: films_id_exports
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: !0,
    caseSensitive: void 0,
    module: index_exports
  },
  "routes/films": {
    id: "routes/films",
    parentId: "root",
    path: "films",
    index: void 0,
    caseSensitive: void 0,
    module: films_exports
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  assets,
  assetsBuildDirectory,
  entry,
  future,
  publicPath,
  routes
});
/*! Bundled license information:

@remix-run/css-bundle/dist/index.js:
  (**
   * @remix-run/css-bundle v1.19.3
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)
*/
//# sourceMappingURL=index.js.map
