"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertCompatibleAngularVersion = void 0;
const core_1 = require("@angular-devkit/core");
const semver_1 = require("semver");
function assertCompatibleAngularVersion(projectRoot, logger) {
    let angularCliPkgJson;
    let angularPkgJson;
    let rxjsPkgJson;
    const resolveOptions = { paths: [projectRoot] };
    try {
        const angularPackagePath = require.resolve('@angular/core/package.json', resolveOptions);
        const rxjsPackagePath = require.resolve('rxjs/package.json', resolveOptions);
        angularPkgJson = require(angularPackagePath);
        rxjsPkgJson = require(rxjsPackagePath);
    }
    catch {
        logger.error(core_1.tags.stripIndents `
      You seem to not be depending on "@angular/core" and/or "rxjs". This is an error.
    `);
        process.exit(2);
    }
    if (!(angularPkgJson && angularPkgJson['version'] && rxjsPkgJson && rxjsPkgJson['version'])) {
        logger.error(core_1.tags.stripIndents `
      Cannot determine versions of "@angular/core" and/or "rxjs".
      This likely means your local installation is broken. Please reinstall your packages.
    `);
        process.exit(2);
    }
    try {
        const angularCliPkgPath = require.resolve('@angular/cli/package.json', resolveOptions);
        angularCliPkgJson = require(angularCliPkgPath);
        if (!(angularCliPkgJson && angularCliPkgJson['version'])) {
            return;
        }
    }
    catch {
        // Not using @angular-devkit/build-angular with @angular/cli is ok too.
        // In this case we don't provide as many version checks.
        return;
    }
    if (angularCliPkgJson['version'] === '0.0.0' || angularPkgJson['version'] === '0.0.0') {
        // Internal CLI testing version or integration testing in the angular/angular
        // repository with the generated development @angular/core npm package which is versioned "0.0.0".
        return;
    }
    const angularVersion = new semver_1.SemVer(angularPkgJson['version']);
    const cliMajor = new semver_1.SemVer(angularCliPkgJson['version']).major;
    // e.g. CLI 8.0 supports '>=8.0.0 <9.0.0', including pre-releases (next, rcs, snapshots)
    // of both 8 and 9.
    const supportedAngularSemver = `^${cliMajor}.0.0-next || >=${cliMajor}.0.0 <${cliMajor + 1}.0.0`;
    if (!semver_1.satisfies(angularVersion, supportedAngularSemver, { includePrerelease: true })) {
        logger.error(core_1.tags.stripIndents `
        This version of CLI is only compatible with Angular versions ${supportedAngularSemver},
        but Angular version ${angularVersion} was found instead.

        Please visit the link below to find instructions on how to update Angular.
        https://update.angular.io/
      ` + '\n');
        process.exit(3);
    }
}
exports.assertCompatibleAngularVersion = assertCompatibleAngularVersion;
