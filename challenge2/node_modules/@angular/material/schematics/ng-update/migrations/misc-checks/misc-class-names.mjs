"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiscClassNamesMigration = void 0;
const schematics_1 = require("@angular/cdk/schematics");
const ts = require("typescript");
/**
 * Migration that looks for class name identifiers that have been removed but
 * cannot be automatically migrated.
 */
class MiscClassNamesMigration extends schematics_1.Migration {
    constructor() {
        super(...arguments);
        // Only enable this rule if the migration targets version 6. The rule
        // currently only includes migrations for V6 deprecations.
        this.enabled = this.targetVersion === schematics_1.TargetVersion.V6;
    }
    visitNode(node) {
        if (ts.isIdentifier(node)) {
            this._visitIdentifier(node);
        }
    }
    _visitIdentifier(identifier) {
        // Migration for: https://github.com/angular/components/pull/10279 (v6)
        if (identifier.getText() === 'MatDrawerToggleResult') {
            this.createFailureAtNode(identifier, `Found "MatDrawerToggleResult" which has changed from a class type to a string ` +
                `literal type. Your code may need to be updated.`);
        }
        // Migration for: https://github.com/angular/components/pull/10398 (v6)
        if (identifier.getText() === 'MatListOptionChange') {
            this.createFailureAtNode(identifier, `Found usage of "MatListOptionChange" which has been removed. Please listen for ` +
                `"selectionChange" on "MatSelectionList" instead.`);
        }
    }
}
exports.MiscClassNamesMigration = MiscClassNamesMigration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlzYy1jbGFzcy1uYW1lcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zY2hlbWF0aWNzL25nLXVwZGF0ZS9taWdyYXRpb25zL21pc2MtY2hlY2tzL21pc2MtY2xhc3MtbmFtZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsd0RBQWlFO0FBQ2pFLGlDQUFpQztBQUVqQzs7O0dBR0c7QUFDSCxNQUFhLHVCQUF3QixTQUFRLHNCQUFlO0lBQTVEOztRQUVFLHFFQUFxRTtRQUNyRSwwREFBMEQ7UUFDMUQsWUFBTyxHQUFHLElBQUksQ0FBQyxhQUFhLEtBQUssMEJBQWEsQ0FBQyxFQUFFLENBQUM7SUF5QnBELENBQUM7SUF2QkMsU0FBUyxDQUFDLElBQWE7UUFDckIsSUFBSSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3pCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3QjtJQUNILENBQUM7SUFFTyxnQkFBZ0IsQ0FBQyxVQUF5QjtRQUNoRCx1RUFBdUU7UUFDdkUsSUFBSSxVQUFVLENBQUMsT0FBTyxFQUFFLEtBQUssdUJBQXVCLEVBQUU7WUFDcEQsSUFBSSxDQUFDLG1CQUFtQixDQUNwQixVQUFVLEVBQ1YsZ0ZBQWdGO2dCQUM1RSxpREFBaUQsQ0FBQyxDQUFDO1NBQzVEO1FBRUQsdUVBQXVFO1FBQ3ZFLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLHFCQUFxQixFQUFFO1lBQ2xELElBQUksQ0FBQyxtQkFBbUIsQ0FDcEIsVUFBVSxFQUNWLGlGQUFpRjtnQkFDN0Usa0RBQWtELENBQUMsQ0FBQztTQUM3RDtJQUNILENBQUM7Q0FDRjtBQTdCRCwwREE2QkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtNaWdyYXRpb24sIFRhcmdldFZlcnNpb259IGZyb20gJ0Bhbmd1bGFyL2Nkay9zY2hlbWF0aWNzJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG4vKipcbiAqIE1pZ3JhdGlvbiB0aGF0IGxvb2tzIGZvciBjbGFzcyBuYW1lIGlkZW50aWZpZXJzIHRoYXQgaGF2ZSBiZWVuIHJlbW92ZWQgYnV0XG4gKiBjYW5ub3QgYmUgYXV0b21hdGljYWxseSBtaWdyYXRlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIE1pc2NDbGFzc05hbWVzTWlncmF0aW9uIGV4dGVuZHMgTWlncmF0aW9uPG51bGw+IHtcblxuICAvLyBPbmx5IGVuYWJsZSB0aGlzIHJ1bGUgaWYgdGhlIG1pZ3JhdGlvbiB0YXJnZXRzIHZlcnNpb24gNi4gVGhlIHJ1bGVcbiAgLy8gY3VycmVudGx5IG9ubHkgaW5jbHVkZXMgbWlncmF0aW9ucyBmb3IgVjYgZGVwcmVjYXRpb25zLlxuICBlbmFibGVkID0gdGhpcy50YXJnZXRWZXJzaW9uID09PSBUYXJnZXRWZXJzaW9uLlY2O1xuXG4gIHZpc2l0Tm9kZShub2RlOiB0cy5Ob2RlKTogdm9pZCB7XG4gICAgaWYgKHRzLmlzSWRlbnRpZmllcihub2RlKSkge1xuICAgICAgdGhpcy5fdmlzaXRJZGVudGlmaWVyKG5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0SWRlbnRpZmllcihpZGVudGlmaWVyOiB0cy5JZGVudGlmaWVyKSB7XG4gICAgLy8gTWlncmF0aW9uIGZvcjogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzEwMjc5ICh2NilcbiAgICBpZiAoaWRlbnRpZmllci5nZXRUZXh0KCkgPT09ICdNYXREcmF3ZXJUb2dnbGVSZXN1bHQnKSB7XG4gICAgICB0aGlzLmNyZWF0ZUZhaWx1cmVBdE5vZGUoXG4gICAgICAgICAgaWRlbnRpZmllcixcbiAgICAgICAgICBgRm91bmQgXCJNYXREcmF3ZXJUb2dnbGVSZXN1bHRcIiB3aGljaCBoYXMgY2hhbmdlZCBmcm9tIGEgY2xhc3MgdHlwZSB0byBhIHN0cmluZyBgICtcbiAgICAgICAgICAgICAgYGxpdGVyYWwgdHlwZS4gWW91ciBjb2RlIG1heSBuZWVkIHRvIGJlIHVwZGF0ZWQuYCk7XG4gICAgfVxuXG4gICAgLy8gTWlncmF0aW9uIGZvcjogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzEwMzk4ICh2NilcbiAgICBpZiAoaWRlbnRpZmllci5nZXRUZXh0KCkgPT09ICdNYXRMaXN0T3B0aW9uQ2hhbmdlJykge1xuICAgICAgdGhpcy5jcmVhdGVGYWlsdXJlQXROb2RlKFxuICAgICAgICAgIGlkZW50aWZpZXIsXG4gICAgICAgICAgYEZvdW5kIHVzYWdlIG9mIFwiTWF0TGlzdE9wdGlvbkNoYW5nZVwiIHdoaWNoIGhhcyBiZWVuIHJlbW92ZWQuIFBsZWFzZSBsaXN0ZW4gZm9yIGAgK1xuICAgICAgICAgICAgICBgXCJzZWxlY3Rpb25DaGFuZ2VcIiBvbiBcIk1hdFNlbGVjdGlvbkxpc3RcIiBpbnN0ZWFkLmApO1xuICAgIH1cbiAgfVxufVxuIl19