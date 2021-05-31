(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/analysis/private_declarations_analyzer", ["require", "exports", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PrivateDeclarationsAnalyzer = void 0;
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/utils");
    /**
     * This class will analyze a program to find all the declared classes
     * (i.e. on an NgModule) that are not publicly exported via an entry-point.
     */
    var PrivateDeclarationsAnalyzer = /** @class */ (function () {
        function PrivateDeclarationsAnalyzer(host, referencesRegistry) {
            this.host = host;
            this.referencesRegistry = referencesRegistry;
        }
        PrivateDeclarationsAnalyzer.prototype.analyzeProgram = function (program) {
            var rootFiles = this.getRootFiles(program);
            return this.getPrivateDeclarations(rootFiles, this.referencesRegistry.getDeclarationMap());
        };
        PrivateDeclarationsAnalyzer.prototype.getRootFiles = function (program) {
            return program.getRootFileNames().map(function (f) { return program.getSourceFile(f); }).filter(utils_1.isDefined);
        };
        PrivateDeclarationsAnalyzer.prototype.getPrivateDeclarations = function (rootFiles, declarations) {
            var _this = this;
            var privateDeclarations = new Map(declarations);
            rootFiles.forEach(function (f) {
                var exports = _this.host.getExportsOfModule(f);
                if (exports) {
                    exports.forEach(function (declaration, exportedName) {
                        if (declaration.node !== null && utils_1.hasNameIdentifier(declaration.node)) {
                            if (privateDeclarations.has(declaration.node.name)) {
                                var privateDeclaration = privateDeclarations.get(declaration.node.name);
                                if (privateDeclaration.node !== declaration.node) {
                                    throw new Error(declaration.node.name.text + " is declared multiple times.");
                                }
                                // This declaration is public so we can remove it from the list
                                privateDeclarations.delete(declaration.node.name);
                            }
                        }
                    });
                }
            });
            return Array.from(privateDeclarations.keys()).map(function (id) {
                var from = file_system_1.absoluteFromSourceFile(id.getSourceFile());
                var declaration = privateDeclarations.get(id);
                var dtsDeclaration = _this.host.getDtsDeclaration(declaration.node);
                var dtsFrom = dtsDeclaration && file_system_1.absoluteFromSourceFile(dtsDeclaration.getSourceFile());
                return { identifier: id.text, from: from, dtsFrom: dtsFrom };
            });
        };
        return PrivateDeclarationsAnalyzer;
    }());
    exports.PrivateDeclarationsAnalyzer = PrivateDeclarationsAnalyzer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpdmF0ZV9kZWNsYXJhdGlvbnNfYW5hbHl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvYW5hbHlzaXMvcHJpdmF0ZV9kZWNsYXJhdGlvbnNfYW5hbHl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBU0EsMkVBQXNGO0lBR3RGLDhEQUFzRDtJQVd0RDs7O09BR0c7SUFDSDtRQUNFLHFDQUNZLElBQXdCLEVBQVUsa0JBQTBDO1lBQTVFLFNBQUksR0FBSixJQUFJLENBQW9CO1lBQVUsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUF3QjtRQUFHLENBQUM7UUFFNUYsb0RBQWMsR0FBZCxVQUFlLE9BQW1CO1lBQ2hDLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0MsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7UUFDN0YsQ0FBQztRQUVPLGtEQUFZLEdBQXBCLFVBQXFCLE9BQW1CO1lBQ3RDLE9BQU8sT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBeEIsQ0FBd0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxpQkFBUyxDQUFDLENBQUM7UUFDekYsQ0FBQztRQUVPLDREQUFzQixHQUE5QixVQUNJLFNBQTBCLEVBQzFCLFlBQTZDO1lBRmpELGlCQStCQztZQTVCQyxJQUFNLG1CQUFtQixHQUFvQyxJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVuRixTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQztnQkFDakIsSUFBTSxPQUFPLEdBQUcsS0FBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxPQUFPLEVBQUU7b0JBQ1gsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFdBQVcsRUFBRSxZQUFZO3dCQUN4QyxJQUFJLFdBQVcsQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLHlCQUFpQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTs0QkFDcEUsSUFBSSxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtnQ0FDbEQsSUFBTSxrQkFBa0IsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUUsQ0FBQztnQ0FDM0UsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDLElBQUksRUFBRTtvQ0FDaEQsTUFBTSxJQUFJLEtBQUssQ0FBSSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLGlDQUE4QixDQUFDLENBQUM7aUNBQzlFO2dDQUNELCtEQUErRDtnQ0FDL0QsbUJBQW1CLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7NkJBQ25EO3lCQUNGO29CQUNILENBQUMsQ0FBQyxDQUFDO2lCQUNKO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxFQUFFO2dCQUNsRCxJQUFNLElBQUksR0FBRyxvQ0FBc0IsQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztnQkFDeEQsSUFBTSxXQUFXLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBRSxDQUFDO2dCQUNqRCxJQUFNLGNBQWMsR0FBRyxLQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckUsSUFBTSxPQUFPLEdBQUcsY0FBYyxJQUFJLG9DQUFzQixDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO2dCQUV6RixPQUFPLEVBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxNQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztZQUM5QyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFDSCxrQ0FBQztJQUFELENBQUMsQUE3Q0QsSUE2Q0M7SUE3Q1ksa0VBQTJCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHthYnNvbHV0ZUZyb21Tb3VyY2VGaWxlLCBBYnNvbHV0ZUZzUGF0aH0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7RGVjbGFyYXRpb259IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9yZWZsZWN0aW9uJztcbmltcG9ydCB7TmdjY1JlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi9ob3N0L25nY2NfaG9zdCc7XG5pbXBvcnQge2hhc05hbWVJZGVudGlmaWVyLCBpc0RlZmluZWR9IGZyb20gJy4uL3V0aWxzJztcblxuaW1wb3J0IHtOZ2NjUmVmZXJlbmNlc1JlZ2lzdHJ5fSBmcm9tICcuL25nY2NfcmVmZXJlbmNlc19yZWdpc3RyeSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXhwb3J0SW5mbyB7XG4gIGlkZW50aWZpZXI6IHN0cmluZztcbiAgZnJvbTogQWJzb2x1dGVGc1BhdGg7XG4gIGR0c0Zyb20/OiBBYnNvbHV0ZUZzUGF0aHxudWxsO1xufVxuZXhwb3J0IHR5cGUgUHJpdmF0ZURlY2xhcmF0aW9uc0FuYWx5c2VzID0gRXhwb3J0SW5mb1tdO1xuXG4vKipcbiAqIFRoaXMgY2xhc3Mgd2lsbCBhbmFseXplIGEgcHJvZ3JhbSB0byBmaW5kIGFsbCB0aGUgZGVjbGFyZWQgY2xhc3Nlc1xuICogKGkuZS4gb24gYW4gTmdNb2R1bGUpIHRoYXQgYXJlIG5vdCBwdWJsaWNseSBleHBvcnRlZCB2aWEgYW4gZW50cnktcG9pbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBQcml2YXRlRGVjbGFyYXRpb25zQW5hbHl6ZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgaG9zdDogTmdjY1JlZmxlY3Rpb25Ib3N0LCBwcml2YXRlIHJlZmVyZW5jZXNSZWdpc3RyeTogTmdjY1JlZmVyZW5jZXNSZWdpc3RyeSkge31cblxuICBhbmFseXplUHJvZ3JhbShwcm9ncmFtOiB0cy5Qcm9ncmFtKTogUHJpdmF0ZURlY2xhcmF0aW9uc0FuYWx5c2VzIHtcbiAgICBjb25zdCByb290RmlsZXMgPSB0aGlzLmdldFJvb3RGaWxlcyhwcm9ncmFtKTtcbiAgICByZXR1cm4gdGhpcy5nZXRQcml2YXRlRGVjbGFyYXRpb25zKHJvb3RGaWxlcywgdGhpcy5yZWZlcmVuY2VzUmVnaXN0cnkuZ2V0RGVjbGFyYXRpb25NYXAoKSk7XG4gIH1cblxuICBwcml2YXRlIGdldFJvb3RGaWxlcyhwcm9ncmFtOiB0cy5Qcm9ncmFtKTogdHMuU291cmNlRmlsZVtdIHtcbiAgICByZXR1cm4gcHJvZ3JhbS5nZXRSb290RmlsZU5hbWVzKCkubWFwKGYgPT4gcHJvZ3JhbS5nZXRTb3VyY2VGaWxlKGYpKS5maWx0ZXIoaXNEZWZpbmVkKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UHJpdmF0ZURlY2xhcmF0aW9ucyhcbiAgICAgIHJvb3RGaWxlczogdHMuU291cmNlRmlsZVtdLFxuICAgICAgZGVjbGFyYXRpb25zOiBNYXA8dHMuSWRlbnRpZmllciwgRGVjbGFyYXRpb24+KTogUHJpdmF0ZURlY2xhcmF0aW9uc0FuYWx5c2VzIHtcbiAgICBjb25zdCBwcml2YXRlRGVjbGFyYXRpb25zOiBNYXA8dHMuSWRlbnRpZmllciwgRGVjbGFyYXRpb24+ID0gbmV3IE1hcChkZWNsYXJhdGlvbnMpO1xuXG4gICAgcm9vdEZpbGVzLmZvckVhY2goZiA9PiB7XG4gICAgICBjb25zdCBleHBvcnRzID0gdGhpcy5ob3N0LmdldEV4cG9ydHNPZk1vZHVsZShmKTtcbiAgICAgIGlmIChleHBvcnRzKSB7XG4gICAgICAgIGV4cG9ydHMuZm9yRWFjaCgoZGVjbGFyYXRpb24sIGV4cG9ydGVkTmFtZSkgPT4ge1xuICAgICAgICAgIGlmIChkZWNsYXJhdGlvbi5ub2RlICE9PSBudWxsICYmIGhhc05hbWVJZGVudGlmaWVyKGRlY2xhcmF0aW9uLm5vZGUpKSB7XG4gICAgICAgICAgICBpZiAocHJpdmF0ZURlY2xhcmF0aW9ucy5oYXMoZGVjbGFyYXRpb24ubm9kZS5uYW1lKSkge1xuICAgICAgICAgICAgICBjb25zdCBwcml2YXRlRGVjbGFyYXRpb24gPSBwcml2YXRlRGVjbGFyYXRpb25zLmdldChkZWNsYXJhdGlvbi5ub2RlLm5hbWUpITtcbiAgICAgICAgICAgICAgaWYgKHByaXZhdGVEZWNsYXJhdGlvbi5ub2RlICE9PSBkZWNsYXJhdGlvbi5ub2RlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2RlY2xhcmF0aW9uLm5vZGUubmFtZS50ZXh0fSBpcyBkZWNsYXJlZCBtdWx0aXBsZSB0aW1lcy5gKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBUaGlzIGRlY2xhcmF0aW9uIGlzIHB1YmxpYyBzbyB3ZSBjYW4gcmVtb3ZlIGl0IGZyb20gdGhlIGxpc3RcbiAgICAgICAgICAgICAgcHJpdmF0ZURlY2xhcmF0aW9ucy5kZWxldGUoZGVjbGFyYXRpb24ubm9kZS5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIEFycmF5LmZyb20ocHJpdmF0ZURlY2xhcmF0aW9ucy5rZXlzKCkpLm1hcChpZCA9PiB7XG4gICAgICBjb25zdCBmcm9tID0gYWJzb2x1dGVGcm9tU291cmNlRmlsZShpZC5nZXRTb3VyY2VGaWxlKCkpO1xuICAgICAgY29uc3QgZGVjbGFyYXRpb24gPSBwcml2YXRlRGVjbGFyYXRpb25zLmdldChpZCkhO1xuICAgICAgY29uc3QgZHRzRGVjbGFyYXRpb24gPSB0aGlzLmhvc3QuZ2V0RHRzRGVjbGFyYXRpb24oZGVjbGFyYXRpb24ubm9kZSk7XG4gICAgICBjb25zdCBkdHNGcm9tID0gZHRzRGVjbGFyYXRpb24gJiYgYWJzb2x1dGVGcm9tU291cmNlRmlsZShkdHNEZWNsYXJhdGlvbi5nZXRTb3VyY2VGaWxlKCkpO1xuXG4gICAgICByZXR1cm4ge2lkZW50aWZpZXI6IGlkLnRleHQsIGZyb20sIGR0c0Zyb219O1xuICAgIH0pO1xuICB9XG59XG4iXX0=