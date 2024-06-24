/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzaWduX2kxOG5fc2xvdF9kZXBlbmRlbmNpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9hc3NpZ25faTE4bl9zbG90X2RlcGVuZGVuY2llcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQVEvQjs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsMEJBQTBCLENBQUMsR0FBbUI7SUFDNUQsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsdUJBQXVCO1FBQ3ZCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBRWhDLCtEQUErRDtRQUMvRCxJQUFJLHlCQUF5QixHQUEwQixFQUFFLENBQUM7UUFFMUQscUVBQXFFO1FBQ3JFLElBQUksS0FBSyxHQUFzQixJQUFJLENBQUM7UUFFcEMsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbkMsSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzFDLEtBQUssR0FBRztvQkFDTixTQUFTLEVBQUUsUUFBUSxDQUFDLElBQUk7b0JBQ3hCLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxJQUFJO2lCQUNoQyxDQUFDO1lBQ0osQ0FBQztpQkFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDL0MsS0FBSyxNQUFNLEVBQUUsSUFBSSx5QkFBeUIsRUFBRSxDQUFDO29CQUMzQyxFQUFFLENBQUMsTUFBTSxHQUFHLEtBQU0sQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDcEMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBaUIsRUFBRSxRQUFTLENBQUMsQ0FBQztnQkFDdkQsQ0FBQztnQkFDRCx5QkFBeUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUNyQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2YsQ0FBQztZQUVELElBQUksRUFBRSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBQ3RDLElBQUksS0FBSyxLQUFLLElBQUksRUFBRSxDQUFDO29CQUNuQixLQUFLLENBQUMsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDekMsQ0FBQztnQkFFRCxPQUFPLElBQUksRUFBRSxDQUFDO29CQUNaLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUUsQ0FBQzt3QkFDM0IsTUFBTTtvQkFDUixDQUFDO29CQUVELElBQ0UsS0FBSyxLQUFLLElBQUk7d0JBQ2QsUUFBUSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWM7d0JBQzFDLFFBQVEsQ0FBQyxLQUFLLEtBQUssRUFBRSxDQUFDLGlCQUFpQixDQUFDLFFBQVE7d0JBQ2hELFFBQVEsQ0FBQyxTQUFTLEtBQUssS0FBSyxDQUFDLFNBQVMsRUFDdEMsQ0FBQzt3QkFDRCxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUM7d0JBQzVCLFFBQVEsR0FBRyxRQUFRLENBQUMsSUFBSyxDQUFDO3dCQUMxQixFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBYyxVQUFVLENBQUMsQ0FBQzt3QkFDMUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUMzQyxTQUFTO29CQUNYLENBQUM7b0JBRUQsSUFBSSxFQUFFLENBQUMsNEJBQTRCLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ25GLE1BQU07b0JBQ1IsQ0FBQztvQkFFRCxRQUFRLEdBQUcsUUFBUSxDQUFDLElBQUssQ0FBQztnQkFDNUIsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHtDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG5pbnRlcmZhY2UgQmxvY2tTdGF0ZSB7XG4gIGJsb2NrWHJlZjogaXIuWHJlZklkO1xuICBsYXN0U2xvdENvbnN1bWVyOiBpci5YcmVmSWQ7XG59XG5cbi8qKlxuICogVXBkYXRlcyBpMThuIGV4cHJlc3Npb24gb3BzIHRvIHRhcmdldCB0aGUgbGFzdCBzbG90IGluIHRoZWlyIG93bmluZyBpMThuIGJsb2NrLCBhbmQgbW92ZXMgdGhlbVxuICogYWZ0ZXIgdGhlIGxhc3QgdXBkYXRlIGluc3RydWN0aW9uIHRoYXQgZGVwZW5kcyBvbiB0aGF0IHNsb3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NpZ25JMThuU2xvdERlcGVuZGVuY2llcyhqb2I6IENvbXBpbGF0aW9uSm9iKSB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICAvLyBUaGUgZmlyc3QgdXBkYXRlIG9wLlxuICAgIGxldCB1cGRhdGVPcCA9IHVuaXQudXBkYXRlLmhlYWQ7XG5cbiAgICAvLyBJMThuIGV4cHJlc3Npb25zIGN1cnJlbnRseSBiZWluZyBtb3ZlZCBkdXJpbmcgdGhlIGl0ZXJhdGlvbi5cbiAgICBsZXQgaTE4bkV4cHJlc3Npb25zSW5Qcm9ncmVzczogaXIuSTE4bkV4cHJlc3Npb25PcFtdID0gW107XG5cbiAgICAvLyBOb24tbnVsbCAgd2hpbGUgd2UgYXJlIGl0ZXJhdGluZyB0aHJvdWdoIGFuIGkxOG5TdGFydC9pMThuRW5kIHBhaXJcbiAgICBsZXQgc3RhdGU6IEJsb2NrU3RhdGUgfCBudWxsID0gbnVsbDtcblxuICAgIGZvciAoY29uc3QgY3JlYXRlT3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChjcmVhdGVPcC5raW5kID09PSBpci5PcEtpbmQuSTE4blN0YXJ0KSB7XG4gICAgICAgIHN0YXRlID0ge1xuICAgICAgICAgIGJsb2NrWHJlZjogY3JlYXRlT3AueHJlZixcbiAgICAgICAgICBsYXN0U2xvdENvbnN1bWVyOiBjcmVhdGVPcC54cmVmLFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIGlmIChjcmVhdGVPcC5raW5kID09PSBpci5PcEtpbmQuSTE4bkVuZCkge1xuICAgICAgICBmb3IgKGNvbnN0IG9wIG9mIGkxOG5FeHByZXNzaW9uc0luUHJvZ3Jlc3MpIHtcbiAgICAgICAgICBvcC50YXJnZXQgPSBzdGF0ZSEubGFzdFNsb3RDb25zdW1lcjtcbiAgICAgICAgICBpci5PcExpc3QuaW5zZXJ0QmVmb3JlKG9wIGFzIGlyLlVwZGF0ZU9wLCB1cGRhdGVPcCEpO1xuICAgICAgICB9XG4gICAgICAgIGkxOG5FeHByZXNzaW9uc0luUHJvZ3Jlc3MubGVuZ3RoID0gMDtcbiAgICAgICAgc3RhdGUgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXIuaGFzQ29uc3VtZXNTbG90VHJhaXQoY3JlYXRlT3ApKSB7XG4gICAgICAgIGlmIChzdGF0ZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHN0YXRlLmxhc3RTbG90Q29uc3VtZXIgPSBjcmVhdGVPcC54cmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICBpZiAodXBkYXRlT3AubmV4dCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgc3RhdGUgIT09IG51bGwgJiZcbiAgICAgICAgICAgIHVwZGF0ZU9wLmtpbmQgPT09IGlyLk9wS2luZC5JMThuRXhwcmVzc2lvbiAmJlxuICAgICAgICAgICAgdXBkYXRlT3AudXNhZ2UgPT09IGlyLkkxOG5FeHByZXNzaW9uRm9yLkkxOG5UZXh0ICYmXG4gICAgICAgICAgICB1cGRhdGVPcC5pMThuT3duZXIgPT09IHN0YXRlLmJsb2NrWHJlZlxuICAgICAgICAgICkge1xuICAgICAgICAgICAgY29uc3Qgb3BUb1JlbW92ZSA9IHVwZGF0ZU9wO1xuICAgICAgICAgICAgdXBkYXRlT3AgPSB1cGRhdGVPcC5uZXh0ITtcbiAgICAgICAgICAgIGlyLk9wTGlzdC5yZW1vdmU8aXIuVXBkYXRlT3A+KG9wVG9SZW1vdmUpO1xuICAgICAgICAgICAgaTE4bkV4cHJlc3Npb25zSW5Qcm9ncmVzcy5wdXNoKG9wVG9SZW1vdmUpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGlyLmhhc0RlcGVuZHNPblNsb3RDb250ZXh0VHJhaXQodXBkYXRlT3ApICYmIHVwZGF0ZU9wLnRhcmdldCAhPT0gY3JlYXRlT3AueHJlZikge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdXBkYXRlT3AgPSB1cGRhdGVPcC5uZXh0ITtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19