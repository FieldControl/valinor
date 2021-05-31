"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiscImportsMigration = void 0;
const schematics_1 = require("@angular/cdk/schematics");
const ts = require("typescript");
/**
 * Migration that detects import declarations that refer to outdated identifiers from
 * Angular Material which cannot be updated automatically.
 */
class MiscImportsMigration extends schematics_1.Migration {
    constructor() {
        super(...arguments);
        // Only enable this rule if the migration targets version 6. The rule
        // currently only includes migrations for V6 deprecations.
        this.enabled = this.targetVersion === schematics_1.TargetVersion.V6;
    }
    visitNode(node) {
        if (ts.isImportDeclaration(node)) {
            this._visitImportDeclaration(node);
        }
    }
    _visitImportDeclaration(node) {
        if (!schematics_1.isMaterialImportDeclaration(node) || !node.importClause ||
            !node.importClause.namedBindings) {
            return;
        }
        const namedBindings = node.importClause.namedBindings;
        if (ts.isNamedImports(namedBindings)) {
            // Migration for: https://github.com/angular/components/pull/10405 (v6)
            this._checkAnimationConstants(namedBindings);
        }
    }
    /**
     * Checks for named imports that refer to the deleted animation constants.
     * https://github.com/angular/components/commit/9f3bf274c4f15f0b0fbd8ab7dbf1a453076e66d9
     */
    _checkAnimationConstants(namedImports) {
        namedImports.elements.filter(element => ts.isIdentifier(element.name)).forEach(element => {
            const importName = element.name.text;
            if (importName === 'SHOW_ANIMATION' || importName === 'HIDE_ANIMATION') {
                this.createFailureAtNode(element, `Found deprecated symbol "${importName}" which has been removed`);
            }
        });
    }
}
exports.MiscImportsMigration = MiscImportsMigration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlzYy1pbXBvcnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3NjaGVtYXRpY3MvbmctdXBkYXRlL21pZ3JhdGlvbnMvbWlzYy1jaGVja3MvbWlzYy1pbXBvcnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILHdEQUE4RjtBQUM5RixpQ0FBaUM7QUFFakM7OztHQUdHO0FBQ0gsTUFBYSxvQkFBcUIsU0FBUSxzQkFBZTtJQUF6RDs7UUFFRSxxRUFBcUU7UUFDckUsMERBQTBEO1FBQzFELFlBQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxLQUFLLDBCQUFhLENBQUMsRUFBRSxDQUFDO0lBb0NwRCxDQUFDO0lBbENDLFNBQVMsQ0FBQyxJQUFhO1FBQ3JCLElBQUksRUFBRSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2hDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNwQztJQUNILENBQUM7SUFFTyx1QkFBdUIsQ0FBQyxJQUEwQjtRQUN4RCxJQUFJLENBQUMsd0NBQTJCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWTtZQUN4RCxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFO1lBQ3BDLE9BQU87U0FDUjtRQUVELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDO1FBRXRELElBQUksRUFBRSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUNwQyx1RUFBdUU7WUFDdkUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQzlDO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNLLHdCQUF3QixDQUFDLFlBQTZCO1FBQzVELFlBQVksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDdkYsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFFckMsSUFBSSxVQUFVLEtBQUssZ0JBQWdCLElBQUksVUFBVSxLQUFLLGdCQUFnQixFQUFFO2dCQUN0RSxJQUFJLENBQUMsbUJBQW1CLENBQ3BCLE9BQU8sRUFBRSw0QkFBNEIsVUFBVSwwQkFBMEIsQ0FBQyxDQUFDO2FBQ2hGO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUF4Q0Qsb0RBd0NDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aXNNYXRlcmlhbEltcG9ydERlY2xhcmF0aW9uLCBNaWdyYXRpb24sIFRhcmdldFZlcnNpb259IGZyb20gJ0Bhbmd1bGFyL2Nkay9zY2hlbWF0aWNzJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG4vKipcbiAqIE1pZ3JhdGlvbiB0aGF0IGRldGVjdHMgaW1wb3J0IGRlY2xhcmF0aW9ucyB0aGF0IHJlZmVyIHRvIG91dGRhdGVkIGlkZW50aWZpZXJzIGZyb21cbiAqIEFuZ3VsYXIgTWF0ZXJpYWwgd2hpY2ggY2Fubm90IGJlIHVwZGF0ZWQgYXV0b21hdGljYWxseS5cbiAqL1xuZXhwb3J0IGNsYXNzIE1pc2NJbXBvcnRzTWlncmF0aW9uIGV4dGVuZHMgTWlncmF0aW9uPG51bGw+IHtcblxuICAvLyBPbmx5IGVuYWJsZSB0aGlzIHJ1bGUgaWYgdGhlIG1pZ3JhdGlvbiB0YXJnZXRzIHZlcnNpb24gNi4gVGhlIHJ1bGVcbiAgLy8gY3VycmVudGx5IG9ubHkgaW5jbHVkZXMgbWlncmF0aW9ucyBmb3IgVjYgZGVwcmVjYXRpb25zLlxuICBlbmFibGVkID0gdGhpcy50YXJnZXRWZXJzaW9uID09PSBUYXJnZXRWZXJzaW9uLlY2O1xuXG4gIHZpc2l0Tm9kZShub2RlOiB0cy5Ob2RlKTogdm9pZCB7XG4gICAgaWYgKHRzLmlzSW1wb3J0RGVjbGFyYXRpb24obm9kZSkpIHtcbiAgICAgIHRoaXMuX3Zpc2l0SW1wb3J0RGVjbGFyYXRpb24obm9kZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRJbXBvcnREZWNsYXJhdGlvbihub2RlOiB0cy5JbXBvcnREZWNsYXJhdGlvbikge1xuICAgIGlmICghaXNNYXRlcmlhbEltcG9ydERlY2xhcmF0aW9uKG5vZGUpIHx8ICFub2RlLmltcG9ydENsYXVzZSB8fFxuICAgICAgICAhbm9kZS5pbXBvcnRDbGF1c2UubmFtZWRCaW5kaW5ncykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG5hbWVkQmluZGluZ3MgPSBub2RlLmltcG9ydENsYXVzZS5uYW1lZEJpbmRpbmdzO1xuXG4gICAgaWYgKHRzLmlzTmFtZWRJbXBvcnRzKG5hbWVkQmluZGluZ3MpKSB7XG4gICAgICAvLyBNaWdyYXRpb24gZm9yOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTA0MDUgKHY2KVxuICAgICAgdGhpcy5fY2hlY2tBbmltYXRpb25Db25zdGFudHMobmFtZWRCaW5kaW5ncyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBmb3IgbmFtZWQgaW1wb3J0cyB0aGF0IHJlZmVyIHRvIHRoZSBkZWxldGVkIGFuaW1hdGlvbiBjb25zdGFudHMuXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvY29tbWl0LzlmM2JmMjc0YzRmMTVmMGIwZmJkOGFiN2RiZjFhNDUzMDc2ZTY2ZDlcbiAgICovXG4gIHByaXZhdGUgX2NoZWNrQW5pbWF0aW9uQ29uc3RhbnRzKG5hbWVkSW1wb3J0czogdHMuTmFtZWRJbXBvcnRzKSB7XG4gICAgbmFtZWRJbXBvcnRzLmVsZW1lbnRzLmZpbHRlcihlbGVtZW50ID0+IHRzLmlzSWRlbnRpZmllcihlbGVtZW50Lm5hbWUpKS5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgY29uc3QgaW1wb3J0TmFtZSA9IGVsZW1lbnQubmFtZS50ZXh0O1xuXG4gICAgICBpZiAoaW1wb3J0TmFtZSA9PT0gJ1NIT1dfQU5JTUFUSU9OJyB8fCBpbXBvcnROYW1lID09PSAnSElERV9BTklNQVRJT04nKSB7XG4gICAgICAgIHRoaXMuY3JlYXRlRmFpbHVyZUF0Tm9kZShcbiAgICAgICAgICAgIGVsZW1lbnQsIGBGb3VuZCBkZXByZWNhdGVkIHN5bWJvbCBcIiR7aW1wb3J0TmFtZX1cIiB3aGljaCBoYXMgYmVlbiByZW1vdmVkYCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==