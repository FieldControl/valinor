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
                op.placeholderConfig = new ir.ConstCollectedExpr(literalOrArrayLiteral([op.placeholderMinimumTime]));
            }
            if (op.loadingMinimumTime !== null || op.loadingAfterTime !== null) {
                op.loadingConfig = new ir.ConstCollectedExpr(literalOrArrayLiteral([op.loadingMinimumTime, op.loadingAfterTime]));
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmZXJfY29uZmlncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL2RlZmVyX2NvbmZpZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFL0IsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXBEOzs7R0FHRztBQUNILE1BQU0sVUFBVSwwQkFBMEIsQ0FBQyxHQUE0QjtJQUNyRSxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3QixJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDaEMsU0FBUztZQUNYLENBQUM7WUFFRCxJQUFJLEVBQUUsQ0FBQyxzQkFBc0IsS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDdkMsRUFBRSxDQUFDLGlCQUFpQixHQUFHLElBQUksRUFBRSxDQUFDLGtCQUFrQixDQUM5QyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQ25ELENBQUM7WUFDSixDQUFDO1lBQ0QsSUFBSSxFQUFFLENBQUMsa0JBQWtCLEtBQUssSUFBSSxJQUFJLEVBQUUsQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDbkUsRUFBRSxDQUFDLGFBQWEsR0FBRyxJQUFJLEVBQUUsQ0FBQyxrQkFBa0IsQ0FDMUMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FDcEUsQ0FBQztZQUNKLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHR5cGUge0NvbXBvbmVudENvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5pbXBvcnQge2xpdGVyYWxPckFycmF5TGl0ZXJhbH0gZnJvbSAnLi4vY29udmVyc2lvbic7XG5cbi8qKlxuICogRGVmZXIgaW5zdHJ1Y3Rpb25zIHRha2UgYSBjb25maWd1cmF0aW9uIGFycmF5LCB3aGljaCBzaG91bGQgYmUgY29sbGVjdGVkIGludG8gdGhlIGNvbXBvbmVudFxuICogY29uc3RzLiBUaGlzIHBoYXNlIGZpbmRzIHRoZSBjb25maWcgb3B0aW9ucywgYW5kIGNyZWF0ZXMgdGhlIGNvcnJlc3BvbmRpbmcgY29uc3QgYXJyYXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25maWd1cmVEZWZlckluc3RydWN0aW9ucyhqb2I6IENvbXBvbmVudENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBpZiAob3Aua2luZCAhPT0gaXIuT3BLaW5kLkRlZmVyKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAob3AucGxhY2Vob2xkZXJNaW5pbXVtVGltZSAhPT0gbnVsbCkge1xuICAgICAgICBvcC5wbGFjZWhvbGRlckNvbmZpZyA9IG5ldyBpci5Db25zdENvbGxlY3RlZEV4cHIoXG4gICAgICAgICAgbGl0ZXJhbE9yQXJyYXlMaXRlcmFsKFtvcC5wbGFjZWhvbGRlck1pbmltdW1UaW1lXSksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBpZiAob3AubG9hZGluZ01pbmltdW1UaW1lICE9PSBudWxsIHx8IG9wLmxvYWRpbmdBZnRlclRpbWUgIT09IG51bGwpIHtcbiAgICAgICAgb3AubG9hZGluZ0NvbmZpZyA9IG5ldyBpci5Db25zdENvbGxlY3RlZEV4cHIoXG4gICAgICAgICAgbGl0ZXJhbE9yQXJyYXlMaXRlcmFsKFtvcC5sb2FkaW5nTWluaW11bVRpbWUsIG9wLmxvYWRpbmdBZnRlclRpbWVdKSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==