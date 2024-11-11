/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
/**
 * Updates i18n expression ops to target the last slot in their owning i18n block, and moves them
 * after the last update instruction that depends on that slot.
 */
export function assignI18nSlotDependencies(job) {
    for (const unit of job.units) {
        // The first update op.
        let updateOp = unit.update.head;
        // I18n expressions currently being moved during the iteration.
        let i18nExpressionsInProgress = [];
        // Non-null  while we are iterating through an i18nStart/i18nEnd pair
        let state = null;
        for (const createOp of unit.create) {
            if (createOp.kind === ir.OpKind.I18nStart) {
                state = {
                    blockXref: createOp.xref,
                    lastSlotConsumer: createOp.xref,
                };
            }
            else if (createOp.kind === ir.OpKind.I18nEnd) {
                for (const op of i18nExpressionsInProgress) {
                    op.target = state.lastSlotConsumer;
                    ir.OpList.insertBefore(op, updateOp);
                }
                i18nExpressionsInProgress.length = 0;
                state = null;
            }
            if (ir.hasConsumesSlotTrait(createOp)) {
                if (state !== null) {
                    state.lastSlotConsumer = createOp.xref;
                }
                while (true) {
                    if (updateOp.next === null) {
                        break;
                    }
                    if (state !== null &&
                        updateOp.kind === ir.OpKind.I18nExpression &&
                        updateOp.usage === ir.I18nExpressionFor.I18nText &&
                        updateOp.i18nOwner === state.blockXref) {
                        const opToRemove = updateOp;
                        updateOp = updateOp.next;
                        ir.OpList.remove(opToRemove);
                        i18nExpressionsInProgress.push(opToRemove);
                        continue;
                    }
                    if (ir.hasDependsOnSlotContextTrait(updateOp) && updateOp.target !== createOp.xref) {
                        break;
                    }
                    updateOp = updateOp.next;
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzaWduX2kxOG5fc2xvdF9kZXBlbmRlbmNpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9hc3NpZ25faTE4bl9zbG90X2RlcGVuZGVuY2llcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQVEvQjs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsMEJBQTBCLENBQUMsR0FBbUI7SUFDNUQsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsdUJBQXVCO1FBQ3ZCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBRWhDLCtEQUErRDtRQUMvRCxJQUFJLHlCQUF5QixHQUEwQixFQUFFLENBQUM7UUFFMUQscUVBQXFFO1FBQ3JFLElBQUksS0FBSyxHQUFzQixJQUFJLENBQUM7UUFFcEMsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbkMsSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzFDLEtBQUssR0FBRztvQkFDTixTQUFTLEVBQUUsUUFBUSxDQUFDLElBQUk7b0JBQ3hCLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxJQUFJO2lCQUNoQyxDQUFDO1lBQ0osQ0FBQztpQkFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDL0MsS0FBSyxNQUFNLEVBQUUsSUFBSSx5QkFBeUIsRUFBRSxDQUFDO29CQUMzQyxFQUFFLENBQUMsTUFBTSxHQUFHLEtBQU0sQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDcEMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBaUIsRUFBRSxRQUFTLENBQUMsQ0FBQztnQkFDdkQsQ0FBQztnQkFDRCx5QkFBeUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUNyQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2YsQ0FBQztZQUVELElBQUksRUFBRSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBQ3RDLElBQUksS0FBSyxLQUFLLElBQUksRUFBRSxDQUFDO29CQUNuQixLQUFLLENBQUMsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDekMsQ0FBQztnQkFFRCxPQUFPLElBQUksRUFBRSxDQUFDO29CQUNaLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUUsQ0FBQzt3QkFDM0IsTUFBTTtvQkFDUixDQUFDO29CQUVELElBQ0UsS0FBSyxLQUFLLElBQUk7d0JBQ2QsUUFBUSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWM7d0JBQzFDLFFBQVEsQ0FBQyxLQUFLLEtBQUssRUFBRSxDQUFDLGlCQUFpQixDQUFDLFFBQVE7d0JBQ2hELFFBQVEsQ0FBQyxTQUFTLEtBQUssS0FBSyxDQUFDLFNBQVMsRUFDdEMsQ0FBQzt3QkFDRCxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUM7d0JBQzVCLFFBQVEsR0FBRyxRQUFRLENBQUMsSUFBSyxDQUFDO3dCQUMxQixFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBYyxVQUFVLENBQUMsQ0FBQzt3QkFDMUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUMzQyxTQUFTO29CQUNYLENBQUM7b0JBRUQsSUFBSSxFQUFFLENBQUMsNEJBQTRCLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ25GLE1BQU07b0JBQ1IsQ0FBQztvQkFFRCxRQUFRLEdBQUcsUUFBUSxDQUFDLElBQUssQ0FBQztnQkFDNUIsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuaW50ZXJmYWNlIEJsb2NrU3RhdGUge1xuICBibG9ja1hyZWY6IGlyLlhyZWZJZDtcbiAgbGFzdFNsb3RDb25zdW1lcjogaXIuWHJlZklkO1xufVxuXG4vKipcbiAqIFVwZGF0ZXMgaTE4biBleHByZXNzaW9uIG9wcyB0byB0YXJnZXQgdGhlIGxhc3Qgc2xvdCBpbiB0aGVpciBvd25pbmcgaTE4biBibG9jaywgYW5kIG1vdmVzIHRoZW1cbiAqIGFmdGVyIHRoZSBsYXN0IHVwZGF0ZSBpbnN0cnVjdGlvbiB0aGF0IGRlcGVuZHMgb24gdGhhdCBzbG90LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzaWduSTE4blNsb3REZXBlbmRlbmNpZXMoam9iOiBDb21waWxhdGlvbkpvYikge1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgLy8gVGhlIGZpcnN0IHVwZGF0ZSBvcC5cbiAgICBsZXQgdXBkYXRlT3AgPSB1bml0LnVwZGF0ZS5oZWFkO1xuXG4gICAgLy8gSTE4biBleHByZXNzaW9ucyBjdXJyZW50bHkgYmVpbmcgbW92ZWQgZHVyaW5nIHRoZSBpdGVyYXRpb24uXG4gICAgbGV0IGkxOG5FeHByZXNzaW9uc0luUHJvZ3Jlc3M6IGlyLkkxOG5FeHByZXNzaW9uT3BbXSA9IFtdO1xuXG4gICAgLy8gTm9uLW51bGwgIHdoaWxlIHdlIGFyZSBpdGVyYXRpbmcgdGhyb3VnaCBhbiBpMThuU3RhcnQvaTE4bkVuZCBwYWlyXG4gICAgbGV0IHN0YXRlOiBCbG9ja1N0YXRlIHwgbnVsbCA9IG51bGw7XG5cbiAgICBmb3IgKGNvbnN0IGNyZWF0ZU9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBpZiAoY3JlYXRlT3Aua2luZCA9PT0gaXIuT3BLaW5kLkkxOG5TdGFydCkge1xuICAgICAgICBzdGF0ZSA9IHtcbiAgICAgICAgICBibG9ja1hyZWY6IGNyZWF0ZU9wLnhyZWYsXG4gICAgICAgICAgbGFzdFNsb3RDb25zdW1lcjogY3JlYXRlT3AueHJlZixcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAoY3JlYXRlT3Aua2luZCA9PT0gaXIuT3BLaW5kLkkxOG5FbmQpIHtcbiAgICAgICAgZm9yIChjb25zdCBvcCBvZiBpMThuRXhwcmVzc2lvbnNJblByb2dyZXNzKSB7XG4gICAgICAgICAgb3AudGFyZ2V0ID0gc3RhdGUhLmxhc3RTbG90Q29uc3VtZXI7XG4gICAgICAgICAgaXIuT3BMaXN0Lmluc2VydEJlZm9yZShvcCBhcyBpci5VcGRhdGVPcCwgdXBkYXRlT3AhKTtcbiAgICAgICAgfVxuICAgICAgICBpMThuRXhwcmVzc2lvbnNJblByb2dyZXNzLmxlbmd0aCA9IDA7XG4gICAgICAgIHN0YXRlID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKGlyLmhhc0NvbnN1bWVzU2xvdFRyYWl0KGNyZWF0ZU9wKSkge1xuICAgICAgICBpZiAoc3RhdGUgIT09IG51bGwpIHtcbiAgICAgICAgICBzdGF0ZS5sYXN0U2xvdENvbnN1bWVyID0gY3JlYXRlT3AueHJlZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgaWYgKHVwZGF0ZU9wLm5leHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHN0YXRlICE9PSBudWxsICYmXG4gICAgICAgICAgICB1cGRhdGVPcC5raW5kID09PSBpci5PcEtpbmQuSTE4bkV4cHJlc3Npb24gJiZcbiAgICAgICAgICAgIHVwZGF0ZU9wLnVzYWdlID09PSBpci5JMThuRXhwcmVzc2lvbkZvci5JMThuVGV4dCAmJlxuICAgICAgICAgICAgdXBkYXRlT3AuaTE4bk93bmVyID09PSBzdGF0ZS5ibG9ja1hyZWZcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnN0IG9wVG9SZW1vdmUgPSB1cGRhdGVPcDtcbiAgICAgICAgICAgIHVwZGF0ZU9wID0gdXBkYXRlT3AubmV4dCE7XG4gICAgICAgICAgICBpci5PcExpc3QucmVtb3ZlPGlyLlVwZGF0ZU9wPihvcFRvUmVtb3ZlKTtcbiAgICAgICAgICAgIGkxOG5FeHByZXNzaW9uc0luUHJvZ3Jlc3MucHVzaChvcFRvUmVtb3ZlKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChpci5oYXNEZXBlbmRzT25TbG90Q29udGV4dFRyYWl0KHVwZGF0ZU9wKSAmJiB1cGRhdGVPcC50YXJnZXQgIT09IGNyZWF0ZU9wLnhyZWYpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHVwZGF0ZU9wID0gdXBkYXRlT3AubmV4dCE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==