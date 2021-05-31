(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/src/file_linker/linker_environment", ["require", "exports", "@angular/compiler-cli/src/ngtsc/sourcemaps", "@angular/compiler-cli/linker/src/file_linker/linker_options", "@angular/compiler-cli/linker/src/file_linker/translator"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LinkerEnvironment = void 0;
    var sourcemaps_1 = require("@angular/compiler-cli/src/ngtsc/sourcemaps");
    var linker_options_1 = require("@angular/compiler-cli/linker/src/file_linker/linker_options");
    var translator_1 = require("@angular/compiler-cli/linker/src/file_linker/translator");
    var LinkerEnvironment = /** @class */ (function () {
        function LinkerEnvironment(fileSystem, logger, host, factory, options) {
            this.fileSystem = fileSystem;
            this.logger = logger;
            this.host = host;
            this.factory = factory;
            this.options = options;
            this.translator = new translator_1.Translator(this.factory);
            this.sourceFileLoader = this.options.sourceMapping ? new sourcemaps_1.SourceFileLoader(this.fileSystem, this.logger, {}) : null;
        }
        LinkerEnvironment.create = function (fileSystem, logger, host, factory, options) {
            var _a, _b, _c;
            return new LinkerEnvironment(fileSystem, logger, host, factory, {
                sourceMapping: (_a = options.sourceMapping) !== null && _a !== void 0 ? _a : linker_options_1.DEFAULT_LINKER_OPTIONS.sourceMapping,
                linkerJitMode: (_b = options.linkerJitMode) !== null && _b !== void 0 ? _b : linker_options_1.DEFAULT_LINKER_OPTIONS.linkerJitMode,
                unknownDeclarationVersionHandling: (_c = options.unknownDeclarationVersionHandling) !== null && _c !== void 0 ? _c : linker_options_1.DEFAULT_LINKER_OPTIONS.unknownDeclarationVersionHandling,
            });
        };
        return LinkerEnvironment;
    }());
    exports.LinkerEnvironment = LinkerEnvironment;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlua2VyX2Vudmlyb25tZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL2xpbmtlci9zcmMvZmlsZV9saW5rZXIvbGlua2VyX2Vudmlyb25tZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQVNBLHlFQUErRDtJQUkvRCw4RkFBdUU7SUFDdkUsc0ZBQXdDO0lBRXhDO1FBS0UsMkJBQ2EsVUFBOEIsRUFBVyxNQUFjLEVBQ3ZELElBQTBCLEVBQVcsT0FBNEMsRUFDakYsT0FBc0I7WUFGdEIsZUFBVSxHQUFWLFVBQVUsQ0FBb0I7WUFBVyxXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQ3ZELFNBQUksR0FBSixJQUFJLENBQXNCO1lBQVcsWUFBTyxHQUFQLE9BQU8sQ0FBcUM7WUFDakYsWUFBTyxHQUFQLE9BQU8sQ0FBZTtZQVAxQixlQUFVLEdBQUcsSUFBSSx1QkFBVSxDQUEwQixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkUscUJBQWdCLEdBQ3JCLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLDZCQUFnQixDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBS3pELENBQUM7UUFFaEMsd0JBQU0sR0FBYixVQUNJLFVBQThCLEVBQUUsTUFBYyxFQUFFLElBQTBCLEVBQzFFLE9BQTRDLEVBQzVDLE9BQStCOztZQUNqQyxPQUFPLElBQUksaUJBQWlCLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO2dCQUM5RCxhQUFhLEVBQUUsTUFBQSxPQUFPLENBQUMsYUFBYSxtQ0FBSSx1Q0FBc0IsQ0FBQyxhQUFhO2dCQUM1RSxhQUFhLEVBQUUsTUFBQSxPQUFPLENBQUMsYUFBYSxtQ0FBSSx1Q0FBc0IsQ0FBQyxhQUFhO2dCQUM1RSxpQ0FBaUMsRUFBRSxNQUFBLE9BQU8sQ0FBQyxpQ0FBaUMsbUNBQ3hFLHVDQUFzQixDQUFDLGlDQUFpQzthQUM3RCxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0gsd0JBQUM7SUFBRCxDQUFDLEFBckJELElBcUJDO0lBckJZLDhDQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtSZWFkb25seUZpbGVTeXN0ZW19IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2xvZ2dpbmcnO1xuaW1wb3J0IHtTb3VyY2VGaWxlTG9hZGVyfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2Mvc291cmNlbWFwcyc7XG5pbXBvcnQge0FzdEZhY3Rvcnl9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy90cmFuc2xhdG9yJztcblxuaW1wb3J0IHtBc3RIb3N0fSBmcm9tICcuLi9hc3QvYXN0X2hvc3QnO1xuaW1wb3J0IHtERUZBVUxUX0xJTktFUl9PUFRJT05TLCBMaW5rZXJPcHRpb25zfSBmcm9tICcuL2xpbmtlcl9vcHRpb25zJztcbmltcG9ydCB7VHJhbnNsYXRvcn0gZnJvbSAnLi90cmFuc2xhdG9yJztcblxuZXhwb3J0IGNsYXNzIExpbmtlckVudmlyb25tZW50PFRTdGF0ZW1lbnQsIFRFeHByZXNzaW9uPiB7XG4gIHJlYWRvbmx5IHRyYW5zbGF0b3IgPSBuZXcgVHJhbnNsYXRvcjxUU3RhdGVtZW50LCBURXhwcmVzc2lvbj4odGhpcy5mYWN0b3J5KTtcbiAgcmVhZG9ubHkgc291cmNlRmlsZUxvYWRlciA9XG4gICAgICB0aGlzLm9wdGlvbnMuc291cmNlTWFwcGluZyA/IG5ldyBTb3VyY2VGaWxlTG9hZGVyKHRoaXMuZmlsZVN5c3RlbSwgdGhpcy5sb2dnZXIsIHt9KSA6IG51bGw7XG5cbiAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcbiAgICAgIHJlYWRvbmx5IGZpbGVTeXN0ZW06IFJlYWRvbmx5RmlsZVN5c3RlbSwgcmVhZG9ubHkgbG9nZ2VyOiBMb2dnZXIsXG4gICAgICByZWFkb25seSBob3N0OiBBc3RIb3N0PFRFeHByZXNzaW9uPiwgcmVhZG9ubHkgZmFjdG9yeTogQXN0RmFjdG9yeTxUU3RhdGVtZW50LCBURXhwcmVzc2lvbj4sXG4gICAgICByZWFkb25seSBvcHRpb25zOiBMaW5rZXJPcHRpb25zKSB7fVxuXG4gIHN0YXRpYyBjcmVhdGU8VFN0YXRlbWVudCwgVEV4cHJlc3Npb24+KFxuICAgICAgZmlsZVN5c3RlbTogUmVhZG9ubHlGaWxlU3lzdGVtLCBsb2dnZXI6IExvZ2dlciwgaG9zdDogQXN0SG9zdDxURXhwcmVzc2lvbj4sXG4gICAgICBmYWN0b3J5OiBBc3RGYWN0b3J5PFRTdGF0ZW1lbnQsIFRFeHByZXNzaW9uPixcbiAgICAgIG9wdGlvbnM6IFBhcnRpYWw8TGlua2VyT3B0aW9ucz4pOiBMaW5rZXJFbnZpcm9ubWVudDxUU3RhdGVtZW50LCBURXhwcmVzc2lvbj4ge1xuICAgIHJldHVybiBuZXcgTGlua2VyRW52aXJvbm1lbnQoZmlsZVN5c3RlbSwgbG9nZ2VyLCBob3N0LCBmYWN0b3J5LCB7XG4gICAgICBzb3VyY2VNYXBwaW5nOiBvcHRpb25zLnNvdXJjZU1hcHBpbmcgPz8gREVGQVVMVF9MSU5LRVJfT1BUSU9OUy5zb3VyY2VNYXBwaW5nLFxuICAgICAgbGlua2VySml0TW9kZTogb3B0aW9ucy5saW5rZXJKaXRNb2RlID8/IERFRkFVTFRfTElOS0VSX09QVElPTlMubGlua2VySml0TW9kZSxcbiAgICAgIHVua25vd25EZWNsYXJhdGlvblZlcnNpb25IYW5kbGluZzogb3B0aW9ucy51bmtub3duRGVjbGFyYXRpb25WZXJzaW9uSGFuZGxpbmcgPz9cbiAgICAgICAgICBERUZBVUxUX0xJTktFUl9PUFRJT05TLnVua25vd25EZWNsYXJhdGlvblZlcnNpb25IYW5kbGluZyxcbiAgICB9KTtcbiAgfVxufVxuIl19