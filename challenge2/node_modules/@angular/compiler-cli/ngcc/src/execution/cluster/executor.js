(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/execution/cluster/executor", ["require", "exports", "tslib", "@angular/compiler-cli/ngcc/src/execution/cluster/master"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClusterExecutor = void 0;
    var tslib_1 = require("tslib");
    var master_1 = require("@angular/compiler-cli/ngcc/src/execution/cluster/master");
    /**
     * An `Executor` that processes tasks in parallel (on multiple processes) and completes
     * asynchronously.
     */
    var ClusterExecutor = /** @class */ (function () {
        function ClusterExecutor(workerCount, fileSystem, logger, fileWriter, pkgJsonUpdater, lockFile, createTaskCompletedCallback) {
            this.workerCount = workerCount;
            this.fileSystem = fileSystem;
            this.logger = logger;
            this.fileWriter = fileWriter;
            this.pkgJsonUpdater = pkgJsonUpdater;
            this.lockFile = lockFile;
            this.createTaskCompletedCallback = createTaskCompletedCallback;
        }
        ClusterExecutor.prototype.execute = function (analyzeEntryPoints, _createCompileFn) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _this = this;
                return tslib_1.__generator(this, function (_a) {
                    return [2 /*return*/, this.lockFile.lock(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var master;
                            return tslib_1.__generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        this.logger.debug("Running ngcc on " + this.constructor.name + " (using " + this.workerCount + " worker processes).");
                                        master = new master_1.ClusterMaster(this.workerCount, this.fileSystem, this.logger, this.fileWriter, this.pkgJsonUpdater, analyzeEntryPoints, this.createTaskCompletedCallback);
                                        return [4 /*yield*/, master.run()];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); })];
                });
            });
        };
        return ClusterExecutor;
    }());
    exports.ClusterExecutor = ClusterExecutor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlY3V0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvZXhlY3V0aW9uL2NsdXN0ZXIvZXhlY3V0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQWVBLGtGQUF1QztJQUV2Qzs7O09BR0c7SUFDSDtRQUNFLHlCQUNZLFdBQW1CLEVBQVUsVUFBNEIsRUFBVSxNQUFjLEVBQ2pGLFVBQXNCLEVBQVUsY0FBa0MsRUFDbEUsUUFBcUIsRUFDckIsMkJBQXdEO1lBSHhELGdCQUFXLEdBQVgsV0FBVyxDQUFRO1lBQVUsZUFBVSxHQUFWLFVBQVUsQ0FBa0I7WUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQ2pGLGVBQVUsR0FBVixVQUFVLENBQVk7WUFBVSxtQkFBYyxHQUFkLGNBQWMsQ0FBb0I7WUFDbEUsYUFBUSxHQUFSLFFBQVEsQ0FBYTtZQUNyQixnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQTZCO1FBQUcsQ0FBQztRQUVsRSxpQ0FBTyxHQUFiLFVBQWMsa0JBQXdDLEVBQUUsZ0JBQWlDOzs7O29CQUV2RixzQkFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQzs7Ozs7d0NBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUNiLHFCQUFtQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksZ0JBQVcsSUFBSSxDQUFDLFdBQVcsd0JBQXFCLENBQUMsQ0FBQzt3Q0FDeEYsTUFBTSxHQUFHLElBQUksc0JBQWEsQ0FDNUIsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUNwRixrQkFBa0IsRUFBRSxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQzt3Q0FDbkQscUJBQU0sTUFBTSxDQUFDLEdBQUcsRUFBRSxFQUFBOzRDQUF6QixzQkFBTyxTQUFrQixFQUFDOzs7NkJBQzNCLENBQUMsRUFBQzs7O1NBQ0o7UUFDSCxzQkFBQztJQUFELENBQUMsQUFsQkQsSUFrQkM7SUFsQlksMENBQWUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7UGF0aE1hbmlwdWxhdGlvbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7TG9nZ2VyfSBmcm9tICcuLi8uLi8uLi8uLi9zcmMvbmd0c2MvbG9nZ2luZyc7XG5pbXBvcnQge0FzeW5jTG9ja2VyfSBmcm9tICcuLi8uLi9sb2NraW5nL2FzeW5jX2xvY2tlcic7XG5pbXBvcnQge0ZpbGVXcml0ZXJ9IGZyb20gJy4uLy4uL3dyaXRpbmcvZmlsZV93cml0ZXInO1xuaW1wb3J0IHtQYWNrYWdlSnNvblVwZGF0ZXJ9IGZyb20gJy4uLy4uL3dyaXRpbmcvcGFja2FnZV9qc29uX3VwZGF0ZXInO1xuaW1wb3J0IHtBbmFseXplRW50cnlQb2ludHNGbiwgQ3JlYXRlQ29tcGlsZUZuLCBFeGVjdXRvcn0gZnJvbSAnLi4vYXBpJztcbmltcG9ydCB7Q3JlYXRlVGFza0NvbXBsZXRlZENhbGxiYWNrfSBmcm9tICcuLi90YXNrcy9hcGknO1xuXG5pbXBvcnQge0NsdXN0ZXJNYXN0ZXJ9IGZyb20gJy4vbWFzdGVyJztcblxuLyoqXG4gKiBBbiBgRXhlY3V0b3JgIHRoYXQgcHJvY2Vzc2VzIHRhc2tzIGluIHBhcmFsbGVsIChvbiBtdWx0aXBsZSBwcm9jZXNzZXMpIGFuZCBjb21wbGV0ZXNcbiAqIGFzeW5jaHJvbm91c2x5LlxuICovXG5leHBvcnQgY2xhc3MgQ2x1c3RlckV4ZWN1dG9yIGltcGxlbWVudHMgRXhlY3V0b3Ige1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgd29ya2VyQ291bnQ6IG51bWJlciwgcHJpdmF0ZSBmaWxlU3lzdGVtOiBQYXRoTWFuaXB1bGF0aW9uLCBwcml2YXRlIGxvZ2dlcjogTG9nZ2VyLFxuICAgICAgcHJpdmF0ZSBmaWxlV3JpdGVyOiBGaWxlV3JpdGVyLCBwcml2YXRlIHBrZ0pzb25VcGRhdGVyOiBQYWNrYWdlSnNvblVwZGF0ZXIsXG4gICAgICBwcml2YXRlIGxvY2tGaWxlOiBBc3luY0xvY2tlcixcbiAgICAgIHByaXZhdGUgY3JlYXRlVGFza0NvbXBsZXRlZENhbGxiYWNrOiBDcmVhdGVUYXNrQ29tcGxldGVkQ2FsbGJhY2spIHt9XG5cbiAgYXN5bmMgZXhlY3V0ZShhbmFseXplRW50cnlQb2ludHM6IEFuYWx5emVFbnRyeVBvaW50c0ZuLCBfY3JlYXRlQ29tcGlsZUZuOiBDcmVhdGVDb21waWxlRm4pOlxuICAgICAgUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMubG9ja0ZpbGUubG9jayhhc3luYyAoKSA9PiB7XG4gICAgICB0aGlzLmxvZ2dlci5kZWJ1ZyhcbiAgICAgICAgICBgUnVubmluZyBuZ2NjIG9uICR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSAodXNpbmcgJHt0aGlzLndvcmtlckNvdW50fSB3b3JrZXIgcHJvY2Vzc2VzKS5gKTtcbiAgICAgIGNvbnN0IG1hc3RlciA9IG5ldyBDbHVzdGVyTWFzdGVyKFxuICAgICAgICAgIHRoaXMud29ya2VyQ291bnQsIHRoaXMuZmlsZVN5c3RlbSwgdGhpcy5sb2dnZXIsIHRoaXMuZmlsZVdyaXRlciwgdGhpcy5wa2dKc29uVXBkYXRlcixcbiAgICAgICAgICBhbmFseXplRW50cnlQb2ludHMsIHRoaXMuY3JlYXRlVGFza0NvbXBsZXRlZENhbGxiYWNrKTtcbiAgICAgIHJldHVybiBhd2FpdCBtYXN0ZXIucnVuKCk7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==