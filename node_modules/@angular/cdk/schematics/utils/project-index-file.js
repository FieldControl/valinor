"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectIndexFiles = getProjectIndexFiles;
const project_targets_1 = require("./project-targets");
/** Gets the path of the index file in the given project. */
function getProjectIndexFiles(project) {
    const paths = (0, project_targets_1.getProjectBuildTargets)(project)
        .filter(t => { var _a; return (_a = t.options) === null || _a === void 0 ? void 0 : _a['index']; })
        .map(t => t.options['index']);
    // Use a set to remove duplicate index files referenced in multiple build targets of a project.
    return Array.from(new Set(paths));
}
//# sourceMappingURL=project-index-file.js.map