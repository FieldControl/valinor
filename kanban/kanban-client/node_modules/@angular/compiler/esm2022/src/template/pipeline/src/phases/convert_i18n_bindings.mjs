/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udmVydF9pMThuX2JpbmRpbmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvY29udmVydF9pMThuX2JpbmRpbmdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COzs7R0FHRztBQUNILE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxHQUFtQjtJQUNyRCxNQUFNLG9CQUFvQixHQUF3QyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQzVFLEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN6QyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMxQyxDQUFDO1FBQ0gsQ0FBQztRQUVELEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNoQixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO2dCQUN4QixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUztvQkFDdEIsSUFBSSxFQUFFLENBQUMsV0FBVyxLQUFLLElBQUksRUFBRSxDQUFDO3dCQUM1QixTQUFTO29CQUNYLENBQUM7b0JBRUQsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsWUFBWSxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQzt3QkFDakQsU0FBUztvQkFDWCxDQUFDO29CQUVELE1BQU0scUJBQXFCLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDbEUsSUFBSSxxQkFBcUIsS0FBSyxTQUFTLEVBQUUsQ0FBQzt3QkFDeEMsTUFBTSxJQUFJLEtBQUssQ0FDYixnSUFBZ0ksQ0FDakksQ0FBQztvQkFDSixDQUFDO29CQUVELElBQUkscUJBQXFCLENBQUMsTUFBTSxLQUFLLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDL0MsTUFBTSxJQUFJLEtBQUssQ0FDYix3RkFBd0YsQ0FDekYsQ0FBQztvQkFDSixDQUFDO29CQUVELE1BQU0sR0FBRyxHQUFrQixFQUFFLENBQUM7b0JBQzlCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzt3QkFDMUQsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBRTFDLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7NEJBQy9FLE1BQU0sSUFBSSxLQUFLLENBQ2IsNkhBQTZILEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxxQkFBcUIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxjQUFjLENBQ3RPLENBQUM7d0JBQ0osQ0FBQzt3QkFFRCxHQUFHLENBQUMsSUFBSSxDQUNOLEVBQUUsQ0FBQyxzQkFBc0IsQ0FDdkIsRUFBRSxDQUFDLFdBQVcsRUFDZCxxQkFBcUIsQ0FBQyxNQUFNLEVBQzVCLHFCQUFxQixDQUFDLElBQUksRUFDMUIscUJBQXFCLENBQUMsTUFBTSxFQUM1QixJQUFJLEVBQ0osSUFBSSxFQUNKLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEVBQ2pDLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLEVBQ25DLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQ2xDLEVBQUUsQ0FBQyxJQUFJLEVBQ1AsRUFBRSxDQUFDLFVBQVUsQ0FDZCxDQUNGLENBQUM7b0JBQ0osQ0FBQztvQkFDRCxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxFQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUNsRCxNQUFNO1lBQ1YsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQge0NvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogU29tZSBiaW5kaW5nIGluc3RydWN0aW9ucyBpbiB0aGUgdXBkYXRlIGJsb2NrIG1heSBhY3R1YWxseSBjb3JyZXNwb25kIHRvIGkxOG4gYmluZGluZ3MuIEluIHRoYXRcbiAqIGNhc2UsIHRoZXkgc2hvdWxkIGJlIHJlcGxhY2VkIHdpdGggaTE4bkV4cCBpbnN0cnVjdGlvbnMgZm9yIHRoZSBkeW5hbWljIHBvcnRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udmVydEkxOG5CaW5kaW5ncyhqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGNvbnN0IGkxOG5BdHRyaWJ1dGVzQnlFbGVtOiBNYXA8aXIuWHJlZklkLCBpci5JMThuQXR0cmlidXRlc09wPiA9IG5ldyBNYXAoKTtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuSTE4bkF0dHJpYnV0ZXMpIHtcbiAgICAgICAgaTE4bkF0dHJpYnV0ZXNCeUVsZW0uc2V0KG9wLnRhcmdldCwgb3ApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC51cGRhdGUpIHtcbiAgICAgIHN3aXRjaCAob3Aua2luZCkge1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5Qcm9wZXJ0eTpcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuQXR0cmlidXRlOlxuICAgICAgICAgIGlmIChvcC5pMThuQ29udGV4dCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCEob3AuZXhwcmVzc2lvbiBpbnN0YW5jZW9mIGlyLkludGVycG9sYXRpb24pKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBpMThuQXR0cmlidXRlc0ZvckVsZW0gPSBpMThuQXR0cmlidXRlc0J5RWxlbS5nZXQob3AudGFyZ2V0KTtcbiAgICAgICAgICBpZiAoaTE4bkF0dHJpYnV0ZXNGb3JFbGVtID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgJ0Fzc2VydGlvbkVycm9yOiBBbiBpMThuIGF0dHJpYnV0ZSBiaW5kaW5nIGluc3RydWN0aW9uIHJlcXVpcmVzIHRoZSBvd25pbmcgZWxlbWVudCB0byBoYXZlIGFuIEkxOG5BdHRyaWJ1dGVzIGNyZWF0ZSBpbnN0cnVjdGlvbicsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChpMThuQXR0cmlidXRlc0ZvckVsZW0udGFyZ2V0ICE9PSBvcC50YXJnZXQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgJ0Fzc2VydGlvbkVycm9yOiBFeHBlY3RlZCBpMThuQXR0cmlidXRlcyB0YXJnZXQgZWxlbWVudCB0byBtYXRjaCBiaW5kaW5nIHRhcmdldCBlbGVtZW50JyxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qgb3BzOiBpci5VcGRhdGVPcFtdID0gW107XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcC5leHByZXNzaW9uLmV4cHJlc3Npb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBleHByID0gb3AuZXhwcmVzc2lvbi5leHByZXNzaW9uc1tpXTtcblxuICAgICAgICAgICAgaWYgKG9wLmV4cHJlc3Npb24uaTE4blBsYWNlaG9sZGVycy5sZW5ndGggIT09IG9wLmV4cHJlc3Npb24uZXhwcmVzc2lvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgQXNzZXJ0aW9uRXJyb3I6IEFuIGkxOG4gYXR0cmlidXRlIGJpbmRpbmcgaW5zdHJ1Y3Rpb24gcmVxdWlyZXMgdGhlIHNhbWUgbnVtYmVyIG9mIGV4cHJlc3Npb25zIGFuZCBwbGFjZWhvbGRlcnMsIGJ1dCBmb3VuZCAke29wLmV4cHJlc3Npb24uaTE4blBsYWNlaG9sZGVycy5sZW5ndGh9IHBsYWNlaG9sZGVycyBhbmQgJHtvcC5leHByZXNzaW9uLmV4cHJlc3Npb25zLmxlbmd0aH0gZXhwcmVzc2lvbnNgLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvcHMucHVzaChcbiAgICAgICAgICAgICAgaXIuY3JlYXRlSTE4bkV4cHJlc3Npb25PcChcbiAgICAgICAgICAgICAgICBvcC5pMThuQ29udGV4dCxcbiAgICAgICAgICAgICAgICBpMThuQXR0cmlidXRlc0ZvckVsZW0udGFyZ2V0LFxuICAgICAgICAgICAgICAgIGkxOG5BdHRyaWJ1dGVzRm9yRWxlbS54cmVmLFxuICAgICAgICAgICAgICAgIGkxOG5BdHRyaWJ1dGVzRm9yRWxlbS5oYW5kbGUsXG4gICAgICAgICAgICAgICAgZXhwcixcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIG9wLmV4cHJlc3Npb24uaTE4blBsYWNlaG9sZGVyc1tpXSxcbiAgICAgICAgICAgICAgICBpci5JMThuUGFyYW1SZXNvbHV0aW9uVGltZS5DcmVhdGlvbixcbiAgICAgICAgICAgICAgICBpci5JMThuRXhwcmVzc2lvbkZvci5JMThuQXR0cmlidXRlLFxuICAgICAgICAgICAgICAgIG9wLm5hbWUsXG4gICAgICAgICAgICAgICAgb3Auc291cmNlU3BhbixcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlyLk9wTGlzdC5yZXBsYWNlV2l0aE1hbnkob3AgYXMgaXIuVXBkYXRlT3AsIG9wcyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=