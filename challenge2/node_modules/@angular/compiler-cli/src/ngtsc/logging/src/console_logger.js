(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/logging/src/console_logger", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/logging/src/logger"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConsoleLogger = exports.ERROR = exports.WARN = exports.DEBUG = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var logger_1 = require("@angular/compiler-cli/src/ngtsc/logging/src/logger");
    var RESET = '\x1b[0m';
    var RED = '\x1b[31m';
    var YELLOW = '\x1b[33m';
    var BLUE = '\x1b[36m';
    exports.DEBUG = BLUE + "Debug:" + RESET;
    exports.WARN = YELLOW + "Warning:" + RESET;
    exports.ERROR = RED + "Error:" + RESET;
    /**
     * A simple logger that outputs directly to the Console.
     *
     * The log messages can be filtered based on severity via the `logLevel`
     * constructor parameter.
     */
    var ConsoleLogger = /** @class */ (function () {
        function ConsoleLogger(level) {
            this.level = level;
        }
        ConsoleLogger.prototype.debug = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (this.level <= logger_1.LogLevel.debug)
                console.debug.apply(console, tslib_1.__spreadArray([exports.DEBUG], tslib_1.__read(args)));
        };
        ConsoleLogger.prototype.info = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (this.level <= logger_1.LogLevel.info)
                console.info.apply(console, tslib_1.__spreadArray([], tslib_1.__read(args)));
        };
        ConsoleLogger.prototype.warn = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (this.level <= logger_1.LogLevel.warn)
                console.warn.apply(console, tslib_1.__spreadArray([exports.WARN], tslib_1.__read(args)));
        };
        ConsoleLogger.prototype.error = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (this.level <= logger_1.LogLevel.error)
                console.error.apply(console, tslib_1.__spreadArray([exports.ERROR], tslib_1.__read(args)));
        };
        return ConsoleLogger;
    }());
    exports.ConsoleLogger = ConsoleLogger;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZV9sb2dnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2xvZ2dpbmcvc3JjL2NvbnNvbGVfbG9nZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw2RUFBMEM7SUFFMUMsSUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDO0lBQ3hCLElBQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQztJQUN2QixJQUFNLE1BQU0sR0FBRyxVQUFVLENBQUM7SUFDMUIsSUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDO0lBRVgsUUFBQSxLQUFLLEdBQU0sSUFBSSxjQUFTLEtBQU8sQ0FBQztJQUNoQyxRQUFBLElBQUksR0FBTSxNQUFNLGdCQUFXLEtBQU8sQ0FBQztJQUNuQyxRQUFBLEtBQUssR0FBTSxHQUFHLGNBQVMsS0FBTyxDQUFDO0lBRTVDOzs7OztPQUtHO0lBQ0g7UUFDRSx1QkFBbUIsS0FBZTtZQUFmLFVBQUssR0FBTCxLQUFLLENBQVU7UUFBRyxDQUFDO1FBQ3RDLDZCQUFLLEdBQUw7WUFBTSxjQUFpQjtpQkFBakIsVUFBaUIsRUFBakIscUJBQWlCLEVBQWpCLElBQWlCO2dCQUFqQix5QkFBaUI7O1lBQ3JCLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxpQkFBUSxDQUFDLEtBQUs7Z0JBQUUsT0FBTyxDQUFDLEtBQUssT0FBYixPQUFPLHlCQUFPLGFBQUssa0JBQUssSUFBSSxJQUFFO1FBQ2xFLENBQUM7UUFDRCw0QkFBSSxHQUFKO1lBQUssY0FBaUI7aUJBQWpCLFVBQWlCLEVBQWpCLHFCQUFpQixFQUFqQixJQUFpQjtnQkFBakIseUJBQWlCOztZQUNwQixJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksaUJBQVEsQ0FBQyxJQUFJO2dCQUFFLE9BQU8sQ0FBQyxJQUFJLE9BQVosT0FBTywyQ0FBUyxJQUFJLElBQUU7UUFDekQsQ0FBQztRQUNELDRCQUFJLEdBQUo7WUFBSyxjQUFpQjtpQkFBakIsVUFBaUIsRUFBakIscUJBQWlCLEVBQWpCLElBQWlCO2dCQUFqQix5QkFBaUI7O1lBQ3BCLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxpQkFBUSxDQUFDLElBQUk7Z0JBQUUsT0FBTyxDQUFDLElBQUksT0FBWixPQUFPLHlCQUFNLFlBQUksa0JBQUssSUFBSSxJQUFFO1FBQy9ELENBQUM7UUFDRCw2QkFBSyxHQUFMO1lBQU0sY0FBaUI7aUJBQWpCLFVBQWlCLEVBQWpCLHFCQUFpQixFQUFqQixJQUFpQjtnQkFBakIseUJBQWlCOztZQUNyQixJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksaUJBQVEsQ0FBQyxLQUFLO2dCQUFFLE9BQU8sQ0FBQyxLQUFLLE9BQWIsT0FBTyx5QkFBTyxhQUFLLGtCQUFLLElBQUksSUFBRTtRQUNsRSxDQUFDO1FBQ0gsb0JBQUM7SUFBRCxDQUFDLEFBZEQsSUFjQztJQWRZLHNDQUFhIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0xvZ2dlciwgTG9nTGV2ZWx9IGZyb20gJy4vbG9nZ2VyJztcblxuY29uc3QgUkVTRVQgPSAnXFx4MWJbMG0nO1xuY29uc3QgUkVEID0gJ1xceDFiWzMxbSc7XG5jb25zdCBZRUxMT1cgPSAnXFx4MWJbMzNtJztcbmNvbnN0IEJMVUUgPSAnXFx4MWJbMzZtJztcblxuZXhwb3J0IGNvbnN0IERFQlVHID0gYCR7QkxVRX1EZWJ1Zzoke1JFU0VUfWA7XG5leHBvcnQgY29uc3QgV0FSTiA9IGAke1lFTExPV31XYXJuaW5nOiR7UkVTRVR9YDtcbmV4cG9ydCBjb25zdCBFUlJPUiA9IGAke1JFRH1FcnJvcjoke1JFU0VUfWA7XG5cbi8qKlxuICogQSBzaW1wbGUgbG9nZ2VyIHRoYXQgb3V0cHV0cyBkaXJlY3RseSB0byB0aGUgQ29uc29sZS5cbiAqXG4gKiBUaGUgbG9nIG1lc3NhZ2VzIGNhbiBiZSBmaWx0ZXJlZCBiYXNlZCBvbiBzZXZlcml0eSB2aWEgdGhlIGBsb2dMZXZlbGBcbiAqIGNvbnN0cnVjdG9yIHBhcmFtZXRlci5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbnNvbGVMb2dnZXIgaW1wbGVtZW50cyBMb2dnZXIge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbGV2ZWw6IExvZ0xldmVsKSB7fVxuICBkZWJ1ZyguLi5hcmdzOiBzdHJpbmdbXSkge1xuICAgIGlmICh0aGlzLmxldmVsIDw9IExvZ0xldmVsLmRlYnVnKSBjb25zb2xlLmRlYnVnKERFQlVHLCAuLi5hcmdzKTtcbiAgfVxuICBpbmZvKC4uLmFyZ3M6IHN0cmluZ1tdKSB7XG4gICAgaWYgKHRoaXMubGV2ZWwgPD0gTG9nTGV2ZWwuaW5mbykgY29uc29sZS5pbmZvKC4uLmFyZ3MpO1xuICB9XG4gIHdhcm4oLi4uYXJnczogc3RyaW5nW10pIHtcbiAgICBpZiAodGhpcy5sZXZlbCA8PSBMb2dMZXZlbC53YXJuKSBjb25zb2xlLndhcm4oV0FSTiwgLi4uYXJncyk7XG4gIH1cbiAgZXJyb3IoLi4uYXJnczogc3RyaW5nW10pIHtcbiAgICBpZiAodGhpcy5sZXZlbCA8PSBMb2dMZXZlbC5lcnJvcikgY29uc29sZS5lcnJvcihFUlJPUiwgLi4uYXJncyk7XG4gIH1cbn1cbiJdfQ==