/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ir from '../../ir';
/**
 * i18nAttributes ops will be generated for each i18n attribute. However, not all i18n attribues
 * will contain dynamic content, and so some of these i18nAttributes ops may be unnecessary.
 */
export function removeUnusedI18nAttributesOps(job) {
    for (const unit of job.units) {
        const ownersWithI18nExpressions = new Set();
        for (const op of unit.update) {
            switch (op.kind) {
                case ir.OpKind.I18nExpression:
                    ownersWithI18nExpressions.add(op.i18nOwner);
            }
        }
        for (const op of unit.create) {
            switch (op.kind) {
                case ir.OpKind.I18nAttributes:
                    if (ownersWithI18nExpressions.has(op.xref)) {
                        continue;
                    }
                    ir.OpList.remove(op);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlX3VudXNlZF9pMThuX2F0dHJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvcmVtb3ZlX3VudXNlZF9pMThuX2F0dHJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COzs7R0FHRztBQUNILE1BQU0sVUFBVSw2QkFBNkIsQ0FBQyxHQUFtQjtJQUMvRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixNQUFNLHlCQUF5QixHQUFHLElBQUksR0FBRyxFQUFhLENBQUM7UUFFdkQsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjO29CQUMzQix5QkFBeUIsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2hELENBQUM7UUFDSCxDQUFDO1FBRUQsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjO29CQUMzQixJQUFJLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzt3QkFDM0MsU0FBUztvQkFDWCxDQUFDO29CQUNELEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFjLEVBQUUsQ0FBQyxDQUFDO1lBQ3RDLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHtDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIGkxOG5BdHRyaWJ1dGVzIG9wcyB3aWxsIGJlIGdlbmVyYXRlZCBmb3IgZWFjaCBpMThuIGF0dHJpYnV0ZS4gSG93ZXZlciwgbm90IGFsbCBpMThuIGF0dHJpYnVlc1xuICogd2lsbCBjb250YWluIGR5bmFtaWMgY29udGVudCwgYW5kIHNvIHNvbWUgb2YgdGhlc2UgaTE4bkF0dHJpYnV0ZXMgb3BzIG1heSBiZSB1bm5lY2Vzc2FyeS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVVudXNlZEkxOG5BdHRyaWJ1dGVzT3BzKGpvYjogQ29tcGlsYXRpb25Kb2IpIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGNvbnN0IG93bmVyc1dpdGhJMThuRXhwcmVzc2lvbnMgPSBuZXcgU2V0PGlyLlhyZWZJZD4oKTtcblxuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC51cGRhdGUpIHtcbiAgICAgIHN3aXRjaCAob3Aua2luZCkge1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JMThuRXhwcmVzc2lvbjpcbiAgICAgICAgICBvd25lcnNXaXRoSTE4bkV4cHJlc3Npb25zLmFkZChvcC5pMThuT3duZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIHN3aXRjaCAob3Aua2luZCkge1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JMThuQXR0cmlidXRlczpcbiAgICAgICAgICBpZiAob3duZXJzV2l0aEkxOG5FeHByZXNzaW9ucy5oYXMob3AueHJlZikpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpci5PcExpc3QucmVtb3ZlPGlyLkNyZWF0ZU9wPihvcCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=