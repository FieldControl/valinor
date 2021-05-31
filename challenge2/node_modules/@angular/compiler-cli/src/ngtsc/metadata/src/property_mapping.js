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
        define("@angular/compiler-cli/src/ngtsc/metadata/src/property_mapping", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClassPropertyMapping = void 0;
    var tslib_1 = require("tslib");
    /**
     * A mapping of component property and template binding property names, for example containing the
     * inputs of a particular directive or component.
     *
     * A single component property has exactly one input/output annotation (and therefore one binding
     * property name) associated with it, but the same binding property name may be shared across many
     * component property names.
     *
     * Allows bidirectional querying of the mapping - looking up all inputs/outputs with a given
     * property name, or mapping from a specific class property to its binding property name.
     */
    var ClassPropertyMapping = /** @class */ (function () {
        function ClassPropertyMapping(forwardMap) {
            this.forwardMap = forwardMap;
            this.reverseMap = reverseMapFromForwardMap(forwardMap);
        }
        /**
         * Construct a `ClassPropertyMapping` with no entries.
         */
        ClassPropertyMapping.empty = function () {
            return new ClassPropertyMapping(new Map());
        };
        /**
         * Construct a `ClassPropertyMapping` from a primitive JS object which maps class property names
         * to either binding property names or an array that contains both names, which is used in on-disk
         * metadata formats (e.g. in .d.ts files).
         */
        ClassPropertyMapping.fromMappedObject = function (obj) {
            var e_1, _a;
            var forwardMap = new Map();
            try {
                for (var _b = tslib_1.__values(Object.keys(obj)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var classPropertyName = _c.value;
                    var value = obj[classPropertyName];
                    var bindingPropertyName = Array.isArray(value) ? value[0] : value;
                    var inputOrOutput = { classPropertyName: classPropertyName, bindingPropertyName: bindingPropertyName };
                    forwardMap.set(classPropertyName, inputOrOutput);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return new ClassPropertyMapping(forwardMap);
        };
        /**
         * Merge two mappings into one, with class properties from `b` taking precedence over class
         * properties from `a`.
         */
        ClassPropertyMapping.merge = function (a, b) {
            var e_2, _a;
            var forwardMap = new Map(a.forwardMap.entries());
            try {
                for (var _b = tslib_1.__values(b.forwardMap), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = tslib_1.__read(_c.value, 2), classPropertyName = _d[0], inputOrOutput = _d[1];
                    forwardMap.set(classPropertyName, inputOrOutput);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return new ClassPropertyMapping(forwardMap);
        };
        Object.defineProperty(ClassPropertyMapping.prototype, "classPropertyNames", {
            /**
             * All class property names mapped in this mapping.
             */
            get: function () {
                return Array.from(this.forwardMap.keys());
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ClassPropertyMapping.prototype, "propertyNames", {
            /**
             * All binding property names mapped in this mapping.
             */
            get: function () {
                return Array.from(this.reverseMap.keys());
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Check whether a mapping for the given property name exists.
         */
        ClassPropertyMapping.prototype.hasBindingPropertyName = function (propertyName) {
            return this.reverseMap.has(propertyName);
        };
        /**
         * Lookup all `InputOrOutput`s that use this `propertyName`.
         */
        ClassPropertyMapping.prototype.getByBindingPropertyName = function (propertyName) {
            return this.reverseMap.has(propertyName) ? this.reverseMap.get(propertyName) : null;
        };
        /**
         * Lookup the `InputOrOutput` associated with a `classPropertyName`.
         */
        ClassPropertyMapping.prototype.getByClassPropertyName = function (classPropertyName) {
            return this.forwardMap.has(classPropertyName) ? this.forwardMap.get(classPropertyName) : null;
        };
        /**
         * Convert this mapping to a primitive JS object which maps each class property directly to the
         * binding property name associated with it.
         */
        ClassPropertyMapping.prototype.toDirectMappedObject = function () {
            var e_3, _a;
            var obj = {};
            try {
                for (var _b = tslib_1.__values(this.forwardMap), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = tslib_1.__read(_c.value, 2), classPropertyName = _d[0], inputOrOutput = _d[1];
                    obj[classPropertyName] = inputOrOutput.bindingPropertyName;
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return obj;
        };
        /**
         * Convert this mapping to a primitive JS object which maps each class property either to itself
         * (for cases where the binding property name is the same) or to an array which contains both
         * names if they differ.
         *
         * This object format is used when mappings are serialized (for example into .d.ts files).
         */
        ClassPropertyMapping.prototype.toJointMappedObject = function () {
            var e_4, _a;
            var obj = {};
            try {
                for (var _b = tslib_1.__values(this.forwardMap), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = tslib_1.__read(_c.value, 2), classPropertyName = _d[0], inputOrOutput = _d[1];
                    if (inputOrOutput.bindingPropertyName === classPropertyName) {
                        obj[classPropertyName] = inputOrOutput.bindingPropertyName;
                    }
                    else {
                        obj[classPropertyName] = [inputOrOutput.bindingPropertyName, classPropertyName];
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return obj;
        };
        /**
         * Implement the iterator protocol and return entry objects which contain the class and binding
         * property names (and are useful for destructuring).
         */
        ClassPropertyMapping.prototype[Symbol.iterator] = function () {
            var _a, _b, _c, classPropertyName, inputOrOutput, e_5_1;
            var e_5, _d;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 5, 6, 7]);
                        _a = tslib_1.__values(this.forwardMap.entries()), _b = _a.next();
                        _e.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 4];
                        _c = tslib_1.__read(_b.value, 2), classPropertyName = _c[0], inputOrOutput = _c[1];
                        return [4 /*yield*/, [classPropertyName, inputOrOutput.bindingPropertyName]];
                    case 2:
                        _e.sent();
                        _e.label = 3;
                    case 3:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_5_1 = _e.sent();
                        e_5 = { error: e_5_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                        }
                        finally { if (e_5) throw e_5.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        };
        return ClassPropertyMapping;
    }());
    exports.ClassPropertyMapping = ClassPropertyMapping;
    function reverseMapFromForwardMap(forwardMap) {
        var e_6, _a;
        var reverseMap = new Map();
        try {
            for (var forwardMap_1 = tslib_1.__values(forwardMap), forwardMap_1_1 = forwardMap_1.next(); !forwardMap_1_1.done; forwardMap_1_1 = forwardMap_1.next()) {
                var _b = tslib_1.__read(forwardMap_1_1.value, 2), _ = _b[0], inputOrOutput = _b[1];
                if (!reverseMap.has(inputOrOutput.bindingPropertyName)) {
                    reverseMap.set(inputOrOutput.bindingPropertyName, []);
                }
                reverseMap.get(inputOrOutput.bindingPropertyName).push(inputOrOutput);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (forwardMap_1_1 && !forwardMap_1_1.done && (_a = forwardMap_1.return)) _a.call(forwardMap_1);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return reverseMap;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGVydHlfbWFwcGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvbWV0YWRhdGEvc3JjL3Byb3BlcnR5X21hcHBpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQW1DSDs7Ozs7Ozs7OztPQVVHO0lBQ0g7UUFXRSw4QkFBb0IsVUFBaUQ7WUFDbkUsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFDN0IsSUFBSSxDQUFDLFVBQVUsR0FBRyx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBRUQ7O1dBRUc7UUFDSSwwQkFBSyxHQUFaO1lBQ0UsT0FBTyxJQUFJLG9CQUFvQixDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRUQ7Ozs7V0FJRztRQUNJLHFDQUFnQixHQUF2QixVQUF3QixHQUV2Qjs7WUFDQyxJQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBb0MsQ0FBQzs7Z0JBRS9ELEtBQWdDLElBQUEsS0FBQSxpQkFBQSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBLGdCQUFBLDRCQUFFO29CQUE3QyxJQUFNLGlCQUFpQixXQUFBO29CQUMxQixJQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztvQkFDckMsSUFBTSxtQkFBbUIsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztvQkFDcEUsSUFBTSxhQUFhLEdBQWtCLEVBQUMsaUJBQWlCLG1CQUFBLEVBQUUsbUJBQW1CLHFCQUFBLEVBQUMsQ0FBQztvQkFDOUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIs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QWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5wdXRPdXRwdXRQcm9wZXJ0eVNldH0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuXG4vKipcbiAqIFRoZSBuYW1lIG9mIGEgY2xhc3MgcHJvcGVydHkgdGhhdCBiYWNrcyBhbiBpbnB1dCBvciBvdXRwdXQgZGVjbGFyZWQgYnkgYSBkaXJlY3RpdmUgb3IgY29tcG9uZW50LlxuICpcbiAqIFRoaXMgdHlwZSBleGlzdHMgZm9yIGRvY3VtZW50YXRpb24gb25seS5cbiAqL1xuZXhwb3J0IHR5cGUgQ2xhc3NQcm9wZXJ0eU5hbWUgPSBzdHJpbmc7XG5cbi8qKlxuICogVGhlIG5hbWUgYnkgd2hpY2ggYW4gaW5wdXQgb3Igb3V0cHV0IG9mIGEgZGlyZWN0aXZlIG9yIGNvbXBvbmVudCBpcyBib3VuZCBpbiBhbiBBbmd1bGFyIHRlbXBsYXRlLlxuICpcbiAqIFRoaXMgdHlwZSBleGlzdHMgZm9yIGRvY3VtZW50YXRpb24gb25seS5cbiAqL1xuZXhwb3J0IHR5cGUgQmluZGluZ1Byb3BlcnR5TmFtZSA9IHN0cmluZztcblxuLyoqXG4gKiBBbiBpbnB1dCBvciBvdXRwdXQgb2YgYSBkaXJlY3RpdmUgdGhhdCBoYXMgYm90aCBhIG5hbWVkIEphdmFTY3JpcHQgY2xhc3MgcHJvcGVydHkgb24gYSBjb21wb25lbnRcbiAqIG9yIGRpcmVjdGl2ZSBjbGFzcywgYXMgd2VsbCBhcyBhbiBBbmd1bGFyIHRlbXBsYXRlIHByb3BlcnR5IG5hbWUgdXNlZCBmb3IgYmluZGluZy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbnB1dE9yT3V0cHV0IHtcbiAgLyoqXG4gICAqIFRoZSBuYW1lIG9mIHRoZSBKYXZhU2NyaXB0IHByb3BlcnR5IG9uIHRoZSBjb21wb25lbnQgb3IgZGlyZWN0aXZlIGluc3RhbmNlIGZvciB0aGlzIGlucHV0IG9yXG4gICAqIG91dHB1dC5cbiAgICovXG4gIHJlYWRvbmx5IGNsYXNzUHJvcGVydHlOYW1lOiBDbGFzc1Byb3BlcnR5TmFtZTtcblxuICAvKipcbiAgICogVGhlIHByb3BlcnR5IG5hbWUgdXNlZCB0byBiaW5kIHRoaXMgaW5wdXQgb3Igb3V0cHV0IGluIGFuIEFuZ3VsYXIgdGVtcGxhdGUuXG4gICAqL1xuICByZWFkb25seSBiaW5kaW5nUHJvcGVydHlOYW1lOiBCaW5kaW5nUHJvcGVydHlOYW1lO1xufVxuXG4vKipcbiAqIEEgbWFwcGluZyBvZiBjb21wb25lbnQgcHJvcGVydHkgYW5kIHRlbXBsYXRlIGJpbmRpbmcgcHJvcGVydHkgbmFtZXMsIGZvciBleGFtcGxlIGNvbnRhaW5pbmcgdGhlXG4gKiBpbnB1dHMgb2YgYSBwYXJ0aWN1bGFyIGRpcmVjdGl2ZSBvciBjb21wb25lbnQuXG4gKlxuICogQSBzaW5nbGUgY29tcG9uZW50IHByb3BlcnR5IGhhcyBleGFjdGx5IG9uZSBpbnB1dC9vdXRwdXQgYW5ub3RhdGlvbiAoYW5kIHRoZXJlZm9yZSBvbmUgYmluZGluZ1xuICogcHJvcGVydHkgbmFtZSkgYXNzb2NpYXRlZCB3aXRoIGl0LCBidXQgdGhlIHNhbWUgYmluZGluZyBwcm9wZXJ0eSBuYW1lIG1heSBiZSBzaGFyZWQgYWNyb3NzIG1hbnlcbiAqIGNvbXBvbmVudCBwcm9wZXJ0eSBuYW1lcy5cbiAqXG4gKiBBbGxvd3MgYmlkaXJlY3Rpb25hbCBxdWVyeWluZyBvZiB0aGUgbWFwcGluZyAtIGxvb2tpbmcgdXAgYWxsIGlucHV0cy9vdXRwdXRzIHdpdGggYSBnaXZlblxuICogcHJvcGVydHkgbmFtZSwgb3IgbWFwcGluZyBmcm9tIGEgc3BlY2lmaWMgY2xhc3MgcHJvcGVydHkgdG8gaXRzIGJpbmRpbmcgcHJvcGVydHkgbmFtZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENsYXNzUHJvcGVydHlNYXBwaW5nIGltcGxlbWVudHMgSW5wdXRPdXRwdXRQcm9wZXJ0eVNldCB7XG4gIC8qKlxuICAgKiBNYXBwaW5nIGZyb20gY2xhc3MgcHJvcGVydHkgbmFtZXMgdG8gdGhlIHNpbmdsZSBgSW5wdXRPck91dHB1dGAgZm9yIHRoYXQgY2xhc3MgcHJvcGVydHkuXG4gICAqL1xuICBwcml2YXRlIGZvcndhcmRNYXA6IE1hcDxDbGFzc1Byb3BlcnR5TmFtZSwgSW5wdXRPck91dHB1dD47XG5cbiAgLyoqXG4gICAqIE1hcHBpbmcgZnJvbSBwcm9wZXJ0eSBuYW1lcyB0byBvbmUgb3IgbW9yZSBgSW5wdXRPck91dHB1dGBzIHdoaWNoIHNoYXJlIHRoYXQgbmFtZS5cbiAgICovXG4gIHByaXZhdGUgcmV2ZXJzZU1hcDogTWFwPEJpbmRpbmdQcm9wZXJ0eU5hbWUsIElucHV0T3JPdXRwdXRbXT47XG5cbiAgcHJpdmF0ZSBjb25zdHJ1Y3Rvcihmb3J3YXJkTWFwOiBNYXA8Q2xhc3NQcm9wZXJ0eU5hbWUsIElucHV0T3JPdXRwdXQ+KSB7XG4gICAgdGhpcy5mb3J3YXJkTWFwID0gZm9yd2FyZE1hcDtcbiAgICB0aGlzLnJldmVyc2VNYXAgPSByZXZlcnNlTWFwRnJvbUZvcndhcmRNYXAoZm9yd2FyZE1hcCk7XG4gIH1cblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgYENsYXNzUHJvcGVydHlNYXBwaW5nYCB3aXRoIG5vIGVudHJpZXMuXG4gICAqL1xuICBzdGF0aWMgZW1wdHkoKTogQ2xhc3NQcm9wZXJ0eU1hcHBpbmcge1xuICAgIHJldHVybiBuZXcgQ2xhc3NQcm9wZXJ0eU1hcHBpbmcobmV3IE1hcCgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBgQ2xhc3NQcm9wZXJ0eU1hcHBpbmdgIGZyb20gYSBwcmltaXRpdmUgSlMgb2JqZWN0IHdoaWNoIG1hcHMgY2xhc3MgcHJvcGVydHkgbmFtZXNcbiAgICogdG8gZWl0aGVyIGJpbmRpbmcgcHJvcGVydHkgbmFtZXMgb3IgYW4gYXJyYXkgdGhhdCBjb250YWlucyBib3RoIG5hbWVzLCB3aGljaCBpcyB1c2VkIGluIG9uLWRpc2tcbiAgICogbWV0YWRhdGEgZm9ybWF0cyAoZS5nLiBpbiAuZC50cyBmaWxlcykuXG4gICAqL1xuICBzdGF0aWMgZnJvbU1hcHBlZE9iamVjdChvYmo6IHtcbiAgICBbY2xhc3NQcm9wZXJ0eU5hbWU6IHN0cmluZ106IEJpbmRpbmdQcm9wZXJ0eU5hbWV8W0NsYXNzUHJvcGVydHlOYW1lLCBCaW5kaW5nUHJvcGVydHlOYW1lXVxuICB9KTogQ2xhc3NQcm9wZXJ0eU1hcHBpbmcge1xuICAgIGNvbnN0IGZvcndhcmRNYXAgPSBuZXcgTWFwPENsYXNzUHJvcGVydHlOYW1lLCBJbnB1dE9yT3V0cHV0PigpO1xuXG4gICAgZm9yIChjb25zdCBjbGFzc1Byb3BlcnR5TmFtZSBvZiBPYmplY3Qua2V5cyhvYmopKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IG9ialtjbGFzc1Byb3BlcnR5TmFtZV07XG4gICAgICBjb25zdCBiaW5kaW5nUHJvcGVydHlOYW1lID0gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZVswXSA6IHZhbHVlO1xuICAgICAgY29uc3QgaW5wdXRPck91dHB1dDogSW5wdXRPck91dHB1dCA9IHtjbGFzc1Byb3BlcnR5TmFtZSwgYmluZGluZ1Byb3BlcnR5TmFtZX07XG4gICAgICBmb3J3YXJkTWFwLnNldChjbGFzc1Byb3BlcnR5TmFtZSwgaW5wdXRPck91dHB1dCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBDbGFzc1Byb3BlcnR5TWFwcGluZyhmb3J3YXJkTWFwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXJnZSB0d28gbWFwcGluZ3MgaW50byBvbmUsIHdpdGggY2xhc3MgcHJvcGVydGllcyBmcm9tIGBiYCB0YWtpbmcgcHJlY2VkZW5jZSBvdmVyIGNsYXNzXG4gICAqIHByb3BlcnRpZXMgZnJvbSBgYWAuXG4gICAqL1xuICBzdGF0aWMgbWVyZ2UoYTogQ2xhc3NQcm9wZXJ0eU1hcHBpbmcsIGI6IENsYXNzUHJvcGVydHlNYXBwaW5nKTogQ2xhc3NQcm9wZXJ0eU1hcHBpbmcge1xuICAgIGNvbnN0IGZvcndhcmRNYXAgPSBuZXcgTWFwPENsYXNzUHJvcGVydHlOYW1lLCBJbnB1dE9yT3V0cHV0PihhLmZvcndhcmRNYXAuZW50cmllcygpKTtcbiAgICBmb3IgKGNvbnN0IFtjbGFzc1Byb3BlcnR5TmFtZSwgaW5wdXRPck91dHB1dF0gb2YgYi5mb3J3YXJkTWFwKSB7XG4gICAgICBmb3J3YXJkTWFwLnNldChjbGFzc1Byb3BlcnR5TmFtZSwgaW5wdXRPck91dHB1dCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBDbGFzc1Byb3BlcnR5TWFwcGluZyhmb3J3YXJkTWFwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGwgY2xhc3MgcHJvcGVydHkgbmFtZXMgbWFwcGVkIGluIHRoaXMgbWFwcGluZy5cbiAgICovXG4gIGdldCBjbGFzc1Byb3BlcnR5TmFtZXMoKTogQ2xhc3NQcm9wZXJ0eU5hbWVbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5mb3J3YXJkTWFwLmtleXMoKSk7XG4gIH1cblxuICAvKipcbiAgICogQWxsIGJpbmRpbmcgcHJvcGVydHkgbmFtZXMgbWFwcGVkIGluIHRoaXMgbWFwcGluZy5cbiAgICovXG4gIGdldCBwcm9wZXJ0eU5hbWVzKCk6IEJpbmRpbmdQcm9wZXJ0eU5hbWVbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5yZXZlcnNlTWFwLmtleXMoKSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBhIG1hcHBpbmcgZm9yIHRoZSBnaXZlbiBwcm9wZXJ0eSBuYW1lIGV4aXN0cy5cbiAgICovXG4gIGhhc0JpbmRpbmdQcm9wZXJ0eU5hbWUocHJvcGVydHlOYW1lOiBCaW5kaW5nUHJvcGVydHlOYW1lKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucmV2ZXJzZU1hcC5oYXMocHJvcGVydHlOYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb29rdXAgYWxsIGBJbnB1dE9yT3V0cHV0YHMgdGhhdCB1c2UgdGhpcyBgcHJvcGVydHlOYW1lYC5cbiAgICovXG4gIGdldEJ5QmluZGluZ1Byb3BlcnR5TmFtZShwcm9wZXJ0eU5hbWU6IHN0cmluZyk6IFJlYWRvbmx5QXJyYXk8SW5wdXRPck91dHB1dD58bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMucmV2ZXJzZU1hcC5oYXMocHJvcGVydHlOYW1lKSA/IHRoaXMucmV2ZXJzZU1hcC5nZXQocHJvcGVydHlOYW1lKSEgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIExvb2t1cCB0aGUgYElucHV0T3JPdXRwdXRgIGFzc29jaWF0ZWQgd2l0aCBhIGBjbGFzc1Byb3BlcnR5TmFtZWAuXG4gICAqL1xuICBnZXRCeUNsYXNzUHJvcGVydHlOYW1lKGNsYXNzUHJvcGVydHlOYW1lOiBzdHJpbmcpOiBJbnB1dE9yT3V0cHV0fG51bGwge1xuICAgIHJldHVybiB0aGlzLmZvcndhcmRNYXAuaGFzKGNsYXNzUHJvcGVydHlOYW1lKSA/IHRoaXMuZm9yd2FyZE1hcC5nZXQoY2xhc3NQcm9wZXJ0eU5hbWUpISA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCB0aGlzIG1hcHBpbmcgdG8gYSBwcmltaXRpdmUgSlMgb2JqZWN0IHdoaWNoIG1hcHMgZWFjaCBjbGFzcyBwcm9wZXJ0eSBkaXJlY3RseSB0byB0aGVcbiAgICogYmluZGluZyBwcm9wZXJ0eSBuYW1lIGFzc29jaWF0ZWQgd2l0aCBpdC5cbiAgICovXG4gIHRvRGlyZWN0TWFwcGVkT2JqZWN0KCk6IHtbY2xhc3NQcm9wZXJ0eU5hbWU6IHN0cmluZ106IEJpbmRpbmdQcm9wZXJ0eU5hbWV9IHtcbiAgICBjb25zdCBvYmo6IHtbY2xhc3NQcm9wZXJ0eU5hbWU6IHN0cmluZ106IEJpbmRpbmdQcm9wZXJ0eU5hbWV9ID0ge307XG4gICAgZm9yIChjb25zdCBbY2xhc3NQcm9wZXJ0eU5hbWUsIGlucHV0T3JPdXRwdXRdIG9mIHRoaXMuZm9yd2FyZE1hcCkge1xuICAgICAgb2JqW2NsYXNzUHJvcGVydHlOYW1lXSA9IGlucHV0T3JPdXRwdXQuYmluZGluZ1Byb3BlcnR5TmFtZTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IHRoaXMgbWFwcGluZyB0byBhIHByaW1pdGl2ZSBKUyBvYmplY3Qgd2hpY2ggbWFwcyBlYWNoIGNsYXNzIHByb3BlcnR5IGVpdGhlciB0byBpdHNlbGZcbiAgICogKGZvciBjYXNlcyB3aGVyZSB0aGUgYmluZGluZyBwcm9wZXJ0eSBuYW1lIGlzIHRoZSBzYW1lKSBvciB0byBhbiBhcnJheSB3aGljaCBjb250YWlucyBib3RoXG4gICAqIG5hbWVzIGlmIHRoZXkgZGlmZmVyLlxuICAgKlxuICAgKiBUaGlzIG9iamVjdCBmb3JtYXQgaXMgdXNlZCB3aGVuIG1hcHBpbmdzIGFyZSBzZXJpYWxpemVkIChmb3IgZXhhbXBsZSBpbnRvIC5kLnRzIGZpbGVzKS5cbiAgICovXG4gIHRvSm9pbnRNYXBwZWRPYmplY3QoKTpcbiAgICAgIHtbY2xhc3NQcm9wZXJ0eU5hbWU6IHN0cmluZ106IEJpbmRpbmdQcm9wZXJ0eU5hbWV8W0JpbmRpbmdQcm9wZXJ0eU5hbWUsIENsYXNzUHJvcGVydHlOYW1lXX0ge1xuICAgIGNvbnN0IG9iajoge1xuICAgICAgW2NsYXNzUHJvcGVydHlOYW1lOiBzdHJpbmddOiBCaW5kaW5nUHJvcGVydHlOYW1lfFtCaW5kaW5nUHJvcGVydHlOYW1lLCBDbGFzc1Byb3BlcnR5TmFtZV1cbiAgICB9ID0ge307XG4gICAgZm9yIChjb25zdCBbY2xhc3NQcm9wZXJ0eU5hbWUsIGlucHV0T3JPdXRwdXRdIG9mIHRoaXMuZm9yd2FyZE1hcCkge1xuICAgICAgaWYgKGlucHV0T3JPdXRwdXQuYmluZGluZ1Byb3BlcnR5TmFtZSBhcyBzdHJpbmcgPT09IGNsYXNzUHJvcGVydHlOYW1lIGFzIHN0cmluZykge1xuICAgICAgICBvYmpbY2xhc3NQcm9wZXJ0eU5hbWVdID0gaW5wdXRPck91dHB1dC5iaW5kaW5nUHJvcGVydHlOYW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb2JqW2NsYXNzUHJvcGVydHlOYW1lXSA9IFtpbnB1dE9yT3V0cHV0LmJpbmRpbmdQcm9wZXJ0eU5hbWUsIGNsYXNzUHJvcGVydHlOYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnQgdGhlIGl0ZXJhdG9yIHByb3RvY29sIGFuZCByZXR1cm4gZW50cnkgb2JqZWN0cyB3aGljaCBjb250YWluIHRoZSBjbGFzcyBhbmQgYmluZGluZ1xuICAgKiBwcm9wZXJ0eSBuYW1lcyAoYW5kIGFyZSB1c2VmdWwgZm9yIGRlc3RydWN0dXJpbmcpLlxuICAgKi9cbiAgKiBbU3ltYm9sLml0ZXJhdG9yXSgpOiBJdGVyYWJsZUl0ZXJhdG9yPFtDbGFzc1Byb3BlcnR5TmFtZSwgQmluZGluZ1Byb3BlcnR5TmFtZV0+IHtcbiAgICBmb3IgKGNvbnN0IFtjbGFzc1Byb3BlcnR5TmFtZSwgaW5wdXRPck91dHB1dF0gb2YgdGhpcy5mb3J3YXJkTWFwLmVudHJpZXMoKSkge1xuICAgICAgeWllbGQgW2NsYXNzUHJvcGVydHlOYW1lLCBpbnB1dE9yT3V0cHV0LmJpbmRpbmdQcm9wZXJ0eU5hbWVdO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiByZXZlcnNlTWFwRnJvbUZvcndhcmRNYXAoZm9yd2FyZE1hcDogTWFwPENsYXNzUHJvcGVydHlOYW1lLCBJbnB1dE9yT3V0cHV0Pik6XG4gICAgTWFwPEJpbmRpbmdQcm9wZXJ0eU5hbWUsIElucHV0T3JPdXRwdXRbXT4ge1xuICBjb25zdCByZXZlcnNlTWFwID0gbmV3IE1hcDxCaW5kaW5nUHJvcGVydHlOYW1lLCBJbnB1dE9yT3V0cHV0W10+KCk7XG4gIGZvciAoY29uc3QgW18sIGlucHV0T3JPdXRwdXRdIG9mIGZvcndhcmRNYXApIHtcbiAgICBpZiAoIXJldmVyc2VNYXAuaGFzKGlucHV0T3JPdXRwdXQuYmluZGluZ1Byb3BlcnR5TmFtZSkpIHtcbiAgICAgIHJldmVyc2VNYXAuc2V0KGlucHV0T3JPdXRwdXQuYmluZGluZ1Byb3BlcnR5TmFtZSwgW10pO1xuICAgIH1cblxuICAgIHJldmVyc2VNYXAuZ2V0KGlucHV0T3JPdXRwdXQuYmluZGluZ1Byb3BlcnR5TmFtZSkhLnB1c2goaW5wdXRPck91dHB1dCk7XG4gIH1cbiAgcmV0dXJuIHJldmVyc2VNYXA7XG59XG4iXX0=