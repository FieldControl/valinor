/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
/**
 * Some binding instructions in the update block may actually correspond to i18n bindings. In that
 * case, they should be replaced with i18nExp instructions for the dynamic portions.
 */
export function convertI18nBindings(job) {
    const i18nAttributesByElem = new Map();
    for (const unit of job.units) {
        for (const op of unit.create) {
            if (op.kind === ir.OpKind.I18nAttributes) {
                i18nAttributesByElem.set(op.target, op);
            }
        }
        for (const op of unit.update) {
            switch (op.kind) {
                case ir.OpKind.Property:
                case ir.OpKind.Attribute:
                    if (op.i18nContext === null) {
                        continue;
                    }
                    if (!(op.expression instanceof ir.Interpolation)) {
                        continue;
                    }
                    const i18nAttributesForElem = i18nAttributesByElem.get(op.target);
                    if (i18nAttributesForElem === undefined) {
                        throw new Error('AssertionError: An i18n attribute binding instruction requires the owning element to have an I18nAttributes create instruction');
                    }
                    if (i18nAttributesForElem.target !== op.target) {
                        throw new Error('AssertionError: Expected i18nAttributes target element to match binding target element');
                    }
                    const ops = [];
                    for (let i = 0; i < op.expression.expressions.length; i++) {
                        const expr = op.expression.expressions[i];
                        if (op.expression.i18nPlaceholders.length !== op.expression.expressions.length) {
                            throw new Error(`AssertionError: An i18n attribute binding instruction requires the same number of expressions and placeholders, but found ${op.expression.i18nPlaceholders.length} placeholders and ${op.expression.expressions.length} expressions`);
                        }
                        ops.push(ir.createI18nExpressionOp(op.i18nContext, i18nAttributesForElem.target, i18nAttributesForElem.xref, i18nAttributesForElem.handle, expr, null, op.expression.i18nPlaceholders[i], ir.I18nParamResolutionTime.Creation, ir.I18nExpressionFor.I18nAttribute, op.name, op.sourceSpan));
                    }
                    ir.OpList.replaceWithMany(op, ops);
                    break;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udmVydF9pMThuX2JpbmRpbmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvY29udmVydF9pMThuX2JpbmRpbmdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COzs7R0FHRztBQUNILE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxHQUFtQjtJQUNyRCxNQUFNLG9CQUFvQixHQUF3QyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQzVFLEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN6QyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMxQyxDQUFDO1FBQ0gsQ0FBQztRQUVELEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNoQixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO2dCQUN4QixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUztvQkFDdEIsSUFBSSxFQUFFLENBQUMsV0FBVyxLQUFLLElBQUksRUFBRSxDQUFDO3dCQUM1QixTQUFTO29CQUNYLENBQUM7b0JBRUQsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsWUFBWSxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQzt3QkFDakQsU0FBUztvQkFDWCxDQUFDO29CQUVELE1BQU0scUJBQXFCLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDbEUsSUFBSSxxQkFBcUIsS0FBSyxTQUFTLEVBQUUsQ0FBQzt3QkFDeEMsTUFBTSxJQUFJLEtBQUssQ0FDYixnSUFBZ0ksQ0FDakksQ0FBQztvQkFDSixDQUFDO29CQUVELElBQUkscUJBQXFCLENBQUMsTUFBTSxLQUFLLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDL0MsTUFBTSxJQUFJLEtBQUssQ0FDYix3RkFBd0YsQ0FDekYsQ0FBQztvQkFDSixDQUFDO29CQUVELE1BQU0sR0FBRyxHQUFrQixFQUFFLENBQUM7b0JBQzlCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzt3QkFDMUQsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBRTFDLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7NEJBQy9FLE1BQU0sSUFBSSxLQUFLLENBQ2IsNkhBQTZILEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxxQkFBcUIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxjQUFjLENBQ3RPLENBQUM7d0JBQ0osQ0FBQzt3QkFFRCxHQUFHLENBQUMsSUFBSSxDQUNOLEVBQUUsQ0FBQyxzQkFBc0IsQ0FDdkIsRUFBRSxDQUFDLFdBQVcsRUFDZCxxQkFBcUIsQ0FBQyxNQUFNLEVBQzVCLHFCQUFxQixDQUFDLElBQUksRUFDMUIscUJBQXFCLENBQUMsTUFBTSxFQUM1QixJQUFJLEVBQ0osSUFBSSxFQUNKLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEVBQ2pDLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLEVBQ25DLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQ2xDLEVBQUUsQ0FBQyxJQUFJLEVBQ1AsRUFBRSxDQUFDLFVBQVUsQ0FDZCxDQUNGLENBQUM7b0JBQ0osQ0FBQztvQkFDRCxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxFQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUNsRCxNQUFNO1lBQ1YsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHtDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIFNvbWUgYmluZGluZyBpbnN0cnVjdGlvbnMgaW4gdGhlIHVwZGF0ZSBibG9jayBtYXkgYWN0dWFsbHkgY29ycmVzcG9uZCB0byBpMThuIGJpbmRpbmdzLiBJbiB0aGF0XG4gKiBjYXNlLCB0aGV5IHNob3VsZCBiZSByZXBsYWNlZCB3aXRoIGkxOG5FeHAgaW5zdHJ1Y3Rpb25zIGZvciB0aGUgZHluYW1pYyBwb3J0aW9ucy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRJMThuQmluZGluZ3Moam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBjb25zdCBpMThuQXR0cmlidXRlc0J5RWxlbTogTWFwPGlyLlhyZWZJZCwgaXIuSTE4bkF0dHJpYnV0ZXNPcD4gPSBuZXcgTWFwKCk7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLkkxOG5BdHRyaWJ1dGVzKSB7XG4gICAgICAgIGkxOG5BdHRyaWJ1dGVzQnlFbGVtLnNldChvcC50YXJnZXQsIG9wKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQudXBkYXRlKSB7XG4gICAgICBzd2l0Y2ggKG9wLmtpbmQpIHtcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuUHJvcGVydHk6XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkF0dHJpYnV0ZTpcbiAgICAgICAgICBpZiAob3AuaTE4bkNvbnRleHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghKG9wLmV4cHJlc3Npb24gaW5zdGFuY2VvZiBpci5JbnRlcnBvbGF0aW9uKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgaTE4bkF0dHJpYnV0ZXNGb3JFbGVtID0gaTE4bkF0dHJpYnV0ZXNCeUVsZW0uZ2V0KG9wLnRhcmdldCk7XG4gICAgICAgICAgaWYgKGkxOG5BdHRyaWJ1dGVzRm9yRWxlbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICdBc3NlcnRpb25FcnJvcjogQW4gaTE4biBhdHRyaWJ1dGUgYmluZGluZyBpbnN0cnVjdGlvbiByZXF1aXJlcyB0aGUgb3duaW5nIGVsZW1lbnQgdG8gaGF2ZSBhbiBJMThuQXR0cmlidXRlcyBjcmVhdGUgaW5zdHJ1Y3Rpb24nLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaTE4bkF0dHJpYnV0ZXNGb3JFbGVtLnRhcmdldCAhPT0gb3AudGFyZ2V0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICdBc3NlcnRpb25FcnJvcjogRXhwZWN0ZWQgaTE4bkF0dHJpYnV0ZXMgdGFyZ2V0IGVsZW1lbnQgdG8gbWF0Y2ggYmluZGluZyB0YXJnZXQgZWxlbWVudCcsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IG9wczogaXIuVXBkYXRlT3BbXSA9IFtdO1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3AuZXhwcmVzc2lvbi5leHByZXNzaW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZXhwciA9IG9wLmV4cHJlc3Npb24uZXhwcmVzc2lvbnNbaV07XG5cbiAgICAgICAgICAgIGlmIChvcC5leHByZXNzaW9uLmkxOG5QbGFjZWhvbGRlcnMubGVuZ3RoICE9PSBvcC5leHByZXNzaW9uLmV4cHJlc3Npb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEFzc2VydGlvbkVycm9yOiBBbiBpMThuIGF0dHJpYnV0ZSBiaW5kaW5nIGluc3RydWN0aW9uIHJlcXVpcmVzIHRoZSBzYW1lIG51bWJlciBvZiBleHByZXNzaW9ucyBhbmQgcGxhY2Vob2xkZXJzLCBidXQgZm91bmQgJHtvcC5leHByZXNzaW9uLmkxOG5QbGFjZWhvbGRlcnMubGVuZ3RofSBwbGFjZWhvbGRlcnMgYW5kICR7b3AuZXhwcmVzc2lvbi5leHByZXNzaW9ucy5sZW5ndGh9IGV4cHJlc3Npb25zYCxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb3BzLnB1c2goXG4gICAgICAgICAgICAgIGlyLmNyZWF0ZUkxOG5FeHByZXNzaW9uT3AoXG4gICAgICAgICAgICAgICAgb3AuaTE4bkNvbnRleHQsXG4gICAgICAgICAgICAgICAgaTE4bkF0dHJpYnV0ZXNGb3JFbGVtLnRhcmdldCxcbiAgICAgICAgICAgICAgICBpMThuQXR0cmlidXRlc0ZvckVsZW0ueHJlZixcbiAgICAgICAgICAgICAgICBpMThuQXR0cmlidXRlc0ZvckVsZW0uaGFuZGxlLFxuICAgICAgICAgICAgICAgIGV4cHIsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBvcC5leHByZXNzaW9uLmkxOG5QbGFjZWhvbGRlcnNbaV0sXG4gICAgICAgICAgICAgICAgaXIuSTE4blBhcmFtUmVzb2x1dGlvblRpbWUuQ3JlYXRpb24sXG4gICAgICAgICAgICAgICAgaXIuSTE4bkV4cHJlc3Npb25Gb3IuSTE4bkF0dHJpYnV0ZSxcbiAgICAgICAgICAgICAgICBvcC5uYW1lLFxuICAgICAgICAgICAgICAgIG9wLnNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpci5PcExpc3QucmVwbGFjZVdpdGhNYW55KG9wIGFzIGlyLlVwZGF0ZU9wLCBvcHMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19