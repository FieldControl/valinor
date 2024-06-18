"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspace = exports.getWorkspacePath = void 0;
var schematics_1 = require("@angular-devkit/schematics");
function getWorkspacePath(host) {
    var possibleFiles = ['/angular.json', '/.angular.json', '/workspace.json'];
    var path = possibleFiles.filter(function (path) { return host.exists(path); })[0];
    return path;
}
exports.getWorkspacePath = getWorkspacePath;
function getWorkspace(host) {
    var path = getWorkspacePath(host);
    var configBuffer = host.read(path);
    if (configBuffer === null) {
        throw new schematics_1.SchematicsException("Could not find (".concat(path, ")"));
    }
    var config = configBuffer.toString();
    return JSON.parse(config);
}
exports.getWorkspace = getWorkspace;
//# sourceMappingURL=config.js.map