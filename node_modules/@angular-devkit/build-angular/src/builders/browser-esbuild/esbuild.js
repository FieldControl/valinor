"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _BundlerContext_esbuildContext, _BundlerContext_esbuildOptions;
Object.defineProperty(exports, "__esModule", { value: true });
exports.logMessages = exports.BundlerContext = exports.isEsBuildFailure = void 0;
const esbuild_1 = require("esbuild");
const node_path_1 = require("node:path");
/**
 * Determines if an unknown value is an esbuild BuildFailure error object thrown by esbuild.
 * @param value A potential esbuild BuildFailure error object.
 * @returns `true` if the object is determined to be a BuildFailure object; otherwise, `false`.
 */
function isEsBuildFailure(value) {
    return !!value && typeof value === 'object' && 'errors' in value && 'warnings' in value;
}
exports.isEsBuildFailure = isEsBuildFailure;
class BundlerContext {
    constructor(workspaceRoot, incremental, options) {
        this.workspaceRoot = workspaceRoot;
        this.incremental = incremental;
        _BundlerContext_esbuildContext.set(this, void 0);
        _BundlerContext_esbuildOptions.set(this, void 0);
        __classPrivateFieldSet(this, _BundlerContext_esbuildOptions, {
            ...options,
            metafile: true,
            write: false,
        }, "f");
    }
    /**
     * Executes the esbuild build function and normalizes the build result in the event of a
     * build failure that results in no output being generated.
     * All builds use the `write` option with a value of `false` to allow for the output files
     * build result array to be populated.
     *
     * @returns If output files are generated, the full esbuild BuildResult; if not, the
     * warnings and errors for the attempted build.
     */
    async bundle() {
        var _a, _b;
        let result;
        try {
            if (__classPrivateFieldGet(this, _BundlerContext_esbuildContext, "f")) {
                // Rebuild using the existing incremental build context
                result = await __classPrivateFieldGet(this, _BundlerContext_esbuildContext, "f").rebuild();
            }
            else if (this.incremental) {
                // Create an incremental build context and perform the first build.
                // Context creation does not perform a build.
                __classPrivateFieldSet(this, _BundlerContext_esbuildContext, await (0, esbuild_1.context)(__classPrivateFieldGet(this, _BundlerContext_esbuildOptions, "f")), "f");
                result = await __classPrivateFieldGet(this, _BundlerContext_esbuildContext, "f").rebuild();
            }
            else {
                // For non-incremental builds, perform a single build
                result = await (0, esbuild_1.build)(__classPrivateFieldGet(this, _BundlerContext_esbuildOptions, "f"));
            }
        }
        catch (failure) {
            // Build failures will throw an exception which contains errors/warnings
            if (isEsBuildFailure(failure)) {
                return failure;
            }
            else {
                throw failure;
            }
        }
        // Return if the build encountered any errors
        if (result.errors.length) {
            return {
                errors: result.errors,
                warnings: result.warnings,
            };
        }
        // Find all initial files
        const initialFiles = [];
        for (const outputFile of result.outputFiles) {
            // Entries in the metafile are relative to the `absWorkingDir` option which is set to the workspaceRoot
            const relativeFilePath = (0, node_path_1.relative)(this.workspaceRoot, outputFile.path);
            const entryPoint = (_b = (_a = result.metafile) === null || _a === void 0 ? void 0 : _a.outputs[relativeFilePath]) === null || _b === void 0 ? void 0 : _b.entryPoint;
            outputFile.path = relativeFilePath;
            if (entryPoint) {
                // An entryPoint value indicates an initial file
                initialFiles.push({
                    file: outputFile.path,
                    // The first part of the filename is the name of file (e.g., "polyfills" for "polyfills.7S5G3MDY.js")
                    name: (0, node_path_1.basename)(outputFile.path).split('.')[0],
                    extension: (0, node_path_1.extname)(outputFile.path),
                });
            }
        }
        // Return the successful build results
        return { ...result, initialFiles, errors: undefined };
    }
    /**
     * Disposes incremental build resources present in the context.
     *
     * @returns A promise that resolves when disposal is complete.
     */
    async dispose() {
        var _a;
        try {
            return (_a = __classPrivateFieldGet(this, _BundlerContext_esbuildContext, "f")) === null || _a === void 0 ? void 0 : _a.dispose();
        }
        finally {
            __classPrivateFieldSet(this, _BundlerContext_esbuildContext, undefined, "f");
        }
    }
}
exports.BundlerContext = BundlerContext;
_BundlerContext_esbuildContext = new WeakMap(), _BundlerContext_esbuildOptions = new WeakMap();
async function logMessages(context, { errors, warnings }) {
    if (warnings === null || warnings === void 0 ? void 0 : warnings.length) {
        const warningMessages = await (0, esbuild_1.formatMessages)(warnings, { kind: 'warning', color: true });
        context.logger.warn(warningMessages.join('\n'));
    }
    if (errors === null || errors === void 0 ? void 0 : errors.length) {
        const errorMessages = await (0, esbuild_1.formatMessages)(errors, { kind: 'error', color: true });
        context.logger.error(errorMessages.join('\n'));
    }
}
exports.logMessages = logMessages;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXNidWlsZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL2J1aWxkZXJzL2Jyb3dzZXItZXNidWlsZC9lc2J1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7OztBQUdILHFDQVdpQjtBQUNqQix5Q0FBd0Q7QUFHeEQ7Ozs7R0FJRztBQUNILFNBQWdCLGdCQUFnQixDQUFDLEtBQWM7SUFDN0MsT0FBTyxDQUFDLENBQUMsS0FBSyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxRQUFRLElBQUksS0FBSyxJQUFJLFVBQVUsSUFBSSxLQUFLLENBQUM7QUFDMUYsQ0FBQztBQUZELDRDQUVDO0FBRUQsTUFBYSxjQUFjO0lBSXpCLFlBQW9CLGFBQXFCLEVBQVUsV0FBb0IsRUFBRSxPQUFxQjtRQUExRSxrQkFBYSxHQUFiLGFBQWEsQ0FBUTtRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1FBSHZFLGlEQUFpRTtRQUNqRSxpREFBaUU7UUFHL0QsdUJBQUEsSUFBSSxrQ0FBbUI7WUFDckIsR0FBRyxPQUFPO1lBQ1YsUUFBUSxFQUFFLElBQUk7WUFDZCxLQUFLLEVBQUUsS0FBSztTQUNiLE1BQUEsQ0FBQztJQUNKLENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNILEtBQUssQ0FBQyxNQUFNOztRQVVWLElBQUksTUFBTSxDQUFDO1FBQ1gsSUFBSTtZQUNGLElBQUksdUJBQUEsSUFBSSxzQ0FBZ0IsRUFBRTtnQkFDeEIsdURBQXVEO2dCQUN2RCxNQUFNLEdBQUcsTUFBTSx1QkFBQSxJQUFJLHNDQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQy9DO2lCQUFNLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDM0IsbUVBQW1FO2dCQUNuRSw2Q0FBNkM7Z0JBQzdDLHVCQUFBLElB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QUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDbkYsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ2hEO0FBQ0gsQ0FBQztBQWJELGtDQWFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IEJ1aWxkZXJDb250ZXh0IH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2FyY2hpdGVjdCc7XG5pbXBvcnQge1xuICBCdWlsZENvbnRleHQsXG4gIEJ1aWxkRmFpbHVyZSxcbiAgQnVpbGRPcHRpb25zLFxuICBNZXNzYWdlLFxuICBNZXRhZmlsZSxcbiAgT3V0cHV0RmlsZSxcbiAgUGFydGlhbE1lc3NhZ2UsXG4gIGJ1aWxkLFxuICBjb250ZXh0LFxuICBmb3JtYXRNZXNzYWdlcyxcbn0gZnJvbSAnZXNidWlsZCc7XG5pbXBvcnQgeyBiYXNlbmFtZSwgZXh0bmFtZSwgcmVsYXRpdmUgfSBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgRmlsZUluZm8gfSBmcm9tICcuLi8uLi91dGlscy9pbmRleC1maWxlL2F1Z21lbnQtaW5kZXgtaHRtbCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiBhbiB1bmtub3duIHZhbHVlIGlzIGFuIGVzYnVpbGQgQnVpbGRGYWlsdXJlIGVycm9yIG9iamVjdCB0aHJvd24gYnkgZXNidWlsZC5cbiAqIEBwYXJhbSB2YWx1ZSBBIHBvdGVudGlhbCBlc2J1aWxkIEJ1aWxkRmFpbHVyZSBlcnJvciBvYmplY3QuXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG9iamVjdCBpcyBkZXRlcm1pbmVkIHRvIGJlIGEgQnVpbGRGYWlsdXJlIG9iamVjdDsgb3RoZXJ3aXNlLCBgZmFsc2VgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNFc0J1aWxkRmFpbHVyZSh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIEJ1aWxkRmFpbHVyZSB7XG4gIHJldHVybiAhIXZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgJ2Vycm9ycycgaW4gdmFsdWUgJiYgJ3dhcm5pbmdzJyBpbiB2YWx1ZTtcbn1cblxuZXhwb3J0IGNsYXNzIEJ1bmRsZXJDb250ZXh0IHtcbiAgI2VzYnVpbGRDb250ZXh0PzogQnVpbGRDb250ZXh0PHsgbWV0YWZpbGU6IHRydWU7IHdyaXRlOiBmYWxzZSB9PjtcbiAgI2VzYnVpbGRPcHRpb25zOiBCdWlsZE9wdGlvbnMgJiB7IG1ldGFmaWxlOiB0cnVlOyB3cml0ZTogZmFsc2UgfTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHdvcmtzcGFjZVJvb3Q6IHN0cmluZywgcHJpdmF0ZSBpbmNyZW1lbnRhbDogYm9vbGVhbiwgb3B0aW9uczogQnVpbGRPcHRpb25zKSB7XG4gICAgdGhpcy4jZXNidWlsZE9wdGlvbnMgPSB7XG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgbWV0YWZpbGU6IHRydWUsXG4gICAgICB3cml0ZTogZmFsc2UsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlcyB0aGUgZXNidWlsZCBidWlsZCBmdW5jdGlvbiBhbmQgbm9ybWFsaXplcyB0aGUgYnVpbGQgcmVzdWx0IGluIHRoZSBldmVudCBvZiBhXG4gICAqIGJ1aWxkIGZhaWx1cmUgdGhhdCByZXN1bHRzIGluIG5vIG91dHB1dCBiZWluZyBnZW5lcmF0ZWQuXG4gICAqIEFsbCBidWlsZHMgdXNlIHRoZSBgd3JpdGVgIG9wdGlvbiB3aXRoIGEgdmFsdWUgb2YgYGZhbHNlYCB0byBhbGxvdyBmb3IgdGhlIG91dHB1dCBmaWxlc1xuICAgKiBidWlsZCByZXN1bHQgYXJyYXkgdG8gYmUgcG9wdWxhdGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyBJZiBvdXRwdXQgZmlsZXMgYXJlIGdlbmVyYXRlZCwgdGhlIGZ1bGwgZXNidWlsZCBCdWlsZFJlc3VsdDsgaWYgbm90LCB0aGVcbiAgICogd2FybmluZ3MgYW5kIGVycm9ycyBmb3IgdGhlIGF0dGVtcHRlZCBidWlsZC5cbiAgICovXG4gIGFzeW5jIGJ1bmRsZSgpOiBQcm9taXNlPFxuICAgIHwgeyBlcnJvcnM6IE1lc3NhZ2VbXTsgd2FybmluZ3M6IE1lc3NhZ2VbXSB9XG4gICAgfCB7XG4gICAgICAgIGVycm9yczogdW5kZWZpbmVkO1xuICAgICAgICB3YXJuaW5nczogTWVzc2FnZVtdO1xuICAgICAgICBtZXRhZmlsZTogTWV0YWZpbGU7XG4gICAgICAgIG91dHB1dEZpbGVzOiBPdXRwdXRGaWxlW107XG4gICAgICAgIGluaXRpYWxGaWxlczogRmlsZUluZm9bXTtcbiAgICAgIH1cbiAgPiB7XG4gICAgbGV0IHJlc3VsdDtcbiAgICB0cnkge1xuICAgICAgaWYgKHRoaXMuI2VzYnVpbGRDb250ZXh0KSB7XG4gICAgICAgIC8vIFJlYnVpbGQgdXNpbmcgdGhlIGV4aXN0aW5nIGluY3JlbWVudGFsIGJ1aWxkIGNvbnRleHRcbiAgICAgICAgcmVzdWx0ID0gYXdhaXQgdGhpcy4jZXNidWlsZENvbnRleHQucmVidWlsZCgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmluY3JlbWVudGFsKSB7XG4gICAgICAgIC8vIENyZWF0ZSBhbiBpbmNyZW1lbnRhbCBidWlsZCBjb250ZXh0IGFuZCBwZXJmb3JtIHRoZSBmaXJzdCBidWlsZC5cbiAgICAgICAgLy8gQ29udGV4dCBjcmVhdGlvbiBkb2VzIG5vdCBwZXJmb3JtIGEgYnVpbGQuXG4gICAgICAgIHRoaXMuI2VzYnVpbGRDb250ZXh0ID0gYXdhaXQgY29udGV4dCh0aGlzLiNlc2J1aWxkT3B0aW9ucyk7XG4gICAgICAgIHJlc3VsdCA9IGF3YWl0IHRoaXMuI2VzYnVpbGRDb250ZXh0LnJlYnVpbGQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEZvciBub24taW5jcmVtZW50YWwgYnVpbGRzLCBwZXJmb3JtIGEgc2luZ2xlIGJ1aWxkXG4gICAgICAgIHJlc3VsdCA9IGF3YWl0IGJ1aWxkKHRoaXMuI2VzYnVpbGRPcHRpb25zKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChmYWlsdXJlKSB7XG4gICAgICAvLyBCdWlsZCBmYWlsdXJlcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiB3aGljaCBjb250YWlucyBlcnJvcnMvd2FybmluZ3NcbiAgICAgIGlmIChpc0VzQnVpbGRGYWlsdXJlKGZhaWx1cmUpKSB7XG4gICAgICAgIHJldHVybiBmYWlsdXJlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZmFpbHVyZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gaWYgdGhlIGJ1aWxkIGVuY291bnRlcmVkIGFueSBlcnJvcnNcbiAgICBpZiAocmVzdWx0LmVycm9ycy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGVycm9yczogcmVzdWx0LmVycm9ycyxcbiAgICAgICAgd2FybmluZ3M6IHJlc3VsdC53YXJuaW5ncyxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gRmluZCBhbGwgaW5pdGlhbCBmaWxlc1xuICAgIGNvbnN0IGluaXRpYWxGaWxlczogRmlsZUluZm9bXSA9IFtdO1xuICAgIGZvciAoY29uc3Qgb3V0cHV0RmlsZSBvZiByZXN1bHQub3V0cHV0RmlsZXMpIHtcbiAgICAgIC8vIEVudHJpZXMgaW4gdGhlIG1ldGFmaWxlIGFyZSByZWxhdGl2ZSB0byB0aGUgYGFic1dvcmtpbmdEaXJgIG9wdGlvbiB3aGljaCBpcyBzZXQgdG8gdGhlIHdvcmtzcGFjZVJvb3RcbiAgICAgIGNvbnN0IHJlbGF0aXZlRmlsZVBhdGggPSByZWxhdGl2ZSh0aGlzLndvcmtzcGFjZVJvb3QsIG91dHB1dEZpbGUucGF0aCk7XG4gICAgICBjb25zdCBlbnRyeVBvaW50ID0gcmVzdWx0Lm1ldGFmaWxlPy5vdXRwdXRzW3JlbGF0aXZlRmlsZVBhdGhdPy5lbnRyeVBvaW50O1xuXG4gICAgICBvdXRwdXRGaWxlLnBhdGggPSByZWxhdGl2ZUZpbGVQYXRoO1xuXG4gICAgICBpZiAoZW50cnlQb2ludCkge1xuICAgICAgICAvLyBBbiBlbnRyeVBvaW50IHZhbHVlIGluZGljYXRlcyBhbiBpbml0aWFsIGZpbGVcbiAgICAgICAgaW5pdGlhbEZpbGVzLnB1c2goe1xuICAgICAgICAgIGZpbGU6IG91dHB1dEZpbGUucGF0aCxcbiAgICAgICAgICAvLyBUaGUgZmlyc3QgcGFydCBvZiB0aGUgZmlsZW5hbWUgaXMgdGhlIG5hbWUgb2YgZmlsZSAoZS5nLiwgXCJwb2x5ZmlsbHNcIiBmb3IgXCJwb2x5ZmlsbHMuN1M1RzNNRFkuanNcIilcbiAgICAgICAgICBuYW1lOiBiYXNlbmFtZShvdXRwdXRGaWxlLnBhdGgpLnNwbGl0KCcuJylbMF0sXG4gICAgICAgICAgZXh0ZW5zaW9uOiBleHRuYW1lKG91dHB1dEZpbGUucGF0aCksXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiB0aGUgc3VjY2Vzc2Z1bCBidWlsZCByZXN1bHRzXG4gICAgcmV0dXJuIHsgLi4ucmVzdWx0LCBpbml0aWFsRmlsZXMsIGVycm9yczogdW5kZWZpbmVkIH07XG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZXMgaW5jcmVtZW50YWwgYnVpbGQgcmVzb3VyY2VzIHByZXNlbnQgaW4gdGhlIGNvbnRleHQuXG4gICAqXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gZGlzcG9zYWwgaXMgY29tcGxldGUuXG4gICAqL1xuICBhc3luYyBkaXNwb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdGhpcy4jZXNidWlsZENvbnRleHQ/LmRpc3Bvc2UoKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy4jZXNidWlsZENvbnRleHQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2dNZXNzYWdlcyhcbiAgY29udGV4dDogQnVpbGRlckNvbnRleHQsXG4gIHsgZXJyb3JzLCB3YXJuaW5ncyB9OiB7IGVycm9ycz86IFBhcnRpYWxNZXNzYWdlW107IHdhcm5pbmdzPzogUGFydGlhbE1lc3NhZ2VbXSB9LFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmICh3YXJuaW5ncz8ubGVuZ3RoKSB7XG4gICAgY29uc3Qgd2FybmluZ01lc3NhZ2VzID0gYXdhaXQgZm9ybWF0TWVzc2FnZXMod2FybmluZ3MsIHsga2luZDogJ3dhcm5pbmcnLCBjb2xvcjogdHJ1ZSB9KTtcbiAgICBjb250ZXh0LmxvZ2dlci53YXJuKHdhcm5pbmdNZXNzYWdlcy5qb2luKCdcXG4nKSk7XG4gIH1cblxuICBpZiAoZXJyb3JzPy5sZW5ndGgpIHtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2VzID0gYXdhaXQgZm9ybWF0TWVzc2FnZXMoZXJyb3JzLCB7IGtpbmQ6ICdlcnJvcicsIGNvbG9yOiB0cnVlIH0pO1xuICAgIGNvbnRleHQubG9nZ2VyLmVycm9yKGVycm9yTWVzc2FnZXMuam9pbignXFxuJykpO1xuICB9XG59XG4iXX0=