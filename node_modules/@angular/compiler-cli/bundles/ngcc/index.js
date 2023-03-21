
      import {createRequire as __cjsCompatRequire} from 'module';
      const require = __cjsCompatRequire(import.meta.url);
    
import {
  mainNgcc
} from "../chunk-PKXB2WOZ.js";
import "../chunk-B57SP4JB.js";
import {
  clearTsConfigCache
} from "../chunk-WN75SNW4.js";
import "../chunk-RMPM4VAI.js";
import "../chunk-P5LISIUG.js";
import "../chunk-ZF3IVDQ2.js";
import {
  ConsoleLogger,
  LogLevel
} from "../chunk-LYJKWJUC.js";
import "../chunk-2NLFVEGY.js";
import "../chunk-IJECERTO.js";
import "../chunk-IYYB2HTK.js";
import {
  NodeJSFileSystem,
  setFileSystem
} from "../chunk-TBUSSXUA.js";
import "../chunk-YZWN2KWE.js";
import "../chunk-SRFZMXHZ.js";

// bazel-out/k8-fastbuild/bin/packages/compiler-cli/ngcc/index.mjs
import { dirname, join } from "path";
import { fileURLToPath } from "url";
function process(options) {
  setFileSystem(new NodeJSFileSystem());
  return mainNgcc(options);
}
var containingDirPath = dirname(fileURLToPath(import.meta.url));
var ngccMainFilePath = join(containingDirPath, "./main-ngcc.js");
export {
  ConsoleLogger,
  LogLevel,
  clearTsConfigCache,
  ngccMainFilePath,
  process
};
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
//# sourceMappingURL=index.js.map
