/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { assertEqual } from '../../util/assert';
import { setI18nHandling } from '../node_manipulation';
import { getInsertInFrontOfRNodeWithI18n, processI18nInsertBefore } from '../node_manipulation_i18n';
/**
 * Add `tNode` to `previousTNodes` list and update relevant `TNode`s in `previousTNodes` list
 * `tNode.insertBeforeIndex`.
 *
 * Things to keep in mind:
 * 1. All i18n text nodes are encoded as `TNodeType.Element` and are created eagerly by the
 *    `ɵɵi18nStart` instruction.
 * 2. All `TNodeType.Placeholder` `TNodes` are elements which will be created later by
 *    `ɵɵelementStart` instruction.
 * 3. `ɵɵelementStart` instruction will create `TNode`s in the ascending `TNode.index` order. (So a
 *    smaller index `TNode` is guaranteed to be created before a larger one)
 *
 * We use the above three invariants to determine `TNode.insertBeforeIndex`.
 *
 * In an ideal world `TNode.insertBeforeIndex` would always be `TNode.next.index`. However,
 * this will not work because `TNode.next.index` may be larger than `TNode.index` which means that
 * the next node is not yet created and therefore we can't insert in front of it.
 *
 * Rule1: `TNode.insertBeforeIndex = null` if `TNode.next === null` (Initial condition, as we don't
 *        know if there will be further `TNode`s inserted after.)
 * Rule2: If `previousTNode` is created after the `tNode` being inserted, then
 *        `previousTNode.insertBeforeNode = tNode.index` (So when a new `tNode` is added we check
 *        previous to see if we can update its `insertBeforeTNode`)
 *
 * See `TNode.insertBeforeIndex` for more context.
 *
 * @param previousTNodes A list of previous TNodes so that we can easily traverse `TNode`s in
 *     reverse order. (If `TNode` would have `previous` this would not be necessary.)
 * @param newTNode A TNode to add to the `previousTNodes` list.
 */
