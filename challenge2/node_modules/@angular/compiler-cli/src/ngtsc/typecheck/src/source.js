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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/source", ["require", "exports", "@angular/compiler", "@angular/compiler-cli/src/ngtsc/typecheck/diagnostics", "@angular/compiler-cli/src/ngtsc/typecheck/src/line_mappings"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TemplateSourceManager = exports.TemplateSource = void 0;
    var compiler_1 = require("@angular/compiler");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/diagnostics");
    var line_mappings_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/line_mappings");
    /**
     * Represents the source of a template that was processed during type-checking. This information is
     * used when translating parse offsets in diagnostics back to their original line/column location.
     */
    var TemplateSource = /** @class */ (function () {
        function TemplateSource(mapping, file) {
            this.mapping = mapping;
            this.file = file;
            this.lineStarts = null;
        }
        TemplateSource.prototype.toParseSourceSpan = function (start, end) {
            var startLoc = this.toParseLocation(start);
            var endLoc = this.toParseLocation(end);
            return new compiler_1.ParseSourceSpan(startLoc, endLoc);
        };
        TemplateSource.prototype.toParseLocation = function (position) {
            var lineStarts = this.acquireLineStarts();
            var _a = line_mappings_1.getLineAndCharacterFromPosition(lineStarts, position), line = _a.line, character = _a.character;
            return new compiler_1.ParseLocation(this.file, position, line, character);
        };
        TemplateSource.prototype.acquireLineStarts = function () {
            if (this.lineStarts === null) {
                this.lineStarts = line_mappings_1.computeLineStartsMap(this.file.content);
            }
            return this.lineStarts;
        };
        return TemplateSource;
    }());
    exports.TemplateSource = TemplateSource;
    /**
     * Assigns IDs to templates and keeps track of their origins.
     *
     * Implements `TemplateSourceResolver` to resolve the source of a template based on these IDs.
     */
    var TemplateSourceManager = /** @class */ (function () {
        function TemplateSourceManager() {
            /**
             * This map keeps track of all template sources that have been type-checked by the id that is
             * attached to a TCB's function declaration as leading trivia. This enables translation of
             * diagnostics produced for TCB code to their source location in the template.
             */
            this.templateSources = new Map();
        }
        TemplateSourceManager.prototype.getTemplateId = function (node) {
            return diagnostics_1.getTemplateId(node);
        };
        TemplateSourceManager.prototype.captureSource = function (node, mapping, file) {
            var id = diagnostics_1.getTemplateId(node);
            this.templateSources.set(id, new TemplateSource(mapping, file));
            return id;
        };
        TemplateSourceManager.prototype.getSourceMapping = function (id) {
            if (!this.templateSources.has(id)) {
                throw new Error("Unexpected unknown template ID: " + id);
            }
            return this.templateSources.get(id).mapping;
        };
        TemplateSourceManager.prototype.toParseSourceSpan = function (id, span) {
            if (!this.templateSources.has(id)) {
                return null;
            }
            var templateSource = this.templateSources.get(id);
            return templateSource.toParseSourceSpan(span.start, span.end);
        };
        return TemplateSourceManager;
    }());
    exports.TemplateSourceManager = TemplateSourceManager;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy90eXBlY2hlY2svc3JjL3NvdXJjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBc0c7SUFJdEcscUZBQTZDO0lBRTdDLDZGQUFzRjtJQUd0Rjs7O09BR0c7SUFDSDtRQUdFLHdCQUFxQixPQUE4QixFQUFVLElBQXFCO1lBQTdELFlBQU8sR0FBUCxPQUFPLENBQXVCO1lBQVUsU0FBSSxHQUFKLElBQUksQ0FBaUI7WUFGMUUsZUFBVSxHQUFrQixJQUFJLENBQUM7UUFFNEMsQ0FBQztRQUV0RiwwQ0FBaUIsR0FBakIsVUFBa0IsS0FBYSxFQUFFLEdBQVc7WUFDMUMsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3QyxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pDLE9BQU8sSUFBSSwwQkFBZSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRU8sd0NBQWUsR0FBdkIsVUFBd0IsUUFBZ0I7WUFDdEMsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDdEMsSUFBQSxLQUFvQiwrQ0FBK0IsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLEVBQXhFLElBQUksVUFBQSxFQUFFLFNBQVMsZUFBeUQsQ0FBQztZQUNoRixPQUFPLElBQUksd0JBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVPLDBDQUFpQixHQUF6QjtZQUNFLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxJQUFJLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxVQUFVLEdBQUcsb0NBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUMzRDtZQUNELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUN6QixDQUFDO1FBQ0gscUJBQUM7SUFBRCxDQUFDLEFBdkJELElBdUJDO0lBdkJZLHdDQUFjO0lBeUIzQjs7OztPQUlHO0lBQ0g7UUFBQTtZQUNFOzs7O2VBSUc7WUFDSyxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUE4QixDQUFDO1FBMkJsRSxDQUFDO1FBekJDLDZDQUFhLEdBQWIsVUFBYyxJQUF5QjtZQUNyQyxPQUFPLDJCQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUVELDZDQUFhLEdBQWIsVUFBYyxJQUF5QixFQUFFLE9BQThCLEVBQUUsSUFBcUI7WUFFNUYsSUFBTSxFQUFFLEdBQUcsMkJBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDaEUsT0FBTyxFQUFFLENBQUM7UUFDWixDQUFDO1FBRUQsZ0RBQWdCLEdBQWhCLFVBQWlCLEVBQWM7WUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFtQyxFQUFJLENBQUMsQ0FBQzthQUMxRDtZQUNELE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFFLENBQUMsT0FBTyxDQUFDO1FBQy9DLENBQUM7UUFFRCxpREFBaUIsR0FBakIsVUFBa0IsRUFBYyxFQUFFLElBQXdCO1lBQ3hELElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDakMsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBRSxDQUFDO1lBQ3JELE9BQU8sY0FBYyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7UUFDSCw0QkFBQztJQUFELENBQUMsQUFqQ0QsSUFpQ0M7SUFqQ1ksc0RBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QWJzb2x1dGVTb3VyY2VTcGFuLCBQYXJzZUxvY2F0aW9uLCBQYXJzZVNvdXJjZUZpbGUsIFBhcnNlU291cmNlU3Bhbn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7VGVtcGxhdGVJZCwgVGVtcGxhdGVTb3VyY2VNYXBwaW5nfSBmcm9tICcuLi9hcGknO1xuaW1wb3J0IHtnZXRUZW1wbGF0ZUlkfSBmcm9tICcuLi9kaWFnbm9zdGljcyc7XG5cbmltcG9ydCB7Y29tcHV0ZUxpbmVTdGFydHNNYXAsIGdldExpbmVBbmRDaGFyYWN0ZXJGcm9tUG9zaXRpb259IGZyb20gJy4vbGluZV9tYXBwaW5ncyc7XG5pbXBvcnQge1RlbXBsYXRlU291cmNlUmVzb2x2ZXJ9IGZyb20gJy4vdGNiX3V0aWwnO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIHNvdXJjZSBvZiBhIHRlbXBsYXRlIHRoYXQgd2FzIHByb2Nlc3NlZCBkdXJpbmcgdHlwZS1jaGVja2luZy4gVGhpcyBpbmZvcm1hdGlvbiBpc1xuICogdXNlZCB3aGVuIHRyYW5zbGF0aW5nIHBhcnNlIG9mZnNldHMgaW4gZGlhZ25vc3RpY3MgYmFjayB0byB0aGVpciBvcmlnaW5hbCBsaW5lL2NvbHVtbiBsb2NhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlU291cmNlIHtcbiAgcHJpdmF0ZSBsaW5lU3RhcnRzOiBudW1iZXJbXXxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBtYXBwaW5nOiBUZW1wbGF0ZVNvdXJjZU1hcHBpbmcsIHByaXZhdGUgZmlsZTogUGFyc2VTb3VyY2VGaWxlKSB7fVxuXG4gIHRvUGFyc2VTb3VyY2VTcGFuKHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKTogUGFyc2VTb3VyY2VTcGFuIHtcbiAgICBjb25zdCBzdGFydExvYyA9IHRoaXMudG9QYXJzZUxvY2F0aW9uKHN0YXJ0KTtcbiAgICBjb25zdCBlbmRMb2MgPSB0aGlzLnRvUGFyc2VMb2NhdGlvbihlbmQpO1xuICAgIHJldHVybiBuZXcgUGFyc2VTb3VyY2VTcGFuKHN0YXJ0TG9jLCBlbmRMb2MpO1xuICB9XG5cbiAgcHJpdmF0ZSB0b1BhcnNlTG9jYXRpb24ocG9zaXRpb246IG51bWJlcikge1xuICAgIGNvbnN0IGxpbmVTdGFydHMgPSB0aGlzLmFjcXVpcmVMaW5lU3RhcnRzKCk7XG4gICAgY29uc3Qge2xpbmUsIGNoYXJhY3Rlcn0gPSBnZXRMaW5lQW5kQ2hhcmFjdGVyRnJvbVBvc2l0aW9uKGxpbmVTdGFydHMsIHBvc2l0aW9uKTtcbiAgICByZXR1cm4gbmV3IFBhcnNlTG9jYXRpb24odGhpcy5maWxlLCBwb3NpdGlvbiwgbGluZSwgY2hhcmFjdGVyKTtcbiAgfVxuXG4gIHByaXZhdGUgYWNxdWlyZUxpbmVTdGFydHMoKTogbnVtYmVyW10ge1xuICAgIGlmICh0aGlzLmxpbmVTdGFydHMgPT09IG51bGwpIHtcbiAgICAgIHRoaXMubGluZVN0YXJ0cyA9IGNvbXB1dGVMaW5lU3RhcnRzTWFwKHRoaXMuZmlsZS5jb250ZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubGluZVN0YXJ0cztcbiAgfVxufVxuXG4vKipcbiAqIEFzc2lnbnMgSURzIHRvIHRlbXBsYXRlcyBhbmQga2VlcHMgdHJhY2sgb2YgdGhlaXIgb3JpZ2lucy5cbiAqXG4gKiBJbXBsZW1lbnRzIGBUZW1wbGF0ZVNvdXJjZVJlc29sdmVyYCB0byByZXNvbHZlIHRoZSBzb3VyY2Ugb2YgYSB0ZW1wbGF0ZSBiYXNlZCBvbiB0aGVzZSBJRHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZVNvdXJjZU1hbmFnZXIgaW1wbGVtZW50cyBUZW1wbGF0ZVNvdXJjZVJlc29sdmVyIHtcbiAgLyoqXG4gICAqIFRoaXMgbWFwIGtlZXBzIHRyYWNrIG9mIGFsbCB0ZW1wbGF0ZSBzb3VyY2VzIHRoYXQgaGF2ZSBiZWVuIHR5cGUtY2hlY2tlZCBieSB0aGUgaWQgdGhhdCBpc1xuICAgKiBhdHRhY2hlZCB0byBhIFRDQidzIGZ1bmN0aW9uIGRlY2xhcmF0aW9uIGFzIGxlYWRpbmcgdHJpdmlhLiBUaGlzIGVuYWJsZXMgdHJhbnNsYXRpb24gb2ZcbiAgICogZGlhZ25vc3RpY3MgcHJvZHVjZWQgZm9yIFRDQiBjb2RlIHRvIHRoZWlyIHNvdXJjZSBsb2NhdGlvbiBpbiB0aGUgdGVtcGxhdGUuXG4gICAqL1xuICBwcml2YXRlIHRlbXBsYXRlU291cmNlcyA9IG5ldyBNYXA8VGVtcGxhdGVJZCwgVGVtcGxhdGVTb3VyY2U+KCk7XG5cbiAgZ2V0VGVtcGxhdGVJZChub2RlOiB0cy5DbGFzc0RlY2xhcmF0aW9uKTogVGVtcGxhdGVJZCB7XG4gICAgcmV0dXJuIGdldFRlbXBsYXRlSWQobm9kZSk7XG4gIH1cblxuICBjYXB0dXJlU291cmNlKG5vZGU6IHRzLkNsYXNzRGVjbGFyYXRpb24sIG1hcHBpbmc6IFRlbXBsYXRlU291cmNlTWFwcGluZywgZmlsZTogUGFyc2VTb3VyY2VGaWxlKTpcbiAgICAgIFRlbXBsYXRlSWQge1xuICAgIGNvbnN0IGlkID0gZ2V0VGVtcGxhdGVJZChub2RlKTtcbiAgICB0aGlzLnRlbXBsYXRlU291cmNlcy5zZXQoaWQsIG5ldyBUZW1wbGF0ZVNvdXJjZShtYXBwaW5nLCBmaWxlKSk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG5cbiAgZ2V0U291cmNlTWFwcGluZyhpZDogVGVtcGxhdGVJZCk6IFRlbXBsYXRlU291cmNlTWFwcGluZyB7XG4gICAgaWYgKCF0aGlzLnRlbXBsYXRlU291cmNlcy5oYXMoaWQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgdW5rbm93biB0ZW1wbGF0ZSBJRDogJHtpZH1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudGVtcGxhdGVTb3VyY2VzLmdldChpZCkhLm1hcHBpbmc7XG4gIH1cblxuICB0b1BhcnNlU291cmNlU3BhbihpZDogVGVtcGxhdGVJZCwgc3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuKTogUGFyc2VTb3VyY2VTcGFufG51bGwge1xuICAgIGlmICghdGhpcy50ZW1wbGF0ZVNvdXJjZXMuaGFzKGlkKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHRlbXBsYXRlU291cmNlID0gdGhpcy50ZW1wbGF0ZVNvdXJjZXMuZ2V0KGlkKSE7XG4gICAgcmV0dXJuIHRlbXBsYXRlU291cmNlLnRvUGFyc2VTb3VyY2VTcGFuKHNwYW4uc3RhcnQsIHNwYW4uZW5kKTtcbiAgfVxufVxuIl19