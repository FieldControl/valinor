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
                    if (state !== null && updateOp.kind === ir.OpKind.I18nExpression &&
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzaWduX2kxOG5fc2xvdF9kZXBlbmRlbmNpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9hc3NpZ25faTE4bl9zbG90X2RlcGVuZGVuY2llcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQVEvQjs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsMEJBQTBCLENBQUMsR0FBbUI7SUFDNUQsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsdUJBQXVCO1FBQ3ZCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBRWhDLCtEQUErRDtRQUMvRCxJQUFJLHlCQUF5QixHQUEwQixFQUFFLENBQUM7UUFFMUQscUVBQXFFO1FBQ3JFLElBQUksS0FBSyxHQUFvQixJQUFJLENBQUM7UUFFbEMsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbkMsSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzFDLEtBQUssR0FBRztvQkFDTixTQUFTLEVBQUUsUUFBUSxDQUFDLElBQUk7b0JBQ3hCLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxJQUFJO2lCQUNoQyxDQUFDO1lBQ0osQ0FBQztpQkFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDL0MsS0FBSyxNQUFNLEVBQUUsSUFBSSx5QkFBeUIsRUFBRSxDQUFDO29CQUMzQyxFQUFFLENBQUMsTUFBTSxHQUFHLEtBQU0sQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDcEMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBaUIsRUFBRSxRQUFTLENBQUMsQ0FBQztnQkFDdkQsQ0FBQztnQkFDRCx5QkFBeUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUNyQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2YsQ0FBQztZQUVELElBQUksRUFBRSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBQ3RDLElBQUksS0FBSyxLQUFLLElBQUksRUFBRSxDQUFDO29CQUNuQixLQUFLLENBQUMsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDekMsQ0FBQztnQkFFRCxPQUFPLElBQUksRUFBRSxDQUFDO29CQUNaLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUUsQ0FBQzt3QkFDM0IsTUFBTTtvQkFDUixDQUFDO29CQUVELElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYzt3QkFDNUQsUUFBUSxDQUFDLEtBQUssS0FBSyxFQUFFLENBQUMsaUJBQWlCLENBQUMsUUFBUTt3QkFDaEQsUUFBUSxDQUFDLFNBQVMsS0FBSyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7d0JBQzNDLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQzt3QkFDNUIsUUFBUSxHQUFHLFFBQVEsQ0FBQyxJQUFLLENBQUM7d0JBQzFCLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFjLFVBQVUsQ0FBQyxDQUFDO3dCQUMxQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQzNDLFNBQVM7b0JBQ1gsQ0FBQztvQkFFRCxJQUFJLEVBQUUsQ0FBQyw0QkFBNEIsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDbkYsTUFBTTtvQkFDUixDQUFDO29CQUVELFFBQVEsR0FBRyxRQUFRLENBQUMsSUFBSyxDQUFDO2dCQUM1QixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQge0NvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbmludGVyZmFjZSBCbG9ja1N0YXRlIHtcbiAgYmxvY2tYcmVmOiBpci5YcmVmSWQ7XG4gIGxhc3RTbG90Q29uc3VtZXI6IGlyLlhyZWZJZDtcbn1cblxuLyoqXG4gKiBVcGRhdGVzIGkxOG4gZXhwcmVzc2lvbiBvcHMgdG8gdGFyZ2V0IHRoZSBsYXN0IHNsb3QgaW4gdGhlaXIgb3duaW5nIGkxOG4gYmxvY2ssIGFuZCBtb3ZlcyB0aGVtXG4gKiBhZnRlciB0aGUgbGFzdCB1cGRhdGUgaW5zdHJ1Y3Rpb24gdGhhdCBkZXBlbmRzIG9uIHRoYXQgc2xvdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2lnbkkxOG5TbG90RGVwZW5kZW5jaWVzKGpvYjogQ29tcGlsYXRpb25Kb2IpIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIC8vIFRoZSBmaXJzdCB1cGRhdGUgb3AuXG4gICAgbGV0IHVwZGF0ZU9wID0gdW5pdC51cGRhdGUuaGVhZDtcblxuICAgIC8vIEkxOG4gZXhwcmVzc2lvbnMgY3VycmVudGx5IGJlaW5nIG1vdmVkIGR1cmluZyB0aGUgaXRlcmF0aW9uLlxuICAgIGxldCBpMThuRXhwcmVzc2lvbnNJblByb2dyZXNzOiBpci5JMThuRXhwcmVzc2lvbk9wW10gPSBbXTtcblxuICAgIC8vIE5vbi1udWxsICB3aGlsZSB3ZSBhcmUgaXRlcmF0aW5nIHRocm91Z2ggYW4gaTE4blN0YXJ0L2kxOG5FbmQgcGFpclxuICAgIGxldCBzdGF0ZTogQmxvY2tTdGF0ZXxudWxsID0gbnVsbDtcblxuICAgIGZvciAoY29uc3QgY3JlYXRlT3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChjcmVhdGVPcC5raW5kID09PSBpci5PcEtpbmQuSTE4blN0YXJ0KSB7XG4gICAgICAgIHN0YXRlID0ge1xuICAgICAgICAgIGJsb2NrWHJlZjogY3JlYXRlT3AueHJlZixcbiAgICAgICAgICBsYXN0U2xvdENvbnN1bWVyOiBjcmVhdGVPcC54cmVmLFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIGlmIChjcmVhdGVPcC5raW5kID09PSBpci5PcEtpbmQuSTE4bkVuZCkge1xuICAgICAgICBmb3IgKGNvbnN0IG9wIG9mIGkxOG5FeHByZXNzaW9uc0luUHJvZ3Jlc3MpIHtcbiAgICAgICAgICBvcC50YXJnZXQgPSBzdGF0ZSEubGFzdFNsb3RDb25zdW1lcjtcbiAgICAgICAgICBpci5PcExpc3QuaW5zZXJ0QmVmb3JlKG9wIGFzIGlyLlVwZGF0ZU9wLCB1cGRhdGVPcCEpO1xuICAgICAgICB9XG4gICAgICAgIGkxOG5FeHByZXNzaW9uc0luUHJvZ3Jlc3MubGVuZ3RoID0gMDtcbiAgICAgICAgc3RhdGUgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXIuaGFzQ29uc3VtZXNTbG90VHJhaXQoY3JlYXRlT3ApKSB7XG4gICAgICAgIGlmIChzdGF0ZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHN0YXRlLmxhc3RTbG90Q29uc3VtZXIgPSBjcmVhdGVPcC54cmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICBpZiAodXBkYXRlT3AubmV4dCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHN0YXRlICE9PSBudWxsICYmIHVwZGF0ZU9wLmtpbmQgPT09IGlyLk9wS2luZC5JMThuRXhwcmVzc2lvbiAmJlxuICAgICAgICAgICAgICB1cGRhdGVPcC51c2FnZSA9PT0gaXIuSTE4bkV4cHJlc3Npb25Gb3IuSTE4blRleHQgJiZcbiAgICAgICAgICAgICAgdXBkYXRlT3AuaTE4bk93bmVyID09PSBzdGF0ZS5ibG9ja1hyZWYpIHtcbiAgICAgICAgICAgIGNvbnN0IG9wVG9SZW1vdmUgPSB1cGRhdGVPcDtcbiAgICAgICAgICAgIHVwZGF0ZU9wID0gdXBkYXRlT3AubmV4dCE7XG4gICAgICAgICAgICBpci5PcExpc3QucmVtb3ZlPGlyLlVwZGF0ZU9wPihvcFRvUmVtb3ZlKTtcbiAgICAgICAgICAgIGkxOG5FeHByZXNzaW9uc0luUHJvZ3Jlc3MucHVzaChvcFRvUmVtb3ZlKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChpci5oYXNEZXBlbmRzT25TbG90Q29udGV4dFRyYWl0KHVwZGF0ZU9wKSAmJiB1cGRhdGVPcC50YXJnZXQgIT09IGNyZWF0ZU9wLnhyZWYpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHVwZGF0ZU9wID0gdXBkYXRlT3AubmV4dCE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==