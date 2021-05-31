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
        define("@angular/compiler-cli/src/ngtsc/metadata/src/inheritance", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/metadata/src/property_mapping"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.flattenInheritedDirectiveMetadata = void 0;
    var tslib_1 = require("tslib");
    var property_mapping_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/property_mapping");
    /**
     * Given a reference to a directive, return a flattened version of its `DirectiveMeta` metadata
     * which includes metadata from its entire inheritance chain.
     *
     * The returned `DirectiveMeta` will either have `baseClass: null` if the inheritance chain could be
     * fully resolved, or `baseClass: 'dynamic'` if the inheritance chain could not be completely
     * followed.
     */
    function flattenInheritedDirectiveMetadata(reader, dir) {
        var topMeta = reader.getDirectiveMetadata(dir);
        if (topMeta === null) {
            throw new Error("Metadata not found for directive: " + dir.debugName);
        }
        if (topMeta.baseClass === null) {
            return topMeta;
        }
        var coercedInputFields = new Set();
        var undeclaredInputFields = new Set();
        var restrictedInputFields = new Set();
        var stringLiteralInputFields = new Set();
        var isDynamic = false;
        var inputs = property_mapping_1.ClassPropertyMapping.empty();
        var outputs = property_mapping_1.ClassPropertyMapping.empty();
        var isStructural = false;
        var addMetadata = function (meta) {
            var e_1, _a, e_2, _b, e_3, _c, e_4, _d;
            if (meta.baseClass === 'dynamic') {
                isDynamic = true;
            }
            else if (meta.baseClass !== null) {
                var baseMeta = reader.getDirectiveMetadata(meta.baseClass);
                if (baseMeta !== null) {
                    addMetadata(baseMeta);
                }
                else {
                    // Missing metadata for the base class means it's effectively dynamic.
                    isDynamic = true;
                }
            }
            isStructural = isStructural || meta.isStructural;
            inputs = property_mapping_1.ClassPropertyMapping.merge(inputs, meta.inputs);
            outputs = property_mapping_1.ClassPropertyMapping.merge(outputs, meta.outputs);
            try {
                for (var _e = tslib_1.__values(meta.coercedInputFields), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var coercedInputField = _f.value;
                    coercedInputFields.add(coercedInputField);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            try {
                for (var _g = tslib_1.__values(meta.undeclaredInputFields), _h = _g.next(); !_h.done; _h = _g.next()) {
                    var undeclaredInputField = _h.value;
                    undeclaredInputFields.add(undeclaredInputField);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
                }
                finally { if (e_2) throw e_2.error; }
            }
            try {
                for (var _j = tslib_1.__values(meta.restrictedInputFields), _k = _j.next(); !_k.done; _k = _j.next()) {
                    var restrictedInputField = _k.value;
                    restrictedInputFields.add(restrictedInputField);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_k && !_k.done && (_c = _j.return)) _c.call(_j);
                }
                finally { if (e_3) throw e_3.error; }
            }
            try {
                for (var _l = tslib_1.__values(meta.stringLiteralInputFields), _m = _l.next(); !_m.done; _m = _l.next()) {
                    var field = _m.value;
                    stringLiteralInputFields.add(field);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_m && !_m.done && (_d = _l.return)) _d.call(_l);
                }
                finally { if (e_4) throw e_4.error; }
            }
        };
        addMetadata(topMeta);
        return tslib_1.__assign(tslib_1.__assign({}, topMeta), { inputs: inputs,
            outputs: outputs,
            coercedInputFields: coercedInputFields,
            undeclaredInputFields: undeclaredInputFields,
            restrictedInputFields: restrictedInputFields,
            stringLiteralInputFields: stringLiteralInputFields, baseClass: isDynamic ? 'dynamic' : null, isStructural: isStructural });
    }
    exports.flattenInheritedDirectiveMetadata = flattenInheritedDirectiveMetadata;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5oZXJpdGFuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL21ldGFkYXRhL3NyYy9pbmhlcml0YW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBTUgsa0dBQTJFO0lBRTNFOzs7Ozs7O09BT0c7SUFDSCxTQUFnQixpQ0FBaUMsQ0FDN0MsTUFBc0IsRUFBRSxHQUFnQztRQUMxRCxJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakQsSUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXFDLEdBQUcsQ0FBQyxTQUFXLENBQUMsQ0FBQztTQUN2RTtRQUNELElBQUksT0FBTyxDQUFDLFNBQVMsS0FBSyxJQUFJLEVBQUU7WUFDOUIsT0FBTyxPQUFPLENBQUM7U0FDaEI7UUFFRCxJQUFNLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUFxQixDQUFDO1FBQ3hELElBQU0scUJBQXFCLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUM7UUFDM0QsSUFBTSxxQkFBcUIsR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztRQUMzRCxJQUFNLHdCQUF3QixHQUFHLElBQUksR0FBRyxFQUFxQixDQUFDO1FBQzlELElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztRQUN0QixJQUFJLE1BQU0sR0FBRyx1Q0FBb0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMxQyxJQUFJLE9BQU8sR0FBRyx1Q0FBb0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMzQyxJQUFJLFlBQVksR0FBWSxLQUFLLENBQUM7UUFFbEMsSUFBTSxXQUFXLEdBQUcsVUFBQyxJQUFtQjs7WUFDdEMsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFNBQVMsRUFBRTtnQkFDaEMsU0FBUyxHQUFHLElBQUksQ0FBQzthQUNsQjtpQkFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxFQUFFO2dCQUNsQyxJQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUM3RCxJQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUU7b0JBQ3JCLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDdkI7cUJBQU07b0JBQ0wsc0VBQXNFO29CQUN0RSxTQUFTLEdBQUcsSUFBSSxDQUFDO2lCQUNsQjthQUNGO1lBRUQsWUFBWSxHQUFHLFlBQVksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDO1lBRWpELE1BQU0sR0FBRyx1Q0FBb0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6RCxPQUFPLEdBQUcsdUNBQW9CLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7O2dCQUU1RCxLQUFnQyxJQUFBLEtBQUEsaUJBQUEsSUFBSSxDQUFDLGtCQUFrQixDQUFBLGdCQUFBLDRCQUFFO29CQUFwRCxJQUFNLGlCQUFpQixXQUFBO29CQUMxQixrQkFBa0IsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztpQkFDM0M7Ozs7Ozs7Ozs7Z0JBQ0QsS0FBbUMsSUFBQSxLQUFBLGlCQUFBLElBQUksQ0FBQyxxQkFBcUIsQ0FBQSxnQkFBQSw0QkFBRTtvQkFBMUQsSUFBTSxvQkFBb0IsV0FBQTtvQkFDN0IscUJBQXFCLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7aUJBQ2pEOzs7Ozs7Ozs7O2dCQUNELEtBQW1DLElBQUEsS0FBQSxpQkFBQSxJQUFJLENBQUMscUJBQXFCLENBQUEsZ0JBQUEsNEJBQUU7b0JBQTFELElBQU0sb0JBQW9CLFdBQUE7b0JBQzdCLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2lCQUNqRDs7Ozs7Ozs7OztnQkFDRCxLQUFvQixJQUFBLEtBQUEsaUJBQUEsSUFBSSxDQUFDLHdCQUF3QixDQUFBLGdCQUFBLDRCQUFFO29CQUE5QyxJQUFNLEtBQUssV0FBQTtvQkFDZCx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ3JDOzs7Ozs7Ozs7UUFDSCxDQUFDLENBQUM7UUFFRixXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFckIsNkNBQ0ssT0FBTyxLQUNWLE1BQU0sUUFBQTtZQUNOLE9BQU8sU0FBQTtZQUNQLGtCQUFrQixvQkFBQTtZQUNsQixxQkFBcUIsdUJBQUE7WUFDckIscUJBQXFCLHVCQUFBO1lBQ3JCLHdCQUF3QiwwQkFBQSxFQUN4QixTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksRUFDdkMsWUFBWSxjQUFBLElBQ1o7SUFDSixDQUFDO0lBaEVELDhFQWdFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1JlZmVyZW5jZX0gZnJvbSAnLi4vLi4vaW1wb3J0cyc7XG5pbXBvcnQge0NsYXNzRGVjbGFyYXRpb259IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuXG5pbXBvcnQge0RpcmVjdGl2ZU1ldGEsIE1ldGFkYXRhUmVhZGVyfSBmcm9tICcuL2FwaSc7XG5pbXBvcnQge0NsYXNzUHJvcGVydHlNYXBwaW5nLCBDbGFzc1Byb3BlcnR5TmFtZX0gZnJvbSAnLi9wcm9wZXJ0eV9tYXBwaW5nJztcblxuLyoqXG4gKiBHaXZlbiBhIHJlZmVyZW5jZSB0byBhIGRpcmVjdGl2ZSwgcmV0dXJuIGEgZmxhdHRlbmVkIHZlcnNpb24gb2YgaXRzIGBEaXJlY3RpdmVNZXRhYCBtZXRhZGF0YVxuICogd2hpY2ggaW5jbHVkZXMgbWV0YWRhdGEgZnJvbSBpdHMgZW50aXJlIGluaGVyaXRhbmNlIGNoYWluLlxuICpcbiAqIFRoZSByZXR1cm5lZCBgRGlyZWN0aXZlTWV0YWAgd2lsbCBlaXRoZXIgaGF2ZSBgYmFzZUNsYXNzOiBudWxsYCBpZiB0aGUgaW5oZXJpdGFuY2UgY2hhaW4gY291bGQgYmVcbiAqIGZ1bGx5IHJlc29sdmVkLCBvciBgYmFzZUNsYXNzOiAnZHluYW1pYydgIGlmIHRoZSBpbmhlcml0YW5jZSBjaGFpbiBjb3VsZCBub3QgYmUgY29tcGxldGVseVxuICogZm9sbG93ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmbGF0dGVuSW5oZXJpdGVkRGlyZWN0aXZlTWV0YWRhdGEoXG4gICAgcmVhZGVyOiBNZXRhZGF0YVJlYWRlciwgZGlyOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj4pOiBEaXJlY3RpdmVNZXRhIHtcbiAgY29uc3QgdG9wTWV0YSA9IHJlYWRlci5nZXREaXJlY3RpdmVNZXRhZGF0YShkaXIpO1xuICBpZiAodG9wTWV0YSA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgTWV0YWRhdGEgbm90IGZvdW5kIGZvciBkaXJlY3RpdmU6ICR7ZGlyLmRlYnVnTmFtZX1gKTtcbiAgfVxuICBpZiAodG9wTWV0YS5iYXNlQ2xhc3MgPT09IG51bGwpIHtcbiAgICByZXR1cm4gdG9wTWV0YTtcbiAgfVxuXG4gIGNvbnN0IGNvZXJjZWRJbnB1dEZpZWxkcyA9IG5ldyBTZXQ8Q2xhc3NQcm9wZXJ0eU5hbWU+KCk7XG4gIGNvbnN0IHVuZGVjbGFyZWRJbnB1dEZpZWxkcyA9IG5ldyBTZXQ8Q2xhc3NQcm9wZXJ0eU5hbWU+KCk7XG4gIGNvbnN0IHJlc3RyaWN0ZWRJbnB1dEZpZWxkcyA9IG5ldyBTZXQ8Q2xhc3NQcm9wZXJ0eU5hbWU+KCk7XG4gIGNvbnN0IHN0cmluZ0xpdGVyYWxJbnB1dEZpZWxkcyA9IG5ldyBTZXQ8Q2xhc3NQcm9wZXJ0eU5hbWU+KCk7XG4gIGxldCBpc0R5bmFtaWMgPSBmYWxzZTtcbiAgbGV0IGlucHV0cyA9IENsYXNzUHJvcGVydHlNYXBwaW5nLmVtcHR5KCk7XG4gIGxldCBvdXRwdXRzID0gQ2xhc3NQcm9wZXJ0eU1hcHBpbmcuZW1wdHkoKTtcbiAgbGV0IGlzU3RydWN0dXJhbDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGNvbnN0IGFkZE1ldGFkYXRhID0gKG1ldGE6IERpcmVjdGl2ZU1ldGEpOiB2b2lkID0+IHtcbiAgICBpZiAobWV0YS5iYXNlQ2xhc3MgPT09ICdkeW5hbWljJykge1xuICAgICAgaXNEeW5hbWljID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKG1ldGEuYmFzZUNsYXNzICE9PSBudWxsKSB7XG4gICAgICBjb25zdCBiYXNlTWV0YSA9IHJlYWRlci5nZXREaXJlY3RpdmVNZXRhZGF0YShtZXRhLmJhc2VDbGFzcyk7XG4gICAgICBpZiAoYmFzZU1ldGEgIT09IG51bGwpIHtcbiAgICAgICAgYWRkTWV0YWRhdGEoYmFzZU1ldGEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTWlzc2luZyBtZXRhZGF0YSBmb3IgdGhlIGJhc2UgY2xhc3MgbWVhbnMgaXQncyBlZmZlY3RpdmVseSBkeW5hbWljLlxuICAgICAgICBpc0R5bmFtaWMgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlzU3RydWN0dXJhbCA9IGlzU3RydWN0dXJhbCB8fCBtZXRhLmlzU3RydWN0dXJhbDtcblxuICAgIGlucHV0cyA9IENsYXNzUHJvcGVydHlNYXBwaW5nLm1lcmdlKGlucHV0cywgbWV0YS5pbnB1dHMpO1xuICAgIG91dHB1dHMgPSBDbGFzc1Byb3BlcnR5TWFwcGluZy5tZXJnZShvdXRwdXRzLCBtZXRhLm91dHB1dHMpO1xuXG4gICAgZm9yIChjb25zdCBjb2VyY2VkSW5wdXRGaWVsZCBvZiBtZXRhLmNvZXJjZWRJbnB1dEZpZWxkcykge1xuICAgICAgY29lcmNlZElucHV0RmllbGRzLmFkZChjb2VyY2VkSW5wdXRGaWVsZCk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgdW5kZWNsYXJlZElucHV0RmllbGQgb2YgbWV0YS51bmRlY2xhcmVkSW5wdXRGaWVsZHMpIHtcbiAgICAgIHVuZGVjbGFyZWRJbnB1dEZpZWxkcy5hZGQodW5kZWNsYXJlZElucHV0RmllbGQpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IHJlc3RyaWN0ZWRJbnB1dEZpZWxkIG9mIG1ldGEucmVzdHJpY3RlZElucHV0RmllbGRzKSB7XG4gICAgICByZXN0cmljdGVkSW5wdXRGaWVsZHMuYWRkKHJlc3RyaWN0ZWRJbnB1dEZpZWxkKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBmaWVsZCBvZiBtZXRhLnN0cmluZ0xpdGVyYWxJbnB1dEZpZWxkcykge1xuICAgICAgc3RyaW5nTGl0ZXJhbElucHV0RmllbGRzLmFkZChmaWVsZCk7XG4gICAgfVxuICB9O1xuXG4gIGFkZE1ldGFkYXRhKHRvcE1ldGEpO1xuXG4gIHJldHVybiB7XG4gICAgLi4udG9wTWV0YSxcbiAgICBpbnB1dHMsXG4gICAgb3V0cHV0cyxcbiAgICBjb2VyY2VkSW5wdXRGaWVsZHMsXG4gICAgdW5kZWNsYXJlZElucHV0RmllbGRzLFxuICAgIHJlc3RyaWN0ZWRJbnB1dEZpZWxkcyxcbiAgICBzdHJpbmdMaXRlcmFsSW5wdXRGaWVsZHMsXG4gICAgYmFzZUNsYXNzOiBpc0R5bmFtaWMgPyAnZHluYW1pYycgOiBudWxsLFxuICAgIGlzU3RydWN0dXJhbCxcbiAgfTtcbn1cbiJdfQ==