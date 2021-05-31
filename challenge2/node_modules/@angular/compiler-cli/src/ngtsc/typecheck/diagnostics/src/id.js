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
        define("@angular/compiler-cli/src/ngtsc/typecheck/diagnostics/src/id", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTemplateId = void 0;
    var TEMPLATE_ID = Symbol('ngTemplateId');
    var NEXT_TEMPLATE_ID = Symbol('ngNextTemplateId');
    function getTemplateId(clazz) {
        var node = clazz;
        if (node[TEMPLATE_ID] === undefined) {
            node[TEMPLATE_ID] = allocateTemplateId(node.getSourceFile());
        }
        return node[TEMPLATE_ID];
    }
    exports.getTemplateId = getTemplateId;
    function allocateTemplateId(sf) {
        if (sf[NEXT_TEMPLATE_ID] === undefined) {
            sf[NEXT_TEMPLATE_ID] = 1;
        }
        return ("tcb" + sf[NEXT_TEMPLATE_ID]++);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3R5cGVjaGVjay9kaWFnbm9zdGljcy9zcmMvaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBUUgsSUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzNDLElBQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFVcEQsU0FBZ0IsYUFBYSxDQUFDLEtBQXNCO1FBQ2xELElBQU0sSUFBSSxHQUFHLEtBQWdELENBQUM7UUFDOUQsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssU0FBUyxFQUFFO1lBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztTQUM5RDtRQUNELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBRSxDQUFDO0lBQzVCLENBQUM7SUFORCxzQ0FNQztJQUVELFNBQVMsa0JBQWtCLENBQUMsRUFBNEM7UUFDdEUsSUFBSSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxTQUFTLEVBQUU7WUFDdEMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzFCO1FBQ0QsT0FBTyxDQUFDLFFBQU0sRUFBRSxDQUFDLGdCQUFnQixDQUFFLEVBQUksQ0FBZSxDQUFDO0lBQ3pELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge0RlY2xhcmF0aW9uTm9kZX0gZnJvbSAnLi4vLi4vLi4vcmVmbGVjdGlvbic7XG5cbmltcG9ydCB7VGVtcGxhdGVJZH0gZnJvbSAnLi4vLi4vYXBpJztcblxuXG5jb25zdCBURU1QTEFURV9JRCA9IFN5bWJvbCgnbmdUZW1wbGF0ZUlkJyk7XG5jb25zdCBORVhUX1RFTVBMQVRFX0lEID0gU3ltYm9sKCduZ05leHRUZW1wbGF0ZUlkJyk7XG5cbmludGVyZmFjZSBIYXNUZW1wbGF0ZUlkIHtcbiAgW1RFTVBMQVRFX0lEXTogVGVtcGxhdGVJZDtcbn1cblxuaW50ZXJmYWNlIEhhc05leHRUZW1wbGF0ZUlkIHtcbiAgW05FWFRfVEVNUExBVEVfSURdOiBudW1iZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZW1wbGF0ZUlkKGNsYXp6OiBEZWNsYXJhdGlvbk5vZGUpOiBUZW1wbGF0ZUlkIHtcbiAgY29uc3Qgbm9kZSA9IGNsYXp6IGFzIHRzLkRlY2xhcmF0aW9uICYgUGFydGlhbDxIYXNUZW1wbGF0ZUlkPjtcbiAgaWYgKG5vZGVbVEVNUExBVEVfSURdID09PSB1bmRlZmluZWQpIHtcbiAgICBub2RlW1RFTVBMQVRFX0lEXSA9IGFsbG9jYXRlVGVtcGxhdGVJZChub2RlLmdldFNvdXJjZUZpbGUoKSk7XG4gIH1cbiAgcmV0dXJuIG5vZGVbVEVNUExBVEVfSURdITtcbn1cblxuZnVuY3Rpb24gYWxsb2NhdGVUZW1wbGF0ZUlkKHNmOiB0cy5Tb3VyY2VGaWxlJlBhcnRpYWw8SGFzTmV4dFRlbXBsYXRlSWQ+KTogVGVtcGxhdGVJZCB7XG4gIGlmIChzZltORVhUX1RFTVBMQVRFX0lEXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgc2ZbTkVYVF9URU1QTEFURV9JRF0gPSAxO1xuICB9XG4gIHJldHVybiAoYHRjYiR7c2ZbTkVYVF9URU1QTEFURV9JRF0hKyt9YCkgYXMgVGVtcGxhdGVJZDtcbn1cbiJdfQ==