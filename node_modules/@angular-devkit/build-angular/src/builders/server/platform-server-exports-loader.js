"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
/**
 * This loader is needed to add additional exports and is a workaround for a Webpack bug that doesn't
 * allow exports from multiple files in the same entry.
 * @see https://github.com/webpack/webpack/issues/15936.
 */
function default_1(content, map) {
    const extractorPath = (0, node_path_1.join)((0, node_path_1.dirname)(require.resolve('@angular/build/package.json')), 'src/utils/routes-extractor/extractor.js');
    const source = `${content}

  // EXPORTS added by @angular-devkit/build-angular
  export { renderApplication, renderModule, ɵSERVER_CONTEXT } from '@angular/platform-server';
  ` +
        // We do not import it directly so that node.js modules are resolved using the correct context.
        // Remove source map URL comments from the code if a sourcemap is present as this will not match the file.
        (0, node_fs_1.readFileSync)(extractorPath, 'utf-8').replace(/^\/\/# sourceMappingURL=[^\r\n]*/gm, '');
    this.callback(null, source, map);
    return;
}
