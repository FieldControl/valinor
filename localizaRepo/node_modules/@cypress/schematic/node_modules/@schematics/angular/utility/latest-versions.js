"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.latestVersions = void 0;
/** Retrieve the minor version for the provided version string. */
function getAngularEarliestMinorVersion(version) {
    const versionMatching = version.match(/^(\d+)\.(\d+)\.\d+(-\w+)?/);
    if (versionMatching === null) {
        throw Error('Unable to determine the minor version for the provided version');
    }
    const [_, major, minor, prerelease = ''] = versionMatching;
    return `~${major}.${minor}.0${prerelease}`;
}
exports.latestVersions = {
    // We could have used TypeScripts' `resolveJsonModule` to make the `latestVersion` object typesafe,
    // but ts_library doesn't support JSON inputs.
    ...require('./latest-versions/package.json')['dependencies'],
    // As Angular CLI works with same minor versions of Angular Framework, a tilde match for the current
    Angular: getAngularEarliestMinorVersion(require('../package.json')['version']),
    // Since @angular-devkit/build-angular and @schematics/angular are always
    // published together from the same monorepo, and they are both
    // non-experimental, they will always have the same version.
    DevkitBuildAngular: '~' + require('../package.json')['version'],
};
