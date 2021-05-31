(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/typescript_support", ["require", "exports", "typescript", "@angular/compiler-cli/src/diagnostics/typescript_version"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.verifySupportedTypeScriptVersion = exports.checkVersion = exports.restoreTypeScriptVersionForTesting = exports.setTypeScriptVersionForTesting = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var typescript_version_1 = require("@angular/compiler-cli/src/diagnostics/typescript_version");
    /**
     * Minimum supported TypeScript version
     * ∀ supported typescript version v, v >= MIN_TS_VERSION
     *
     * Note: this check is disabled in g3, search for
     * `angularCompilerOptions.disableTypeScriptVersionCheck` config param value in g3.
     */
    var MIN_TS_VERSION = '4.2.3';
    /**
     * Supremum of supported TypeScript versions
     * ∀ supported typescript version v, v < MAX_TS_VERSION
     * MAX_TS_VERSION is not considered as a supported TypeScript version
     *
     * Note: this check is disabled in g3, search for
     * `angularCompilerOptions.disableTypeScriptVersionCheck` config param value in g3.
     */
    var MAX_TS_VERSION = '4.3.0';
    /**
     * The currently used version of TypeScript, which can be adjusted for testing purposes using
     * `setTypeScriptVersionForTesting` and `restoreTypeScriptVersionForTesting` below.
     */
    var tsVersion = ts.version;
    function setTypeScriptVersionForTesting(version) {
        tsVersion = version;
    }
    exports.setTypeScriptVersionForTesting = setTypeScriptVersionForTesting;
    function restoreTypeScriptVersionForTesting() {
        tsVersion = ts.version;
    }
    exports.restoreTypeScriptVersionForTesting = restoreTypeScriptVersionForTesting;
    /**
     * Checks whether a given version ∈ [minVersion, maxVersion[.
     * An error will be thrown when the given version ∉ [minVersion, maxVersion[.
     *
     * @param version The version on which the check will be performed
     * @param minVersion The lower bound version. A valid version needs to be greater than minVersion
     * @param maxVersion The upper bound version. A valid version needs to be strictly less than
     * maxVersion
     *
     * @throws Will throw an error if the given version ∉ [minVersion, maxVersion[
     */
    function checkVersion(version, minVersion, maxVersion) {
        if ((typescript_version_1.compareVersions(version, minVersion) < 0 || typescript_version_1.compareVersions(version, maxVersion) >= 0)) {
            throw new Error("The Angular Compiler requires TypeScript >=" + minVersion + " and <" + maxVersion + " but " + version + " was found instead.");
        }
    }
    exports.checkVersion = checkVersion;
    function verifySupportedTypeScriptVersion() {
        checkVersion(tsVersion, MIN_TS_VERSION, MAX_TS_VERSION);
    }
    exports.verifySupportedTypeScriptVersion = verifySupportedTypeScriptVersion;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdF9zdXBwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy90eXBlc2NyaXB0X3N1cHBvcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsK0JBQWlDO0lBQ2pDLCtGQUFpRTtJQUVqRTs7Ozs7O09BTUc7SUFDSCxJQUFNLGNBQWMsR0FBRyxPQUFPLENBQUM7SUFFL0I7Ozs7Ozs7T0FPRztJQUNILElBQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQztJQUUvQjs7O09BR0c7SUFDSCxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO0lBRTNCLFNBQWdCLDhCQUE4QixDQUFDLE9BQWU7UUFDNUQsU0FBUyxHQUFHLE9BQU8sQ0FBQztJQUN0QixDQUFDO0lBRkQsd0VBRUM7SUFFRCxTQUFnQixrQ0FBa0M7UUFDaEQsU0FBUyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7SUFDekIsQ0FBQztJQUZELGdGQUVDO0lBRUQ7Ozs7Ozs7Ozs7T0FVRztJQUNILFNBQWdCLFlBQVksQ0FBQyxPQUFlLEVBQUUsVUFBa0IsRUFBRSxVQUFrQjtRQUNsRixJQUFJLENBQUMsb0NBQWUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLG9DQUFlLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFO1lBQzNGLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQThDLFVBQVUsY0FDcEUsVUFBVSxhQUFRLE9BQU8sd0JBQXFCLENBQUMsQ0FBQztTQUNyRDtJQUNILENBQUM7SUFMRCxvQ0FLQztJQUVELFNBQWdCLGdDQUFnQztRQUM5QyxZQUFZLENBQUMsU0FBUyxFQUFFLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRkQsNEVBRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtjb21wYXJlVmVyc2lvbnN9IGZyb20gJy4vZGlhZ25vc3RpY3MvdHlwZXNjcmlwdF92ZXJzaW9uJztcblxuLyoqXG4gKiBNaW5pbXVtIHN1cHBvcnRlZCBUeXBlU2NyaXB0IHZlcnNpb25cbiAqIOKIgCBzdXBwb3J0ZWQgdHlwZXNjcmlwdCB2ZXJzaW9uIHYsIHYgPj0gTUlOX1RTX1ZFUlNJT05cbiAqXG4gKiBOb3RlOiB0aGlzIGNoZWNrIGlzIGRpc2FibGVkIGluIGczLCBzZWFyY2ggZm9yXG4gKiBgYW5ndWxhckNvbXBpbGVyT3B0aW9ucy5kaXNhYmxlVHlwZVNjcmlwdFZlcnNpb25DaGVja2AgY29uZmlnIHBhcmFtIHZhbHVlIGluIGczLlxuICovXG5jb25zdCBNSU5fVFNfVkVSU0lPTiA9ICc0LjIuMyc7XG5cbi8qKlxuICogU3VwcmVtdW0gb2Ygc3VwcG9ydGVkIFR5cGVTY3JpcHQgdmVyc2lvbnNcbiAqIOKIgCBzdXBwb3J0ZWQgdHlwZXNjcmlwdCB2ZXJzaW9uIHYsIHYgPCBNQVhfVFNfVkVSU0lPTlxuICogTUFYX1RTX1ZFUlNJT04gaXMgbm90IGNvbnNpZGVyZWQgYXMgYSBzdXBwb3J0ZWQgVHlwZVNjcmlwdCB2ZXJzaW9uXG4gKlxuICogTm90ZTogdGhpcyBjaGVjayBpcyBkaXNhYmxlZCBpbiBnMywgc2VhcmNoIGZvclxuICogYGFuZ3VsYXJDb21waWxlck9wdGlvbnMuZGlzYWJsZVR5cGVTY3JpcHRWZXJzaW9uQ2hlY2tgIGNvbmZpZyBwYXJhbSB2YWx1ZSBpbiBnMy5cbiAqL1xuY29uc3QgTUFYX1RTX1ZFUlNJT04gPSAnNC4zLjAnO1xuXG4vKipcbiAqIFRoZSBjdXJyZW50bHkgdXNlZCB2ZXJzaW9uIG9mIFR5cGVTY3JpcHQsIHdoaWNoIGNhbiBiZSBhZGp1c3RlZCBmb3IgdGVzdGluZyBwdXJwb3NlcyB1c2luZ1xuICogYHNldFR5cGVTY3JpcHRWZXJzaW9uRm9yVGVzdGluZ2AgYW5kIGByZXN0b3JlVHlwZVNjcmlwdFZlcnNpb25Gb3JUZXN0aW5nYCBiZWxvdy5cbiAqL1xubGV0IHRzVmVyc2lvbiA9IHRzLnZlcnNpb247XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRUeXBlU2NyaXB0VmVyc2lvbkZvclRlc3RpbmcodmVyc2lvbjogc3RyaW5nKTogdm9pZCB7XG4gIHRzVmVyc2lvbiA9IHZlcnNpb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXN0b3JlVHlwZVNjcmlwdFZlcnNpb25Gb3JUZXN0aW5nKCk6IHZvaWQge1xuICB0c1ZlcnNpb24gPSB0cy52ZXJzaW9uO1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIGEgZ2l2ZW4gdmVyc2lvbiDiiIggW21pblZlcnNpb24sIG1heFZlcnNpb25bLlxuICogQW4gZXJyb3Igd2lsbCBiZSB0aHJvd24gd2hlbiB0aGUgZ2l2ZW4gdmVyc2lvbiDiiIkgW21pblZlcnNpb24sIG1heFZlcnNpb25bLlxuICpcbiAqIEBwYXJhbSB2ZXJzaW9uIFRoZSB2ZXJzaW9uIG9uIHdoaWNoIHRoZSBjaGVjayB3aWxsIGJlIHBlcmZvcm1lZFxuICogQHBhcmFtIG1pblZlcnNpb24gVGhlIGxvd2VyIGJvdW5kIHZlcnNpb24uIEEgdmFsaWQgdmVyc2lvbiBuZWVkcyB0byBiZSBncmVhdGVyIHRoYW4gbWluVmVyc2lvblxuICogQHBhcmFtIG1heFZlcnNpb24gVGhlIHVwcGVyIGJvdW5kIHZlcnNpb24uIEEgdmFsaWQgdmVyc2lvbiBuZWVkcyB0byBiZSBzdHJpY3RseSBsZXNzIHRoYW5cbiAqIG1heFZlcnNpb25cbiAqXG4gKiBAdGhyb3dzIFdpbGwgdGhyb3cgYW4gZXJyb3IgaWYgdGhlIGdpdmVuIHZlcnNpb24g4oiJIFttaW5WZXJzaW9uLCBtYXhWZXJzaW9uW1xuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tWZXJzaW9uKHZlcnNpb246IHN0cmluZywgbWluVmVyc2lvbjogc3RyaW5nLCBtYXhWZXJzaW9uOiBzdHJpbmcpIHtcbiAgaWYgKChjb21wYXJlVmVyc2lvbnModmVyc2lvbiwgbWluVmVyc2lvbikgPCAwIHx8IGNvbXBhcmVWZXJzaW9ucyh2ZXJzaW9uLCBtYXhWZXJzaW9uKSA+PSAwKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVGhlIEFuZ3VsYXIgQ29tcGlsZXIgcmVxdWlyZXMgVHlwZVNjcmlwdCA+PSR7bWluVmVyc2lvbn0gYW5kIDwke1xuICAgICAgICBtYXhWZXJzaW9ufSBidXQgJHt2ZXJzaW9ufSB3YXMgZm91bmQgaW5zdGVhZC5gKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5U3VwcG9ydGVkVHlwZVNjcmlwdFZlcnNpb24oKTogdm9pZCB7XG4gIGNoZWNrVmVyc2lvbih0c1ZlcnNpb24sIE1JTl9UU19WRVJTSU9OLCBNQVhfVFNfVkVSU0lPTik7XG59XG4iXX0=