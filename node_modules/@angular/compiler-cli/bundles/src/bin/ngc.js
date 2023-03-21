#!/usr/bin/env node

      import {createRequire as __cjsCompatRequire} from 'module';
      const require = __cjsCompatRequire(import.meta.url);
    
import {
  main
} from "../../chunk-5WBIJMZH.js";
import "../../chunk-RMPM4VAI.js";
import "../../chunk-P5LISIUG.js";
import "../../chunk-ZF3IVDQ2.js";
import "../../chunk-IJECERTO.js";
import "../../chunk-IYYB2HTK.js";
import {
  NodeJSFileSystem,
  setFileSystem
} from "../../chunk-TBUSSXUA.js";
import "../../chunk-YZWN2KWE.js";
import {
  __require,
  __toESM
} from "../../chunk-SRFZMXHZ.js";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/src/bin/ngc.mjs
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