export function addTNodeAndUpdateInsertBeforeIndex(previousTNodes, newTNode) {
    // Start with Rule1
    ngDevMode &&
        assertEqual(newTNode.insertBeforeIndex, null, 'We expect that insertBeforeIndex is not set');
    previousTNodes.push(newTNode);
    if (previousTNodes.length > 1) {
        for (let i = previousTNodes.length - 2; i >= 0; i--) {
            const existingTNode = previousTNodes[i];
            // Text nodes are created eagerly and so they don't need their `indexBeforeIndex` updated.
            // It is safe to ignore them.
            if (!isI18nText(existingTNode)) {
                if (isNewTNodeCreatedBefore(existingTNode, newTNode) &&
                    getInsertBeforeIndex(existingTNode) === null) {
                    // If it was created before us in time, (and it does not yet have `insertBeforeIndex`)
                    // then add the `insertBeforeIndex`.
                    setInsertBeforeIndex(existingTNode, newTNode.index);
                }
            }
        }
    }
}
function isI18nText(tNode) {
    return !(tNode.type & 64 /* TNodeType.Placeholder */);
}
function isNewTNodeCreatedBefore(existingTNode, newTNode) {
    return isI18nText(newTNode) || existingTNode.index > newTNode.index;
}
function getInsertBeforeIndex(tNode) {
    const index = tNode.insertBeforeIndex;
    return Array.isArray(index) ? index[0] : index;
}
function setInsertBeforeIndex(tNode, value) {
    const index = tNode.insertBeforeIndex;
    if (Array.isArray(index)) {
        // Array is stored if we have to insert child nodes. See `TNode.insertBeforeIndex`
        index[0] = value;
    }
    else {
        setI18nHandling(getInsertInFrontOfRNodeWithI18n, processI18nInsertBefore);
        tNode.insertBeforeIndex = value;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9pbnNlcnRfYmVmb3JlX2luZGV4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9pMThuL2kxOG5faW5zZXJ0X2JlZm9yZV9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFOUMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3JELE9BQU8sRUFBQywrQkFBK0IsRUFBRSx1QkFBdUIsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBRW5HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTZCRztBQUNILE1BQU0sVUFBVSxrQ0FBa0MsQ0FBQyxjQUF1QixFQUFFLFFBQWU7SUFDekYsbUJBQW1CO0lBQ25CLFNBQVM7UUFDUCxXQUFXLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLElBQUksRUFBRSw2Q0FBNkMsQ0FBQyxDQUFDO0lBRS9GLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUIsSUFBSSxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzlCLEtBQUssSUFBSSxDQUFDLEdBQUcsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3BELE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QywwRkFBMEY7WUFDMUYsNkJBQTZCO1lBQzdCLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztnQkFDL0IsSUFDRSx1QkFBdUIsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDO29CQUNoRCxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsS0FBSyxJQUFJLEVBQzVDLENBQUM7b0JBQ0Qsc0ZBQXNGO29CQUN0RixvQ0FBb0M7b0JBQ3BDLG9CQUFvQixDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3RELENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxVQUFVLENBQUMsS0FBWTtJQUM5QixPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxpQ0FBd0IsQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFFRCxTQUFTLHVCQUF1QixDQUFDLGFBQW9CLEVBQUUsUUFBZTtJQUNwRSxPQUFPLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxhQUFhLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7QUFDdEUsQ0FBQztBQUVELFNBQVMsb0JBQW9CLENBQUMsS0FBWTtJQUN4QyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsaUJBQWlCLENBQUM7SUFDdEMsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUNqRCxDQUFDO0FBRUQsU0FBUyxvQkFBb0IsQ0FBQyxLQUFZLEVBQUUsS0FBYTtJQUN2RCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsaUJBQWlCLENBQUM7SUFDdEMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDekIsa0ZBQWtGO1FBQ2xGLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDbkIsQ0FBQztTQUFNLENBQUM7UUFDTixlQUFlLENBQUMsK0JBQStCLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztRQUMxRSxLQUFLLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO0lBQ2xDLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Fzc2VydEVxdWFsfSBmcm9tICcuLi8uLi91dGlsL2Fzc2VydCc7XG5pbXBvcnQge1ROb2RlLCBUTm9kZVR5cGV9IGZyb20gJy4uL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge3NldEkxOG5IYW5kbGluZ30gZnJvbSAnLi4vbm9kZV9tYW5pcHVsYXRpb24nO1xuaW1wb3J0IHtnZXRJbnNlcnRJbkZyb250T2ZSTm9kZVdpdGhJMThuLCBwcm9jZXNzSTE4bkluc2VydEJlZm9yZX0gZnJvbSAnLi4vbm9kZV9tYW5pcHVsYXRpb25faTE4bic7XG5cbi8qKlxuICogQWRkIGB0Tm9kZWAgdG8gYHByZXZpb3VzVE5vZGVzYCBsaXN0IGFuZCB1cGRhdGUgcmVsZXZhbnQgYFROb2RlYHMgaW4gYHByZXZpb3VzVE5vZGVzYCBsaXN0XG4gKiBgdE5vZGUuaW5zZXJ0QmVmb3JlSW5kZXhgLlxuICpcbiAqIFRoaW5ncyB0byBrZWVwIGluIG1pbmQ6XG4gKiAxLiBBbGwgaTE4biB0ZXh0IG5vZGVzIGFyZSBlbmNvZGVkIGFzIGBUTm9kZVR5cGUuRWxlbWVudGAgYW5kIGFyZSBjcmVhdGVkIGVhZ2VybHkgYnkgdGhlXG4gKiAgICBgybXJtWkxOG5TdGFydGAgaW5zdHJ1Y3Rpb24uXG4gKiAyLiBBbGwgYFROb2RlVHlwZS5QbGFjZWhvbGRlcmAgYFROb2Rlc2AgYXJlIGVsZW1lbnRzIHdoaWNoIHdpbGwgYmUgY3JlYXRlZCBsYXRlciBieVxuICogICAgYMm1ybVlbGVtZW50U3RhcnRgIGluc3RydWN0aW9uLlxuICogMy4gYMm1ybVlbGVtZW50U3RhcnRgIGluc3RydWN0aW9uIHdpbGwgY3JlYXRlIGBUTm9kZWBzIGluIHRoZSBhc2NlbmRpbmcgYFROb2RlLmluZGV4YCBvcmRlci4gKFNvIGFcbiAqICAgIHNtYWxsZXIgaW5kZXggYFROb2RlYCBpcyBndWFyYW50ZWVkIHRvIGJlIGNyZWF0ZWQgYmVmb3JlIGEgbGFyZ2VyIG9uZSlcbiAqXG4gKiBXZSB1c2UgdGhlIGFib3ZlIHRocmVlIGludmFyaWFudHMgdG8gZGV0ZXJtaW5lIGBUTm9kZS5pbnNlcnRCZWZvcmVJbmRleGAuXG4gKlxuICogSW4gYW4gaWRlYWwgd29ybGQgYFROb2RlLmluc2VydEJlZm9yZUluZGV4YCB3b3VsZCBhbHdheXMgYmUgYFROb2RlLm5leHQuaW5kZXhgLiBIb3dldmVyLFxuICogdGhpcyB3aWxsIG5vdCB3b3JrIGJlY2F1c2UgYFROb2RlLm5leHQuaW5kZXhgIG1heSBiZSBsYXJnZXIgdGhhbiBgVE5vZGUuaW5kZXhgIHdoaWNoIG1lYW5zIHRoYXRcbiAqIHRoZSBuZXh0IG5vZGUgaXMgbm90IHlldCBjcmVhdGVkIGFuZCB0aGVyZWZvcmUgd2UgY2FuJ3QgaW5zZXJ0IGluIGZyb250IG9mIGl0LlxuICpcbiAqIFJ1bGUxOiBgVE5vZGUuaW5zZXJ0QmVmb3JlSW5kZXggPSBudWxsYCBpZiBgVE5vZGUubmV4dCA9PT0gbnVsbGAgKEluaXRpYWwgY29uZGl0aW9uLCBhcyB3ZSBkb24ndFxuICogICAgICAgIGtub3cgaWYgdGhlcmUgd2lsbCBiZSBmdXJ0aGVyIGBUTm9kZWBzIGluc2VydGVkIGFmdGVyLilcbiAqIFJ1bGUyOiBJZiBgcHJldmlvdXNUTm9kZWAgaXMgY3JlYXRlZCBhZnRlciB0aGUgYHROb2RlYCBiZWluZyBpbnNlcnRlZCwgdGhlblxuICogICAgICAgIGBwcmV2aW91c1ROb2RlLmluc2VydEJlZm9yZU5vZGUgPSB0Tm9kZS5pbmRleGAgKFNvIHdoZW4gYSBuZXcgYHROb2RlYCBpcyBhZGRlZCB3ZSBjaGVja1xuICogICAgICAgIHByZXZpb3VzIHRvIHNlZSBpZiB3ZSBjYW4gdXBkYXRlIGl0cyBgaW5zZXJ0QmVmb3JlVE5vZGVgKVxuICpcbiAqIFNlZSBgVE5vZGUuaW5zZXJ0QmVmb3JlSW5kZXhgIGZvciBtb3JlIGNvbnRleHQuXG4gKlxuICogQHBhcmFtIHByZXZpb3VzVE5vZGVzIEEgbGlzdCBvZiBwcmV2aW91cyBUTm9kZXMgc28gdGhhdCB3ZSBjYW4gZWFzaWx5IHRyYXZlcnNlIGBUTm9kZWBzIGluXG4gKiAgICAgcmV2ZXJzZSBvcmRlci4gKElmIGBUTm9kZWAgd291bGQgaGF2ZSBgcHJldmlvdXNgIHRoaXMgd291bGQgbm90IGJlIG5lY2Vzc2FyeS4pXG4gKiBAcGFyYW0gbmV3VE5vZGUgQSBUTm9kZSB0byBhZGQgdG8gdGhlIGBwcmV2aW91c1ROb2Rlc2AgbGlzdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFROb2RlQW5kVXBkYXRlSW5zZXJ0QmVmb3JlSW5kZXgocHJldmlvdXNUTm9kZXM6IFROb2RlW10sIG5ld1ROb2RlOiBUTm9kZSkge1xuICAvLyBTdGFydCB3aXRoIFJ1bGUxXG4gIG5nRGV2TW9kZSAmJlxuICAgIGFzc2VydEVxdWFsKG5ld1ROb2RlLmluc2VydEJlZm9yZUluZGV4LCBudWxsLCAnV2UgZXhwZWN0IHRoYXQgaW5zZXJ0QmVmb3JlSW5kZXggaXMgbm90IHNldCcpO1xuXG4gIHByZXZpb3VzVE5vZGVzLnB1c2gobmV3VE5vZGUpO1xuICBpZiAocHJldmlvdXNUTm9kZXMubGVuZ3RoID4gMSkge1xuICAgIGZvciAobGV0IGkgPSBwcmV2aW91c1ROb2Rlcy5sZW5ndGggLSAyOyBpID49IDA7IGktLSkge1xuICAgICAgY29uc3QgZXhpc3RpbmdUTm9kZSA9IHByZXZpb3VzVE5vZGVzW2ldO1xuICAgICAgLy8gVGV4dCBub2RlcyBhcmUgY3JlYXRlZCBlYWdlcmx5IGFuZCBzbyB0aGV5IGRvbid0IG5lZWQgdGhlaXIgYGluZGV4QmVmb3JlSW5kZXhgIHVwZGF0ZWQuXG4gICAgICAvLyBJdCBpcyBzYWZlIHRvIGlnbm9yZSB0aGVtLlxuICAgICAgaWYgKCFpc0kxOG5UZXh0KGV4aXN0aW5nVE5vZGUpKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBpc05ld1ROb2RlQ3JlYXRlZEJlZm9yZShleGlzdGluZ1ROb2RlLCBuZXdUTm9kZSkgJiZcbiAgICAgICAgICBnZXRJbnNlcnRCZWZvcmVJbmRleChleGlzdGluZ1ROb2RlKSA9PT0gbnVsbFxuICAgICAgICApIHtcbiAgICAgICAgICAvLyBJZiBpdCB3YXMgY3JlYXRlZCBiZWZvcmUgdXMgaW4gdGltZSwgKGFuZCBpdCBkb2VzIG5vdCB5ZXQgaGF2ZSBgaW5zZXJ0QmVmb3JlSW5kZXhgKVxuICAgICAgICAgIC8vIHRoZW4gYWRkIHRoZSBgaW5zZXJ0QmVmb3JlSW5kZXhgLlxuICAgICAgICAgIHNldEluc2VydEJlZm9yZUluZGV4KGV4aXN0aW5nVE5vZGUsIG5ld1ROb2RlLmluZGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc0kxOG5UZXh0KHROb2RlOiBUTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gISh0Tm9kZS50eXBlICYgVE5vZGVUeXBlLlBsYWNlaG9sZGVyKTtcbn1cblxuZnVuY3Rpb24gaXNOZXdUTm9kZUNyZWF0ZWRCZWZvcmUoZXhpc3RpbmdUTm9kZTogVE5vZGUsIG5ld1ROb2RlOiBUTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNJMThuVGV4dChuZXdUTm9kZSkgfHwgZXhpc3RpbmdUTm9kZS5pbmRleCA+IG5ld1ROb2RlLmluZGV4O1xufVxuXG5mdW5jdGlvbiBnZXRJbnNlcnRCZWZvcmVJbmRleCh0Tm9kZTogVE5vZGUpOiBudW1iZXIgfCBudWxsIHtcbiAgY29uc3QgaW5kZXggPSB0Tm9kZS5pbnNlcnRCZWZvcmVJbmRleDtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoaW5kZXgpID8gaW5kZXhbMF0gOiBpbmRleDtcbn1cblxuZnVuY3Rpb24gc2V0SW5zZXJ0QmVmb3JlSW5kZXgodE5vZGU6IFROb2RlLCB2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gIGNvbnN0IGluZGV4ID0gdE5vZGUuaW5zZXJ0QmVmb3JlSW5kZXg7XG4gIGlmIChBcnJheS5pc0FycmF5KGluZGV4KSkge1xuICAgIC8vIEFycmF5IGlzIHN0b3JlZCBpZiB3ZSBoYXZlIHRvIGluc2VydCBjaGlsZCBub2Rlcy4gU2VlIGBUTm9kZS5pbnNlcnRCZWZvcmVJbmRleGBcbiAgICBpbmRleFswXSA9IHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHNldEkxOG5IYW5kbGluZyhnZXRJbnNlcnRJbkZyb250T2ZSTm9kZVdpdGhJMThuLCBwcm9jZXNzSTE4bkluc2VydEJlZm9yZSk7XG4gICAgdE5vZGUuaW5zZXJ0QmVmb3JlSW5kZXggPSB2YWx1ZTtcbiAgfVxufVxuIl19