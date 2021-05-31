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
        define("@angular/compiler-cli/src/ngtsc/logging/testing/src/mock_logger", ["require", "exports", "@angular/compiler-cli/src/ngtsc/logging"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MockLogger = void 0;
    var __1 = require("@angular/compiler-cli/src/ngtsc/logging");
    var MockLogger = /** @class */ (function () {
        function MockLogger(level) {
            if (level === void 0) { level = __1.LogLevel.info; }
            this.level = level;
            this.logs = {
                debug: [],
                info: [],
                warn: [],
                error: [],
            };
        }
        MockLogger.prototype.debug = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this.logs.debug.push(args);
        };
        MockLogger.prototype.info = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this.logs.info.push(args);
        };
        MockLogger.prototype.warn = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this.logs.warn.push(args);
        };
        MockLogger.prototype.error = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this.logs.error.push(args);
        };
        return MockLogger;
    }());
    exports.MockLogger = MockLogger;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19sb2dnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2xvZ2dpbmcvdGVzdGluZy9zcmMvbW9ja19sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsNkRBQXVDO0lBRXZDO1FBQ0Usb0JBQW1CLEtBQXFCO1lBQXJCLHNCQUFBLEVBQUEsUUFBUSxZQUFRLENBQUMsSUFBSTtZQUFyQixVQUFLLEdBQUwsS0FBSyxDQUFnQjtZQUV4QyxTQUFJLEdBQXdEO2dCQUMxRCxLQUFLLEVBQUUsRUFBRTtnQkFDVCxJQUFJLEVBQUUsRUFBRTtnQkFDUixJQUFJLEVBQUUsRUFBRTtnQkFDUixLQUFLLEVBQUUsRUFBRTthQUNWLENBQUM7UUFQeUMsQ0FBQztRQVE1QywwQkFBSyxHQUFMO1lBQU0sY0FBaUI7aUJBQWpCLFVBQWlCLEVBQWpCLHFCQUFpQixFQUFqQixJQUFpQjtnQkFBakIseUJBQWlCOztZQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUNELHlCQUFJLEdBQUo7WUFBSyxjQUFpQjtpQkFBakIsVUFBaUIsRUFBakIscUJBQWlCLEVBQWpCLElBQWlCO2dCQUFqQix5QkFBaUI7O1lBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBQ0QseUJBQUksR0FBSjtZQUFLLGNBQWlCO2lCQUFqQixVQUFpQixFQUFqQixxQkFBaUIsRUFBakIsSUFBaUI7Z0JBQWpCLHlCQUFpQjs7WUFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFDRCwwQkFBSyxHQUFMO1lBQU0sY0FBaUI7aUJBQWpCLFVBQWlCLEVBQWpCLHFCQUFpQixFQUFqQixJQUFpQjtnQkFBakIseUJBQWlCOztZQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUNILGlCQUFDO0lBQUQsQ0FBQyxBQXJCRCxJQXFCQztJQXJCWSxnQ0FBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xvZ2dlciwgTG9nTGV2ZWx9IGZyb20gJy4uLy4uJztcblxuZXhwb3J0IGNsYXNzIE1vY2tMb2dnZXIgaW1wbGVtZW50cyBMb2dnZXIge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbGV2ZWwgPSBMb2dMZXZlbC5pbmZvKSB7fVxuXG4gIGxvZ3M6IHtbUCBpbiBFeGNsdWRlPGtleW9mIExvZ2dlciwgJ2xldmVsJz5dOiBzdHJpbmdbXVtdfSA9IHtcbiAgICBkZWJ1ZzogW10sXG4gICAgaW5mbzogW10sXG4gICAgd2FybjogW10sXG4gICAgZXJyb3I6IFtdLFxuICB9O1xuICBkZWJ1ZyguLi5hcmdzOiBzdHJpbmdbXSkge1xuICAgIHRoaXMubG9ncy5kZWJ1Zy5wdXNoKGFyZ3MpO1xuICB9XG4gIGluZm8oLi4uYXJnczogc3RyaW5nW10pIHtcbiAgICB0aGlzLmxvZ3MuaW5mby5wdXNoKGFyZ3MpO1xuICB9XG4gIHdhcm4oLi4uYXJnczogc3RyaW5nW10pIHtcbiAgICB0aGlzLmxvZ3Mud2Fybi5wdXNoKGFyZ3MpO1xuICB9XG4gIGVycm9yKC4uLmFyZ3M6IHN0cmluZ1tdKSB7XG4gICAgdGhpcy5sb2dzLmVycm9yLnB1c2goYXJncyk7XG4gIH1cbn1cbiJdfQ==