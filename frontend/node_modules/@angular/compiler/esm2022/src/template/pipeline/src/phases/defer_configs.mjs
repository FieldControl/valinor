/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ir from '../../ir';
import { literalOrArrayLiteral } from '../conversion';
/**
 * Defer instructions take a configuration array, which should be collected into the component
 * consts. This phase finds the config options, and creates the corresponding const array.
 */
export function configureDeferInstructions(job) {
    for (const unit of job.units) {
        for (const op of unit.create) {
            if (op.kind !== ir.OpKind.Defer) {
                continue;
            }
            if (op.placeholderMinimumTime !== null) {
                op.placeholderConfig =
                    new ir.ConstCollectedExpr(literalOrArrayLiteral([op.placeholderMinimumTime]));
            }
            if (op.loadingMinimumTime !== null || op.loadingAfterTime !== null) {
                op.loadingConfig = new ir.ConstCollectedExpr(literalOrArrayLiteral([op.loadingMinimumTime, op.loadingAfterTime]));
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmZXJfY29uZmlncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL2RlZmVyX2NvbmZpZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFL0IsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXBEOzs7R0FHRztBQUNILE1BQU0sVUFBVSwwQkFBMEIsQ0FBQyxHQUE0QjtJQUNyRSxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3QixJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDaEMsU0FBUztZQUNYLENBQUM7WUFFRCxJQUFJLEVBQUUsQ0FBQyxzQkFBc0IsS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDdkMsRUFBRSxDQUFDLGlCQUFpQjtvQkFDaEIsSUFBSSxFQUFFLENBQUMsa0JBQWtCLENBQUMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEYsQ0FBQztZQUNELElBQUksRUFBRSxDQUFDLGtCQUFrQixLQUFLLElBQUksSUFBSSxFQUFFLENBQUMsZ0JBQWdCLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQ25FLEVBQUUsQ0FBQyxhQUFhLEdBQUcsSUFBSSxFQUFFLENBQUMsa0JBQWtCLENBQ3hDLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRSxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB0eXBlIHtDb21wb25lbnRDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuaW1wb3J0IHtsaXRlcmFsT3JBcnJheUxpdGVyYWx9IGZyb20gJy4uL2NvbnZlcnNpb24nO1xuXG4vKipcbiAqIERlZmVyIGluc3RydWN0aW9ucyB0YWtlIGEgY29uZmlndXJhdGlvbiBhcnJheSwgd2hpY2ggc2hvdWxkIGJlIGNvbGxlY3RlZCBpbnRvIHRoZSBjb21wb25lbnRcbiAqIGNvbnN0cy4gVGhpcyBwaGFzZSBmaW5kcyB0aGUgY29uZmlnIG9wdGlvbnMsIGFuZCBjcmVhdGVzIHRoZSBjb3JyZXNwb25kaW5nIGNvbnN0IGFycmF5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uZmlndXJlRGVmZXJJbnN0cnVjdGlvbnMoam9iOiBDb21wb25lbnRDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgaWYgKG9wLmtpbmQgIT09IGlyLk9wS2luZC5EZWZlcikge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wLnBsYWNlaG9sZGVyTWluaW11bVRpbWUgIT09IG51bGwpIHtcbiAgICAgICAgb3AucGxhY2Vob2xkZXJDb25maWcgPVxuICAgICAgICAgICAgbmV3IGlyLkNvbnN0Q29sbGVjdGVkRXhwcihsaXRlcmFsT3JBcnJheUxpdGVyYWwoW29wLnBsYWNlaG9sZGVyTWluaW11bVRpbWVdKSk7XG4gICAgICB9XG4gICAgICBpZiAob3AubG9hZGluZ01pbmltdW1UaW1lICE9PSBudWxsIHx8IG9wLmxvYWRpbmdBZnRlclRpbWUgIT09IG51bGwpIHtcbiAgICAgICAgb3AubG9hZGluZ0NvbmZpZyA9IG5ldyBpci5Db25zdENvbGxlY3RlZEV4cHIoXG4gICAgICAgICAgICBsaXRlcmFsT3JBcnJheUxpdGVyYWwoW29wLmxvYWRpbmdNaW5pbXVtVGltZSwgb3AubG9hZGluZ0FmdGVyVGltZV0pKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==