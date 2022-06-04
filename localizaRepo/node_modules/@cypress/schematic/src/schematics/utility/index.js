"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestNodeVersion = exports.getAngularVersion = void 0;
const http_1 = require("http");
const dependencies_1 = require("./dependencies");
function getAngularVersion(tree) {
    const packageNode = dependencies_1.getPackageJsonDependency(tree, '@angular/core');
    const version = packageNode && packageNode.version.split('').find((char) => !!parseInt(char, 10));
    return version ? +version : 0;
}
exports.getAngularVersion = getAngularVersion;
/**
   * Attempt to retrieve the latest package version from NPM
   * Return an optional "latest" version in case of error
   * @param packageName
   */
function getLatestNodeVersion(packageName) {
    const DEFAULT_VERSION = 'latest';
    return new Promise((resolve) => {
        return http_1.get(`http://registry.npmjs.org/${packageName}`, (res) => {
            let rawData = '';
            res.on('data', (chunk) => (rawData += chunk));
            res.on('end', () => {
                try {
                    const response = JSON.parse(rawData);
                    const version = (response && response['dist-tags']) || {};
                    resolve(buildPackage(packageName, version.latest));
                }
                catch (e) {
                    resolve(buildPackage(packageName));
                }
            });
        }).on('error', () => resolve(buildPackage(packageName)));
    });
    function buildPackage(name, version = DEFAULT_VERSION) {
        return { name, version };
    }
}
exports.getLatestNodeVersion = getLatestNodeVersion;
//# sourceMappingURL=index.js.map