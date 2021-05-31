/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/core/schematics/migrations/deep-shadow-piercing-selector", ["require", "exports", "@angular-devkit/core"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const core_1 = require("@angular-devkit/core");
    const VALID_EXTENSIONS = ['.scss', '.sass', '.css', '.styl', '.less', '.ts'];
    function* visitFiles(directory) {
        for (const path of directory.subfiles) {
            const extension = core_1.extname(path);
            if (VALID_EXTENSIONS.includes(extension)) {
                yield core_1.join(directory.path, path);
            }
        }
        for (const path of directory.subdirs) {
            if (path === 'node_modules' || path.startsWith('.') || path === 'dist') {
                continue;
            }
            yield* visitFiles(directory.dir(path));
        }
    }
    function default_1() {
        return (tree) => {
            var _a;
            // Visit all files in an Angular workspace monorepo.
            for (const file of visitFiles(tree.root)) {
                const content = (_a = tree.read(file)) === null || _a === void 0 ? void 0 : _a.toString();
                if (content === null || content === void 0 ? void 0 : content.includes('/deep/ ')) {
                    tree.overwrite(file, content.replace(/\/deep\/ /g, '::ng-deep '));
                }
            }
        };
    }
    exports.default = default_1;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NjaGVtYXRpY3MvbWlncmF0aW9ucy9kZWVwLXNoYWRvdy1waWVyY2luZy1zZWxlY3Rvci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILCtDQUFtRDtJQUduRCxNQUFNLGdCQUFnQixHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUU3RSxRQUFRLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBbUI7UUFDdEMsS0FBSyxNQUFNLElBQUksSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFO1lBQ3JDLE1BQU0sU0FBUyxHQUFHLGNBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoQyxJQUFJLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDeEMsTUFBTSxXQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQzthQUNsQztTQUNGO1FBRUQsS0FBSyxNQUFNLElBQUksSUFBSSxTQUFTLENBQUMsT0FBTyxFQUFFO1lBQ3BDLElBQUksSUFBSSxLQUFLLGNBQWMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksS0FBSyxNQUFNLEVBQUU7Z0JBQ3RFLFNBQVM7YUFDVjtZQUVELEtBQUssQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDeEM7SUFDSCxDQUFDO0lBRUQ7UUFDRSxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUU7O1lBQ2Qsb0RBQW9EO1lBQ3BELEtBQUssTUFBTSxJQUFJLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDeEMsTUFBTSxPQUFPLEdBQUcsTUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywwQ0FBRSxRQUFRLEVBQUUsQ0FBQztnQkFDNUMsSUFBSSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUNoQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO2lCQUNuRTthQUNGO1FBQ0gsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQVZELDRCQVVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXh0bmFtZSwgam9pbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHtEaXJFbnRyeSwgUnVsZX0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuXG5jb25zdCBWQUxJRF9FWFRFTlNJT05TID0gWycuc2NzcycsICcuc2FzcycsICcuY3NzJywgJy5zdHlsJywgJy5sZXNzJywgJy50cyddO1xuXG5mdW5jdGlvbiogdmlzaXRGaWxlcyhkaXJlY3Rvcnk6IERpckVudHJ5KTogSXRlcmFibGVJdGVyYXRvcjxzdHJpbmc+IHtcbiAgZm9yIChjb25zdCBwYXRoIG9mIGRpcmVjdG9yeS5zdWJmaWxlcykge1xuICAgIGNvbnN0IGV4dGVuc2lvbiA9IGV4dG5hbWUocGF0aCk7XG4gICAgaWYgKFZBTElEX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0ZW5zaW9uKSkge1xuICAgICAgeWllbGQgam9pbihkaXJlY3RvcnkucGF0aCwgcGF0aCk7XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBwYXRoIG9mIGRpcmVjdG9yeS5zdWJkaXJzKSB7XG4gICAgaWYgKHBhdGggPT09ICdub2RlX21vZHVsZXMnIHx8IHBhdGguc3RhcnRzV2l0aCgnLicpIHx8IHBhdGggPT09ICdkaXN0Jykge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgeWllbGQqIHZpc2l0RmlsZXMoZGlyZWN0b3J5LmRpcihwYXRoKSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKTogUnVsZSB7XG4gIHJldHVybiAodHJlZSkgPT4ge1xuICAgIC8vIFZpc2l0IGFsbCBmaWxlcyBpbiBhbiBBbmd1bGFyIHdvcmtzcGFjZSBtb25vcmVwby5cbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgdmlzaXRGaWxlcyh0cmVlLnJvb3QpKSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gdHJlZS5yZWFkKGZpbGUpPy50b1N0cmluZygpO1xuICAgICAgaWYgKGNvbnRlbnQ/LmluY2x1ZGVzKCcvZGVlcC8gJykpIHtcbiAgICAgICAgdHJlZS5vdmVyd3JpdGUoZmlsZSwgY29udGVudC5yZXBsYWNlKC9cXC9kZWVwXFwvIC9nLCAnOjpuZy1kZWVwICcpKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG4iXX0=