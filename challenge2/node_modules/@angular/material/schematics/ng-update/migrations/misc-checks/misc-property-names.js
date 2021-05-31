"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiscPropertyNamesMigration = void 0;
const schematics_1 = require("@angular/cdk/schematics");
const ts = require("typescript");
/**
 * Migration that walks through every property access expression and and reports a failure if
 * a given property name no longer exists but cannot be automatically migrated.
 */
class MiscPropertyNamesMigration extends schematics_1.Migration {
    constructor() {
        super(...arguments);
        // Only enable this rule if the migration targets version 6. The rule
        // currently only includes migrations for V6 deprecations.
        this.enabled = this.targetVersion === schematics_1.TargetVersion.V6;
    }
    visitNode(node) {
        if (ts.isPropertyAccessExpression(node)) {
            this._visitPropertyAccessExpression(node);
        }
    }
    _visitPropertyAccessExpression(node) {
        const hostType = this.typeChecker.getTypeAtLocation(node.expression);
        const typeName = hostType && hostType.symbol && hostType.symbol.getName();
        // Migration for: https://github.com/angular/components/pull/10398 (v6)
        if (typeName === 'MatListOption' && node.name.text === 'selectionChange') {
            this.createFailureAtNode(node, `Found deprecated property "selectionChange" of ` +
                `class "MatListOption". Use the "selectionChange" property on the ` +
                `parent "MatSelectionList" instead.`);
        }
        // Migration for: https://github.com/angular/components/pull/10413 (v6)
        if (typeName === 'MatDatepicker' && node.name.text === 'selectedChanged') {
            this.createFailureAtNode(node, `Found deprecated property "selectedChanged" of ` +
                `class "MatDatepicker". Use the "dateChange" or "dateInput" methods ` +
                `on "MatDatepickerInput" instead.`);
        }
    }
}
exports.MiscPropertyNamesMigration = MiscPropertyNamesMigration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlzYy1wcm9wZXJ0eS1uYW1lcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zY2hlbWF0aWNzL25nLXVwZGF0ZS9taWdyYXRpb25zL21pc2MtY2hlY2tzL21pc2MtcHJvcGVydHktbmFtZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsd0RBQWlFO0FBQ2pFLGlDQUFpQztBQUVqQzs7O0dBR0c7QUFDSCxNQUFhLDBCQUEyQixTQUFRLHNCQUFlO0lBQS9EOztRQUVFLHFFQUFxRTtRQUNyRSwwREFBMEQ7UUFDMUQsWUFBTyxHQUFHLElBQUksQ0FBQyxhQUFhLEtBQUssMEJBQWEsQ0FBQyxFQUFFLENBQUM7SUE4QnBELENBQUM7SUE1QkMsU0FBUyxDQUFDLElBQWE7UUFDckIsSUFBSSxFQUFFLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDdkMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzNDO0lBQ0gsQ0FBQztJQUVPLDhCQUE4QixDQUFDLElBQWlDO1FBQ3RFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sUUFBUSxHQUFHLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFMUUsdUVBQXVFO1FBQ3ZFLElBQUksUUFBUSxLQUFLLGVBQWUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxpQkFBaUIsRUFBRTtZQUN4RSxJQUFJLENBQUMsbUJBQW1CLENBQ3BCLElBQUksRUFDSixpREFBaUQ7Z0JBQzdDLG1FQUFtRTtnQkFDbkUsb0NBQW9DLENBQUMsQ0FBQztTQUMvQztRQUVELHVFQUF1RTtRQUN2RSxJQUFJLFFBQVEsS0FBSyxlQUFlLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssaUJBQWlCLEVBQUU7WUFDeEUsSUFBSSxDQUFDLG1CQUFtQixDQUNwQixJQUFJLEVBQ0osaURBQWlEO2dCQUM3QyxxRUFBcUU7Z0JBQ3JFLGtDQUFrQyxDQUFDLENBQUM7U0FDN0M7SUFDSCxDQUFDO0NBQ0Y7QUFsQ0QsZ0VBa0NDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TWlncmF0aW9uLCBUYXJnZXRWZXJzaW9ufSBmcm9tICdAYW5ndWxhci9jZGsvc2NoZW1hdGljcyc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuLyoqXG4gKiBNaWdyYXRpb24gdGhhdCB3YWxrcyB0aHJvdWdoIGV2ZXJ5IHByb3BlcnR5IGFjY2VzcyBleHByZXNzaW9uIGFuZCBhbmQgcmVwb3J0cyBhIGZhaWx1cmUgaWZcbiAqIGEgZ2l2ZW4gcHJvcGVydHkgbmFtZSBubyBsb25nZXIgZXhpc3RzIGJ1dCBjYW5ub3QgYmUgYXV0b21hdGljYWxseSBtaWdyYXRlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIE1pc2NQcm9wZXJ0eU5hbWVzTWlncmF0aW9uIGV4dGVuZHMgTWlncmF0aW9uPG51bGw+IHtcblxuICAvLyBPbmx5IGVuYWJsZSB0aGlzIHJ1bGUgaWYgdGhlIG1pZ3JhdGlvbiB0YXJnZXRzIHZlcnNpb24gNi4gVGhlIHJ1bGVcbiAgLy8gY3VycmVudGx5IG9ubHkgaW5jbHVkZXMgbWlncmF0aW9ucyBmb3IgVjYgZGVwcmVjYXRpb25zLlxuICBlbmFibGVkID0gdGhpcy50YXJnZXRWZXJzaW9uID09PSBUYXJnZXRWZXJzaW9uLlY2O1xuXG4gIHZpc2l0Tm9kZShub2RlOiB0cy5Ob2RlKTogdm9pZCB7XG4gICAgaWYgKHRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKG5vZGUpKSB7XG4gICAgICB0aGlzLl92aXNpdFByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbihub2RlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbihub2RlOiB0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24pIHtcbiAgICBjb25zdCBob3N0VHlwZSA9IHRoaXMudHlwZUNoZWNrZXIuZ2V0VHlwZUF0TG9jYXRpb24obm9kZS5leHByZXNzaW9uKTtcbiAgICBjb25zdCB0eXBlTmFtZSA9IGhvc3RUeXBlICYmIGhvc3RUeXBlLnN5bWJvbCAmJiBob3N0VHlwZS5zeW1ib2wuZ2V0TmFtZSgpO1xuXG4gICAgLy8gTWlncmF0aW9uIGZvcjogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzEwMzk4ICh2NilcbiAgICBpZiAodHlwZU5hbWUgPT09ICdNYXRMaXN0T3B0aW9uJyAmJiBub2RlLm5hbWUudGV4dCA9PT0gJ3NlbGVjdGlvbkNoYW5nZScpIHtcbiAgICAgIHRoaXMuY3JlYXRlRmFpbHVyZUF0Tm9kZShcbiAgICAgICAgICBub2RlLFxuICAgICAgICAgIGBGb3VuZCBkZXByZWNhdGVkIHByb3BlcnR5IFwic2VsZWN0aW9uQ2hhbmdlXCIgb2YgYCArXG4gICAgICAgICAgICAgIGBjbGFzcyBcIk1hdExpc3RPcHRpb25cIi4gVXNlIHRoZSBcInNlbGVjdGlvbkNoYW5nZVwiIHByb3BlcnR5IG9uIHRoZSBgICtcbiAgICAgICAgICAgICAgYHBhcmVudCBcIk1hdFNlbGVjdGlvbkxpc3RcIiBpbnN0ZWFkLmApO1xuICAgIH1cblxuICAgIC8vIE1pZ3JhdGlvbiBmb3I6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8xMDQxMyAodjYpXG4gICAgaWYgKHR5cGVOYW1lID09PSAnTWF0RGF0ZXBpY2tlcicgJiYgbm9kZS5uYW1lLnRleHQgPT09ICdzZWxlY3RlZENoYW5nZWQnKSB7XG4gICAgICB0aGlzLmNyZWF0ZUZhaWx1cmVBdE5vZGUoXG4gICAgICAgICAgbm9kZSxcbiAgICAgICAgICBgRm91bmQgZGVwcmVjYXRlZCBwcm9wZXJ0eSBcInNlbGVjdGVkQ2hhbmdlZFwiIG9mIGAgK1xuICAgICAgICAgICAgICBgY2xhc3MgXCJNYXREYXRlcGlja2VyXCIuIFVzZSB0aGUgXCJkYXRlQ2hhbmdlXCIgb3IgXCJkYXRlSW5wdXRcIiBtZXRob2RzIGAgK1xuICAgICAgICAgICAgICBgb24gXCJNYXREYXRlcGlja2VySW5wdXRcIiBpbnN0ZWFkLmApO1xuICAgIH1cbiAgfVxufVxuIl19