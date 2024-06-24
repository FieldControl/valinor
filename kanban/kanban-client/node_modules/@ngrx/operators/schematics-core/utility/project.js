"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectMainFile = exports.isLib = exports.getProjectPath = exports.getProject = void 0;
var config_1 = require("./config");
var schematics_1 = require("@angular-devkit/schematics");
function getProject(host, options) {
    var workspace = (0, config_1.getWorkspace)(host);
    if (!options.project) {
        var defaultProject = workspace
            .defaultProject;
        options.project =
            defaultProject !== undefined
                ? defaultProject
                : Object.keys(workspace.projects)[0];
    }
    return workspace.projects[options.project];
}
exports.getProject = getProject;
function getProjectPath(host, options) {
    var project = getProject(host, options);
    if (project.root.slice(-1) === '/') {
        project.root = project.root.substring(0, project.root.length - 1);
    }
    if (options.path === undefined) {
        var projectDirName = project.projectType === 'application' ? 'app' : 'lib';
        return "".concat(project.root ? "/".concat(project.root) : '', "/src/").concat(projectDirName);
    }
    return options.path;
}
exports.getProjectPath = getProjectPath;
function isLib(host, options) {
    var project = getProject(host, options);
    return project.projectType === 'library';
}
exports.isLib = isLib;
function getProjectMainFile(host, options) {
    if (isLib(host, options)) {
        throw new schematics_1.SchematicsException("Invalid project type");
    }
    var project = getProject(host, options);
    var projectOptions = project.architect['build'].options;
    if (!(projectOptions === null || projectOptions === void 0 ? void 0 : projectOptions.main) && !(projectOptions === null || projectOptions === void 0 ? void 0 : projectOptions.browser)) {
        throw new schematics_1.SchematicsException("Could not find the main file ".concat(project));
    }
    return (projectOptions.browser || projectOptions.main);
}
exports.getProjectMainFile = getProjectMainFile;
//# sourceMappingURL=project.js.map