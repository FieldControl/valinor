(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/analysis/switch_marker_analyzer", ["require", "exports", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/analysis/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SwitchMarkerAnalyzer = exports.SwitchMarkerAnalyses = void 0;
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var util_1 = require("@angular/compiler-cli/ngcc/src/analysis/util");
    exports.SwitchMarkerAnalyses = Map;
    /**
     * This Analyzer will analyse the files that have an R3 switch marker in them
     * that will be replaced.
     */
    var SwitchMarkerAnalyzer = /** @class */ (function () {
        function SwitchMarkerAnalyzer(host, packagePath) {
            this.host = host;
            this.packagePath = packagePath;
        }
        /**
         * Analyze the files in the program to identify declarations that contain R3
         * switch markers.
         * @param program The program to analyze.
         * @return A map of source files to analysis objects. The map will contain only the
         * source files that had switch markers, and the analysis will contain an array of
         * the declarations in that source file that contain the marker.
         */
        SwitchMarkerAnalyzer.prototype.analyzeProgram = function (program) {
            var _this = this;
            var analyzedFiles = new exports.SwitchMarkerAnalyses();
            program.getSourceFiles()
                .filter(function (sourceFile) { return util_1.isWithinPackage(_this.packagePath, file_system_1.absoluteFromSourceFile(sourceFile)); })
                .forEach(function (sourceFile) {
                var declarations = _this.host.getSwitchableDeclarations(sourceFile);
                if (declarations.length) {
                    analyzedFiles.set(sourceFile, { sourceFile: sourceFile, declarations: declarations });
                }
            });
            return analyzedFiles;
        };
        return SwitchMarkerAnalyzer;
    }());
    exports.SwitchMarkerAnalyzer = SwitchMarkerAnalyzer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoX21hcmtlcl9hbmFseXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9hbmFseXNpcy9zd2l0Y2hfbWFya2VyX2FuYWx5emVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQVFBLDJFQUFzRjtJQUV0RixxRUFBdUM7SUFRMUIsUUFBQSxvQkFBb0IsR0FBRyxHQUFHLENBQUM7SUFFeEM7OztPQUdHO0lBQ0g7UUFDRSw4QkFBb0IsSUFBd0IsRUFBVSxXQUEyQjtZQUE3RCxTQUFJLEdBQUosSUFBSSxDQUFvQjtZQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFnQjtRQUFHLENBQUM7UUFDckY7Ozs7Ozs7V0FPRztRQUNILDZDQUFjLEdBQWQsVUFBZSxPQUFtQjtZQUFsQyxpQkFXQztZQVZDLElBQU0sYUFBYSxHQUFHLElBQUksNEJBQW9CLEVBQUUsQ0FBQztZQUNqRCxPQUFPLENBQUMsY0FBYyxFQUFFO2lCQUNuQixNQUFNLENBQUMsVUFBQSxVQUFVLElBQUksT0FBQSxzQkFBZSxDQUFDLEtBQUksQ0FBQyxXQUFXLEVBQUUsb0NBQXNCLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBckUsQ0FBcUUsQ0FBQztpQkFDM0YsT0FBTyxDQUFDLFVBQUEsVUFBVTtnQkFDakIsSUFBTSxZQUFZLEdBQUcsS0FBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDckUsSUFBSSxZQUFZLENBQUMsTUFBTSxFQUFFO29CQUN2QixhQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxFQUFDLFVBQVUsWUFBQSxFQUFFLFlBQVksY0FBQSxFQUFDLENBQUMsQ0FBQztpQkFDM0Q7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNQLE9BQU8sYUFBYSxDQUFDO1FBQ3ZCLENBQUM7UUFDSCwyQkFBQztJQUFELENBQUMsQUF0QkQsSUFzQkM7SUF0Qlksb0RBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7YWJzb2x1dGVGcm9tU291cmNlRmlsZSwgQWJzb2x1dGVGc1BhdGh9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge05nY2NSZWZsZWN0aW9uSG9zdCwgU3dpdGNoYWJsZVZhcmlhYmxlRGVjbGFyYXRpb259IGZyb20gJy4uL2hvc3QvbmdjY19ob3N0JztcbmltcG9ydCB7aXNXaXRoaW5QYWNrYWdlfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN3aXRjaE1hcmtlckFuYWx5c2lzIHtcbiAgc291cmNlRmlsZTogdHMuU291cmNlRmlsZTtcbiAgZGVjbGFyYXRpb25zOiBTd2l0Y2hhYmxlVmFyaWFibGVEZWNsYXJhdGlvbltdO1xufVxuXG5leHBvcnQgdHlwZSBTd2l0Y2hNYXJrZXJBbmFseXNlcyA9IE1hcDx0cy5Tb3VyY2VGaWxlLCBTd2l0Y2hNYXJrZXJBbmFseXNpcz47XG5leHBvcnQgY29uc3QgU3dpdGNoTWFya2VyQW5hbHlzZXMgPSBNYXA7XG5cbi8qKlxuICogVGhpcyBBbmFseXplciB3aWxsIGFuYWx5c2UgdGhlIGZpbGVzIHRoYXQgaGF2ZSBhbiBSMyBzd2l0Y2ggbWFya2VyIGluIHRoZW1cbiAqIHRoYXQgd2lsbCBiZSByZXBsYWNlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIFN3aXRjaE1hcmtlckFuYWx5emVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBob3N0OiBOZ2NjUmVmbGVjdGlvbkhvc3QsIHByaXZhdGUgcGFja2FnZVBhdGg6IEFic29sdXRlRnNQYXRoKSB7fVxuICAvKipcbiAgICogQW5hbHl6ZSB0aGUgZmlsZXMgaW4gdGhlIHByb2dyYW0gdG8gaWRlbnRpZnkgZGVjbGFyYXRpb25zIHRoYXQgY29udGFpbiBSM1xuICAgKiBzd2l0Y2ggbWFya2Vycy5cbiAgICogQHBhcmFtIHByb2dyYW0gVGhlIHByb2dyYW0gdG8gYW5hbHl6ZS5cbiAgICogQHJldHVybiBBIG1hcCBvZiBzb3VyY2UgZmlsZXMgdG8gYW5hbHlzaXMgb2JqZWN0cy4gVGhlIG1hcCB3aWxsIGNvbnRhaW4gb25seSB0aGVcbiAgICogc291cmNlIGZpbGVzIHRoYXQgaGFkIHN3aXRjaCBtYXJrZXJzLCBhbmQgdGhlIGFuYWx5c2lzIHdpbGwgY29udGFpbiBhbiBhcnJheSBvZlxuICAgKiB0aGUgZGVjbGFyYXRpb25zIGluIHRoYXQgc291cmNlIGZpbGUgdGhhdCBjb250YWluIHRoZSBtYXJrZXIuXG4gICAqL1xuICBhbmFseXplUHJvZ3JhbShwcm9ncmFtOiB0cy5Qcm9ncmFtKTogU3dpdGNoTWFya2VyQW5hbHlzZXMge1xuICAgIGNvbnN0IGFuYWx5emVkRmlsZXMgPSBuZXcgU3dpdGNoTWFya2VyQW5hbHlzZXMoKTtcbiAgICBwcm9ncmFtLmdldFNvdXJjZUZpbGVzKClcbiAgICAgICAgLmZpbHRlcihzb3VyY2VGaWxlID0+IGlzV2l0aGluUGFja2FnZSh0aGlzLnBhY2thZ2VQYXRoLCBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKHNvdXJjZUZpbGUpKSlcbiAgICAgICAgLmZvckVhY2goc291cmNlRmlsZSA9PiB7XG4gICAgICAgICAgY29uc3QgZGVjbGFyYXRpb25zID0gdGhpcy5ob3N0LmdldFN3aXRjaGFibGVEZWNsYXJhdGlvbnMoc291cmNlRmlsZSk7XG4gICAgICAgICAgaWYgKGRlY2xhcmF0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFuYWx5emVkRmlsZXMuc2V0KHNvdXJjZUZpbGUsIHtzb3VyY2VGaWxlLCBkZWNsYXJhdGlvbnN9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIHJldHVybiBhbmFseXplZEZpbGVzO1xuICB9XG59XG4iXX0=