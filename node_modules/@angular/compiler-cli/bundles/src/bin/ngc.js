#!/usr/bin/env node

      import {createRequire as __cjsCompatRequire} from 'module';
      const require = __cjsCompatRequire(import.meta.url);
    
import {
  main
} from "../../chunk-P6SWFK2U.js";
import "../../chunk-2OF2AI57.js";
import "../../chunk-PKSKJEUS.js";
import "../../chunk-O4JLZZWJ.js";
import "../../chunk-QRHWLC7U.js";
import "../../chunk-ZCBRXUPO.js";
import {
  NodeJSFileSystem,
  setFileSystem
} from "../../chunk-EC5K6QPP.js";
import "../../chunk-NJMZRTB6.js";
import {
  __require,
  __toESM
} from "../../chunk-SRFZMXHZ.js";

// bazel-out/darwin_arm64-fastbuild/bin/packages/compiler-cli/src/bin/ngc.mjs
import "reflect-metadata";
async function runNgcComamnd() {
  process.title = "Angular Compiler (ngc)";
  const args = process.argv.slice(2);
  setFileSystem(new NodeJSFileSystem());
  let tsickleModule;
  try {
    tsickleModule = (await Promise.resolve().then(() => __toESM(__require("tsickle"), 1))).default;
  } catch {
  }
  process.exitCode = main(args, void 0, void 0, void 0, void 0, void 0, tsickleModule);
}
runNgcComamnd().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
//# sourceMappingURL=ngc.js.map
