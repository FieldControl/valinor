import {
  Loading_default
} from "/build/_shared/chunk-CEM3LMQN.js";
import {
  Await,
  Outlet,
  useLoaderData
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

// app/assets/star-wars-logo.png
var star_wars_logo_default = "/build/_assets/star-wars-logo-L6TOR4D6.png";

// app/routes/films.tsx
var import_node = __toESM(require_node());

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
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime());
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/features/FilmPoster.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/features/FilmPoster.tsx"
  );
  import.meta.hot.lastModified = "1691764585915.374";
}
var Posters = [__default, __default2, __default3, __default4, __default5, __default6];
var FilmPoster = ({
  title,
  episode_id,
  release_date
}) => {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex flex-wrap ", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "w-full md:w-full border border-transparent hover:border-yellow-500 lg:w-1/2 max-w-4xl rounded overflow-hidden shadow-lg m-4 flex justify-between", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "md:flex-shrink-0", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("img", { className: "md:w-56", src: Posters[Posters.length - episode_id], alt: "A Quiet Place movie poster" }, void 0, false, {
      fileName: "app/components/features/FilmPoster.tsx",
      lineNumber: 37,
      columnNumber: 21
    }, this) }, void 0, false, {
      fileName: "app/components/features/FilmPoster.tsx",
      lineNumber: 36,
      columnNumber: 17
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex flex-col flex-grow px-8 py-4 bg-color-333", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", { className: "font-bold text-4xl md:text-2xl lg:text-2xl text-gray-200 movie--title", children: title }, void 0, false, {
        fileName: "app/components/features/FilmPoster.tsx",
        lineNumber: 40,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "movie--year text-yellow-400 font-bold text-xl lg:text-sm lg:mb-4", children: release_date.split("-")[0] }, void 0, false, {
        fileName: "app/components/features/FilmPoster.tsx",
        lineNumber: 41,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex-grow", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-xl md:text-base lg:text-base text-gray-100 leading-snug truncate-overflow", children: "A family is forced to live in silence while hiding from creatures that hunt by sound." }, void 0, false, {
        fileName: "app/components/features/FilmPoster.tsx",
        lineNumber: 43,
        columnNumber: 25
      }, this) }, void 0, false, {
        fileName: "app/components/features/FilmPoster.tsx",
        lineNumber: 42,
        columnNumber: 21
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/features/FilmPoster.tsx",
      lineNumber: 39,
      columnNumber: 17
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/features/FilmPoster.tsx",
    lineNumber: 35,
    columnNumber: 13
  }, this) }, void 0, false, {
    fileName: "app/components/features/FilmPoster.tsx",
    lineNumber: 33,
    columnNumber: 10
  }, this);
};
_c = FilmPoster;
var FilmPoster_default = FilmPoster;
var _c;
$RefreshReg$(_c, "FilmPoster");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/routes/films.tsx
var import_react2 = __toESM(require_react());
var import_jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime());
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/films.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/films.tsx"
  );
  import.meta.hot.lastModified = "1691805493925.204";
}
function films_default() {
  const {
    filmsPromise
  } = useLoaderData();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_jsx_dev_runtime2.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "h-1/4 w-1/4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("img", { className: "fade", src: star_wars_logo_default, alt: "star-wars-logo" }, void 0, false, {
      fileName: "app/routes/films.tsx",
      lineNumber: 40,
      columnNumber: 17
    }, this) }, void 0, false, {
      fileName: "app/routes/films.tsx",
      lineNumber: 39,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "flex flex-wrap", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react2.Suspense, { fallback: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Loading_default, {}, void 0, false, {
        fileName: "app/routes/films.tsx",
        lineNumber: 44,
        columnNumber: 41
      }, this), children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("h2", { className: "text-xl text-gray-300 m-2", children: "Filmes" }, void 0, false, {
          fileName: "app/routes/films.tsx",
          lineNumber: 45,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Await, { errorElement: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("p", { className: "text-xl text-gray-300", children: "Ooops alguma coisa de errado aconteceu enquanto buscavamos os dados, por favor tente novamente" }, void 0, false, {
          fileName: "app/routes/films.tsx",
          lineNumber: 46,
          columnNumber: 46
        }, this), resolve: filmsPromise, children: (films) => {
          return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("ul", { children: films.map((film) => /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("li", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(FilmPoster_default, { title: film.title, release_date: film.release_date, episode_id: film.episode_id }, void 0, false, {
            fileName: "app/routes/films.tsx",
            lineNumber: 51,
            columnNumber: 53
          }, this) }, film.episode_id, false, {
            fileName: "app/routes/films.tsx",
            lineNumber: 50,
            columnNumber: 64
          }, this)) }, void 0, false, {
            fileName: "app/routes/films.tsx",
            lineNumber: 49,
            columnNumber: 41
          }, this) }, void 0, false, {
            fileName: "app/routes/films.tsx",
            lineNumber: 48,
            columnNumber: 22
          }, this);
        } }, void 0, false, {
          fileName: "app/routes/films.tsx",
          lineNumber: 46,
          columnNumber: 25
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/films.tsx",
        lineNumber: 44,
        columnNumber: 21
      }, this) }, void 0, false, {
        fileName: "app/routes/films.tsx",
        lineNumber: 43,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Outlet, {}, void 0, false, {
        fileName: "app/routes/films.tsx",
        lineNumber: 59,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/films.tsx",
      lineNumber: 42,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/films.tsx",
    lineNumber: 38,
    columnNumber: 10
  }, this);
}
function ErrorBoundary({
  error
}) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("h1", { children: "Error" }, void 0, false, {
      fileName: "app/routes/films.tsx",
      lineNumber: 67,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("p", { children: error.message }, void 0, false, {
      fileName: "app/routes/films.tsx",
      lineNumber: 68,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("p", { children: "The stack trace is:" }, void 0, false, {
      fileName: "app/routes/films.tsx",
      lineNumber: 69,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("pre", { children: error.stack }, void 0, false, {
      fileName: "app/routes/films.tsx",
      lineNumber: 70,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/films.tsx",
    lineNumber: 66,
    columnNumber: 10
  }, this);
}
_c2 = ErrorBoundary;
var _c2;
$RefreshReg$(_c2, "ErrorBoundary");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  ErrorBoundary,
  films_default as default
};
//# sourceMappingURL=/build/routes/films-AESNAWAA.js.map
