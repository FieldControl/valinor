import {
  Loading_default
} from "/build/_shared/chunk-CEM3LMQN.js";
import {
  Await,
  useLoaderData,
  useNavigate
} from "/build/_shared/chunk-RQ7LBGZI.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-XU7DNSPJ.js";
import {
  require_react
} from "/build/_shared/chunk-BOXFZXVX.js";
import {
  require_node
} from "/build/_shared/chunk-G7CHZRZX.js";
import {
  createHotContext
} from "/build/_shared/chunk-TCV3N3JT.js";
import "/build/_shared/chunk-UWV35TSL.js";
import {
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// app/routes/films.$id.tsx
var import_node = __toESM(require_node());
var import_react2 = __toESM(require_react());
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime());
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/films.$id.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/films.$id.tsx"
  );
  import.meta.hot.lastModified = "1691806243109.742";
}
function findNumberInURL(url = "", paramName = "page") {
  const parsedUrl = new URL(url);
  const searchParams = parsedUrl.searchParams;
  const paramValue = searchParams.get(paramName);
  if (paramValue) {
    const numberMatch = paramValue.match(/\d+/);
    if (numberMatch) {
      return parseInt(numberMatch[0]);
    }
  }
  return null;
}
function FilmInfo() {
  _s();
  const {
    characters: charactersPromise
  } = useLoaderData();
  const history = useNavigate();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_react2.Suspense, { fallback: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Loading_default, {}, void 0, false, {
    fileName: "app/routes/films.$id.tsx",
    lineNumber: 57,
    columnNumber: 33
  }, this), children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", { className: "text-xl text-gray-300 m-2", children: "Personagens" }, void 0, false, {
      fileName: "app/routes/films.$id.tsx",
      lineNumber: 58,
      columnNumber: 17
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Await, { errorElement: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-xl text-gray-300", children: "Ooops alguma coisa de errado aconteceu enquanto buscavamos os dados, por favor tente novamente" }, void 0, false, {
      fileName: "app/routes/films.$id.tsx",
      lineNumber: 59,
      columnNumber: 38
    }, this), resolve: charactersPromise, children: (characters) => {
      return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ul", { className: "space-y-4 text-left text-gray-500 dark:text-gray-400", children: characters.results.map((character) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { className: "text-white flex items-center space-x-3", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("svg", { width: "24px", height: "24px", viewBox: "0 0 512 512", xmlns: "http://www.w3.org/2000/svg", fill: "#fffafa", stroke: "#fffafa", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("g", { id: "SVGRepo_bgCarrier", strokeWidth: "0" }, void 0, false, {
              fileName: "app/routes/films.$id.tsx",
              lineNumber: 64,
              columnNumber: 166
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("g", { id: "SVGRepo_tracerCarrier", strokeLinecap: "round", strokeLinejoin: "round" }, void 0, false, {
              fileName: "app/routes/films.$id.tsx",
              lineNumber: 64,
              columnNumber: 212
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("g", { id: "SVGRepo_iconCarrier", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("path", { fill: "#f2f2f2", d: "M256 32C135.1 32 36.06 127.9 32.12 248.7c136.18 13.8 311.58 13.8 447.78 0-.3-10.6-1.4-21.2-3.3-31.7H352v-18h32v-16h32v-16h45.6c-4.5-10.4-9.8-20.4-15.8-30H368v-18h48v-14h-18.7V89H368V73h-48V55h34.9c-30.8-15.14-64.6-23-98.9-23zm-64.3 64h.3c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64c0-35.2 28.5-63.83 63.7-64zM32.26 266.7C37.97 386.1 136.4 480 256 480c10.6-1.4 16 0 43.8-7v-18h59c8.1-4.2 16-8.9 23.5-14H368v-16h-32v-18h85.4c8.5-9.3 16.3-19.4 23.1-30H432v-16h-80v-18h16v-16h48v-16h32v-16h28.5c1.7-9.4 2.7-18.8 3.2-28.3-136.8 13.7-310.6 13.7-447.44 0z" }, void 0, false, {
              fileName: "app/routes/films.$id.tsx",
              lineNumber: 64,
              columnNumber: 319
            }, this) }, void 0, false, {
              fileName: "app/routes/films.$id.tsx",
              lineNumber: 64,
              columnNumber: 291
            }, this)
          ] }, void 0, true, {
            fileName: "app/routes/films.$id.tsx",
            lineNumber: 64,
            columnNumber: 45
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "m-1", children: character.name }, void 0, false, {
            fileName: "app/routes/films.$id.tsx",
            lineNumber: 65,
            columnNumber: 45
          }, this)
        ] }, character.name, true, {
          fileName: "app/routes/films.$id.tsx",
          lineNumber: 63,
          columnNumber: 74
        }, this)) }, void 0, false, {
          fileName: "app/routes/films.$id.tsx",
          lineNumber: 62,
          columnNumber: 33
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex space-x-2 m-2", children: [
          characters.previous && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { className: "text-white bg-gray-800 hover:bg-gray-400font-bold py-2 px-4 rounded inline-flex items-center", onClick: () => {
            const param = findNumberInURL(characters.previous);
            return history(`/films/${param}`);
          }, children: [
            " ",
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: [
              "<",
              " Anterior"
            ] }, void 0, true, {
              fileName: "app/routes/films.$id.tsx",
              lineNumber: 72,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "app/routes/films.$id.tsx",
            lineNumber: 69,
            columnNumber: 61
          }, this),
          characters.next && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { className: "text-white bg-gray-800 hover:bg-gray-400font-bold py-2 px-4 rounded inline-flex items-center", onClick: () => {
            const param = findNumberInURL(characters.next);
            return history(`/films/${param}`);
          }, children: [
            " ",
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: [
              "Proximo ",
              ">",
              " "
            ] }, void 0, true, {
              fileName: "app/routes/films.$id.tsx",
              lineNumber: 76,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "app/routes/films.$id.tsx",
            lineNumber: 73,
            columnNumber: 57
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/films.$id.tsx",
          lineNumber: 68,
          columnNumber: 33
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/films.$id.tsx",
        lineNumber: 61,
        columnNumber: 18
      }, this);
    } }, void 0, false, {
      fileName: "app/routes/films.$id.tsx",
      lineNumber: 59,
      columnNumber: 17
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/films.$id.tsx",
    lineNumber: 57,
    columnNumber: 13
  }, this) }, void 0, false, {
    fileName: "app/routes/films.$id.tsx",
    lineNumber: 56,
    columnNumber: 10
  }, this);
}
_s(FilmInfo, "AP47Lm0HjHXq7chNt3AHUrvqygU=", false, function() {
  return [useLoaderData, useNavigate];
});
_c = FilmInfo;
var _c;
$RefreshReg$(_c, "FilmInfo");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  FilmInfo as default
};
//# sourceMappingURL=/build/routes/films.$id-R3A5NLWJ.js.map
