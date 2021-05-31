/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="node" />
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/execution/cluster/worker", ["require", "exports", "tslib", "cluster", "@angular/compiler-cli/ngcc/src/command_line_options", "@angular/compiler-cli/ngcc/src/ngcc_options", "@angular/compiler-cli/ngcc/src/execution/create_compile_function", "@angular/compiler-cli/ngcc/src/execution/tasks/utils", "@angular/compiler-cli/ngcc/src/execution/cluster/package_json_updater", "@angular/compiler-cli/ngcc/src/execution/cluster/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.startWorker = void 0;
    var tslib_1 = require("tslib");
    var cluster = require("cluster");
    var command_line_options_1 = require("@angular/compiler-cli/ngcc/src/command_line_options");
    var ngcc_options_1 = require("@angular/compiler-cli/ngcc/src/ngcc_options");
    var create_compile_function_1 = require("@angular/compiler-cli/ngcc/src/execution/create_compile_function");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/execution/tasks/utils");
    var package_json_updater_1 = require("@angular/compiler-cli/ngcc/src/execution/cluster/package_json_updater");
    var utils_2 = require("@angular/compiler-cli/ngcc/src/execution/cluster/utils");
    // Cluster worker entry point
    if (require.main === module) {
        (function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var _a, logger, pathMappings, enableI18nLegacyMessageIdFormat, fileSystem, tsConfig, getFileWriter, pkgJsonUpdater, fileWriter, createCompileFn, e_1;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        process.title = 'ngcc (worker)';
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        _a = ngcc_options_1.getSharedSetup(command_line_options_1.parseCommandLineOptions(process.argv.slice(2))), logger = _a.logger, pathMappings = _a.pathMappings, enableI18nLegacyMessageIdFormat = _a.enableI18nLegacyMessageIdFormat, fileSystem = _a.fileSystem, tsConfig = _a.tsConfig, getFileWriter = _a.getFileWriter;
                        pkgJsonUpdater = new package_json_updater_1.ClusterWorkerPackageJsonUpdater();
                        fileWriter = getFileWriter(pkgJsonUpdater);
                        createCompileFn = create_compile_function_1.getCreateCompileFn(fileSystem, logger, fileWriter, enableI18nLegacyMessageIdFormat, tsConfig, pathMappings);
                        return [4 /*yield*/, startWorker(logger, createCompileFn)];
                    case 2:
                        _b.sent();
                        process.exitCode = 0;
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _b.sent();
                        console.error(e_1.stack || e_1.message);
                        process.exit(1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); })();
    }
    function startWorker(logger, createCompileFn) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var compile;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                if (cluster.isMaster) {
                    throw new Error('Tried to run cluster worker on the master process.');
                }
                compile = createCompileFn(function (transformedFiles) { return utils_2.sendMessageToMaster({
                    type: 'transformed-files',
                    files: transformedFiles.map(function (f) { return f.path; }),
                }); }, function (_task, outcome, message) { return utils_2.sendMessageToMaster({ type: 'task-completed', outcome: outcome, message: message }); });
                // Listen for `ProcessTaskMessage`s and process tasks.
                cluster.worker.on('message', function (msg) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var _a, err_1, _b;
                    return tslib_1.__generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _c.trys.push([0, 5, , 10]);
                                _a = msg.type;
                                switch (_a) {
                                    case 'process-task': return [3 /*break*/, 1];
                                }
                                return [3 /*break*/, 3];
                            case 1:
                                logger.debug("[Worker #" + cluster.worker.id + "] Processing task: " + utils_1.stringifyTask(msg.task));
                                return [4 /*yield*/, compile(msg.task)];
                            case 2: return [2 /*return*/, _c.sent()];
                            case 3: throw new Error("[Worker #" + cluster.worker.id + "] Invalid message received: " + JSON.stringify(msg));
                            case 4: return [3 /*break*/, 10];
                            case 5:
                                err_1 = _c.sent();
                                _b = err_1 && err_1.code;
                                switch (_b) {
                                    case 'ENOMEM': return [3 /*break*/, 6];
                                }
                                return [3 /*break*/, 7];
                            case 6:
                                // Not being able to allocate enough memory is not necessarily a problem with processing
                                // the current task. It could just mean that there are too many tasks being processed
                                // simultaneously.
                                //
                                // Exit with an error and let the cluster master decide how to handle this.
                                logger.warn("[Worker #" + cluster.worker.id + "] " + (err_1.stack || err_1.message));
                                return [2 /*return*/, process.exit(1)];
                            case 7: return [4 /*yield*/, utils_2.sendMessageToMaster({
                                    type: 'error',
                                    error: (err_1 instanceof Error) ? (err_1.stack || err_1.message) : err_1,
                                })];
                            case 8:
                                _c.sent();
                                _c.label = 9;
                            case 9: return [3 /*break*/, 10];
                            case 10: return [2 /*return*/];
                        }
                    });
                }); });
                // Return a promise that is never resolved.
                return [2 /*return*/, new Promise(function () { return undefined; })];
            });
        });
    }
    exports.startWorker = startWorker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL2V4ZWN1dGlvbi9jbHVzdGVyL3dvcmtlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCw4QkFBOEI7Ozs7Ozs7Ozs7Ozs7O0lBRTlCLGlDQUFtQztJQUduQyw0RkFBbUU7SUFDbkUsNEVBQWtEO0lBRWxELDRHQUE4RDtJQUM5RCw4RUFBNkM7SUFHN0MsOEdBQXVFO0lBQ3ZFLGdGQUE0QztJQUU1Qyw2QkFBNkI7SUFDN0IsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtRQUMzQixDQUFDOzs7Ozt3QkFDQyxPQUFPLENBQUMsS0FBSyxHQUFHLGVBQWUsQ0FBQzs7Ozt3QkFHeEIsS0FPRiw2QkFBYyxDQUFDLDhDQUF1QixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFOaEUsTUFBTSxZQUFBLEVBQ04sWUFBWSxrQkFBQSxFQUNaLCtCQUErQixxQ0FBQSxFQUMvQixVQUFVLGdCQUFBLEVBQ1YsUUFBUSxjQUFBLEVBQ1IsYUFBYSxtQkFBQSxDQUNvRDt3QkFLN0QsY0FBYyxHQUFHLElBQUksc0RBQStCLEVBQUUsQ0FBQzt3QkFDdkQsVUFBVSxHQUFHLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQzt3QkFHM0MsZUFBZSxHQUFHLDRDQUFrQixDQUN0QyxVQUFVLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSwrQkFBK0IsRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7d0JBRTdGLHFCQUFNLFdBQVcsQ0FBQyxNQUFNLEVBQUUsZUFBZSxDQUFDLEVBQUE7O3dCQUExQyxTQUEwQyxDQUFDO3dCQUMzQyxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQzs7Ozt3QkFFckIsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFDLENBQUMsS0FBSyxJQUFJLEdBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDcEMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7YUFFbkIsQ0FBQyxFQUFFLENBQUM7S0FDTjtJQUVELFNBQXNCLFdBQVcsQ0FBQyxNQUFjLEVBQUUsZUFBZ0M7Ozs7O2dCQUNoRixJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7b0JBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQztpQkFDdkU7Z0JBRUssT0FBTyxHQUFHLGVBQWUsQ0FDM0IsVUFBQSxnQkFBZ0IsSUFBSSxPQUFBLDJCQUFtQixDQUFDO29CQUN0QyxJQUFJLEVBQUUsbUJBQW1CO29CQUN6QixLQUFLLEVBQUUsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksRUFBTixDQUFNLENBQUM7aUJBQ3pDLENBQUMsRUFIa0IsQ0FHbEIsRUFDRixVQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxJQUFLLE9BQUEsMkJBQW1CLENBQUMsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxTQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQyxFQUEvRCxDQUErRCxDQUFDLENBQUM7Z0JBR2xHLHNEQUFzRDtnQkFDdEQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQU8sR0FBb0I7Ozs7OztnQ0FFNUMsS0FBQSxHQUFHLENBQUMsSUFBSSxDQUFBOzt5Q0FDVCxjQUFjLENBQUMsQ0FBZix3QkFBYzs7OztnQ0FDakIsTUFBTSxDQUFDLEtBQUssQ0FDUixjQUFZLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSwyQkFBc0IscUJBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFHLENBQUMsQ0FBQztnQ0FDM0UscUJBQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBQTtvQ0FBOUIsc0JBQU8sU0FBdUIsRUFBQztvQ0FFL0IsTUFBTSxJQUFJLEtBQUssQ0FDWCxjQUFZLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxvQ0FBK0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUcsQ0FBQyxDQUFDOzs7O2dDQUduRixLQUFBLEtBQUcsSUFBSSxLQUFHLENBQUMsSUFBSSxDQUFBOzt5Q0FDaEIsUUFBUSxDQUFDLENBQVQsd0JBQVE7Ozs7Z0NBQ1gsd0ZBQXdGO2dDQUN4RixxRkFBcUY7Z0NBQ3JGLGtCQUFrQjtnQ0FDbEIsRUFBRTtnQ0FDRiwyRUFBMkU7Z0NBQzNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBWSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsV0FBSyxLQUFHLENBQUMsS0FBSyxJQUFJLEtBQUcsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFDO2dDQUMxRSxzQkFBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFDO29DQUV2QixxQkFBTSwyQkFBbUIsQ0FBQztvQ0FDeEIsSUFBSSxFQUFFLE9BQU87b0NBQ2IsS0FBSyxFQUFFLENBQUMsS0FBRyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUcsQ0FBQyxLQUFLLElBQUksS0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFHO2lDQUNqRSxDQUFDLEVBQUE7O2dDQUhGLFNBR0UsQ0FBQzs7Ozs7O3FCQUdWLENBQUMsQ0FBQztnQkFFSCwyQ0FBMkM7Z0JBQzNDLHNCQUFPLElBQUksT0FBTyxDQUFDLGNBQU0sT0FBQSxTQUFTLEVBQVQsQ0FBUyxDQUFDLEVBQUM7OztLQUNyQztJQTlDRCxrQ0E4Q0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwibm9kZVwiIC8+XG5cbmltcG9ydCAqIGFzIGNsdXN0ZXIgZnJvbSAnY2x1c3Rlcic7XG5cbmltcG9ydCB7TG9nZ2VyfSBmcm9tICcuLi8uLi8uLi8uLi9zcmMvbmd0c2MvbG9nZ2luZyc7XG5pbXBvcnQge3BhcnNlQ29tbWFuZExpbmVPcHRpb25zfSBmcm9tICcuLi8uLi9jb21tYW5kX2xpbmVfb3B0aW9ucyc7XG5pbXBvcnQge2dldFNoYXJlZFNldHVwfSBmcm9tICcuLi8uLi9uZ2NjX29wdGlvbnMnO1xuaW1wb3J0IHtDcmVhdGVDb21waWxlRm59IGZyb20gJy4uL2FwaSc7XG5pbXBvcnQge2dldENyZWF0ZUNvbXBpbGVGbn0gZnJvbSAnLi4vY3JlYXRlX2NvbXBpbGVfZnVuY3Rpb24nO1xuaW1wb3J0IHtzdHJpbmdpZnlUYXNrfSBmcm9tICcuLi90YXNrcy91dGlscyc7XG5cbmltcG9ydCB7TWVzc2FnZVRvV29ya2VyfSBmcm9tICcuL2FwaSc7XG5pbXBvcnQge0NsdXN0ZXJXb3JrZXJQYWNrYWdlSnNvblVwZGF0ZXJ9IGZyb20gJy4vcGFja2FnZV9qc29uX3VwZGF0ZXInO1xuaW1wb3J0IHtzZW5kTWVzc2FnZVRvTWFzdGVyfSBmcm9tICcuL3V0aWxzJztcblxuLy8gQ2x1c3RlciB3b3JrZXIgZW50cnkgcG9pbnRcbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICAoYXN5bmMgKCkgPT4ge1xuICAgIHByb2Nlc3MudGl0bGUgPSAnbmdjYyAod29ya2VyKSc7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBsb2dnZXIsXG4gICAgICAgIHBhdGhNYXBwaW5ncyxcbiAgICAgICAgZW5hYmxlSTE4bkxlZ2FjeU1lc3NhZ2VJZEZvcm1hdCxcbiAgICAgICAgZmlsZVN5c3RlbSxcbiAgICAgICAgdHNDb25maWcsXG4gICAgICAgIGdldEZpbGVXcml0ZXIsXG4gICAgICB9ID0gZ2V0U2hhcmVkU2V0dXAocGFyc2VDb21tYW5kTGluZU9wdGlvbnMocHJvY2Vzcy5hcmd2LnNsaWNlKDIpKSk7XG5cbiAgICAgIC8vIE5PVEU6IFRvIGF2b2lkIGZpbGUgY29ycnVwdGlvbiwgYG5nY2NgIGludm9jYXRpb24gb25seSBjcmVhdGVzIF9vbmVfIGluc3RhbmNlIG9mXG4gICAgICAvLyBgUGFja2FnZUpzb25VcGRhdGVyYCB0aGF0IGFjdHVhbGx5IHdyaXRlcyB0byBkaXNrIChhY3Jvc3MgYWxsIHByb2Nlc3NlcykuXG4gICAgICAvLyBJbiBjbHVzdGVyIHdvcmtlcnMgd2UgdXNlIGEgYFBhY2thZ2VKc29uVXBkYXRlcmAgdGhhdCBkZWxlZ2F0ZXMgdG8gdGhlIGNsdXN0ZXIgbWFzdGVyLlxuICAgICAgY29uc3QgcGtnSnNvblVwZGF0ZXIgPSBuZXcgQ2x1c3RlcldvcmtlclBhY2thZ2VKc29uVXBkYXRlcigpO1xuICAgICAgY29uc3QgZmlsZVdyaXRlciA9IGdldEZpbGVXcml0ZXIocGtnSnNvblVwZGF0ZXIpO1xuXG4gICAgICAvLyBUaGUgZnVuY3Rpb24gZm9yIGNyZWF0aW5nIHRoZSBgY29tcGlsZSgpYCBmdW5jdGlvbi5cbiAgICAgIGNvbnN0IGNyZWF0ZUNvbXBpbGVGbiA9IGdldENyZWF0ZUNvbXBpbGVGbihcbiAgICAgICAgICBmaWxlU3lzdGVtLCBsb2dnZXIsIGZpbGVXcml0ZXIsIGVuYWJsZUkxOG5MZWdhY3lNZXNzYWdlSWRGb3JtYXQsIHRzQ29uZmlnLCBwYXRoTWFwcGluZ3MpO1xuXG4gICAgICBhd2FpdCBzdGFydFdvcmtlcihsb2dnZXIsIGNyZWF0ZUNvbXBpbGVGbik7XG4gICAgICBwcm9jZXNzLmV4aXRDb2RlID0gMDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUuc3RhY2sgfHwgZS5tZXNzYWdlKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG4gIH0pKCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydFdvcmtlcihsb2dnZXI6IExvZ2dlciwgY3JlYXRlQ29tcGlsZUZuOiBDcmVhdGVDb21waWxlRm4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgaWYgKGNsdXN0ZXIuaXNNYXN0ZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyaWVkIHRvIHJ1biBjbHVzdGVyIHdvcmtlciBvbiB0aGUgbWFzdGVyIHByb2Nlc3MuJyk7XG4gIH1cblxuICBjb25zdCBjb21waWxlID0gY3JlYXRlQ29tcGlsZUZuKFxuICAgICAgdHJhbnNmb3JtZWRGaWxlcyA9PiBzZW5kTWVzc2FnZVRvTWFzdGVyKHtcbiAgICAgICAgdHlwZTogJ3RyYW5zZm9ybWVkLWZpbGVzJyxcbiAgICAgICAgZmlsZXM6IHRyYW5zZm9ybWVkRmlsZXMubWFwKGYgPT4gZi5wYXRoKSxcbiAgICAgIH0pLFxuICAgICAgKF90YXNrLCBvdXRjb21lLCBtZXNzYWdlKSA9PiBzZW5kTWVzc2FnZVRvTWFzdGVyKHt0eXBlOiAndGFzay1jb21wbGV0ZWQnLCBvdXRjb21lLCBtZXNzYWdlfSkpO1xuXG5cbiAgLy8gTGlzdGVuIGZvciBgUHJvY2Vzc1Rhc2tNZXNzYWdlYHMgYW5kIHByb2Nlc3MgdGFza3MuXG4gIGNsdXN0ZXIud29ya2VyLm9uKCdtZXNzYWdlJywgYXN5bmMgKG1zZzogTWVzc2FnZVRvV29ya2VyKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIHN3aXRjaCAobXNnLnR5cGUpIHtcbiAgICAgICAgY2FzZSAncHJvY2Vzcy10YXNrJzpcbiAgICAgICAgICBsb2dnZXIuZGVidWcoXG4gICAgICAgICAgICAgIGBbV29ya2VyICMke2NsdXN0ZXIud29ya2VyLmlkfV0gUHJvY2Vzc2luZyB0YXNrOiAke3N0cmluZ2lmeVRhc2sobXNnLnRhc2spfWApO1xuICAgICAgICAgIHJldHVybiBhd2FpdCBjb21waWxlKG1zZy50YXNrKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIGBbV29ya2VyICMke2NsdXN0ZXIud29ya2VyLmlkfV0gSW52YWxpZCBtZXNzYWdlIHJlY2VpdmVkOiAke0pTT04uc3RyaW5naWZ5KG1zZyl9YCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBzd2l0Y2ggKGVyciAmJiBlcnIuY29kZSkge1xuICAgICAgICBjYXNlICdFTk9NRU0nOlxuICAgICAgICAgIC8vIE5vdCBiZWluZyBhYmxlIHRvIGFsbG9jYXRlIGVub3VnaCBtZW1vcnkgaXMgbm90IG5lY2Vzc2FyaWx5IGEgcHJvYmxlbSB3aXRoIHByb2Nlc3NpbmdcbiAgICAgICAgICAvLyB0aGUgY3VycmVudCB0YXNrLiBJdCBjb3VsZCBqdXN0IG1lYW4gdGhhdCB0aGVyZSBhcmUgdG9vIG1hbnkgdGFza3MgYmVpbmcgcHJvY2Vzc2VkXG4gICAgICAgICAgLy8gc2ltdWx0YW5lb3VzbHkuXG4gICAgICAgICAgLy9cbiAgICAgICAgICAvLyBFeGl0IHdpdGggYW4gZXJyb3IgYW5kIGxldCB0aGUgY2x1c3RlciBtYXN0ZXIgZGVjaWRlIGhvdyB0byBoYW5kbGUgdGhpcy5cbiAgICAgICAgICBsb2dnZXIud2FybihgW1dvcmtlciAjJHtjbHVzdGVyLndvcmtlci5pZH1dICR7ZXJyLnN0YWNrIHx8IGVyci5tZXNzYWdlfWApO1xuICAgICAgICAgIHJldHVybiBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgYXdhaXQgc2VuZE1lc3NhZ2VUb01hc3Rlcih7XG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgZXJyb3I6IChlcnIgaW5zdGFuY2VvZiBFcnJvcikgPyAoZXJyLnN0YWNrIHx8IGVyci5tZXNzYWdlKSA6IGVycixcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIC8vIFJldHVybiBhIHByb21pc2UgdGhhdCBpcyBuZXZlciByZXNvbHZlZC5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKCgpID0+IHVuZGVmaW5lZCk7XG59XG4iXX0=