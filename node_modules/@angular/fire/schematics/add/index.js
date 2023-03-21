"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ngAdd = void 0;
const common_1 = require("../common");
const versions_json_1 = require("../versions.json");
const tasks_1 = require("@angular-devkit/schematics/tasks");
const ngAdd = (options) => (tree, context) => {
    common_1.addDependencies(tree, versions_json_1.peerDependencies, context);
    const npmInstallTaskId = context.addTask(new tasks_1.NodePackageInstallTask());
    context.addTask(new tasks_1.RunSchematicTask('ng-add-setup-project', options), [npmInstallTaskId]);
    return tree;
};
exports.ngAdd = ngAdd;
