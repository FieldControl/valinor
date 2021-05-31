(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/locking/async_locker", ["require", "exports", "tslib", "@angular/compiler-cli/ngcc/src/constants"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AsyncLocker = void 0;
    var tslib_1 = require("tslib");
    var constants_1 = require("@angular/compiler-cli/ngcc/src/constants");
    var TimeoutError = /** @class */ (function (_super) {
        tslib_1.__extends(TimeoutError, _super);
        function TimeoutError() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.code = constants_1.NGCC_TIMED_OUT_EXIT_CODE;
            return _this;
        }
        return TimeoutError;
    }(Error));
    /**
     * AsyncLocker is used to prevent more than one instance of ngcc executing at the same time,
     * when being called in an asynchronous context.
     *
     * * When ngcc starts executing, it creates a file in the `compiler-cli/ngcc` folder.
     * * If it finds one is already there then it pauses and waits for the file to be removed by the
     *   other process. If the file is not removed within a set timeout period given by
     *   `retryDelay*retryAttempts` an error is thrown with a suitable error message.
     * * If the process locking the file changes, then we restart the timeout.
     * * When ngcc completes executing, it removes the file so that future ngcc executions can start.
     */
    var AsyncLocker = /** @class */ (function () {
        function AsyncLocker(lockFile, logger, retryDelay, retryAttempts) {
            this.lockFile = lockFile;
            this.logger = logger;
            this.retryDelay = retryDelay;
            this.retryAttempts = retryAttempts;
        }
        /**
         * Run a function guarded by the lock file.
         *
         * @param fn The function to run.
         */
        AsyncLocker.prototype.lock = function (fn) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.create()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, , 4, 5]);
                            return [4 /*yield*/, fn()];
                        case 3: return [2 /*return*/, _a.sent()];
                        case 4:
                            this.lockFile.remove();
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        AsyncLocker.prototype.create = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var pid, attempts, e_1, newPid;
                var _this = this;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            pid = '';
                            attempts = 0;
                            _a.label = 1;
                        case 1:
                            if (!(attempts < this.retryAttempts)) return [3 /*break*/, 6];
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 3, , 5]);
                            return [2 /*return*/, this.lockFile.write()];
                        case 3:
                            e_1 = _a.sent();
                            if (e_1.code !== 'EEXIST') {
                                throw e_1;
                            }
                            newPid = this.lockFile.read();
                            if (newPid !== pid) {
                                // The process locking the file has changed, so restart the timeout
                                attempts = 0;
                                pid = newPid;
                            }
                            if (attempts === 0) {
                                this.logger.info("Another process, with id " + pid + ", is currently running ngcc.\n" +
                                    ("Waiting up to " + this.retryDelay * this.retryAttempts / 1000 + "s for it to finish.\n") +
                                    ("(If you are sure no ngcc process is running then you should delete the lock-file at " + this.lockFile.path + ".)"));
                            }
                            // The file is still locked by another process so wait for a bit and retry
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, _this.retryDelay); })];
                        case 4:
                            // The file is still locked by another process so wait for a bit and retry
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 5:
                            attempts++;
                            return [3 /*break*/, 1];
                        case 6: 
                        // If we fall out of the loop then we ran out of rety attempts
                        throw new TimeoutError("Timed out waiting " + this.retryAttempts * this.retryDelay /
                            1000 + "s for another ngcc process, with id " + pid + ", to complete.\n" +
                            ("(If you are sure no ngcc process is running then you should delete the lock-file at " + this.lockFile.path + ".)"));
                    }
                });
            });
        };
        return AsyncLocker;
    }());
    exports.AsyncLocker = AsyncLocker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfbG9ja2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL2xvY2tpbmcvYXN5bmNfbG9ja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFRQSxzRUFBc0Q7SUFJdEQ7UUFBMkIsd0NBQUs7UUFBaEM7WUFBQSxxRUFFQztZQURDLFVBQUksR0FBRyxvQ0FBd0IsQ0FBQzs7UUFDbEMsQ0FBQztRQUFELG1CQUFDO0lBQUQsQ0FBQyxBQUZELENBQTJCLEtBQUssR0FFL0I7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ0g7UUFDRSxxQkFDWSxRQUFrQixFQUFZLE1BQWMsRUFBVSxVQUFrQixFQUN4RSxhQUFxQjtZQURyQixhQUFRLEdBQVIsUUFBUSxDQUFVO1lBQVksV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUFVLGVBQVUsR0FBVixVQUFVLENBQVE7WUFDeEUsa0JBQWEsR0FBYixhQUFhLENBQVE7UUFBRyxDQUFDO1FBRXJDOzs7O1dBSUc7UUFDRywwQkFBSSxHQUFWLFVBQWMsRUFBb0I7Ozs7Z0NBQ2hDLHFCQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBQTs7NEJBQW5CLFNBQW1CLENBQUM7Ozs7NEJBRVgscUJBQU0sRUFBRSxFQUFFLEVBQUE7Z0NBQWpCLHNCQUFPLFNBQVUsRUFBQzs7NEJBRWxCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7Ozs7OztTQUUxQjtRQUVlLDRCQUFNLEdBQXRCOzs7Ozs7OzRCQUNNLEdBQUcsR0FBVyxFQUFFLENBQUM7NEJBQ1osUUFBUSxHQUFHLENBQUM7OztpQ0FBRSxDQUFBLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFBOzs7OzRCQUVoRCxzQkFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFDOzs7NEJBRTdCLElBQUksR0FBQyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7Z0NBQ3ZCLE1BQU0sR0FBQyxDQUFDOzZCQUNUOzRCQUNLLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDOzRCQUNwQyxJQUFJLE1BQU0sS0FBSyxHQUFHLEVBQUU7Z0NBQ2xCLG1FQUFtRTtnQ0FDbkUsUUFBUSxHQUFHLENBQUMsQ0FBQztnQ0FDYixHQUFHLEdBQUcsTUFBTSxDQUFDOzZCQUNkOzRCQUNELElBQUksUUFBUSxLQUFLLENBQUMsRUFBRTtnQ0FDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ1osOEJBQTRCLEdBQUcsbUNBQWdDO3FDQUMvRCxtQkFBaUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksMEJBQXVCLENBQUE7cUNBQ25GLHlGQUNJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxPQUFJLENBQUEsQ0FBQyxDQUFDOzZCQUNqQzs0QkFDRCwwRUFBMEU7NEJBQzFFLHFCQUFNLElBQUksT0FBTyxDQUFDLFVBQUEsT0FBTyxJQUFJLE9BQUEsVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFJLENBQUMsVUFBVSxDQUFDLEVBQXBDLENBQW9DLENBQUMsRUFBQTs7NEJBRGxFLDBFQUEwRTs0QkFDMUUsU0FBa0UsQ0FBQzs7OzRCQXJCakIsUUFBUSxFQUFFLENBQUE7Ozt3QkF3QmhFLDhEQUE4RDt3QkFDOUQsTUFBTSxJQUFJLFlBQVksQ0FDbEIsdUJBQ0ksSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsVUFBVTs0QkFDcEMsSUFBSSw0Q0FBdUMsR0FBRyxxQkFBa0I7NkJBQ3BFLHlGQUNJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxPQUFJLENBQUEsQ0FBQyxDQUFDOzs7O1NBQ2pDO1FBQ0gsa0JBQUM7SUFBRCxDQUFDLEFBckRELElBcURDO0lBckRZLGtDQUFXIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2xvZ2dpbmcnO1xuaW1wb3J0IHtOR0NDX1RJTUVEX09VVF9FWElUX0NPREV9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmltcG9ydCB7TG9ja0ZpbGV9IGZyb20gJy4vbG9ja19maWxlJztcblxuY2xhc3MgVGltZW91dEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb2RlID0gTkdDQ19USU1FRF9PVVRfRVhJVF9DT0RFO1xufVxuXG4vKipcbiAqIEFzeW5jTG9ja2VyIGlzIHVzZWQgdG8gcHJldmVudCBtb3JlIHRoYW4gb25lIGluc3RhbmNlIG9mIG5nY2MgZXhlY3V0aW5nIGF0IHRoZSBzYW1lIHRpbWUsXG4gKiB3aGVuIGJlaW5nIGNhbGxlZCBpbiBhbiBhc3luY2hyb25vdXMgY29udGV4dC5cbiAqXG4gKiAqIFdoZW4gbmdjYyBzdGFydHMgZXhlY3V0aW5nLCBpdCBjcmVhdGVzIGEgZmlsZSBpbiB0aGUgYGNvbXBpbGVyLWNsaS9uZ2NjYCBmb2xkZXIuXG4gKiAqIElmIGl0IGZpbmRzIG9uZSBpcyBhbHJlYWR5IHRoZXJlIHRoZW4gaXQgcGF1c2VzIGFuZCB3YWl0cyBmb3IgdGhlIGZpbGUgdG8gYmUgcmVtb3ZlZCBieSB0aGVcbiAqICAgb3RoZXIgcHJvY2Vzcy4gSWYgdGhlIGZpbGUgaXMgbm90IHJlbW92ZWQgd2l0aGluIGEgc2V0IHRpbWVvdXQgcGVyaW9kIGdpdmVuIGJ5XG4gKiAgIGByZXRyeURlbGF5KnJldHJ5QXR0ZW1wdHNgIGFuIGVycm9yIGlzIHRocm93biB3aXRoIGEgc3VpdGFibGUgZXJyb3IgbWVzc2FnZS5cbiAqICogSWYgdGhlIHByb2Nlc3MgbG9ja2luZyB0aGUgZmlsZSBjaGFuZ2VzLCB0aGVuIHdlIHJlc3RhcnQgdGhlIHRpbWVvdXQuXG4gKiAqIFdoZW4gbmdjYyBjb21wbGV0ZXMgZXhlY3V0aW5nLCBpdCByZW1vdmVzIHRoZSBmaWxlIHNvIHRoYXQgZnV0dXJlIG5nY2MgZXhlY3V0aW9ucyBjYW4gc3RhcnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBBc3luY0xvY2tlciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBsb2NrRmlsZTogTG9ja0ZpbGUsIHByb3RlY3RlZCBsb2dnZXI6IExvZ2dlciwgcHJpdmF0ZSByZXRyeURlbGF5OiBudW1iZXIsXG4gICAgICBwcml2YXRlIHJldHJ5QXR0ZW1wdHM6IG51bWJlcikge31cblxuICAvKipcbiAgICogUnVuIGEgZnVuY3Rpb24gZ3VhcmRlZCBieSB0aGUgbG9jayBmaWxlLlxuICAgKlxuICAgKiBAcGFyYW0gZm4gVGhlIGZ1bmN0aW9uIHRvIHJ1bi5cbiAgICovXG4gIGFzeW5jIGxvY2s8VD4oZm46ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICBhd2FpdCB0aGlzLmNyZWF0ZSgpO1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgZm4oKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5sb2NrRmlsZS5yZW1vdmUoKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgY3JlYXRlKCkge1xuICAgIGxldCBwaWQ6IHN0cmluZyA9ICcnO1xuICAgIGZvciAobGV0IGF0dGVtcHRzID0gMDsgYXR0ZW1wdHMgPCB0aGlzLnJldHJ5QXR0ZW1wdHM7IGF0dGVtcHRzKyspIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvY2tGaWxlLndyaXRlKCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChlLmNvZGUgIT09ICdFRVhJU1QnKSB7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZXdQaWQgPSB0aGlzLmxvY2tGaWxlLnJlYWQoKTtcbiAgICAgICAgaWYgKG5ld1BpZCAhPT0gcGlkKSB7XG4gICAgICAgICAgLy8gVGhlIHByb2Nlc3MgbG9ja2luZyB0aGUgZmlsZSBoYXMgY2hhbmdlZCwgc28gcmVzdGFydCB0aGUgdGltZW91dFxuICAgICAgICAgIGF0dGVtcHRzID0gMDtcbiAgICAgICAgICBwaWQgPSBuZXdQaWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGF0dGVtcHRzID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5sb2dnZXIuaW5mbyhcbiAgICAgICAgICAgICAgYEFub3RoZXIgcHJvY2Vzcywgd2l0aCBpZCAke3BpZH0sIGlzIGN1cnJlbnRseSBydW5uaW5nIG5nY2MuXFxuYCArXG4gICAgICAgICAgICAgIGBXYWl0aW5nIHVwIHRvICR7dGhpcy5yZXRyeURlbGF5ICogdGhpcy5yZXRyeUF0dGVtcHRzIC8gMTAwMH1zIGZvciBpdCB0byBmaW5pc2guXFxuYCArXG4gICAgICAgICAgICAgIGAoSWYgeW91IGFyZSBzdXJlIG5vIG5nY2MgcHJvY2VzcyBpcyBydW5uaW5nIHRoZW4geW91IHNob3VsZCBkZWxldGUgdGhlIGxvY2stZmlsZSBhdCAke1xuICAgICAgICAgICAgICAgICAgdGhpcy5sb2NrRmlsZS5wYXRofS4pYCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVGhlIGZpbGUgaXMgc3RpbGwgbG9ja2VkIGJ5IGFub3RoZXIgcHJvY2VzcyBzbyB3YWl0IGZvciBhIGJpdCBhbmQgcmV0cnlcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIHRoaXMucmV0cnlEZWxheSkpO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBJZiB3ZSBmYWxsIG91dCBvZiB0aGUgbG9vcCB0aGVuIHdlIHJhbiBvdXQgb2YgcmV0eSBhdHRlbXB0c1xuICAgIHRocm93IG5ldyBUaW1lb3V0RXJyb3IoXG4gICAgICAgIGBUaW1lZCBvdXQgd2FpdGluZyAke1xuICAgICAgICAgICAgdGhpcy5yZXRyeUF0dGVtcHRzICogdGhpcy5yZXRyeURlbGF5IC9cbiAgICAgICAgICAgIDEwMDB9cyBmb3IgYW5vdGhlciBuZ2NjIHByb2Nlc3MsIHdpdGggaWQgJHtwaWR9LCB0byBjb21wbGV0ZS5cXG5gICtcbiAgICAgICAgYChJZiB5b3UgYXJlIHN1cmUgbm8gbmdjYyBwcm9jZXNzIGlzIHJ1bm5pbmcgdGhlbiB5b3Ugc2hvdWxkIGRlbGV0ZSB0aGUgbG9jay1maWxlIGF0ICR7XG4gICAgICAgICAgICB0aGlzLmxvY2tGaWxlLnBhdGh9LilgKTtcbiAgfVxufVxuIl19