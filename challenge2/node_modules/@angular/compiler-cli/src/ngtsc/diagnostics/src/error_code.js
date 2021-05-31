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
        define("@angular/compiler-cli/src/ngtsc/diagnostics/src/error_code", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ngErrorCode = exports.COMPILER_ERRORS_WITH_GUIDES = exports.ERROR_DETAILS_PAGE_BASE_URL = exports.ErrorCode = void 0;
    /**
     * @publicApi
     */
    var ErrorCode;
    (function (ErrorCode) {
        ErrorCode[ErrorCode["DECORATOR_ARG_NOT_LITERAL"] = 1001] = "DECORATOR_ARG_NOT_LITERAL";
        ErrorCode[ErrorCode["DECORATOR_ARITY_WRONG"] = 1002] = "DECORATOR_ARITY_WRONG";
        ErrorCode[ErrorCode["DECORATOR_NOT_CALLED"] = 1003] = "DECORATOR_NOT_CALLED";
        ErrorCode[ErrorCode["DECORATOR_ON_ANONYMOUS_CLASS"] = 1004] = "DECORATOR_ON_ANONYMOUS_CLASS";
        ErrorCode[ErrorCode["DECORATOR_UNEXPECTED"] = 1005] = "DECORATOR_UNEXPECTED";
        /**
         * This error code indicates that there are incompatible decorators on a type or a class field.
         */
        ErrorCode[ErrorCode["DECORATOR_COLLISION"] = 1006] = "DECORATOR_COLLISION";
        ErrorCode[ErrorCode["VALUE_HAS_WRONG_TYPE"] = 1010] = "VALUE_HAS_WRONG_TYPE";
        ErrorCode[ErrorCode["VALUE_NOT_LITERAL"] = 1011] = "VALUE_NOT_LITERAL";
        ErrorCode[ErrorCode["COMPONENT_MISSING_TEMPLATE"] = 2001] = "COMPONENT_MISSING_TEMPLATE";
        ErrorCode[ErrorCode["PIPE_MISSING_NAME"] = 2002] = "PIPE_MISSING_NAME";
        ErrorCode[ErrorCode["PARAM_MISSING_TOKEN"] = 2003] = "PARAM_MISSING_TOKEN";
        ErrorCode[ErrorCode["DIRECTIVE_MISSING_SELECTOR"] = 2004] = "DIRECTIVE_MISSING_SELECTOR";
        /** Raised when an undecorated class is passed in as a provider to a module or a directive. */
        ErrorCode[ErrorCode["UNDECORATED_PROVIDER"] = 2005] = "UNDECORATED_PROVIDER";
        /**
         * Raised when a Directive inherits its constructor from a base class without an Angular
         * decorator.
         */
        ErrorCode[ErrorCode["DIRECTIVE_INHERITS_UNDECORATED_CTOR"] = 2006] = "DIRECTIVE_INHERITS_UNDECORATED_CTOR";
        /**
         * Raised when an undecorated class that is using Angular features
         * has been discovered.
         */
        ErrorCode[ErrorCode["UNDECORATED_CLASS_USING_ANGULAR_FEATURES"] = 2007] = "UNDECORATED_CLASS_USING_ANGULAR_FEATURES";
        /**
         * Raised when an component cannot resolve an external resource, such as a template or a style
         * sheet.
         */
        ErrorCode[ErrorCode["COMPONENT_RESOURCE_NOT_FOUND"] = 2008] = "COMPONENT_RESOURCE_NOT_FOUND";
        ErrorCode[ErrorCode["SYMBOL_NOT_EXPORTED"] = 3001] = "SYMBOL_NOT_EXPORTED";
        ErrorCode[ErrorCode["SYMBOL_EXPORTED_UNDER_DIFFERENT_NAME"] = 3002] = "SYMBOL_EXPORTED_UNDER_DIFFERENT_NAME";
        /**
         * Raised when a relationship between directives and/or pipes would cause a cyclic import to be
         * created that cannot be handled, such as in partial compilation mode.
         */
        ErrorCode[ErrorCode["IMPORT_CYCLE_DETECTED"] = 3003] = "IMPORT_CYCLE_DETECTED";
        ErrorCode[ErrorCode["CONFIG_FLAT_MODULE_NO_INDEX"] = 4001] = "CONFIG_FLAT_MODULE_NO_INDEX";
        ErrorCode[ErrorCode["CONFIG_STRICT_TEMPLATES_IMPLIES_FULL_TEMPLATE_TYPECHECK"] = 4002] = "CONFIG_STRICT_TEMPLATES_IMPLIES_FULL_TEMPLATE_TYPECHECK";
        /**
         * Raised when a host expression has a parse error, such as a host listener or host binding
         * expression containing a pipe.
         */
        ErrorCode[ErrorCode["HOST_BINDING_PARSE_ERROR"] = 5001] = "HOST_BINDING_PARSE_ERROR";
        /**
         * Raised when the compiler cannot parse a component's template.
         */
        ErrorCode[ErrorCode["TEMPLATE_PARSE_ERROR"] = 5002] = "TEMPLATE_PARSE_ERROR";
        /**
         * Raised when an NgModule contains an invalid reference in `declarations`.
         */
        ErrorCode[ErrorCode["NGMODULE_INVALID_DECLARATION"] = 6001] = "NGMODULE_INVALID_DECLARATION";
        /**
         * Raised when an NgModule contains an invalid type in `imports`.
         */
        ErrorCode[ErrorCode["NGMODULE_INVALID_IMPORT"] = 6002] = "NGMODULE_INVALID_IMPORT";
        /**
         * Raised when an NgModule contains an invalid type in `exports`.
         */
        ErrorCode[ErrorCode["NGMODULE_INVALID_EXPORT"] = 6003] = "NGMODULE_INVALID_EXPORT";
        /**
         * Raised when an NgModule contains a type in `exports` which is neither in `declarations` nor
         * otherwise imported.
         */
        ErrorCode[ErrorCode["NGMODULE_INVALID_REEXPORT"] = 6004] = "NGMODULE_INVALID_REEXPORT";
        /**
         * Raised when a `ModuleWithProviders` with a missing
         * generic type argument is passed into an `NgModule`.
         */
        ErrorCode[ErrorCode["NGMODULE_MODULE_WITH_PROVIDERS_MISSING_GENERIC"] = 6005] = "NGMODULE_MODULE_WITH_PROVIDERS_MISSING_GENERIC";
        /**
         * Raised when an NgModule exports multiple directives/pipes of the same name and the compiler
         * attempts to generate private re-exports within the NgModule file.
         */
        ErrorCode[ErrorCode["NGMODULE_REEXPORT_NAME_COLLISION"] = 6006] = "NGMODULE_REEXPORT_NAME_COLLISION";
        /**
         * Raised when a directive/pipe is part of the declarations of two or more NgModules.
         */
        ErrorCode[ErrorCode["NGMODULE_DECLARATION_NOT_UNIQUE"] = 6007] = "NGMODULE_DECLARATION_NOT_UNIQUE";
        /**
         * Not actually raised by the compiler, but reserved for documentation of a View Engine error when
         * a View Engine build depends on an Ivy-compiled NgModule.
         */
        ErrorCode[ErrorCode["NGMODULE_VE_DEPENDENCY_ON_IVY_LIB"] = 6999] = "NGMODULE_VE_DEPENDENCY_ON_IVY_LIB";
        /**
         * An element name failed validation against the DOM schema.
         */
        ErrorCode[ErrorCode["SCHEMA_INVALID_ELEMENT"] = 8001] = "SCHEMA_INVALID_ELEMENT";
        /**
         * An element's attribute name failed validation against the DOM schema.
         */
        ErrorCode[ErrorCode["SCHEMA_INVALID_ATTRIBUTE"] = 8002] = "SCHEMA_INVALID_ATTRIBUTE";
        /**
         * No matching directive was found for a `#ref="target"` expression.
         */
        ErrorCode[ErrorCode["MISSING_REFERENCE_TARGET"] = 8003] = "MISSING_REFERENCE_TARGET";
        /**
         * No matching pipe was found for a
         */
        ErrorCode[ErrorCode["MISSING_PIPE"] = 8004] = "MISSING_PIPE";
        /**
         * The left-hand side of an assignment expression was a template variable. Effectively, the
         * template looked like:
         *
         * ```
         * <ng-template let-something>
         *   <button (click)="something = ...">...</button>
         * </ng-template>
         * ```
         *
         * Template variables are read-only.
         */
        ErrorCode[ErrorCode["WRITE_TO_READ_ONLY_VARIABLE"] = 8005] = "WRITE_TO_READ_ONLY_VARIABLE";
        /**
         * A template variable was declared twice. For example:
         *
         * ```html
         * <div *ngFor="let i of items; let i = index">
         * </div>
         * ```
         */
        ErrorCode[ErrorCode["DUPLICATE_VARIABLE_DECLARATION"] = 8006] = "DUPLICATE_VARIABLE_DECLARATION";
        /**
         * The template type-checking engine would need to generate an inline type check block for a
         * component, but the current type-checking environment doesn't support it.
         */
        ErrorCode[ErrorCode["INLINE_TCB_REQUIRED"] = 8900] = "INLINE_TCB_REQUIRED";
        /**
         * The template type-checking engine would need to generate an inline type constructor for a
         * directive or component, but the current type-checking environment doesn't support it.
         */
        ErrorCode[ErrorCode["INLINE_TYPE_CTOR_REQUIRED"] = 8901] = "INLINE_TYPE_CTOR_REQUIRED";
        /**
         * An injectable already has a `ɵprov` property.
         */
        ErrorCode[ErrorCode["INJECTABLE_DUPLICATE_PROV"] = 9001] = "INJECTABLE_DUPLICATE_PROV";
        // 10XXX error codes are reserved for diagnostics with categories other than
        // `ts.DiagnosticCategory.Error`. These diagnostics are generated by the compiler when configured
        // to do so by a tool such as the Language Service, or by the Language Service itself.
        /**
         * Suggest users to enable `strictTemplates` to make use of full capabilities
         * provided by Angular language service.
         */
        ErrorCode[ErrorCode["SUGGEST_STRICT_TEMPLATES"] = 10001] = "SUGGEST_STRICT_TEMPLATES";
        /**
         * Indicates that a particular structural directive provides advanced type narrowing
         * functionality, but the current template type-checking configuration does not allow its usage in
         * type inference.
         */
        ErrorCode[ErrorCode["SUGGEST_SUBOPTIMAL_TYPE_INFERENCE"] = 10002] = "SUGGEST_SUBOPTIMAL_TYPE_INFERENCE";
    })(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
    /**
     * @internal
     * Base URL for the error details page.
     * Keep this value in sync with a similar const in
     * `packages/core/src/render3/error_code.ts`.
     */
    exports.ERROR_DETAILS_PAGE_BASE_URL = 'https://angular.io/errors';
    /**
     * @internal
     * Contains a set of error messages that have detailed guides at angular.io.
     * Full list of available error guides can be found at https://angular.io/errors
     */
    exports.COMPILER_ERRORS_WITH_GUIDES = new Set([
        ErrorCode.DECORATOR_ARG_NOT_LITERAL,
        ErrorCode.IMPORT_CYCLE_DETECTED,
        ErrorCode.PARAM_MISSING_TOKEN,
        ErrorCode.SCHEMA_INVALID_ELEMENT,
        ErrorCode.SCHEMA_INVALID_ATTRIBUTE,
        ErrorCode.MISSING_REFERENCE_TARGET,
    ]);
    /**
     * @internal
     */
    function ngErrorCode(code) {
        return parseInt('-99' + code);
    }
    exports.ngErrorCode = ngErrorCode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JfY29kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvZGlhZ25vc3RpY3Mvc3JjL2Vycm9yX2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUg7O09BRUc7SUFDSCxJQUFZLFNBd0xYO0lBeExELFdBQVksU0FBUztRQUNuQixzRkFBZ0MsQ0FBQTtRQUNoQyw4RUFBNEIsQ0FBQTtRQUM1Qiw0RUFBMkIsQ0FBQTtRQUMzQiw0RkFBbUMsQ0FBQTtRQUNuQyw0RUFBMkIsQ0FBQTtRQUUzQjs7V0FFRztRQUNILDBFQUEwQixDQUFBO1FBRTFCLDRFQUEyQixDQUFBO1FBQzNCLHNFQUF3QixDQUFBO1FBRXhCLHdGQUFpQyxDQUFBO1FBQ2pDLHNFQUF3QixDQUFBO1FBQ3hCLDBFQUEwQixDQUFBO1FBQzFCLHdGQUFpQyxDQUFBO1FBRWpDLDhGQUE4RjtRQUM5Riw0RUFBMkIsQ0FBQTtRQUUzQjs7O1dBR0c7UUFDSCwwR0FBMEMsQ0FBQTtRQUUxQzs7O1dBR0c7UUFDSCxvSEFBK0MsQ0FBQTtRQUUvQzs7O1dBR0c7UUFDSCw0RkFBbUMsQ0FBQTtRQUVuQywwRUFBMEIsQ0FBQTtRQUMxQiw0R0FBMkMsQ0FBQTtRQUMzQzs7O1dBR0c7UUFDSCw4RUFBNEIsQ0FBQTtRQUU1QiwwRkFBa0MsQ0FBQTtRQUNsQyxrSkFBOEQsQ0FBQTtRQUU5RDs7O1dBR0c7UUFDSCxvRkFBK0IsQ0FBQTtRQUUvQjs7V0FFRztRQUNILDRFQUEyQixDQUFBO1FBRTNCOztXQUVHO1FBQ0gsNEZBQW1DLENBQUE7UUFFbkM7O1dBRUc7UUFDSCxrRkFBOEIsQ0FBQTtRQUU5Qjs7V0FFRztRQUNILGtGQUE4QixDQUFBO1FBRTlCOzs7V0FHRztRQUNILHNGQUFnQyxDQUFBO1FBRWhDOzs7V0FHRztRQUNILGdJQUFxRCxDQUFBO1FBRXJEOzs7V0FHRztRQUNILG9HQUF1QyxDQUFBO1FBRXZDOztXQUVHO1FBQ0gsa0dBQXNDLENBQUE7UUFFdEM7OztXQUdHO1FBQ0gsc0dBQXdDLENBQUE7UUFFeEM7O1dBRUc7UUFDSCxnRkFBNkIsQ0FBQTtRQUU3Qjs7V0FFRztRQUNILG9GQUErQixDQUFBO1FBRS9COztXQUVHO1FBQ0gsb0ZBQStCLENBQUE7UUFFL0I7O1dBRUc7UUFDSCw0REFBbUIsQ0FBQTtRQUVuQjs7Ozs7Ozs7Ozs7V0FXRztRQUNILDBGQUFrQyxDQUFBO1FBRWxDOzs7Ozs7O1dBT0c7UUFDSCxnR0FBcUMsQ0FBQTtRQUVyQzs7O1dBR0c7UUFDSCwwRUFBMEIsQ0FBQTtRQUUxQjs7O1dBR0c7UUFDSCxzRkFBZ0MsQ0FBQTtRQUVoQzs7V0FFRztRQUNILHNGQUFnQyxDQUFBO1FBRWhDLDRFQUE0RTtRQUM1RSxpR0FBaUc7UUFDakcsc0ZBQXNGO1FBRXRGOzs7V0FHRztRQUNILHFGQUFnQyxDQUFBO1FBRWhDOzs7O1dBSUc7UUFDSCx1R0FBeUMsQ0FBQTtJQUMzQyxDQUFDLEVBeExXLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBd0xwQjtJQUVEOzs7OztPQUtHO0lBQ1UsUUFBQSwyQkFBMkIsR0FBRywyQkFBMkIsQ0FBQztJQUV2RTs7OztPQUlHO0lBQ1UsUUFBQSwyQkFBMkIsR0FBRyxJQUFJLEdBQUcsQ0FBQztRQUNqRCxTQUFTLENBQUMseUJBQXlCO1FBQ25DLFNBQVMsQ0FBQyxxQkFBcUI7UUFDL0IsU0FBUyxDQUFDLG1CQUFtQjtRQUM3QixTQUFTLENBQUMsc0JBQXNCO1FBQ2hDLFNBQVMsQ0FBQyx3QkFBd0I7UUFDbEMsU0FBUyxDQUFDLHdCQUF3QjtLQUNuQyxDQUFDLENBQUM7SUFFSDs7T0FFRztJQUNILFNBQWdCLFdBQVcsQ0FBQyxJQUFlO1FBQ3pDLE9BQU8sUUFBUSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRkQsa0NBRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBlbnVtIEVycm9yQ29kZSB7XG4gIERFQ09SQVRPUl9BUkdfTk9UX0xJVEVSQUwgPSAxMDAxLFxuICBERUNPUkFUT1JfQVJJVFlfV1JPTkcgPSAxMDAyLFxuICBERUNPUkFUT1JfTk9UX0NBTExFRCA9IDEwMDMsXG4gIERFQ09SQVRPUl9PTl9BTk9OWU1PVVNfQ0xBU1MgPSAxMDA0LFxuICBERUNPUkFUT1JfVU5FWFBFQ1RFRCA9IDEwMDUsXG5cbiAgLyoqXG4gICAqIFRoaXMgZXJyb3IgY29kZSBpbmRpY2F0ZXMgdGhhdCB0aGVyZSBhcmUgaW5jb21wYXRpYmxlIGRlY29yYXRvcnMgb24gYSB0eXBlIG9yIGEgY2xhc3MgZmllbGQuXG4gICAqL1xuICBERUNPUkFUT1JfQ09MTElTSU9OID0gMTAwNixcblxuICBWQUxVRV9IQVNfV1JPTkdfVFlQRSA9IDEwMTAsXG4gIFZBTFVFX05PVF9MSVRFUkFMID0gMTAxMSxcblxuICBDT01QT05FTlRfTUlTU0lOR19URU1QTEFURSA9IDIwMDEsXG4gIFBJUEVfTUlTU0lOR19OQU1FID0gMjAwMixcbiAgUEFSQU1fTUlTU0lOR19UT0tFTiA9IDIwMDMsXG4gIERJUkVDVElWRV9NSVNTSU5HX1NFTEVDVE9SID0gMjAwNCxcblxuICAvKiogUmFpc2VkIHdoZW4gYW4gdW5kZWNvcmF0ZWQgY2xhc3MgaXMgcGFzc2VkIGluIGFzIGEgcHJvdmlkZXIgdG8gYSBtb2R1bGUgb3IgYSBkaXJlY3RpdmUuICovXG4gIFVOREVDT1JBVEVEX1BST1ZJREVSID0gMjAwNSxcblxuICAvKipcbiAgICogUmFpc2VkIHdoZW4gYSBEaXJlY3RpdmUgaW5oZXJpdHMgaXRzIGNvbnN0cnVjdG9yIGZyb20gYSBiYXNlIGNsYXNzIHdpdGhvdXQgYW4gQW5ndWxhclxuICAgKiBkZWNvcmF0b3IuXG4gICAqL1xuICBESVJFQ1RJVkVfSU5IRVJJVFNfVU5ERUNPUkFURURfQ1RPUiA9IDIwMDYsXG5cbiAgLyoqXG4gICAqIFJhaXNlZCB3aGVuIGFuIHVuZGVjb3JhdGVkIGNsYXNzIHRoYXQgaXMgdXNpbmcgQW5ndWxhciBmZWF0dXJlc1xuICAgKiBoYXMgYmVlbiBkaXNjb3ZlcmVkLlxuICAgKi9cbiAgVU5ERUNPUkFURURfQ0xBU1NfVVNJTkdfQU5HVUxBUl9GRUFUVVJFUyA9IDIwMDcsXG5cbiAgLyoqXG4gICAqIFJhaXNlZCB3aGVuIGFuIGNvbXBvbmVudCBjYW5ub3QgcmVzb2x2ZSBhbiBleHRlcm5hbCByZXNvdXJjZSwgc3VjaCBhcyBhIHRlbXBsYXRlIG9yIGEgc3R5bGVcbiAgICogc2hlZXQuXG4gICAqL1xuICBDT01QT05FTlRfUkVTT1VSQ0VfTk9UX0ZPVU5EID0gMjAwOCxcblxuICBTWU1CT0xfTk9UX0VYUE9SVEVEID0gMzAwMSxcbiAgU1lNQk9MX0VYUE9SVEVEX1VOREVSX0RJRkZFUkVOVF9OQU1FID0gMzAwMixcbiAgLyoqXG4gICAqIFJhaXNlZCB3aGVuIGEgcmVsYXRpb25zaGlwIGJldHdlZW4gZGlyZWN0aXZlcyBhbmQvb3IgcGlwZXMgd291bGQgY2F1c2UgYSBjeWNsaWMgaW1wb3J0IHRvIGJlXG4gICAqIGNyZWF0ZWQgdGhhdCBjYW5ub3QgYmUgaGFuZGxlZCwgc3VjaCBhcyBpbiBwYXJ0aWFsIGNvbXBpbGF0aW9uIG1vZGUuXG4gICAqL1xuICBJTVBPUlRfQ1lDTEVfREVURUNURUQgPSAzMDAzLFxuXG4gIENPTkZJR19GTEFUX01PRFVMRV9OT19JTkRFWCA9IDQwMDEsXG4gIENPTkZJR19TVFJJQ1RfVEVNUExBVEVTX0lNUExJRVNfRlVMTF9URU1QTEFURV9UWVBFQ0hFQ0sgPSA0MDAyLFxuXG4gIC8qKlxuICAgKiBSYWlzZWQgd2hlbiBhIGhvc3QgZXhwcmVzc2lvbiBoYXMgYSBwYXJzZSBlcnJvciwgc3VjaCBhcyBhIGhvc3QgbGlzdGVuZXIgb3IgaG9zdCBiaW5kaW5nXG4gICAqIGV4cHJlc3Npb24gY29udGFpbmluZyBhIHBpcGUuXG4gICAqL1xuICBIT1NUX0JJTkRJTkdfUEFSU0VfRVJST1IgPSA1MDAxLFxuXG4gIC8qKlxuICAgKiBSYWlzZWQgd2hlbiB0aGUgY29tcGlsZXIgY2Fubm90IHBhcnNlIGEgY29tcG9uZW50J3MgdGVtcGxhdGUuXG4gICAqL1xuICBURU1QTEFURV9QQVJTRV9FUlJPUiA9IDUwMDIsXG5cbiAgLyoqXG4gICAqIFJhaXNlZCB3aGVuIGFuIE5nTW9kdWxlIGNvbnRhaW5zIGFuIGludmFsaWQgcmVmZXJlbmNlIGluIGBkZWNsYXJhdGlvbnNgLlxuICAgKi9cbiAgTkdNT0RVTEVfSU5WQUxJRF9ERUNMQVJBVElPTiA9IDYwMDEsXG5cbiAgLyoqXG4gICAqIFJhaXNlZCB3aGVuIGFuIE5nTW9kdWxlIGNvbnRhaW5zIGFuIGludmFsaWQgdHlwZSBpbiBgaW1wb3J0c2AuXG4gICAqL1xuICBOR01PRFVMRV9JTlZBTElEX0lNUE9SVCA9IDYwMDIsXG5cbiAgLyoqXG4gICAqIFJhaXNlZCB3aGVuIGFuIE5nTW9kdWxlIGNvbnRhaW5zIGFuIGludmFsaWQgdHlwZSBpbiBgZXhwb3J0c2AuXG4gICAqL1xuICBOR01PRFVMRV9JTlZBTElEX0VYUE9SVCA9IDYwMDMsXG5cbiAgLyoqXG4gICAqIFJhaXNlZCB3aGVuIGFuIE5nTW9kdWxlIGNvbnRhaW5zIGEgdHlwZSBpbiBgZXhwb3J0c2Agd2hpY2ggaXMgbmVpdGhlciBpbiBgZGVjbGFyYXRpb25zYCBub3JcbiAgICogb3RoZXJ3aXNlIGltcG9ydGVkLlxuICAgKi9cbiAgTkdNT0RVTEVfSU5WQUxJRF9SRUVYUE9SVCA9IDYwMDQsXG5cbiAgLyoqXG4gICAqIFJhaXNlZCB3aGVuIGEgYE1vZHVsZVdpdGhQcm92aWRlcnNgIHdpdGggYSBtaXNzaW5nXG4gICAqIGdlbmVyaWMgdHlwZSBhcmd1bWVudCBpcyBwYXNzZWQgaW50byBhbiBgTmdNb2R1bGVgLlxuICAgKi9cbiAgTkdNT0RVTEVfTU9EVUxFX1dJVEhfUFJPVklERVJTX01JU1NJTkdfR0VORVJJQyA9IDYwMDUsXG5cbiAgLyoqXG4gICAqIFJhaXNlZCB3aGVuIGFuIE5nTW9kdWxlIGV4cG9ydHMgbXVsdGlwbGUgZGlyZWN0aXZlcy9waXBlcyBvZiB0aGUgc2FtZSBuYW1lIGFuZCB0aGUgY29tcGlsZXJcbiAgICogYXR0ZW1wdHMgdG8gZ2VuZXJhdGUgcHJpdmF0ZSByZS1leHBvcnRzIHdpdGhpbiB0aGUgTmdNb2R1bGUgZmlsZS5cbiAgICovXG4gIE5HTU9EVUxFX1JFRVhQT1JUX05BTUVfQ09MTElTSU9OID0gNjAwNixcblxuICAvKipcbiAgICogUmFpc2VkIHdoZW4gYSBkaXJlY3RpdmUvcGlwZSBpcyBwYXJ0IG9mIHRoZSBkZWNsYXJhdGlvbnMgb2YgdHdvIG9yIG1vcmUgTmdNb2R1bGVzLlxuICAgKi9cbiAgTkdNT0RVTEVfREVDTEFSQVRJT05fTk9UX1VOSVFVRSA9IDYwMDcsXG5cbiAgLyoqXG4gICAqIE5vdCBhY3R1YWxseSByYWlzZWQgYnkgdGhlIGNvbXBpbGVyLCBidXQgcmVzZXJ2ZWQgZm9yIGRvY3VtZW50YXRpb24gb2YgYSBWaWV3IEVuZ2luZSBlcnJvciB3aGVuXG4gICAqIGEgVmlldyBFbmdpbmUgYnVpbGQgZGVwZW5kcyBvbiBhbiBJdnktY29tcGlsZWQgTmdNb2R1bGUuXG4gICAqL1xuICBOR01PRFVMRV9WRV9ERVBFTkRFTkNZX09OX0lWWV9MSUIgPSA2OTk5LFxuXG4gIC8qKlxuICAgKiBBbiBlbGVtZW50IG5hbWUgZmFpbGVkIHZhbGlkYXRpb24gYWdhaW5zdCB0aGUgRE9NIHNjaGVtYS5cbiAgICovXG4gIFNDSEVNQV9JTlZBTElEX0VMRU1FTlQgPSA4MDAxLFxuXG4gIC8qKlxuICAgKiBBbiBlbGVtZW50J3MgYXR0cmlidXRlIG5hbWUgZmFpbGVkIHZhbGlkYXRpb24gYWdhaW5zdCB0aGUgRE9NIHNjaGVtYS5cbiAgICovXG4gIFNDSEVNQV9JTlZBTElEX0FUVFJJQlVURSA9IDgwMDIsXG5cbiAgLyoqXG4gICAqIE5vIG1hdGNoaW5nIGRpcmVjdGl2ZSB3YXMgZm91bmQgZm9yIGEgYCNyZWY9XCJ0YXJnZXRcImAgZXhwcmVzc2lvbi5cbiAgICovXG4gIE1JU1NJTkdfUkVGRVJFTkNFX1RBUkdFVCA9IDgwMDMsXG5cbiAgLyoqXG4gICAqIE5vIG1hdGNoaW5nIHBpcGUgd2FzIGZvdW5kIGZvciBhXG4gICAqL1xuICBNSVNTSU5HX1BJUEUgPSA4MDA0LFxuXG4gIC8qKlxuICAgKiBUaGUgbGVmdC1oYW5kIHNpZGUgb2YgYW4gYXNzaWdubWVudCBleHByZXNzaW9uIHdhcyBhIHRlbXBsYXRlIHZhcmlhYmxlLiBFZmZlY3RpdmVseSwgdGhlXG4gICAqIHRlbXBsYXRlIGxvb2tlZCBsaWtlOlxuICAgKlxuICAgKiBgYGBcbiAgICogPG5nLXRlbXBsYXRlIGxldC1zb21ldGhpbmc+XG4gICAqICAgPGJ1dHRvbiAoY2xpY2spPVwic29tZXRoaW5nID0gLi4uXCI+Li4uPC9idXR0b24+XG4gICAqIDwvbmctdGVtcGxhdGU+XG4gICAqIGBgYFxuICAgKlxuICAgKiBUZW1wbGF0ZSB2YXJpYWJsZXMgYXJlIHJlYWQtb25seS5cbiAgICovXG4gIFdSSVRFX1RPX1JFQURfT05MWV9WQVJJQUJMRSA9IDgwMDUsXG5cbiAgLyoqXG4gICAqIEEgdGVtcGxhdGUgdmFyaWFibGUgd2FzIGRlY2xhcmVkIHR3aWNlLiBGb3IgZXhhbXBsZTpcbiAgICpcbiAgICogYGBgaHRtbFxuICAgKiA8ZGl2ICpuZ0Zvcj1cImxldCBpIG9mIGl0ZW1zOyBsZXQgaSA9IGluZGV4XCI+XG4gICAqIDwvZGl2PlxuICAgKiBgYGBcbiAgICovXG4gIERVUExJQ0FURV9WQVJJQUJMRV9ERUNMQVJBVElPTiA9IDgwMDYsXG5cbiAgLyoqXG4gICAqIFRoZSB0ZW1wbGF0ZSB0eXBlLWNoZWNraW5nIGVuZ2luZSB3b3VsZCBuZWVkIHRvIGdlbmVyYXRlIGFuIGlubGluZSB0eXBlIGNoZWNrIGJsb2NrIGZvciBhXG4gICAqIGNvbXBvbmVudCwgYnV0IHRoZSBjdXJyZW50IHR5cGUtY2hlY2tpbmcgZW52aXJvbm1lbnQgZG9lc24ndCBzdXBwb3J0IGl0LlxuICAgKi9cbiAgSU5MSU5FX1RDQl9SRVFVSVJFRCA9IDg5MDAsXG5cbiAgLyoqXG4gICAqIFRoZSB0ZW1wbGF0ZSB0eXBlLWNoZWNraW5nIGVuZ2luZSB3b3VsZCBuZWVkIHRvIGdlbmVyYXRlIGFuIGlubGluZSB0eXBlIGNvbnN0cnVjdG9yIGZvciBhXG4gICAqIGRpcmVjdGl2ZSBvciBjb21wb25lbnQsIGJ1dCB0aGUgY3VycmVudCB0eXBlLWNoZWNraW5nIGVudmlyb25tZW50IGRvZXNuJ3Qgc3VwcG9ydCBpdC5cbiAgICovXG4gIElOTElORV9UWVBFX0NUT1JfUkVRVUlSRUQgPSA4OTAxLFxuXG4gIC8qKlxuICAgKiBBbiBpbmplY3RhYmxlIGFscmVhZHkgaGFzIGEgYMm1cHJvdmAgcHJvcGVydHkuXG4gICAqL1xuICBJTkpFQ1RBQkxFX0RVUExJQ0FURV9QUk9WID0gOTAwMSxcblxuICAvLyAxMFhYWCBlcnJvciBjb2RlcyBhcmUgcmVzZXJ2ZWQgZm9yIGRpYWdub3N0aWNzIHdpdGggY2F0ZWdvcmllcyBvdGhlciB0aGFuXG4gIC8vIGB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3JgLiBUaGVzZSBkaWFnbm9zdGljcyBhcmUgZ2VuZXJhdGVkIGJ5IHRoZSBjb21waWxlciB3aGVuIGNvbmZpZ3VyZWRcbiAgLy8gdG8gZG8gc28gYnkgYSB0b29sIHN1Y2ggYXMgdGhlIExhbmd1YWdlIFNlcnZpY2UsIG9yIGJ5IHRoZSBMYW5ndWFnZSBTZXJ2aWNlIGl0c2VsZi5cblxuICAvKipcbiAgICogU3VnZ2VzdCB1c2VycyB0byBlbmFibGUgYHN0cmljdFRlbXBsYXRlc2AgdG8gbWFrZSB1c2Ugb2YgZnVsbCBjYXBhYmlsaXRpZXNcbiAgICogcHJvdmlkZWQgYnkgQW5ndWxhciBsYW5ndWFnZSBzZXJ2aWNlLlxuICAgKi9cbiAgU1VHR0VTVF9TVFJJQ1RfVEVNUExBVEVTID0gMTAwMDEsXG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB0aGF0IGEgcGFydGljdWxhciBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSBwcm92aWRlcyBhZHZhbmNlZCB0eXBlIG5hcnJvd2luZ1xuICAgKiBmdW5jdGlvbmFsaXR5LCBidXQgdGhlIGN1cnJlbnQgdGVtcGxhdGUgdHlwZS1jaGVja2luZyBjb25maWd1cmF0aW9uIGRvZXMgbm90IGFsbG93IGl0cyB1c2FnZSBpblxuICAgKiB0eXBlIGluZmVyZW5jZS5cbiAgICovXG4gIFNVR0dFU1RfU1VCT1BUSU1BTF9UWVBFX0lORkVSRU5DRSA9IDEwMDAyLFxufVxuXG4vKipcbiAqIEBpbnRlcm5hbFxuICogQmFzZSBVUkwgZm9yIHRoZSBlcnJvciBkZXRhaWxzIHBhZ2UuXG4gKiBLZWVwIHRoaXMgdmFsdWUgaW4gc3luYyB3aXRoIGEgc2ltaWxhciBjb25zdCBpblxuICogYHBhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvZXJyb3JfY29kZS50c2AuXG4gKi9cbmV4cG9ydCBjb25zdCBFUlJPUl9ERVRBSUxTX1BBR0VfQkFTRV9VUkwgPSAnaHR0cHM6Ly9hbmd1bGFyLmlvL2Vycm9ycyc7XG5cbi8qKlxuICogQGludGVybmFsXG4gKiBDb250YWlucyBhIHNldCBvZiBlcnJvciBtZXNzYWdlcyB0aGF0IGhhdmUgZGV0YWlsZWQgZ3VpZGVzIGF0IGFuZ3VsYXIuaW8uXG4gKiBGdWxsIGxpc3Qgb2YgYXZhaWxhYmxlIGVycm9yIGd1aWRlcyBjYW4gYmUgZm91bmQgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2Vycm9yc1xuICovXG5leHBvcnQgY29uc3QgQ09NUElMRVJfRVJST1JTX1dJVEhfR1VJREVTID0gbmV3IFNldChbXG4gIEVycm9yQ29kZS5ERUNPUkFUT1JfQVJHX05PVF9MSVRFUkFMLFxuICBFcnJvckNvZGUuSU1QT1JUX0NZQ0xFX0RFVEVDVEVELFxuICBFcnJvckNvZGUuUEFSQU1fTUlTU0lOR19UT0tFTixcbiAgRXJyb3JDb2RlLlNDSEVNQV9JTlZBTElEX0VMRU1FTlQsXG4gIEVycm9yQ29kZS5TQ0hFTUFfSU5WQUxJRF9BVFRSSUJVVEUsXG4gIEVycm9yQ29kZS5NSVNTSU5HX1JFRkVSRU5DRV9UQVJHRVQsXG5dKTtcblxuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5nRXJyb3JDb2RlKGNvZGU6IEVycm9yQ29kZSk6IG51bWJlciB7XG4gIHJldHVybiBwYXJzZUludCgnLTk5JyArIGNvZGUpO1xufVxuIl19