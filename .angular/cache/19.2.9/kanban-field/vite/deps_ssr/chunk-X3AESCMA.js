import { createRequire } from 'module';const require = createRequire(import.meta.url);
import {
  InjectionToken
} from "./chunk-LF5MHR5E.js";

// node_modules/@angular/common/fesm2022/dom_tokens-rA0ACyx7.mjs
var DOCUMENT = new InjectionToken(ngDevMode ? "DocumentToken" : "");

// node_modules/@angular/common/fesm2022/xhr-BfNfxNDv.mjs
function parseCookieValue(cookieStr, name) {
  name = encodeURIComponent(name);
  for (const cookie of cookieStr.split(";")) {
    const eqIndex = cookie.indexOf("=");
    const [cookieName, cookieValue] = eqIndex == -1 ? [cookie, ""] : [cookie.slice(0, eqIndex), cookie.slice(eqIndex + 1)];
    if (cookieName.trim() === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}
var PLATFORM_BROWSER_ID = "browser";
var PLATFORM_SERVER_ID = "server";
function isPlatformBrowser(platformId) {
  return platformId === PLATFORM_BROWSER_ID;
}
function isPlatformServer(platformId) {
  return platformId === PLATFORM_SERVER_ID;
}
var XhrFactory = class {
};

export {
  DOCUMENT,
  parseCookieValue,
  PLATFORM_BROWSER_ID,
  PLATFORM_SERVER_ID,
  isPlatformBrowser,
  isPlatformServer,
  XhrFactory
};
/*! Bundled license information:

@angular/common/fesm2022/dom_tokens-rA0ACyx7.mjs:
  (**
   * @license Angular v19.2.8
   * (c) 2010-2025 Google LLC. https://angular.io/
   * License: MIT
   *)

@angular/common/fesm2022/xhr-BfNfxNDv.mjs:
  (**
   * @license Angular v19.2.8
   * (c) 2010-2025 Google LLC. https://angular.io/
   * License: MIT
   *)
*/
//# sourceMappingURL=chunk-X3AESCMA.js.map
