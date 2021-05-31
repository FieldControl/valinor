(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/src/ast/ast_value", ["require", "exports", "tslib", "@angular/compiler", "@angular/compiler-cli/linker/src/fatal_linker_error"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AstValue = exports.AstObject = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var o = require("@angular/compiler");
    var fatal_linker_error_1 = require("@angular/compiler-cli/linker/src/fatal_linker_error");
    /**
     * This helper class wraps an object expression along with an `AstHost` object, exposing helper
     * methods that make it easier to extract the properties of the object.
     *
     * The generic `T` is used as reference type of the expected structure that is represented by this
     * object. It does not achieve full type-safety for the provided operations in correspondence with
     * `T`; its main goal is to provide references to a documented type and ensure that the properties
     * that are read from the object are present.
     *
     * Unfortunately, the generic types are unable to prevent reading an optional property from the
     * object without first having called `has` to ensure that the property exists. This is one example
     * of where full type-safety is not achieved.
     */
    var AstObject = /** @class */ (function () {
        function AstObject(expression, obj, host) {
            this.expression = expression;
            this.obj = obj;
            this.host = host;
        }
        /**
         * Create a new `AstObject` from the given `expression` and `host`.
         */
        AstObject.parse = function (expression, host) {
            var obj = host.parseObjectLiteral(expression);
            return new AstObject(expression, obj, host);
        };
        /**
         * Returns true if the object has a property called `propertyName`.
         */
        AstObject.prototype.has = function (propertyName) {
            return this.obj.has(propertyName);
        };
        /**
         * Returns the number value of the property called `propertyName`.
         *
         * Throws an error if there is no such property or the property is not a number.
         */
        AstObject.prototype.getNumber = function (propertyName) {
            return this.host.parseNumericLiteral(this.getRequiredProperty(propertyName));
        };
        /**
         * Returns the string value of the property called `propertyName`.
         *
         * Throws an error if there is no such property or the property is not a string.
         */
        AstObject.prototype.getString = function (propertyName) {
            return this.host.parseStringLiteral(this.getRequiredProperty(propertyName));
        };
        /**
         * Returns the boolean value of the property called `propertyName`.
         *
         * Throws an error if there is no such property or the property is not a boolean.
         */
        AstObject.prototype.getBoolean = function (propertyName) {
            return this.host.parseBooleanLiteral(this.getRequiredProperty(propertyName));
        };
        /**
         * Returns the nested `AstObject` parsed from the property called `propertyName`.
         *
         * Throws an error if there is no such property or the property is not an object.
         */
        AstObject.prototype.getObject = function (propertyName) {
            var expr = this.getRequiredProperty(propertyName);
            var obj = this.host.parseObjectLiteral(expr);
            return new AstObject(expr, obj, this.host);
        };
        /**
         * Returns an array of `AstValue` objects parsed from the property called `propertyName`.
         *
         * Throws an error if there is no such property or the property is not an array.
         */
        AstObject.prototype.getArray = function (propertyName) {
            var _this = this;
            var arr = this.host.parseArrayLiteral(this.getRequiredProperty(propertyName));
            return arr.map(function (entry) { return new AstValue(entry, _this.host); });
        };
        /**
         * Returns a `WrappedNodeExpr` object that wraps the expression at the property called
         * `propertyName`.
         *
         * Throws an error if there is no such property.
         */
        AstObject.prototype.getOpaque = function (propertyName) {
            return new o.WrappedNodeExpr(this.getRequiredProperty(propertyName));
        };
        /**
         * Returns the raw `TExpression` value of the property called `propertyName`.
         *
         * Throws an error if there is no such property.
         */
        AstObject.prototype.getNode = function (propertyName) {
            return this.getRequiredProperty(propertyName);
        };
        /**
         * Returns an `AstValue` that wraps the value of the property called `propertyName`.
         *
         * Throws an error if there is no such property.
         */
        AstObject.prototype.getValue = function (propertyName) {
            return new AstValue(this.getRequiredProperty(propertyName), this.host);
        };
        /**
         * Converts the AstObject to a raw JavaScript object, mapping each property value (as an
         * `AstValue`) to the generic type (`T`) via the `mapper` function.
         */
        AstObject.prototype.toLiteral = function (mapper) {
            var e_1, _a;
            var result = {};
            try {
                for (var _b = tslib_1.__values(this.obj), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = tslib_1.__read(_c.value, 2), key = _d[0], expression = _d[1];
                    result[key] = mapper(new AstValue(expression, this.host));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return result;
        };
        /**
         * Converts the AstObject to a JavaScript Map, mapping each property value (as an
         * `AstValue`) to the generic type (`T`) via the `mapper` function.
         */
        AstObject.prototype.toMap = function (mapper) {
            var e_2, _a;
            var result = new Map();
            try {
                for (var _b = tslib_1.__values(this.obj), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = tslib_1.__read(_c.value, 2), key = _d[0], expression = _d[1];
                    result.set(key, mapper(new AstValue(expression, this.host)));
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return result;
        };
        AstObject.prototype.getRequiredProperty = function (propertyName) {
            if (!this.obj.has(propertyName)) {
                throw new fatal_linker_error_1.FatalLinkerError(this.expression, "Expected property '" + propertyName + "' to be present.");
            }
            return this.obj.get(propertyName);
        };
        return AstObject;
    }());
    exports.AstObject = AstObject;
    /**
     * This helper class wraps an `expression`, exposing methods that use the `host` to give
     * access to the underlying value of the wrapped expression.
     *
     * The generic `T` is used as reference type of the expected type that is represented by this value.
     * It does not achieve full type-safety for the provided operations in correspondence with `T`; its
     * main goal is to provide references to a documented type.
     */
    var AstValue = /** @class */ (function () {
        function AstValue(expression, host) {
            this.expression = expression;
            this.host = host;
        }
        /**
         * Get the name of the symbol represented by the given expression node, or `null` if it is not a
         * symbol.
         */
        AstValue.prototype.getSymbolName = function () {
            return this.host.getSymbolName(this.expression);
        };
        /**
         * Is this value a number?
         */
        AstValue.prototype.isNumber = function () {
            return this.host.isNumericLiteral(this.expression);
        };
        /**
         * Parse the number from this value, or error if it is not a number.
         */
        AstValue.prototype.getNumber = function () {
            return this.host.parseNumericLiteral(this.expression);
        };
        /**
         * Is this value a string?
         */
        AstValue.prototype.isString = function () {
            return this.host.isStringLiteral(this.expression);
        };
        /**
         * Parse the string from this value, or error if it is not a string.
         */
        AstValue.prototype.getString = function () {
            return this.host.parseStringLiteral(this.expression);
        };
        /**
         * Is this value a boolean?
         */
        AstValue.prototype.isBoolean = function () {
            return this.host.isBooleanLiteral(this.expression);
        };
        /**
         * Parse the boolean from this value, or error if it is not a boolean.
         */
        AstValue.prototype.getBoolean = function () {
            return this.host.parseBooleanLiteral(this.expression);
        };
        /**
         * Is this value an object literal?
         */
        AstValue.prototype.isObject = function () {
            return this.host.isObjectLiteral(this.expression);
        };
        /**
         * Parse this value into an `AstObject`, or error if it is not an object literal.
         */
        AstValue.prototype.getObject = function () {
            return AstObject.parse(this.expression, this.host);
        };
        /**
         * Is this value an array literal?
         */
        AstValue.prototype.isArray = function () {
            return this.host.isArrayLiteral(this.expression);
        };
        /**
         * Parse this value into an array of `AstValue` objects, or error if it is not an array literal.
         */
        AstValue.prototype.getArray = function () {
            var _this = this;
            var arr = this.host.parseArrayLiteral(this.expression);
            return arr.map(function (entry) { return new AstValue(entry, _this.host); });
        };
        /**
         * Is this value a function expression?
         */
        AstValue.prototype.isFunction = function () {
            return this.host.isFunctionExpression(this.expression);
        };
        /**
         * Extract the return value as an `AstValue` from this value as a function expression, or error if
         * it is not a function expression.
         */
        AstValue.prototype.getFunctionReturnValue = function () {
            return new AstValue(this.host.parseReturnValue(this.expression), this.host);
        };
        AstValue.prototype.isCallExpression = function () {
            return this.host.isCallExpression(this.expression);
        };
        AstValue.prototype.getCallee = function () {
            return new AstValue(this.host.parseCallee(this.expression), this.host);
        };
        AstValue.prototype.getArguments = function () {
            var _this = this;
            var args = this.host.parseArguments(this.expression);
            return args.map(function (arg) { return new AstValue(arg, _this.host); });
        };
        /**
         * Return the `TExpression` of this value wrapped in a `WrappedNodeExpr`.
         */
        AstValue.prototype.getOpaque = function () {
            return new o.WrappedNodeExpr(this.expression);
        };
        /**
         * Get the range of the location of this value in the original source.
         */
        AstValue.prototype.getRange = function () {
            return this.host.getRange(this.expression);
        };
        return AstValue;
    }());
    exports.AstValue = AstValue;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN0X3ZhbHVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL2xpbmtlci9zcmMvYXN0L2FzdF92YWx1ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gscUNBQXVDO0lBQ3ZDLDBGQUF1RDtJQW9DdkQ7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0g7UUFVRSxtQkFDYSxVQUF1QixFQUFVLEdBQTZCLEVBQy9ELElBQTBCO1lBRHpCLGVBQVUsR0FBVixVQUFVLENBQWE7WUFBVSxRQUFHLEdBQUgsR0FBRyxDQUEwQjtZQUMvRCxTQUFJLEdBQUosSUFBSSxDQUFzQjtRQUFHLENBQUM7UUFYMUM7O1dBRUc7UUFDSSxlQUFLLEdBQVosVUFBNEMsVUFBdUIsRUFBRSxJQUEwQjtZQUU3RixJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDaEQsT0FBTyxJQUFJLFNBQVMsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFNRDs7V0FFRztRQUNILHVCQUFHLEdBQUgsVUFBSSxZQUE0QjtZQUM5QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsNkJBQVMsR0FBVCxVQUEwRSxZQUFlO1lBRXZGLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILDZCQUFTLEdBQVQsVUFBMEUsWUFBZTtZQUV2RixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFlB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LENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUVELG1DQUFnQixHQUFoQjtZQUNFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVELDRCQUFTLEdBQVQ7WUFDRSxPQUFPLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekUsQ0FBQztRQUVELCtCQUFZLEdBQVo7WUFBQSxpQkFHQztZQUZDLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN2RCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsS0FBSSxDQUFDLElBQUksQ0FBQyxFQUE1QixDQUE0QixDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVEOztXQUVHO1FBQ0gsNEJBQVMsR0FBVDtZQUNFLE9BQU8sSUFBSSxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBRUQ7O1dBRUc7UUFDSCwyQkFBUSxHQUFSO1lBQ0UsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUNILGVBQUM7SUFBRCxDQUFDLEFBM0hELElBMkhDO0lBM0hZLDRCQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyBvIGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCB7RmF0YWxMaW5rZXJFcnJvcn0gZnJvbSAnLi4vZmF0YWxfbGlua2VyX2Vycm9yJztcbmltcG9ydCB7QXN0SG9zdCwgUmFuZ2V9IGZyb20gJy4vYXN0X2hvc3QnO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgb25seSB0aG9zZSB0eXBlcyBpbiBgVGAgdGhhdCBhcmUgb2JqZWN0IHR5cGVzLlxuICovXG50eXBlIE9iamVjdFR5cGU8VD4gPSBFeHRyYWN0PFQsIG9iamVjdD47XG5cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgdmFsdWUgdHlwZSBvZiBhbiBvYmplY3QgbGl0ZXJhbC5cbiAqL1xudHlwZSBPYmplY3RWYWx1ZVR5cGU8VD4gPSBUIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgaW5mZXIgUj4/IFIgOiBuZXZlcjtcblxuLyoqXG4gKiBSZXByZXNlbnRzIHRoZSB2YWx1ZSB0eXBlIG9mIGFuIGFycmF5IGxpdGVyYWwuXG4gKi9cbnR5cGUgQXJyYXlWYWx1ZVR5cGU8VD4gPSBUIGV4dGVuZHMgQXJyYXk8aW5mZXIgUj4/IFIgOiBuZXZlcjtcblxuLyoqXG4gKiBFbnN1cmVzIHRoYXQgYFRoaXNgIGhhcyBpdHMgZ2VuZXJpYyB0eXBlIGBBY3R1YWxgIGNvbmZvcm0gdG8gdGhlIGV4cGVjdGVkIGdlbmVyaWMgdHlwZSBpblxuICogYEV4cGVjdGVkYCwgdG8gZGlzYWxsb3cgY2FsbGluZyBhIG1ldGhvZCBpZiB0aGUgZ2VuZXJpYyB0eXBlIGRvZXMgbm90IGNvbmZvcm0uXG4gKi9cbnR5cGUgQ29uZm9ybXNUbzxUaGlzLCBBY3R1YWwsIEV4cGVjdGVkPiA9IEFjdHVhbCBleHRlbmRzIEV4cGVjdGVkID8gVGhpcyA6IG5ldmVyO1xuXG4vKipcbiAqIEVuc3VyZXMgdGhhdCBgVGhpc2AgaXMgYW4gYEFzdFZhbHVlYCB3aG9zZSBnZW5lcmljIHR5cGUgY29uZm9ybXMgdG8gYEV4cGVjdGVkYCwgdG8gZGlzYWxsb3dcbiAqIGNhbGxpbmcgYSBtZXRob2QgaWYgdGhlIHZhbHVlJ3MgdHlwZSBkb2VzIG5vdCBjb25mb3JtLlxuICovXG50eXBlIEhhc1ZhbHVlVHlwZTxUaGlzLCBFeHBlY3RlZD4gPVxuICAgIFRoaXMgZXh0ZW5kcyBBc3RWYWx1ZTxpbmZlciBBY3R1YWwsIGFueT4/IENvbmZvcm1zVG88VGhpcywgQWN0dWFsLCBFeHBlY3RlZD46IG5ldmVyO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgb25seSB0aGUgc3RyaW5nIGtleXMgb2YgdHlwZSBgVGAuXG4gKi9cbnR5cGUgUHJvcGVydHlLZXk8VD4gPSBrZXlvZiBUJnN0cmluZztcblxuLyoqXG4gKiBUaGlzIGhlbHBlciBjbGFzcyB3cmFwcyBhbiBvYmplY3QgZXhwcmVzc2lvbiBhbG9uZyB3aXRoIGFuIGBBc3RIb3N0YCBvYmplY3QsIGV4cG9zaW5nIGhlbHBlclxuICogbWV0aG9kcyB0aGF0IG1ha2UgaXQgZWFzaWVyIHRvIGV4dHJhY3QgdGhlIHByb3BlcnRpZXMgb2YgdGhlIG9iamVjdC5cbiAqXG4gKiBUaGUgZ2VuZXJpYyBgVGAgaXMgdXNlZCBhcyByZWZlcmVuY2UgdHlwZSBvZiB0aGUgZXhwZWN0ZWQgc3RydWN0dXJlIHRoYXQgaXMgcmVwcmVzZW50ZWQgYnkgdGhpc1xuICogb2JqZWN0LiBJdCBkb2VzIG5vdCBhY2hpZXZlIGZ1bGwgdHlwZS1zYWZldHkgZm9yIHRoZSBwcm92aWRlZCBvcGVyYXRpb25zIGluIGNvcnJlc3BvbmRlbmNlIHdpdGhcbiAqIGBUYDsgaXRzIG1haW4gZ29hbCBpcyB0byBwcm92aWRlIHJlZmVyZW5jZXMgdG8gYSBkb2N1bWVudGVkIHR5cGUgYW5kIGVuc3VyZSB0aGF0IHRoZSBwcm9wZXJ0aWVzXG4gKiB0aGF0IGFyZSByZWFkIGZyb20gdGhlIG9iamVjdCBhcmUgcHJlc2VudC5cbiAqXG4gKiBVbmZvcnR1bmF0ZWx5LCB0aGUgZ2VuZXJpYyB0eXBlcyBhcmUgdW5hYmxlIHRvIHByZXZlbnQgcmVhZGluZyBhbiBvcHRpb25hbCBwcm9wZXJ0eSBmcm9tIHRoZVxuICogb2JqZWN0IHdpdGhvdXQgZmlyc3QgaGF2aW5nIGNhbGxlZCBgaGFzYCB0byBlbnN1cmUgdGhhdCB0aGUgcHJvcGVydHkgZXhpc3RzLiBUaGlzIGlzIG9uZSBleGFtcGxlXG4gKiBvZiB3aGVyZSBmdWxsIHR5cGUtc2FmZXR5IGlzIG5vdCBhY2hpZXZlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEFzdE9iamVjdDxUIGV4dGVuZHMgb2JqZWN0LCBURXhwcmVzc2lvbj4ge1xuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBBc3RPYmplY3RgIGZyb20gdGhlIGdpdmVuIGBleHByZXNzaW9uYCBhbmQgYGhvc3RgLlxuICAgKi9cbiAgc3RhdGljIHBhcnNlPFQgZXh0ZW5kcyBvYmplY3QsIFRFeHByZXNzaW9uPihleHByZXNzaW9uOiBURXhwcmVzc2lvbiwgaG9zdDogQXN0SG9zdDxURXhwcmVzc2lvbj4pOlxuICAgICAgQXN0T2JqZWN0PFQsIFRFeHByZXNzaW9uPiB7XG4gICAgY29uc3Qgb2JqID0gaG9zdC5wYXJzZU9iamVjdExpdGVyYWwoZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG5ldyBBc3RPYmplY3QoZXhwcmVzc2lvbiwgb2JqLCBob3N0KTtcbiAgfVxuXG4gIHByaXZhdGUgY29uc3RydWN0b3IoXG4gICAgICByZWFkb25seSBleHByZXNzaW9uOiBURXhwcmVzc2lvbiwgcHJpdmF0ZSBvYmo6IE1hcDxzdHJpbmcsIFRFeHByZXNzaW9uPixcbiAgICAgIHByaXZhdGUgaG9zdDogQXN0SG9zdDxURXhwcmVzc2lvbj4pIHt9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgb2JqZWN0IGhhcyBhIHByb3BlcnR5IGNhbGxlZCBgcHJvcGVydHlOYW1lYC5cbiAgICovXG4gIGhhcyhwcm9wZXJ0eU5hbWU6IFByb3BlcnR5S2V5PFQ+KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub2JqLmhhcyhwcm9wZXJ0eU5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG51bWJlciB2YWx1ZSBvZiB0aGUgcHJvcGVydHkgY2FsbGVkIGBwcm9wZXJ0eU5hbWVgLlxuICAgKlxuICAgKiBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlcmUgaXMgbm8gc3VjaCBwcm9wZXJ0eSBvciB0aGUgcHJvcGVydHkgaXMgbm90IGEgbnVtYmVyLlxuICAgKi9cbiAgZ2V0TnVtYmVyPEsgZXh0ZW5kcyBQcm9wZXJ0eUtleTxUPj4odGhpczogQ29uZm9ybXNUbzx0aGlzLCBUW0tdLCBudW1iZXI+LCBwcm9wZXJ0eU5hbWU6IEspOlxuICAgICAgbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5ob3N0LnBhcnNlTnVtZXJpY0xpdGVyYWwodGhpcy5nZXRSZXF1aXJlZFByb3BlcnR5KHByb3BlcnR5TmFtZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHN0cmluZyB2YWx1ZSBvZiB0aGUgcHJvcGVydHkgY2FsbGVkIGBwcm9wZXJ0eU5hbWVgLlxuICAgKlxuICAgKiBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlcmUgaXMgbm8gc3VjaCBwcm9wZXJ0eSBvciB0aGUgcHJvcGVydHkgaXMgbm90IGEgc3RyaW5nLlxuICAgKi9cbiAgZ2V0U3RyaW5nPEsgZXh0ZW5kcyBQcm9wZXJ0eUtleTxUPj4odGhpczogQ29uZm9ybXNUbzx0aGlzLCBUW0tdLCBzdHJpbmc+LCBwcm9wZXJ0eU5hbWU6IEspOlxuICAgICAgc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5ob3N0LnBhcnNlU3RyaW5nTGl0ZXJhbCh0aGlzLmdldFJlcXVpcmVkUHJvcGVydHkocHJvcGVydHlOYW1lKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYm9vbGVhbiB2YWx1ZSBvZiB0aGUgcHJvcGVydHkgY2FsbGVkIGBwcm9wZXJ0eU5hbWVgLlxuICAgKlxuICAgKiBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlcmUgaXMgbm8gc3VjaCBwcm9wZXJ0eSBvciB0aGUgcHJvcGVydHkgaXMgbm90IGEgYm9vbGVhbi5cbiAgICovXG4gIGdldEJvb2xlYW48SyBleHRlbmRzIFByb3BlcnR5S2V5PFQ+Pih0aGlzOiBDb25mb3Jtc1RvPHRoaXMsIFRbS10sIGJvb2xlYW4+LCBwcm9wZXJ0eU5hbWU6IEspOlxuICAgICAgYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaG9zdC5wYXJzZUJvb2xlYW5MaXRlcmFsKHRoaXMuZ2V0UmVxdWlyZWRQcm9wZXJ0eShwcm9wZXJ0eU5hbWUpKSBhcyBhbnk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbmVzdGVkIGBBc3RPYmplY3RgIHBhcnNlZCBmcm9tIHRoZSBwcm9wZXJ0eSBjYWxsZWQgYHByb3BlcnR5TmFtZWAuXG4gICAqXG4gICAqIFRocm93cyBhbiBlcnJvciBpZiB0aGVyZSBpcyBubyBzdWNoIHByb3BlcnR5IG9yIHRoZSBwcm9wZXJ0eSBpcyBub3QgYW4gb2JqZWN0LlxuICAgKi9cbiAgZ2V0T2JqZWN0PEsgZXh0ZW5kcyBQcm9wZXJ0eUtleTxUPj4odGhpczogQ29uZm9ybXNUbzx0aGlzLCBUW0tdLCBvYmplY3Q+LCBwcm9wZXJ0eU5hbWU6IEspOlxuICAgICAgQXN0T2JqZWN0PE9iamVjdFR5cGU8VFtLXT4sIFRFeHByZXNzaW9uPiB7XG4gICAgY29uc3QgZXhwciA9IHRoaXMuZ2V0UmVxdWlyZWRQcm9wZXJ0eShwcm9wZXJ0eU5hbWUpO1xuICAgIGNvbnN0IG9iaiA9IHRoaXMuaG9zdC5wYXJzZU9iamVjdExpdGVyYWwoZXhwcik7XG4gICAgcmV0dXJuIG5ldyBBc3RPYmplY3QoZXhwciwgb2JqLCB0aGlzLmhvc3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgYEFzdFZhbHVlYCBvYmplY3RzIHBhcnNlZCBmcm9tIHRoZSBwcm9wZXJ0eSBjYWxsZWQgYHByb3BlcnR5TmFtZWAuXG4gICAqXG4gICAqIFRocm93cyBhbiBlcnJvciBpZiB0aGVyZSBpcyBubyBzdWNoIHByb3BlcnR5IG9yIHRoZSBwcm9wZXJ0eSBpcyBub3QgYW4gYXJyYXkuXG4gICAqL1xuICBnZXRBcnJheTxLIGV4dGVuZHMgUHJvcGVydHlLZXk8VD4+KHRoaXM6IENvbmZvcm1zVG88dGhpcywgVFtLXSwgdW5rbm93bltdPiwgcHJvcGVydHlOYW1lOiBLKTpcbiAgICAgIEFzdFZhbHVlPEFycmF5VmFsdWVUeXBlPFRbS10+LCBURXhwcmVzc2lvbj5bXSB7XG4gICAgY29uc3QgYXJyID0gdGhpcy5ob3N0LnBhcnNlQXJyYXlMaXRlcmFsKHRoaXMuZ2V0UmVxdWlyZWRQcm9wZXJ0eShwcm9wZXJ0eU5hbWUpKTtcbiAgICByZXR1cm4gYXJyLm1hcChlbnRyeSA9PiBuZXcgQXN0VmFsdWUoZW50cnksIHRoaXMuaG9zdCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBgV3JhcHBlZE5vZGVFeHByYCBvYmplY3QgdGhhdCB3cmFwcyB0aGUgZXhwcmVzc2lvbiBhdCB0aGUgcHJvcGVydHkgY2FsbGVkXG4gICAqIGBwcm9wZXJ0eU5hbWVgLlxuICAgKlxuICAgKiBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlcmUgaXMgbm8gc3VjaCBwcm9wZXJ0eS5cbiAgICovXG4gIGdldE9wYXF1ZShwcm9wZXJ0eU5hbWU6IFByb3BlcnR5S2V5PFQ+KTogby5XcmFwcGVkTm9kZUV4cHI8VEV4cHJlc3Npb24+IHtcbiAgICByZXR1cm4gbmV3IG8uV3JhcHBlZE5vZGVFeHByKHRoaXMuZ2V0UmVxdWlyZWRQcm9wZXJ0eShwcm9wZXJ0eU5hbWUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByYXcgYFRFeHByZXNzaW9uYCB2YWx1ZSBvZiB0aGUgcHJvcGVydHkgY2FsbGVkIGBwcm9wZXJ0eU5hbWVgLlxuICAgKlxuICAgKiBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlcmUgaXMgbm8gc3VjaCBwcm9wZXJ0eS5cbiAgICovXG4gIGdldE5vZGUocHJvcGVydHlOYW1lOiBQcm9wZXJ0eUtleTxUPik6IFRFeHByZXNzaW9uIHtcbiAgICByZXR1cm4gdGhpcy5nZXRSZXF1aXJlZFByb3BlcnR5KHByb3BlcnR5TmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBgQXN0VmFsdWVgIHRoYXQgd3JhcHMgdGhlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eSBjYWxsZWQgYHByb3BlcnR5TmFtZWAuXG4gICAqXG4gICAqIFRocm93cyBhbiBlcnJvciBpZiB0aGVyZSBpcyBubyBzdWNoIHByb3BlcnR5LlxuICAgKi9cbiAgZ2V0VmFsdWU8SyBleHRlbmRzIFByb3BlcnR5S2V5PFQ+Pihwcm9wZXJ0eU5hbWU6IEspOiBBc3RWYWx1ZTxUW0tdLCBURXhwcmVzc2lvbj4ge1xuICAgIHJldHVybiBuZXcgQXN0VmFsdWUodGhpcy5nZXRSZXF1aXJlZFByb3BlcnR5KHByb3BlcnR5TmFtZSksIHRoaXMuaG9zdCk7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGhlIEFzdE9iamVjdCB0byBhIHJhdyBKYXZhU2NyaXB0IG9iamVjdCwgbWFwcGluZyBlYWNoIHByb3BlcnR5IHZhbHVlIChhcyBhblxuICAgKiBgQXN0VmFsdWVgKSB0byB0aGUgZ2VuZXJpYyB0eXBlIChgVGApIHZpYSB0aGUgYG1hcHBlcmAgZnVuY3Rpb24uXG4gICAqL1xuICB0b0xpdGVyYWw8Vj4obWFwcGVyOiAodmFsdWU6IEFzdFZhbHVlPE9iamVjdFZhbHVlVHlwZTxUPiwgVEV4cHJlc3Npb24+KSA9PiBWKTogUmVjb3JkPHN0cmluZywgVj4ge1xuICAgIGNvbnN0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgVj4gPSB7fTtcbiAgICBmb3IgKGNvbnN0IFtrZXksIGV4cHJlc3Npb25dIG9mIHRoaXMub2JqKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1hcHBlcihuZXcgQXN0VmFsdWUoZXhwcmVzc2lvbiwgdGhpcy5ob3N0KSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGhlIEFzdE9iamVjdCB0byBhIEphdmFTY3JpcHQgTWFwLCBtYXBwaW5nIGVhY2ggcHJvcGVydHkgdmFsdWUgKGFzIGFuXG4gICAqIGBBc3RWYWx1ZWApIHRvIHRoZSBnZW5lcmljIHR5cGUgKGBUYCkgdmlhIHRoZSBgbWFwcGVyYCBmdW5jdGlvbi5cbiAgICovXG4gIHRvTWFwPFY+KG1hcHBlcjogKHZhbHVlOiBBc3RWYWx1ZTxPYmplY3RWYWx1ZVR5cGU8VD4sIFRFeHByZXNzaW9uPikgPT4gVik6IE1hcDxzdHJpbmcsIFY+IHtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgTWFwPHN0cmluZywgVj4oKTtcbiAgICBmb3IgKGNvbnN0IFtrZXksIGV4cHJlc3Npb25dIG9mIHRoaXMub2JqKSB7XG4gICAgICByZXN1bHQuc2V0KGtleSwgbWFwcGVyKG5ldyBBc3RWYWx1ZShleHByZXNzaW9uLCB0aGlzLmhvc3QpKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIGdldFJlcXVpcmVkUHJvcGVydHkocHJvcGVydHlOYW1lOiBQcm9wZXJ0eUtleTxUPik6IFRFeHByZXNzaW9uIHtcbiAgICBpZiAoIXRoaXMub2JqLmhhcyhwcm9wZXJ0eU5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxMaW5rZXJFcnJvcihcbiAgICAgICAgICB0aGlzLmV4cHJlc3Npb24sIGBFeHBlY3RlZCBwcm9wZXJ0eSAnJHtwcm9wZXJ0eU5hbWV9JyB0byBiZSBwcmVzZW50LmApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5vYmouZ2V0KHByb3BlcnR5TmFtZSkhO1xuICB9XG59XG5cbi8qKlxuICogVGhpcyBoZWxwZXIgY2xhc3Mgd3JhcHMgYW4gYGV4cHJlc3Npb25gLCBleHBvc2luZyBtZXRob2RzIHRoYXQgdXNlIHRoZSBgaG9zdGAgdG8gZ2l2ZVxuICogYWNjZXNzIHRvIHRoZSB1bmRlcmx5aW5nIHZhbHVlIG9mIHRoZSB3cmFwcGVkIGV4cHJlc3Npb24uXG4gKlxuICogVGhlIGdlbmVyaWMgYFRgIGlzIHVzZWQgYXMgcmVmZXJlbmNlIHR5cGUgb2YgdGhlIGV4cGVjdGVkIHR5cGUgdGhhdCBpcyByZXByZXNlbnRlZCBieSB0aGlzIHZhbHVlLlxuICogSXQgZG9lcyBub3QgYWNoaWV2ZSBmdWxsIHR5cGUtc2FmZXR5IGZvciB0aGUgcHJvdmlkZWQgb3BlcmF0aW9ucyBpbiBjb3JyZXNwb25kZW5jZSB3aXRoIGBUYDsgaXRzXG4gKiBtYWluIGdvYWwgaXMgdG8gcHJvdmlkZSByZWZlcmVuY2VzIHRvIGEgZG9jdW1lbnRlZCB0eXBlLlxuICovXG5leHBvcnQgY2xhc3MgQXN0VmFsdWU8VCwgVEV4cHJlc3Npb24+IHtcbiAgY29uc3RydWN0b3IocmVhZG9ubHkgZXhwcmVzc2lvbjogVEV4cHJlc3Npb24sIHByaXZhdGUgaG9zdDogQXN0SG9zdDxURXhwcmVzc2lvbj4pIHt9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbmFtZSBvZiB0aGUgc3ltYm9sIHJlcHJlc2VudGVkIGJ5IHRoZSBnaXZlbiBleHByZXNzaW9uIG5vZGUsIG9yIGBudWxsYCBpZiBpdCBpcyBub3QgYVxuICAgKiBzeW1ib2wuXG4gICAqL1xuICBnZXRTeW1ib2xOYW1lKCk6IHN0cmluZ3xudWxsIHtcbiAgICByZXR1cm4gdGhpcy5ob3N0LmdldFN5bWJvbE5hbWUodGhpcy5leHByZXNzaW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJcyB0aGlzIHZhbHVlIGEgbnVtYmVyP1xuICAgKi9cbiAgaXNOdW1iZXIoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaG9zdC5pc051bWVyaWNMaXRlcmFsKHRoaXMuZXhwcmVzc2lvbik7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgdGhlIG51bWJlciBmcm9tIHRoaXMgdmFsdWUsIG9yIGVycm9yIGlmIGl0IGlzIG5vdCBhIG51bWJlci5cbiAgICovXG4gIGdldE51bWJlcih0aGlzOiBIYXNWYWx1ZVR5cGU8dGhpcywgbnVtYmVyPik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuaG9zdC5wYXJzZU51bWVyaWNMaXRlcmFsKHRoaXMuZXhwcmVzc2lvbik7XG4gIH1cblxuICAvKipcbiAgICogSXMgdGhpcyB2YWx1ZSBhIHN0cmluZz9cbiAgICovXG4gIGlzU3RyaW5nKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmhvc3QuaXNTdHJpbmdMaXRlcmFsKHRoaXMuZXhwcmVzc2lvbik7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgdGhlIHN0cmluZyBmcm9tIHRoaXMgdmFsdWUsIG9yIGVycm9yIGlmIGl0IGlzIG5vdCBhIHN0cmluZy5cbiAgICovXG4gIGdldFN0cmluZyh0aGlzOiBIYXNWYWx1ZVR5cGU8dGhpcywgc3RyaW5nPik6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuaG9zdC5wYXJzZVN0cmluZ0xpdGVyYWwodGhpcy5leHByZXNzaW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJcyB0aGlzIHZhbHVlIGEgYm9vbGVhbj9cbiAgICovXG4gIGlzQm9vbGVhbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ob3N0LmlzQm9vbGVhbkxpdGVyYWwodGhpcy5leHByZXNzaW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSB0aGUgYm9vbGVhbiBmcm9tIHRoaXMgdmFsdWUsIG9yIGVycm9yIGlmIGl0IGlzIG5vdCBhIGJvb2xlYW4uXG4gICAqL1xuICBnZXRCb29sZWFuKHRoaXM6IEhhc1ZhbHVlVHlwZTx0aGlzLCBib29sZWFuPik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmhvc3QucGFyc2VCb29sZWFuTGl0ZXJhbCh0aGlzLmV4cHJlc3Npb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIElzIHRoaXMgdmFsdWUgYW4gb2JqZWN0IGxpdGVyYWw/XG4gICAqL1xuICBpc09iamVjdCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ob3N0LmlzT2JqZWN0TGl0ZXJhbCh0aGlzLmV4cHJlc3Npb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIHRoaXMgdmFsdWUgaW50byBhbiBgQXN0T2JqZWN0YCwgb3IgZXJyb3IgaWYgaXQgaXMgbm90IGFuIG9iamVjdCBsaXRlcmFsLlxuICAgKi9cbiAgZ2V0T2JqZWN0KHRoaXM6IEhhc1ZhbHVlVHlwZTx0aGlzLCBvYmplY3Q+KTogQXN0T2JqZWN0PE9iamVjdFR5cGU8VD4sIFRFeHByZXNzaW9uPiB7XG4gICAgcmV0dXJuIEFzdE9iamVjdC5wYXJzZSh0aGlzLmV4cHJlc3Npb24sIHRoaXMuaG9zdCk7XG4gIH1cblxuICAvKipcbiAgICogSXMgdGhpcyB2YWx1ZSBhbiBhcnJheSBsaXRlcmFsP1xuICAgKi9cbiAgaXNBcnJheSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ob3N0LmlzQXJyYXlMaXRlcmFsKHRoaXMuZXhwcmVzc2lvbik7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgdGhpcyB2YWx1ZSBpbnRvIGFuIGFycmF5IG9mIGBBc3RWYWx1ZWAgb2JqZWN0cywgb3IgZXJyb3IgaWYgaXQgaXMgbm90IGFuIGFycmF5IGxpdGVyYWwuXG4gICAqL1xuICBnZXRBcnJheSh0aGlzOiBIYXNWYWx1ZVR5cGU8dGhpcywgdW5rbm93bltdPik6IEFzdFZhbHVlPEFycmF5VmFsdWVUeXBlPFQ+LCBURXhwcmVzc2lvbj5bXSB7XG4gICAgY29uc3QgYXJyID0gdGhpcy5ob3N0LnBhcnNlQXJyYXlMaXRlcmFsKHRoaXMuZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIGFyci5tYXAoZW50cnkgPT4gbmV3IEFzdFZhbHVlKGVudHJ5LCB0aGlzLmhvc3QpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJcyB0aGlzIHZhbHVlIGEgZnVuY3Rpb24gZXhwcmVzc2lvbj9cbiAgICovXG4gIGlzRnVuY3Rpb24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaG9zdC5pc0Z1bmN0aW9uRXhwcmVzc2lvbih0aGlzLmV4cHJlc3Npb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4dHJhY3QgdGhlIHJldHVybiB2YWx1ZSBhcyBhbiBgQXN0VmFsdWVgIGZyb20gdGhpcyB2YWx1ZSBhcyBhIGZ1bmN0aW9uIGV4cHJlc3Npb24sIG9yIGVycm9yIGlmXG4gICAqIGl0IGlzIG5vdCBhIGZ1bmN0aW9uIGV4cHJlc3Npb24uXG4gICAqL1xuICBnZXRGdW5jdGlvblJldHVyblZhbHVlPFI+KHRoaXM6IEhhc1ZhbHVlVHlwZTx0aGlzLCBGdW5jdGlvbj4pOiBBc3RWYWx1ZTxSLCBURXhwcmVzc2lvbj4ge1xuICAgIHJldHVybiBuZXcgQXN0VmFsdWUodGhpcy5ob3N0LnBhcnNlUmV0dXJuVmFsdWUodGhpcy5leHByZXNzaW9uKSwgdGhpcy5ob3N0KTtcbiAgfVxuXG4gIGlzQ2FsbEV4cHJlc3Npb24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaG9zdC5pc0NhbGxFeHByZXNzaW9uKHRoaXMuZXhwcmVzc2lvbik7XG4gIH1cblxuICBnZXRDYWxsZWUoKTogQXN0VmFsdWU8dW5rbm93biwgVEV4cHJlc3Npb24+IHtcbiAgICByZXR1cm4gbmV3IEFzdFZhbHVlKHRoaXMuaG9zdC5wYXJzZUNhbGxlZSh0aGlzLmV4cHJlc3Npb24pLCB0aGlzLmhvc3QpO1xuICB9XG5cbiAgZ2V0QXJndW1lbnRzKCk6IEFzdFZhbHVlPHVua25vd24sIFRFeHByZXNzaW9uPltdIHtcbiAgICBjb25zdCBhcmdzID0gdGhpcy5ob3N0LnBhcnNlQXJndW1lbnRzKHRoaXMuZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIGFyZ3MubWFwKGFyZyA9PiBuZXcgQXN0VmFsdWUoYXJnLCB0aGlzLmhvc3QpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIGBURXhwcmVzc2lvbmAgb2YgdGhpcyB2YWx1ZSB3cmFwcGVkIGluIGEgYFdyYXBwZWROb2RlRXhwcmAuXG4gICAqL1xuICBnZXRPcGFxdWUoKTogby5XcmFwcGVkTm9kZUV4cHI8VEV4cHJlc3Npb24+IHtcbiAgICByZXR1cm4gbmV3IG8uV3JhcHBlZE5vZGVFeHByKHRoaXMuZXhwcmVzc2lvbik7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSByYW5nZSBvZiB0aGUgbG9jYXRpb24gb2YgdGhpcyB2YWx1ZSBpbiB0aGUgb3JpZ2luYWwgc291cmNlLlxuICAgKi9cbiAgZ2V0UmFuZ2UoKTogUmFuZ2Uge1xuICAgIHJldHVybiB0aGlzLmhvc3QuZ2V0UmFuZ2UodGhpcy5leHByZXNzaW9uKTtcbiAgfVxufVxuIl19