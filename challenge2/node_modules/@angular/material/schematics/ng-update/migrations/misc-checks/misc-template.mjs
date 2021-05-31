"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiscTemplateMigration = void 0;
const schematics_1 = require("@angular/cdk/schematics");
/**
 * Migration that walks through every inline or external template and reports if there
 * are outdated usages of the Angular Material API that needs to be updated manually.
 */
class MiscTemplateMigration extends schematics_1.Migration {
    constructor() {
        super(...arguments);
        // Only enable this rule if the migration targets version 6. The rule
        // currently only includes migrations for V6 deprecations.
        this.enabled = this.targetVersion === schematics_1.TargetVersion.V6;
    }
    visitTemplate(template) {
        // Migration for: https://github.com/angular/components/pull/10398 (v6)
        schematics_1.findOutputsOnElementWithTag(template.content, 'selectionChange', [
            'mat-list-option'
        ]).forEach(offset => {
            this.failures.push({
                filePath: template.filePath,
                position: template.getCharacterAndLineOfPosition(template.start + offset),
                message: `Found deprecated "selectionChange" output binding on "mat-list-option". ` +
                    `Use "selectionChange" on "mat-selection-list" instead.`
            });
        });
        // Migration for: https://github.com/angular/components/pull/10413 (v6)
        schematics_1.findOutputsOnElementWithTag(template.content, 'selectedChanged', [
            'mat-datepicker'
        ]).forEach(offset => {
            this.failures.push({
                filePath: template.filePath,
                position: template.getCharacterAndLineOfPosition(template.start + offset),
                message: `Found deprecated "selectedChanged" output binding on "mat-datepicker". ` +
                    `Use "dateChange" or "dateInput" on "<input [matDatepicker]>" instead.`
            });
        });
        // Migration for: https://github.com/angular/components/commit/f0bf6e7 (v6)
        schematics_1.findInputsOnElementWithTag(template.content, 'selected', [
            'mat-button-toggle-group'
        ]).forEach(offset => {
            this.failures.push({
                filePath: template.filePath,
                position: template.getCharacterAndLineOfPosition(template.start + offset),
                message: `Found deprecated "selected" input binding on "mat-radio-button-group". ` +
                    `Use "value" instead.`
            });
        });
    }
}
exports.MiscTemplateMigration = MiscTemplateMigration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlzYy10ZW1wbGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zY2hlbWF0aWNzL25nLXVwZGF0ZS9taWdyYXRpb25zL21pc2MtY2hlY2tzL21pc2MtdGVtcGxhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsd0RBTWlDO0FBRWpDOzs7R0FHRztBQUNILE1BQWEscUJBQXNCLFNBQVEsc0JBQWU7SUFBMUQ7O1FBRUUscUVBQXFFO1FBQ3JFLDBEQUEwRDtRQUMxRCxZQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsS0FBSywwQkFBYSxDQUFDLEVBQUUsQ0FBQztJQXdDcEQsQ0FBQztJQXRDQyxhQUFhLENBQUMsUUFBMEI7UUFFdEMsdUVBQXVFO1FBQ3ZFLHdDQUEyQixDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUU7WUFDL0QsaUJBQWlCO1NBQ2xCLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQ2pCLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUTtnQkFDM0IsUUFBUSxFQUFFLFFBQVEsQ0FBQyw2QkFBNkIsQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztnQkFDekUsT0FBTyxFQUFFLDBFQUEwRTtvQkFDL0Usd0RBQXdEO2FBQzdELENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsdUVBQXVFO1FBQ3ZFLHdDQUEyQixDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUU7WUFDL0QsZ0JBQWdCO1NBQ2pCLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQ2pCLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUTtnQkFDM0IsUUFBUSxFQUFFLFFBQVEsQ0FBQyw2QkFBNkIsQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztnQkFDekUsT0FBTyxFQUFFLHlFQUF5RTtvQkFDOUUsdUVBQXVFO2FBQzVFLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsMkVBQTJFO1FBQzNFLHVDQUEwQixDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFO1lBQ3ZELHlCQUF5QjtTQUMxQixDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO2dCQUNqQixRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7Z0JBQzNCLFFBQVEsRUFBRSxRQUFRLENBQUMsNkJBQTZCLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7Z0JBQ3pFLE9BQU8sRUFBRSx5RUFBeUU7b0JBQzlFLHNCQUFzQjthQUMzQixDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQTVDRCxzREE0Q0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgZmluZElucHV0c09uRWxlbWVudFdpdGhUYWcsXG4gIGZpbmRPdXRwdXRzT25FbGVtZW50V2l0aFRhZyxcbiAgTWlncmF0aW9uLFxuICBSZXNvbHZlZFJlc291cmNlLFxuICBUYXJnZXRWZXJzaW9uLFxufSBmcm9tICdAYW5ndWxhci9jZGsvc2NoZW1hdGljcyc7XG5cbi8qKlxuICogTWlncmF0aW9uIHRoYXQgd2Fsa3MgdGhyb3VnaCBldmVyeSBpbmxpbmUgb3IgZXh0ZXJuYWwgdGVtcGxhdGUgYW5kIHJlcG9ydHMgaWYgdGhlcmVcbiAqIGFyZSBvdXRkYXRlZCB1c2FnZXMgb2YgdGhlIEFuZ3VsYXIgTWF0ZXJpYWwgQVBJIHRoYXQgbmVlZHMgdG8gYmUgdXBkYXRlZCBtYW51YWxseS5cbiAqL1xuZXhwb3J0IGNsYXNzIE1pc2NUZW1wbGF0ZU1pZ3JhdGlvbiBleHRlbmRzIE1pZ3JhdGlvbjxudWxsPiB7XG5cbiAgLy8gT25seSBlbmFibGUgdGhpcyBydWxlIGlmIHRoZSBtaWdyYXRpb24gdGFyZ2V0cyB2ZXJzaW9uIDYuIFRoZSBydWxlXG4gIC8vIGN1cnJlbnRseSBvbmx5IGluY2x1ZGVzIG1pZ3JhdGlvbnMgZm9yIFY2IGRlcHJlY2F0aW9ucy5cbiAgZW5hYmxlZCA9IHRoaXMudGFyZ2V0VmVyc2lvbiA9PT0gVGFyZ2V0VmVyc2lvbi5WNjtcblxuICB2aXNpdFRlbXBsYXRlKHRlbXBsYXRlOiBSZXNvbHZlZFJlc291cmNlKTogdm9pZCB7XG5cbiAgICAvLyBNaWdyYXRpb24gZm9yOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTAzOTggKHY2KVxuICAgIGZpbmRPdXRwdXRzT25FbGVtZW50V2l0aFRhZyh0ZW1wbGF0ZS5jb250ZW50LCAnc2VsZWN0aW9uQ2hhbmdlJywgW1xuICAgICAgJ21hdC1saXN0LW9wdGlvbidcbiAgICBdKS5mb3JFYWNoKG9mZnNldCA9PiB7XG4gICAgICB0aGlzLmZhaWx1cmVzLnB1c2goe1xuICAgICAgICBmaWxlUGF0aDogdGVtcGxhdGUuZmlsZVBhdGgsXG4gICAgICAgIHBvc2l0aW9uOiB0ZW1wbGF0ZS5nZXRDaGFyYWN0ZXJBbmRMaW5lT2ZQb3NpdGlvbih0ZW1wbGF0ZS5zdGFydCArIG9mZnNldCksXG4gICAgICAgIG1lc3NhZ2U6IGBGb3VuZCBkZXByZWNhdGVkIFwic2VsZWN0aW9uQ2hhbmdlXCIgb3V0cHV0IGJpbmRpbmcgb24gXCJtYXQtbGlzdC1vcHRpb25cIi4gYCArXG4gICAgICAgICAgICBgVXNlIFwic2VsZWN0aW9uQ2hhbmdlXCIgb24gXCJtYXQtc2VsZWN0aW9uLWxpc3RcIiBpbnN0ZWFkLmBcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gTWlncmF0aW9uIGZvcjogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzEwNDEzICh2NilcbiAgICBmaW5kT3V0cHV0c09uRWxlbWVudFdpdGhUYWcodGVtcGxhdGUuY29udGVudCwgJ3NlbGVjdGVkQ2hhbmdlZCcsIFtcbiAgICAgICdtYXQtZGF0ZXBpY2tlcidcbiAgICBdKS5mb3JFYWNoKG9mZnNldCA9PiB7XG4gICAgICB0aGlzLmZhaWx1cmVzLnB1c2goe1xuICAgICAgICBmaWxlUGF0aDogdGVtcGxhdGUuZmlsZVBhdGgsXG4gICAgICAgIHBvc2l0aW9uOiB0ZW1wbGF0ZS5nZXRDaGFyYWN0ZXJBbmRMaW5lT2ZQb3NpdGlvbih0ZW1wbGF0ZS5zdGFydCArIG9mZnNldCksXG4gICAgICAgIG1lc3NhZ2U6IGBGb3VuZCBkZXByZWNhdGVkIFwic2VsZWN0ZWRDaGFuZ2VkXCIgb3V0cHV0IGJpbmRpbmcgb24gXCJtYXQtZGF0ZXBpY2tlclwiLiBgICtcbiAgICAgICAgICAgIGBVc2UgXCJkYXRlQ2hhbmdlXCIgb3IgXCJkYXRlSW5wdXRcIiBvbiBcIjxpbnB1dCBbbWF0RGF0ZXBpY2tlcl0+XCIgaW5zdGVhZC5gXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIE1pZ3JhdGlvbiBmb3I6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvY29tbWl0L2YwYmY2ZTcgKHY2KVxuICAgIGZpbmRJbnB1dHNPbkVsZW1lbnRXaXRoVGFnKHRlbXBsYXRlLmNvbnRlbnQsICdzZWxlY3RlZCcsIFtcbiAgICAgICdtYXQtYnV0dG9uLXRvZ2dsZS1ncm91cCdcbiAgICBdKS5mb3JFYWNoKG9mZnNldCA9PiB7XG4gICAgICB0aGlzLmZhaWx1cmVzLnB1c2goe1xuICAgICAgICBmaWxlUGF0aDogdGVtcGxhdGUuZmlsZVBhdGgsXG4gICAgICAgIHBvc2l0aW9uOiB0ZW1wbGF0ZS5nZXRDaGFyYWN0ZXJBbmRMaW5lT2ZQb3NpdGlvbih0ZW1wbGF0ZS5zdGFydCArIG9mZnNldCksXG4gICAgICAgIG1lc3NhZ2U6IGBGb3VuZCBkZXByZWNhdGVkIFwic2VsZWN0ZWRcIiBpbnB1dCBiaW5kaW5nIG9uIFwibWF0LXJhZGlvLWJ1dHRvbi1ncm91cFwiLiBgICtcbiAgICAgICAgICAgIGBVc2UgXCJ2YWx1ZVwiIGluc3RlYWQuYFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==