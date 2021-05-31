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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/factory", ["require", "exports", "@angular/compiler"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.compileDeclareFactory = exports.compileNgFactoryDefField = void 0;
    var compiler_1 = require("@angular/compiler");
    function compileNgFactoryDefField(metadata) {
        var res = compiler_1.compileFactoryFunction(metadata);
        return { name: 'ɵfac', initializer: res.expression, statements: res.statements, type: res.type };
    }
    exports.compileNgFactoryDefField = compileNgFactoryDefField;
    function compileDeclareFactory(metadata) {
        var res = compiler_1.compileDeclareFactoryFunction(metadata);
        return { name: 'ɵfac', initializer: res.expression, statements: res.statements, type: res.type };
    }
    exports.compileDeclareFactory = compileDeclareFactory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvYW5ub3RhdGlvbnMvc3JjL2ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsOENBQTJHO0lBTTNHLFNBQWdCLHdCQUF3QixDQUFDLFFBQTJCO1FBQ2xFLElBQU0sR0FBRyxHQUFHLGlDQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdDLE9BQU8sRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxHQUFHLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFDLENBQUM7SUFDakcsQ0FBQztJQUhELDREQUdDO0lBRUQsU0FBZ0IscUJBQXFCLENBQUMsUUFBMkI7UUFDL0QsSUFBTSxHQUFHLEdBQUcsd0NBQTZCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEQsT0FBTyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUMsQ0FBQztJQUNqRyxDQUFDO0lBSEQsc0RBR0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtjb21waWxlRGVjbGFyZUZhY3RvcnlGdW5jdGlvbiwgY29tcGlsZUZhY3RvcnlGdW5jdGlvbiwgUjNGYWN0b3J5TWV0YWRhdGF9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcblxuaW1wb3J0IHtDb21waWxlUmVzdWx0fSBmcm9tICcuLi8uLi90cmFuc2Zvcm0nO1xuXG5leHBvcnQgdHlwZSBDb21waWxlRmFjdG9yeUZuID0gKG1ldGFkYXRhOiBSM0ZhY3RvcnlNZXRhZGF0YSkgPT4gQ29tcGlsZVJlc3VsdDtcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVOZ0ZhY3RvcnlEZWZGaWVsZChtZXRhZGF0YTogUjNGYWN0b3J5TWV0YWRhdGEpOiBDb21waWxlUmVzdWx0IHtcbiAgY29uc3QgcmVzID0gY29tcGlsZUZhY3RvcnlGdW5jdGlvbihtZXRhZGF0YSk7XG4gIHJldHVybiB7bmFtZTogJ8m1ZmFjJywgaW5pdGlhbGl6ZXI6IHJlcy5leHByZXNzaW9uLCBzdGF0ZW1lbnRzOiByZXMuc3RhdGVtZW50cywgdHlwZTogcmVzLnR5cGV9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZURlY2xhcmVGYWN0b3J5KG1ldGFkYXRhOiBSM0ZhY3RvcnlNZXRhZGF0YSk6IENvbXBpbGVSZXN1bHQge1xuICBjb25zdCByZXMgPSBjb21waWxlRGVjbGFyZUZhY3RvcnlGdW5jdGlvbihtZXRhZGF0YSk7XG4gIHJldHVybiB7bmFtZTogJ8m1ZmFjJywgaW5pdGlhbGl6ZXI6IHJlcy5leHByZXNzaW9uLCBzdGF0ZW1lbnRzOiByZXMuc3RhdGVtZW50cywgdHlwZTogcmVzLnR5cGV9O1xufVxuIl19