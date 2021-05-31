(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/entry_point_finder/utils", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.trackDuration = exports.getBasePaths = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    /**
     * Extract all the base-paths that we need to search for entry-points.
     *
     * This always contains the standard base-path (`sourceDirectory`).
     * But it also parses the `paths` mappings object to guess additional base-paths.
     *
     * For example:
     *
     * ```
     * getBasePaths('/node_modules', {baseUrl: '/dist', paths: {'*': ['lib/*', 'lib/generated/*']}})
     * > ['/node_modules', '/dist/lib']
     * ```
     *
     * Notice that `'/dist'` is not included as there is no `'*'` path,
     * and `'/dist/lib/generated'` is not included as it is covered by `'/dist/lib'`.
     *
     * @param sourceDirectory The standard base-path (e.g. node_modules).
     * @param pathMappings Path mapping configuration, from which to extract additional base-paths.
     */
    function getBasePaths(logger, sourceDirectory, pathMappings) {
        var e_1, _a, e_2, _b, e_3, _c;
        var fs = file_system_1.getFileSystem();
        var basePaths = [sourceDirectory];
        if (pathMappings) {
            var baseUrl = fs.resolve(pathMappings.baseUrl);
            if (fs.isRoot(baseUrl)) {
                logger.warn("The provided pathMappings baseUrl is the root path " + baseUrl + ".\n" +
                    "This is likely to mess up how ngcc finds entry-points and is probably not correct.\n" +
                    "Please check your path mappings configuration such as in the tsconfig.json file.");
            }
            try {
                for (var _d = tslib_1.__values(Object.values(pathMappings.paths)), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var paths = _e.value;
                    try {
                        for (var paths_1 = (e_2 = void 0, tslib_1.__values(paths)), paths_1_1 = paths_1.next(); !paths_1_1.done; paths_1_1 = paths_1.next()) {
                            var path = paths_1_1.value;
                            var foundMatch = false;
                            // We only want base paths that exist and are not files
                            var _f = extractPathPrefix(path), prefix = _f.prefix, hasWildcard = _f.hasWildcard;
                            var basePath = fs.resolve(baseUrl, prefix);
                            if (fs.exists(basePath) && fs.stat(basePath).isFile()) {
                                basePath = fs.dirname(basePath);
                            }
                            if (fs.exists(basePath)) {
                                // The `basePath` is itself a directory
                                basePaths.push(basePath);
                                foundMatch = true;
                            }
                            if (hasWildcard) {
                                // The path contains a wildcard (`*`) so also try searching for directories that start
                                // with the wildcard prefix path segment.
                                var wildcardContainer = fs.dirname(basePath);
                                var wildcardPrefix = fs.basename(basePath);
                                if (isExistingDirectory(fs, wildcardContainer)) {
                                    var candidates = fs.readdir(wildcardContainer);
                                    try {
                                        for (var candidates_1 = (e_3 = void 0, tslib_1.__values(candidates)), candidates_1_1 = candidates_1.next(); !candidates_1_1.done; candidates_1_1 = candidates_1.next()) {
                                            var candidate = candidates_1_1.value;
                                            if (candidate.startsWith(wildcardPrefix)) {
                                                var candidatePath = fs.resolve(wildcardContainer, candidate);
                                                if (isExistingDirectory(fs, candidatePath)) {
                                                    foundMatch = true;
                                                    basePaths.push(candidatePath);
                                                }
                                            }
                                        }
                                    }
                                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                                    finally {
                                        try {
                                            if (candidates_1_1 && !candidates_1_1.done && (_c = candidates_1.return)) _c.call(candidates_1);
                                        }
                                        finally { if (e_3) throw e_3.error; }
                                    }
                                }
                            }
                            if (!foundMatch) {
                                // We neither found a direct match (i.e. `basePath` is an existing directory) nor a
                                // directory that starts with a wildcard prefix.
                                logger.debug("The basePath \"" + basePath + "\" computed from baseUrl \"" + baseUrl + "\" and path mapping \"" + path + "\" does not exist in the file-system.\n" +
                                    "It will not be scanned for entry-points.");
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (paths_1_1 && !paths_1_1.done && (_b = paths_1.return)) _b.call(paths_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        var dedupedBasePaths = dedupePaths(fs, basePaths);
        // We want to ensure that the `sourceDirectory` is included when it is a node_modules folder.
        // Otherwise our entry-point finding algorithm would fail to walk that folder.
        if (fs.basename(sourceDirectory) === 'node_modules' &&
            !dedupedBasePaths.includes(sourceDirectory)) {
            dedupedBasePaths.unshift(sourceDirectory);
        }
        return dedupedBasePaths;
    }
    exports.getBasePaths = getBasePaths;
    function isExistingDirectory(fs, path) {
        return fs.exists(path) && fs.stat(path).isDirectory();
    }
    /**
     * Extract everything in the `path` up to the first `*`.
     * @param path The path to parse.
     * @returns The extracted prefix and a flag to indicate whether there was a wildcard `*`.
     */
    function extractPathPrefix(path) {
        var _a = tslib_1.__read(path.split('*', 2), 2), prefix = _a[0], rest = _a[1];
        return { prefix: prefix, hasWildcard: rest !== undefined };
    }
    /**
     * Run a task and track how long it takes.
     *
     * @param task The task whose duration we are tracking.
     * @param log The function to call with the duration of the task.
     * @returns The result of calling `task`.
     */
    function trackDuration(task, log) {
        var startTime = Date.now();
        var result = task();
        var duration = Math.round((Date.now() - startTime) / 100) / 10;
        log(duration);
        return result;
    }
    exports.trackDuration = trackDuration;
    /**
     * Remove paths that are contained by other paths.
     *
     * For example:
     * Given `['a/b/c', 'a/b/x', 'a/b', 'd/e', 'd/f']` we will end up with `['a/b', 'd/e', 'd/f]`.
     * (Note that we do not get `d` even though `d/e` and `d/f` share a base directory, since `d` is not
     * one of the base paths.)
     */
    function dedupePaths(fs, paths) {
        var e_4, _a;
        var root = { children: new Map() };
        try {
            for (var paths_2 = tslib_1.__values(paths), paths_2_1 = paths_2.next(); !paths_2_1.done; paths_2_1 = paths_2.next()) {
                var path = paths_2_1.value;
                addPath(fs, root, path);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (paths_2_1 && !paths_2_1.done && (_a = paths_2.return)) _a.call(paths_2);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return flattenTree(root);
    }
    /**
     * Add a path (defined by the `segments`) to the current `node` in the tree.
     */
    function addPath(fs, root, path) {
        var node = root;
        if (!fs.isRoot(path)) {
            var segments = path.split('/');
            for (var index = 0; index < segments.length; index++) {
                if (isLeaf(node)) {
                    // We hit a leaf so don't bother processing any more of the path
                    return;
                }
                // This is not the end of the path continue to process the rest of this path.
                var next = segments[index];
                if (!node.children.has(next)) {
                    node.children.set(next, { children: new Map() });
                }
                node = node.children.get(next);
            }
        }
        // This path has finished so convert this node to a leaf
        convertToLeaf(node, path);
    }
    /**
     * Flatten the tree of nodes back into an array of absolute paths.
     */
    function flattenTree(root) {
        var paths = [];
        var nodes = [root];
        for (var index = 0; index < nodes.length; index++) {
            var node = nodes[index];
            if (isLeaf(node)) {
                // We found a leaf so store the currentPath
                paths.push(node.path);
            }
            else {
                node.children.forEach(function (value) { return nodes.push(value); });
            }
        }
        return paths;
    }
    function isLeaf(node) {
        return node.path !== undefined;
    }
    function convertToLeaf(node, path) {
        node.path = path;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvZW50cnlfcG9pbnRfZmluZGVyL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwyRUFBbUg7SUFJbkg7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQWtCRztJQUNILFNBQWdCLFlBQVksQ0FDeEIsTUFBYyxFQUFFLGVBQStCLEVBQy9DLFlBQW9DOztRQUN0QyxJQUFNLEVBQUUsR0FBRywyQkFBYSxFQUFFLENBQUM7UUFDM0IsSUFBTSxTQUFTLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNwQyxJQUFJLFlBQVksRUFBRTtZQUNoQixJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqRCxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQ1Asd0RBQXNELE9BQU8sUUFBSztvQkFDbEUsc0ZBQXNGO29CQUN0RixrRkFBa0YsQ0FBQyxDQUFDO2FBQ3pGOztnQkFDRCxLQUFvQixJQUFBLEtBQUEsaUJBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUEsZ0JBQUEsNEJBQUU7b0JBQWxELElBQU0sS0FBSyxXQUFBOzt3QkFDZCxLQUFtQixJQUFBLHlCQUFBLGlCQUFBLEtBQUssQ0FBQSxDQUFBLDRCQUFBLCtDQUFFOzRCQUFyQixJQUFNLElBQUksa0JBQUE7NEJBQ2IsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDOzRCQUV2Qix1REFBdUQ7NEJBQ2pELElBQUEsS0FBd0IsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQTlDLE1BQU0sWUFBQSxFQUFFLFdBQVcsaUJBQTJCLENBQUM7NEJB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RDtTQUNGO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsU0FBUyxNQUFNLENBQUMsSUFBVTtRQUN4QixPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDO0lBQ2pDLENBQUM7SUFFRCxTQUFTLGFBQWEsQ0FBQyxJQUFVLEVBQUUsSUFBb0I7UUFDckQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDbkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aCwgZ2V0RmlsZVN5c3RlbSwgUGF0aE1hbmlwdWxhdGlvbiwgUmVhZG9ubHlGaWxlU3lzdGVtfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtMb2dnZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9sb2dnaW5nJztcbmltcG9ydCB7UGF0aE1hcHBpbmdzfSBmcm9tICcuLi9wYXRoX21hcHBpbmdzJztcblxuLyoqXG4gKiBFeHRyYWN0IGFsbCB0aGUgYmFzZS1wYXRocyB0aGF0IHdlIG5lZWQgdG8gc2VhcmNoIGZvciBlbnRyeS1wb2ludHMuXG4gKlxuICogVGhpcyBhbHdheXMgY29udGFpbnMgdGhlIHN0YW5kYXJkIGJhc2UtcGF0aCAoYHNvdXJjZURpcmVjdG9yeWApLlxuICogQnV0IGl0IGFsc28gcGFyc2VzIHRoZSBgcGF0aHNgIG1hcHBpbmdzIG9iamVjdCB0byBndWVzcyBhZGRpdGlvbmFsIGJhc2UtcGF0aHMuXG4gKlxuICogRm9yIGV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiBnZXRCYXNlUGF0aHMoJy9ub2RlX21vZHVsZXMnLCB7YmFzZVVybDogJy9kaXN0JywgcGF0aHM6IHsnKic6IFsnbGliLyonLCAnbGliL2dlbmVyYXRlZC8qJ119fSlcbiAqID4gWycvbm9kZV9tb2R1bGVzJywgJy9kaXN0L2xpYiddXG4gKiBgYGBcbiAqXG4gKiBOb3RpY2UgdGhhdCBgJy9kaXN0J2AgaXMgbm90IGluY2x1ZGVkIGFzIHRoZXJlIGlzIG5vIGAnKidgIHBhdGgsXG4gKiBhbmQgYCcvZGlzdC9saWIvZ2VuZXJhdGVkJ2AgaXMgbm90IGluY2x1ZGVkIGFzIGl0IGlzIGNvdmVyZWQgYnkgYCcvZGlzdC9saWInYC5cbiAqXG4gKiBAcGFyYW0gc291cmNlRGlyZWN0b3J5IFRoZSBzdGFuZGFyZCBiYXNlLXBhdGggKGUuZy4gbm9kZV9tb2R1bGVzKS5cbiAqIEBwYXJhbSBwYXRoTWFwcGluZ3MgUGF0aCBtYXBwaW5nIGNvbmZpZ3VyYXRpb24sIGZyb20gd2hpY2ggdG8gZXh0cmFjdCBhZGRpdGlvbmFsIGJhc2UtcGF0aHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRCYXNlUGF0aHMoXG4gICAgbG9nZ2VyOiBMb2dnZXIsIHNvdXJjZURpcmVjdG9yeTogQWJzb2x1dGVGc1BhdGgsXG4gICAgcGF0aE1hcHBpbmdzOiBQYXRoTWFwcGluZ3N8dW5kZWZpbmVkKTogQWJzb2x1dGVGc1BhdGhbXSB7XG4gIGNvbnN0IGZzID0gZ2V0RmlsZVN5c3RlbSgpO1xuICBjb25zdCBiYXNlUGF0aHMgPSBbc291cmNlRGlyZWN0b3J5XTtcbiAgaWYgKHBhdGhNYXBwaW5ncykge1xuICAgIGNvbnN0IGJhc2VVcmwgPSBmcy5yZXNvbHZlKHBhdGhNYXBwaW5ncy5iYXNlVXJsKTtcbiAgICBpZiAoZnMuaXNSb290KGJhc2VVcmwpKSB7XG4gICAgICBsb2dnZXIud2FybihcbiAgICAgICAgICBgVGhlIHByb3ZpZGVkIHBhdGhNYXBwaW5ncyBiYXNlVXJsIGlzIHRoZSByb290IHBhdGggJHtiYXNlVXJsfS5cXG5gICtcbiAgICAgICAgICBgVGhpcyBpcyBsaWtlbHkgdG8gbWVzcyB1cCBob3cgbmdjYyBmaW5kcyBlbnRyeS1wb2ludHMgYW5kIGlzIHByb2JhYmx5IG5vdCBjb3JyZWN0LlxcbmAgK1xuICAgICAgICAgIGBQbGVhc2UgY2hlY2sgeW91ciBwYXRoIG1hcHBpbmdzIGNvbmZpZ3VyYXRpb24gc3VjaCBhcyBpbiB0aGUgdHNjb25maWcuanNvbiBmaWxlLmApO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IHBhdGhzIG9mIE9iamVjdC52YWx1ZXMocGF0aE1hcHBpbmdzLnBhdGhzKSkge1xuICAgICAgZm9yIChjb25zdCBwYXRoIG9mIHBhdGhzKSB7XG4gICAgICAgIGxldCBmb3VuZE1hdGNoID0gZmFsc2U7XG5cbiAgICAgICAgLy8gV2Ugb25seSB3YW50IGJhc2UgcGF0aHMgdGhhdCBleGlzdCBhbmQgYXJlIG5vdCBmaWxlc1xuICAgICAgICBjb25zdCB7cHJlZml4LCBoYXNXaWxkY2FyZH0gPSBleHRyYWN0UGF0aFByZWZpeChwYXRoKTtcbiAgICAgICAgbGV0IGJhc2VQYXRoID0gZnMucmVzb2x2ZShiYXNlVXJsLCBwcmVmaXgpO1xuICAgICAgICBpZiAoZnMuZXhpc3RzKGJhc2VQYXRoKSAmJiBmcy5zdGF0KGJhc2VQYXRoKS5pc0ZpbGUoKSkge1xuICAgICAgICAgIGJhc2VQYXRoID0gZnMuZGlybmFtZShiYXNlUGF0aCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZnMuZXhpc3RzKGJhc2VQYXRoKSkge1xuICAgICAgICAgIC8vIFRoZSBgYmFzZVBhdGhgIGlzIGl0c2VsZiBhIGRpcmVjdG9yeVxuICAgICAgICAgIGJhc2VQYXRocy5wdXNoKGJhc2VQYXRoKTtcbiAgICAgICAgICBmb3VuZE1hdGNoID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYXNXaWxkY2FyZCkge1xuICAgICAgICAgIC8vIFRoZSBwYXRoIGNvbnRhaW5zIGEgd2lsZGNhcmQgKGAqYCkgc28gYWxzbyB0cnkgc2VhcmNoaW5nIGZvciBkaXJlY3RvcmllcyB0aGF0IHN0YXJ0XG4gICAgICAgICAgLy8gd2l0aCB0aGUgd2lsZGNhcmQgcHJlZml4IHBhdGggc2VnbWVudC5cbiAgICAgICAgICBjb25zdCB3aWxkY2FyZENvbnRhaW5lciA9IGZzLmRpcm5hbWUoYmFzZVBhdGgpO1xuICAgICAgICAgIGNvbnN0IHdpbGRjYXJkUHJlZml4ID0gZnMuYmFzZW5hbWUoYmFzZVBhdGgpO1xuICAgICAgICAgIGlmIChpc0V4aXN0aW5nRGlyZWN0b3J5KGZzLCB3aWxkY2FyZENvbnRhaW5lcikpIHtcbiAgICAgICAgICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSBmcy5yZWFkZGlyKHdpbGRjYXJkQ29udGFpbmVyKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2FuZGlkYXRlIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICAgICAgICAgICAgaWYgKGNhbmRpZGF0ZS5zdGFydHNXaXRoKHdpbGRjYXJkUHJlZml4KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhbmRpZGF0ZVBhdGggPSBmcy5yZXNvbHZlKHdpbGRjYXJkQ29udGFpbmVyLCBjYW5kaWRhdGUpO1xuICAgICAgICAgICAgICAgIGlmIChpc0V4aXN0aW5nRGlyZWN0b3J5KGZzLCBjYW5kaWRhdGVQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgZm91bmRNYXRjaCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICBiYXNlUGF0aHMucHVzaChjYW5kaWRhdGVQYXRoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWZvdW5kTWF0Y2gpIHtcbiAgICAgICAgICAvLyBXZSBuZWl0aGVyIGZvdW5kIGEgZGlyZWN0IG1hdGNoIChpLmUuIGBiYXNlUGF0aGAgaXMgYW4gZXhpc3RpbmcgZGlyZWN0b3J5KSBub3IgYVxuICAgICAgICAgIC8vIGRpcmVjdG9yeSB0aGF0IHN0YXJ0cyB3aXRoIGEgd2lsZGNhcmQgcHJlZml4LlxuICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhcbiAgICAgICAgICAgICAgYFRoZSBiYXNlUGF0aCBcIiR7YmFzZVBhdGh9XCIgY29tcHV0ZWQgZnJvbSBiYXNlVXJsIFwiJHtiYXNlVXJsfVwiIGFuZCBwYXRoIG1hcHBpbmcgXCIke1xuICAgICAgICAgICAgICAgICAgcGF0aH1cIiBkb2VzIG5vdCBleGlzdCBpbiB0aGUgZmlsZS1zeXN0ZW0uXFxuYCArXG4gICAgICAgICAgICAgIGBJdCB3aWxsIG5vdCBiZSBzY2FubmVkIGZvciBlbnRyeS1wb2ludHMuYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBkZWR1cGVkQmFzZVBhdGhzID0gZGVkdXBlUGF0aHMoZnMsIGJhc2VQYXRocyk7XG5cbiAgLy8gV2Ugd2FudCB0byBlbnN1cmUgdGhhdCB0aGUgYHNvdXJjZURpcmVjdG9yeWAgaXMgaW5jbHVkZWQgd2hlbiBpdCBpcyBhIG5vZGVfbW9kdWxlcyBmb2xkZXIuXG4gIC8vIE90aGVyd2lzZSBvdXIgZW50cnktcG9pbnQgZmluZGluZyBhbGdvcml0aG0gd291bGQgZmFpbCB0byB3YWxrIHRoYXQgZm9sZGVyLlxuICBpZiAoZnMuYmFzZW5hbWUoc291cmNlRGlyZWN0b3J5KSA9PT0gJ25vZGVfbW9kdWxlcycgJiZcbiAgICAgICFkZWR1cGVkQmFzZVBhdGhzLmluY2x1ZGVzKHNvdXJjZURpcmVjdG9yeSkpIHtcbiAgICBkZWR1cGVkQmFzZVBhdGhzLnVuc2hpZnQoc291cmNlRGlyZWN0b3J5KTtcbiAgfVxuXG4gIHJldHVybiBkZWR1cGVkQmFzZVBhdGhzO1xufVxuXG5mdW5jdGlvbiBpc0V4aXN0aW5nRGlyZWN0b3J5KGZzOiBSZWFkb25seUZpbGVTeXN0ZW0sIHBhdGg6IEFic29sdXRlRnNQYXRoKTogYm9vbGVhbiB7XG4gIHJldHVybiBmcy5leGlzdHMocGF0aCkgJiYgZnMuc3RhdChwYXRoKS5pc0RpcmVjdG9yeSgpO1xufVxuXG4vKipcbiAqIEV4dHJhY3QgZXZlcnl0aGluZyBpbiB0aGUgYHBhdGhgIHVwIHRvIHRoZSBmaXJzdCBgKmAuXG4gKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCB0byBwYXJzZS5cbiAqIEByZXR1cm5zIFRoZSBleHRyYWN0ZWQgcHJlZml4IGFuZCBhIGZsYWcgdG8gaW5kaWNhdGUgd2hldGhlciB0aGVyZSB3YXMgYSB3aWxkY2FyZCBgKmAuXG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3RQYXRoUHJlZml4KHBhdGg6IHN0cmluZyk6IHtwcmVmaXg6IHN0cmluZywgaGFzV2lsZGNhcmQ6IGJvb2xlYW59IHtcbiAgY29uc3QgW3ByZWZpeCwgcmVzdF0gPSBwYXRoLnNwbGl0KCcqJywgMik7XG4gIHJldHVybiB7cHJlZml4LCBoYXNXaWxkY2FyZDogcmVzdCAhPT0gdW5kZWZpbmVkfTtcbn1cblxuLyoqXG4gKiBSdW4gYSB0YXNrIGFuZCB0cmFjayBob3cgbG9uZyBpdCB0YWtlcy5cbiAqXG4gKiBAcGFyYW0gdGFzayBUaGUgdGFzayB3aG9zZSBkdXJhdGlvbiB3ZSBhcmUgdHJhY2tpbmcuXG4gKiBAcGFyYW0gbG9nIFRoZSBmdW5jdGlvbiB0byBjYWxsIHdpdGggdGhlIGR1cmF0aW9uIG9mIHRoZSB0YXNrLlxuICogQHJldHVybnMgVGhlIHJlc3VsdCBvZiBjYWxsaW5nIGB0YXNrYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYWNrRHVyYXRpb248VCA9IHZvaWQ+KHRhc2s6ICgpID0+IFQgZXh0ZW5kcyBQcm9taXNlPHVua25vd24+PyBuZXZlciA6IFQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZzogKGR1cmF0aW9uOiBudW1iZXIpID0+IHZvaWQpOiBUIHtcbiAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgY29uc3QgcmVzdWx0ID0gdGFzaygpO1xuICBjb25zdCBkdXJhdGlvbiA9IE1hdGgucm91bmQoKERhdGUubm93KCkgLSBzdGFydFRpbWUpIC8gMTAwKSAvIDEwO1xuICBsb2coZHVyYXRpb24pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFJlbW92ZSBwYXRocyB0aGF0IGFyZSBjb250YWluZWQgYnkgb3RoZXIgcGF0aHMuXG4gKlxuICogRm9yIGV4YW1wbGU6XG4gKiBHaXZlbiBgWydhL2IvYycsICdhL2IveCcsICdhL2InLCAnZC9lJywgJ2QvZiddYCB3ZSB3aWxsIGVuZCB1cCB3aXRoIGBbJ2EvYicsICdkL2UnLCAnZC9mXWAuXG4gKiAoTm90ZSB0aGF0IHdlIGRvIG5vdCBnZXQgYGRgIGV2ZW4gdGhvdWdoIGBkL2VgIGFuZCBgZC9mYCBzaGFyZSBhIGJhc2UgZGlyZWN0b3J5LCBzaW5jZSBgZGAgaXMgbm90XG4gKiBvbmUgb2YgdGhlIGJhc2UgcGF0aHMuKVxuICovXG5mdW5jdGlvbiBkZWR1cGVQYXRocyhmczogUGF0aE1hbmlwdWxhdGlvbiwgcGF0aHM6IEFic29sdXRlRnNQYXRoW10pOiBBYnNvbHV0ZUZzUGF0aFtdIHtcbiAgY29uc3Qgcm9vdDogTm9kZSA9IHtjaGlsZHJlbjogbmV3IE1hcCgpfTtcbiAgZm9yIChjb25zdCBwYXRoIG9mIHBhdGhzKSB7XG4gICAgYWRkUGF0aChmcywgcm9vdCwgcGF0aCk7XG4gIH1cbiAgcmV0dXJuIGZsYXR0ZW5UcmVlKHJvb3QpO1xufVxuXG4vKipcbiAqIEFkZCBhIHBhdGggKGRlZmluZWQgYnkgdGhlIGBzZWdtZW50c2ApIHRvIHRoZSBjdXJyZW50IGBub2RlYCBpbiB0aGUgdHJlZS5cbiAqL1xuZnVuY3Rpb24gYWRkUGF0aChmczogUGF0aE1hbmlwdWxhdGlvbiwgcm9vdDogTm9kZSwgcGF0aDogQWJzb2x1dGVGc1BhdGgpOiB2b2lkIHtcbiAgbGV0IG5vZGUgPSByb290O1xuICBpZiAoIWZzLmlzUm9vdChwYXRoKSkge1xuICAgIGNvbnN0IHNlZ21lbnRzID0gcGF0aC5zcGxpdCgnLycpO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBzZWdtZW50cy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGlmIChpc0xlYWYobm9kZSkpIHtcbiAgICAgICAgLy8gV2UgaGl0IGEgbGVhZiBzbyBkb24ndCBib3RoZXIgcHJvY2Vzc2luZyBhbnkgbW9yZSBvZiB0aGUgcGF0aFxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBUaGlzIGlzIG5vdCB0aGUgZW5kIG9mIHRoZSBwYXRoIGNvbnRpbnVlIHRvIHByb2Nlc3MgdGhlIHJlc3Qgb2YgdGhpcyBwYXRoLlxuICAgICAgY29uc3QgbmV4dCA9IHNlZ21lbnRzW2luZGV4XTtcbiAgICAgIGlmICghbm9kZS5jaGlsZHJlbi5oYXMobmV4dCkpIHtcbiAgICAgICAgbm9kZS5jaGlsZHJlbi5zZXQobmV4dCwge2NoaWxkcmVuOiBuZXcgTWFwKCl9KTtcbiAgICAgIH1cbiAgICAgIG5vZGUgPSBub2RlLmNoaWxkcmVuLmdldChuZXh0KSE7XG4gICAgfVxuICB9XG4gIC8vIFRoaXMgcGF0aCBoYXMgZmluaXNoZWQgc28gY29udmVydCB0aGlzIG5vZGUgdG8gYSBsZWFmXG4gIGNvbnZlcnRUb0xlYWYobm9kZSwgcGF0aCk7XG59XG5cbi8qKlxuICogRmxhdHRlbiB0aGUgdHJlZSBvZiBub2RlcyBiYWNrIGludG8gYW4gYXJyYXkgb2YgYWJzb2x1dGUgcGF0aHMuXG4gKi9cbmZ1bmN0aW9uIGZsYXR0ZW5UcmVlKHJvb3Q6IE5vZGUpOiBBYnNvbHV0ZUZzUGF0aFtdIHtcbiAgY29uc3QgcGF0aHM6IEFic29sdXRlRnNQYXRoW10gPSBbXTtcbiAgY29uc3Qgbm9kZXM6IE5vZGVbXSA9IFtyb290XTtcbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG5vZGVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpbmRleF07XG4gICAgaWYgKGlzTGVhZihub2RlKSkge1xuICAgICAgLy8gV2UgZm91bmQgYSBsZWFmIHNvIHN0b3JlIHRoZSBjdXJyZW50UGF0aFxuICAgICAgcGF0aHMucHVzaChub2RlLnBhdGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlLmNoaWxkcmVuLmZvckVhY2godmFsdWUgPT4gbm9kZXMucHVzaCh2YWx1ZSkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGF0aHM7XG59XG5cbmZ1bmN0aW9uIGlzTGVhZihub2RlOiBOb2RlKTogbm9kZSBpcyBMZWFmIHtcbiAgcmV0dXJuIG5vZGUucGF0aCAhPT0gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0VG9MZWFmKG5vZGU6IE5vZGUsIHBhdGg6IEFic29sdXRlRnNQYXRoKSB7XG4gIG5vZGUucGF0aCA9IHBhdGg7XG59XG5cbmludGVyZmFjZSBOb2RlIHtcbiAgY2hpbGRyZW46IE1hcDxzdHJpbmcsIE5vZGU+O1xuICBwYXRoPzogQWJzb2x1dGVGc1BhdGg7XG59XG5cbnR5cGUgTGVhZiA9IFJlcXVpcmVkPE5vZGU+O1xuIl19