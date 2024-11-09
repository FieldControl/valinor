"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
/**
 * This loader is needed to add additional exports and is a workaround for a Webpack bug that doesn't
 * allow exports from multiple files in the same entry.
 * @see https://github.com/webpack/webpack/issues/15936.
 */
function default_1(content, map) {
    const source = `${content}

  // EXPORTS added by @angular-devkit/build-angular
  export { renderApplication, renderModule, ɵSERVER_CONTEXT } from '@angular/platform-server';
  ` +
        // We do not import it directly so that node.js modules are resolved using the correct context.
        // Remove source map URL comments from the code if a sourcemap is present as this will not match the file.
        (0, node_fs_1.readFileSync)((0, node_path_1.join)(__dirname, '../../utils/routes-extractor/extractor.js'), 'utf-8').replace(/^\/\/# sourceMappingURL=[^\r\n]*/gm, '');
    this.callback(null, source, map);
    return;
}
exports.default = default_1;
