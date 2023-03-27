"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMainPath = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const _1 = require(".");
function getMainPath(host, name) {
    const project = getProject(host, name);
    // XXX: it seems like a breaking change in @angular-devkit/schematics
    // between version 0.7 and 0.8
    return (project.architect || project.targets).build.options.main;
}
exports.getMainPath = getMainPath;
function getProject(host, name) {
    const config = getWorkspaceConfig(host);
    if (name) {
        const project = config.projects[name];
        if (!project) {
            throw new schematics_1.SchematicsException(`Couldn't file project ${name}`);
        }
        return config.projects[name];
    }
    const projectNames = Object.keys(config.projects);
    if (projectNames.length === 0) {
        throw new schematics_1.SchematicsException(`Invalid configuration object! No project found!`);
    }
    if (projectNames.length > 1) {
        const { defaultProject } = config;
        return config.projects[defaultProject];
    }
    const projectName = projectNames[0];
    return config.projects[projectName];
}
function getWorkspaceConfig(host) {
    const path = getWorkspacePath(host);
    const config = (0, _1.getJsonFile)(host, path);
    return config;
}
function getWorkspacePath(host) {
    const possibleFiles = ['/angular.json', '/.angular.json'];
    const path = possibleFiles.find((path) => host.exists(path));
    if (!path) {
        throw new schematics_1.SchematicsException(`Couldn't find Angular configuration file! ` +
            `Execute in a project, created with Angular CLI ^6.0.`);
    }
    return path;
}
//# sourceMappingURL=project.js.map