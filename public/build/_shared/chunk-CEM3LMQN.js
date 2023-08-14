import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-XU7DNSPJ.js";
import {
  createHotContext
} from "/build/_shared/chunk-TCV3N3JT.js";
import {
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// app/components/shared/Loading.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime());
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/shared/Loading.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/shared/Loading.tsx"
  );
  import.meta.hot.lastModified = "1691762831425.523";
}
var Loading = () => {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "loader_wrapper", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("svg", { viewBox: "-50 -50 700 700", className: "loader", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("g", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("title", { children: "Layer 1" }, void 0, false, {
        fileName: "app/components/shared/Loading.tsx",
        lineNumber: 26,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("g", { id: "l1", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("path", { fill: "#000", d: "m299.99999,0c-165.59998,0 -299.99998,134.40004 -299.99998,300.00004c0,165.6 134.39998,300.00004 299.99998,300c165.6,0 300.00002,-134.39996 300.00002,-300c0,-165.60002 -134.40002,-300.00004 -300.00002,-300.00004zm-14.15816,24.87248c0.1688,-0.00856 0.34134,0.00824 0.5102,0l1.27552,20.34438c-17.30332,0.82496 -34.14468,3.34834 -50.38266,7.46174l5.03828,19.8342c-42.62194,10.79592 -80.5854,33.2414 -110.33164,63.7755l-14.6046,-14.2857c-11.87822,12.18596 -22.49774,25.57174 -31.76018,39.92346l-17.09184,-11.28828c46.68098,-72.1773 126.19538,-121.13988 217.34692,-125.7653zm27.80612,0c91.36348,4.46928 171.08974,53.45432 217.85716,125.7653l-17.09184,11.28828c-9.24162,-14.31558 -19.85138,-27.69924 -31.69644,-39.8597l-14.60458,14.22194c-29.75088,-30.5504 -67.7586,-52.97584 -110.3954,-63.7755l5.03826,-19.8342c-16.23798,-4.1134 -33.07932,-6.63678 -50.38266,-7.46174l1.2755,-20.34438zm-13.64796,89.92346c8.67348,-0.01988 17.34698,0.5102 24.48982,1.53064l-11.16072,92.85714c23.45946,3.42092 44.02786,15.6988 58.22704,33.35458l74.48978,-55.86736c9.0481,11.2718 19.30572,28.95476 24.68114,42.34696l-85.58674,36.60712c4.3019,10.62846 6.69644,22.21 6.69644,34.37502c0,11.7196 -2.17876,22.9187 -6.18624,33.22704l84.8852,36.28828c-5.23758,13.47174 -15.3882,31.12314 -24.29846,42.47448l-73.9796,-55.35714c-14.1803,18.0591 -34.98424,30.66998 -58.73726,34.18366l10.96942,91.32654c-14.28572,2.19998 -34.69388,2.1684 -48.9796,0.12756l10.96938,-91.4541c-23.77016,-3.51622 -44.55626,-16.16742 -58.73724,-34.24744l-73.78826,55.35714c-9.04808,-11.2718 -19.3057,-28.95476 -24.68114,-42.34694l85.07654,-36.41582c-3.99384,-10.29306 -6.18622,-21.46466 -6.18622,-33.16326c0,-12.18602 2.38038,-23.79538 6.69642,-34.43878l-85.3954,-36.4796c5.2376,-13.47174 15.3882,-31.12314 24.29848,-42.4745l74.6811,55.93114c14.19918,-17.65578 34.76758,-29.93366 58.22706,-33.35458l-11.16072,-92.72962c7.14286,-1.09998 15.81632,-1.63826 24.48978,-1.65816zm-245.15304,59.4388l18.36734,9.05612c-7.74674,15.01834 -14.08054,30.87462 -18.75,47.44896l19.64286,5.54848c-5.71048,20.26526 -8.80102,41.62812 -8.80102,63.71174c0,22.10504 3.07982,43.49278 8.80102,63.7755l-19.64286,5.54848c4.66624,16.54766 11.01278,32.38996 18.75,47.3852l-18.36734,9.05612c-19.39818,-37.71134 -30.35714,-80.46448 -30.35714,-125.7653c0,-45.30084 10.95896,-88.05396 30.35714,-125.7653zm490.30612,0c19.39818,37.71134 30.3571,80.46446 30.3571,125.7653c0,45.30082 -10.95892,88.05396 -30.3571,125.7653l-18.36736,-9.05612c7.7405,-14.9997 14.08224,-30.83214 18.75002,-47.3852l-19.64286,-5.54848c5.72118,-20.28272 8.80102,-41.67046 8.80102,-63.7755c0,-22.08362 -3.09052,-43.44648 -8.80102,-63.71174l19.64286,-5.54848c-4.66816,-16.5697 -11.00646,-32.43422 -18.75002,-47.44896l18.36736,-9.05612zm-459.56632,263.8393c9.26598,14.35144 19.88144,27.73692 31.76018,39.92346l14.6046,-14.28572c29.74624,30.53408 67.7097,52.9796 110.33164,63.77552l-5.03828,19.83416c16.23798,4.11338 33.07934,6.6368 50.38266,7.46176l-1.27552,20.34438c-91.36344,-4.46932 -171.08972,-53.45436 -217.85712,-125.7653l17.09184,-11.28826zm428.8903,0l17.02806,11.28826c-46.76742,72.31094 -126.49368,121.29598 -217.85716,125.7653l-1.2755,-20.34438c17.30334,-0.82496 34.14468,-3.34838 50.38266,-7.46176l-5.03826,-19.83416c42.6368,-10.7997 80.64452,-33.22514 110.3954,-63.77552l14.60458,14.22194c11.85988,-12.17568 22.5073,-25.52476 31.76022,-39.85968z" }, void 0, false, {
        fileName: "app/components/shared/Loading.tsx",
        lineNumber: 28,
        columnNumber: 25
      }, this) }, void 0, false, {
        fileName: "app/components/shared/Loading.tsx",
        lineNumber: 27,
        columnNumber: 21
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/shared/Loading.tsx",
      lineNumber: 25,
      columnNumber: 17
    }, this) }, void 0, false, {
      fileName: "app/components/shared/Loading.tsx",
      lineNumber: 24,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "text", children: "Loading" }, void 0, false, {
      fileName: "app/components/shared/Loading.tsx",
      lineNumber: 32,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/shared/Loading.tsx",
    lineNumber: 23,
    columnNumber: 9
  }, this) }, void 0, false, {
    fileName: "app/components/shared/Loading.tsx",
    lineNumber: 22,
    columnNumber: 10
  }, this);
};
_c = Loading;
var Loading_default = Loading;
var _c;
$RefreshReg$(_c, "Loading");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

export {
  Loading_default
};
//# sourceMappingURL=/build/_shared/chunk-CEM3LMQN.js.map
