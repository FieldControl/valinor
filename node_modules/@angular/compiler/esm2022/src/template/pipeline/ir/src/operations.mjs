/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { OpKind } from './enums';
/**
 * A linked list of `Op` nodes of a given subtype.
 *
 * @param OpT specific subtype of `Op` nodes which this list contains.
 */
export class OpList {
    static { this.nextListId = 0; }
    constructor() {
        /**
         * Debug ID of this `OpList` instance.
         */
        this.debugListId = OpList.nextListId++;
        // OpList uses static head/tail nodes of a special `ListEnd` type.
        // This avoids the need for special casing of the first and last list
        // elements in all list operations.
        this.head = {
            kind: OpKind.ListEnd,
            next: null,
            prev: null,
            debugListId: this.debugListId,
        };
        this.tail = {
            kind: OpKind.ListEnd,
            next: null,
            prev: null,
            debugListId: this.debugListId,
        };
        // Link `head` and `tail` together at the start (list is empty).
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    /**
     * Push a new operation to the tail of the list.
     */
    push(op) {
        if (Array.isArray(op)) {
            for (const o of op) {
                this.push(o);
            }
            return;
        }
        OpList.assertIsNotEnd(op);
        OpList.assertIsUnowned(op);
        op.debugListId = this.debugListId;
        // The old "previous" node (which might be the head, if the list is empty).
        const oldLast = this.tail.prev;
        // Insert `op` following the old last node.
        op.prev = oldLast;
        oldLast.next = op;
        // Connect `op` with the list tail.
        op.next = this.tail;
        this.tail.prev = op;
    }
    /**
     * Prepend one or more nodes to the start of the list.
     */
    prepend(ops) {
        if (ops.length === 0) {
            return;
        }
        for (const op of ops) {
            OpList.assertIsNotEnd(op);
            OpList.assertIsUnowned(op);
            op.debugListId = this.debugListId;
        }
        const first = this.head.next;
        let prev = this.head;
        for (const op of ops) {
            prev.next = op;
            op.prev = prev;
            prev = op;
        }
        prev.next = first;
        first.prev = prev;
    }
    /**
     * `OpList` is iterable via the iteration protocol.
     *
     * It's safe to mutate the part of the list that has already been returned by the iterator, up to
     * and including the last operation returned. Mutations beyond that point _may_ be safe, but may
     * also corrupt the iteration position and should be avoided.
     */
    *[Symbol.iterator]() {
        let current = this.head.next;
        while (current !== this.tail) {
            // Guards against corruption of the iterator state by mutations to the tail of the list during
            // iteration.
            OpList.assertIsOwned(current, this.debugListId);
            const next = current.next;
            yield current;
            current = next;
        }
    }
    *reversed() {
        let current = this.tail.prev;
        while (current !== this.head) {
            OpList.assertIsOwned(current, this.debugListId);
            const prev = current.prev;
            yield current;
            current = prev;
        }
    }
    /**
     * Replace `oldOp` with `newOp` in the list.
     */
    static replace(oldOp, newOp) {
        OpList.assertIsNotEnd(oldOp);
        OpList.assertIsNotEnd(newOp);
        OpList.assertIsOwned(oldOp);
        OpList.assertIsUnowned(newOp);
        newOp.debugListId = oldOp.debugListId;
        if (oldOp.prev !== null) {
            oldOp.prev.next = newOp;
            newOp.prev = oldOp.prev;
        }
        if (oldOp.next !== null) {
            oldOp.next.prev = newOp;
            newOp.next = oldOp.next;
        }
        oldOp.debugListId = null;
        oldOp.prev = null;
        oldOp.next = null;
    }
    /**
     * Replace `oldOp` with some number of new operations in the list (which may include `oldOp`).
     */
    static replaceWithMany(oldOp, newOps) {
        if (newOps.length === 0) {
            // Replacing with an empty list -> pure removal.
            OpList.remove(oldOp);
            return;
        }
        OpList.assertIsNotEnd(oldOp);
        OpList.assertIsOwned(oldOp);
        const listId = oldOp.debugListId;
        oldOp.debugListId = null;
        for (const newOp of newOps) {
            OpList.assertIsNotEnd(newOp);
            // `newOp` might be `oldOp`, but at this point it's been marked as unowned.
            OpList.assertIsUnowned(newOp);
        }
        // It should be safe to reuse `oldOp` in the `newOps` list - maybe you want to sandwich an
        // operation between two new ops.
        const { prev: oldPrev, next: oldNext } = oldOp;
        oldOp.prev = null;
        oldOp.next = null;
        let prev = oldPrev;
        for (const newOp of newOps) {
            this.assertIsUnowned(newOp);
            newOp.debugListId = listId;
            prev.next = newOp;
            newOp.prev = prev;
            // This _should_ be the case, but set it just in case.
            newOp.next = null;
            prev = newOp;
        }
        // At the end of iteration, `prev` holds the last node in the list.
        const first = newOps[0];
        const last = prev;
        // Replace `oldOp` with the chain `first` -> `last`.
        if (oldPrev !== null) {
            oldPrev.next = first;
            first.prev = oldPrev;
        }
        if (oldNext !== null) {
            oldNext.prev = last;
            last.next = oldNext;
        }
    }
    /**
     * Remove the given node from the list which contains it.
     */
    static remove(op) {
        OpList.assertIsNotEnd(op);
        OpList.assertIsOwned(op);
        op.prev.next = op.next;
        op.next.prev = op.prev;
        // Break any link between the node and this list to safeguard against its usage in future
        // operations.
        op.debugListId = null;
        op.prev = null;
        op.next = null;
    }
    /**
     * Insert `op` before `target`.
     */
    static insertBefore(op, target) {
        if (Array.isArray(op)) {
            for (const o of op) {
                this.insertBefore(o, target);
            }
            return;
        }
        OpList.assertIsOwned(target);
        if (target.prev === null) {
            throw new Error(`AssertionError: illegal operation on list start`);
        }
        OpList.assertIsNotEnd(op);
        OpList.assertIsUnowned(op);
        op.debugListId = target.debugListId;
        // Just in case.
        op.prev = null;
        target.prev.next = op;
        op.prev = target.prev;
        op.next = target;
        target.prev = op;
    }
    /**
     * Insert `op` after `target`.
     */
    static insertAfter(op, target) {
        OpList.assertIsOwned(target);
        if (target.next === null) {
            throw new Error(`AssertionError: illegal operation on list end`);
        }
        OpList.assertIsNotEnd(op);
        OpList.assertIsUnowned(op);
        op.debugListId = target.debugListId;
        target.next.prev = op;
        op.next = target.next;
        op.prev = target;
        target.next = op;
    }
    /**
     * Asserts that `op` does not currently belong to a list.
     */
    static assertIsUnowned(op) {
        if (op.debugListId !== null) {
            throw new Error(`AssertionError: illegal operation on owned node: ${OpKind[op.kind]}`);
        }
    }
    /**
     * Asserts that `op` currently belongs to a list. If `byList` is passed, `op` is asserted to
     * specifically belong to that list.
     */
    static assertIsOwned(op, byList) {
        if (op.debugListId === null) {
            throw new Error(`AssertionError: illegal operation on unowned node: ${OpKind[op.kind]}`);
        }
        else if (byList !== undefined && op.debugListId !== byList) {
            throw new Error(`AssertionError: node belongs to the wrong list (expected ${byList}, actual ${op.debugListId})`);
        }
    }
    /**
     * Asserts that `op` is not a special `ListEnd` node.
     */
    static assertIsNotEnd(op) {
        if (op.kind === OpKind.ListEnd) {
            throw new Error(`AssertionError: illegal operation on list head or tail`);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlcmF0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9pci9zcmMvb3BlcmF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBeUMvQjs7OztHQUlHO0FBQ0gsTUFBTSxPQUFPLE1BQU07YUFDVixlQUFVLEdBQUcsQ0FBQyxBQUFKLENBQUs7SUF3QnRCO1FBdEJBOztXQUVHO1FBQ00sZ0JBQVcsR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFM0Msa0VBQWtFO1FBQ2xFLHFFQUFxRTtRQUNyRSxtQ0FBbUM7UUFDMUIsU0FBSSxHQUFRO1lBQ25CLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTztZQUNwQixJQUFJLEVBQUUsSUFBSTtZQUNWLElBQUksRUFBRSxJQUFJO1lBQ1YsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO1NBQ3ZCLENBQUM7UUFFQSxTQUFJLEdBQUc7WUFDZCxJQUFJLEVBQUUsTUFBTSxDQUFDLE9BQU87WUFDcEIsSUFBSSxFQUFFLElBQUk7WUFDVixJQUFJLEVBQUUsSUFBSTtZQUNWLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztTQUN2QixDQUFDO1FBR1AsZ0VBQWdFO1FBQ2hFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztJQUM3QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxJQUFJLENBQUMsRUFBb0I7UUFDdkIsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDdEIsS0FBSyxNQUFNLENBQUMsSUFBSSxF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QyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekYsQ0FBQztJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSCxNQUFNLENBQUMsYUFBYSxDQUFzQixFQUFPLEVBQUUsTUFBZTtRQUNoRSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxzREFBc0QsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0YsQ0FBQzthQUFNLElBQUksTUFBTSxLQUFLLFNBQVMsSUFBSSxFQUFFLENBQUMsV0FBVyxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQzdELE1BQU0sSUFBSSxLQUFLLENBQ2IsNERBQTRELE1BQU0sWUFBWSxFQUFFLENBQUMsV0FBVyxHQUFHLENBQ2hHLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsTUFBTSxDQUFDLGNBQWMsQ0FBc0IsRUFBTztRQUNoRCxJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMsd0RBQXdELENBQUMsQ0FBQztRQUM1RSxDQUFDO0lBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtPcEtpbmR9IGZyb20gJy4vZW51bXMnO1xuXG4vKipcbiAqIEJyYW5kZWQgdHlwZSBmb3IgYSBjcm9zcy1yZWZlcmVuY2UgSUQuIER1cmluZyBpbmdlc3QsIGBYcmVmSWRgcyBhcmUgZ2VuZXJhdGVkIHRvIGxpbmsgdG9nZXRoZXJcbiAqIGRpZmZlcmVudCBJUiBvcGVyYXRpb25zIHdoaWNoIG5lZWQgdG8gcmVmZXJlbmNlIGVhY2ggb3RoZXIuXG4gKi9cbmV4cG9ydCB0eXBlIFhyZWZJZCA9IG51bWJlciAmIHtfX2JyYW5kOiAnWHJlZklkJ307XG5cbi8qKlxuICogQmFzZSBpbnRlcmZhY2UgZm9yIHNlbWFudGljIG9wZXJhdGlvbnMgYmVpbmcgcGVyZm9ybWVkIHdpdGhpbiBhIHRlbXBsYXRlLlxuICpcbiAqIEBwYXJhbSBPcFQgYSBzcGVjaWZpYyBuYXJyb3dlciB0eXBlIG9mIGBPcGAgKGZvciBleGFtcGxlLCBjcmVhdGlvbiBvcGVyYXRpb25zKSB3aGljaCB0aGlzXG4gKiAgICAgc3BlY2lmaWMgc3VidHlwZSBvZiBgT3BgIGNhbiBiZSBsaW5rZWQgd2l0aCBpbiBhIGxpbmtlZCBsaXN0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIE9wPE9wVCBleHRlbmRzIE9wPE9wVD4+IHtcbiAgLyoqXG4gICAqIEFsbCBvcGVyYXRpb25zIGhhdmUgYSBkaXN0aW5jdCBraW5kLlxuICAgKi9cbiAga2luZDogT3BLaW5kO1xuXG4gIC8qKlxuICAgKiBUaGUgcHJldmlvdXMgb3BlcmF0aW9uIGluIHRoZSBsaW5rZWQgbGlzdCwgaWYgYW55LlxuICAgKlxuICAgKiBUaGlzIGlzIGBudWxsYCBmb3Igb3BlcmF0aW9uIG5vZGVzIG5vdCBjdXJyZW50bHkgaW4gYSBsaXN0LCBvciBmb3IgdGhlIHNwZWNpYWwgaGVhZC90YWlsIG5vZGVzLlxuICAgKi9cbiAgcHJldjogT3BUIHwgbnVsbDtcblxuICAvKipcbiAgICogVGhlIG5leHQgb3BlcmF0aW9uIGluIHRoZSBsaW5rZWQgbGlzdCwgaWYgYW55LlxuICAgKlxuICAgKiBUaGlzIGlzIGBudWxsYCBmb3Igb3BlcmF0aW9uIG5vZGVzIG5vdCBjdXJyZW50bHkgaW4gYSBsaXN0LCBvciBmb3IgdGhlIHNwZWNpYWwgaGVhZC90YWlsIG5vZGVzLlxuICAgKi9cbiAgbmV4dDogT3BUIHwgbnVsbDtcblxuICAvKipcbiAgICogRGVidWcgaWQgb2YgdGhlIGxpc3QgdG8gd2hpY2ggdGhpcyBub2RlIGN1cnJlbnRseSBiZWxvbmdzLCBvciBgbnVsbGAgaWYgdGhpcyBub2RlIGlzIG5vdCBwYXJ0XG4gICAqIG9mIGEgbGlzdC5cbiAgICovXG4gIGRlYnVnTGlzdElkOiBudW1iZXIgfCBudWxsO1xufVxuXG4vKipcbiAqIEEgbGlua2VkIGxpc3Qgb2YgYE9wYCBub2RlcyBvZiBhIGdpdmVuIHN1YnR5cGUuXG4gKlxuICogQHBhcmFtIE9wVCBzcGVjaWZpYyBzdWJ0eXBlIG9mIGBPcGAgbm9kZXMgd2hpY2ggdGhpcyBsaXN0IGNvbnRhaW5zLlxuICovXG5leHBvcnQgY2xhc3MgT3BMaXN0PE9wVCBleHRlbmRzIE9wPE9wVD4+IHtcbiAgc3RhdGljIG5leHRMaXN0SWQgPSAwO1xuXG4gIC8qKlxuICAgKiBEZWJ1ZyBJRCBvZiB0aGlzIGBPcExpc3RgIGluc3RhbmNlLlxuICAgKi9cbiAgcmVhZG9ubHkgZGVidWdMaXN0SWQgPSBPcExpc3QubmV4dExpc3RJZCsrO1xuXG4gIC8vIE9wTGlzdCB1c2VzIHN0YXRpYyBoZWFkL3RhaWwgbm9kZXMgb2YgYSBzcGVjaWFsIGBMaXN0RW5kYCB0eXBlLlxuICAvLyBUaGlzIGF2b2lkcyB0aGUgbmVlZCBmb3Igc3BlY2lhbCBjYXNpbmcgb2YgdGhlIGZpcnN0IGFuZCBsYXN0IGxpc3RcbiAgLy8gZWxlbWVudHMgaW4gYWxsIGxpc3Qgb3BlcmF0aW9ucy5cbiAgcmVhZG9ubHkgaGVhZDogT3BUID0ge1xuICAgIGtpbmQ6IE9wS2luZC5MaXN0RW5kLFxuICAgIG5leHQ6IG51bGwsXG4gICAgcHJldjogbnVsbCxcbiAgICBkZWJ1Z0xpc3RJZDogdGhpcy5kZWJ1Z0xpc3RJZCxcbiAgfSBhcyBPcFQ7XG5cbiAgcmVhZG9ubHkgdGFpbCA9IHtcbiAgICBraW5kOiBPcEtpbmQuTGlzdEVuZCxcbiAgICBuZXh0OiBudWxsLFxuICAgIHByZXY6IG51bGwsXG4gICAgZGVidWdMaXN0SWQ6IHRoaXMuZGVidWdMaXN0SWQsXG4gIH0gYXMgT3BUO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8vIExpbmsgYGhlYWRgIGFuZCBgdGFpbGAgdG9nZXRoZXIgYXQgdGhlIHN0YXJ0IChsaXN0IGlzIGVtcHR5KS5cbiAgICB0aGlzLmhlYWQubmV4dCA9IHRoaXMudGFpbDtcbiAgICB0aGlzLnRhaWwucHJldiA9IHRoaXMuaGVhZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQdXNoIGEgbmV3IG9wZXJhdGlvbiB0byB0aGUgdGFpbCBvZiB0aGUgbGlzdC5cbiAgICovXG4gIHB1c2gob3A6IE9wVCB8IEFycmF5PE9wVD4pOiB2b2lkIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShvcCkpIHtcbiAgICAgIGZvciAoY29uc3QgbyBvZiBvcCkge1xuICAgICAgICB0aGlzLnB1c2gobyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgT3BMaXN0LmFzc2VydElzTm90RW5kKG9wKTtcbiAgICBPcExpc3QuYXNzZXJ0SXNVbm93bmVkKG9wKTtcblxuICAgIG9wLmRlYnVnTGlzdElkID0gdGhpcy5kZWJ1Z0xpc3RJZDtcblxuICAgIC8vIFRoZSBvbGQgXCJwcmV2aW91c1wiIG5vZGUgKHdoaWNoIG1pZ2h0IGJlIHRoZSBoZWFkLCBpZiB0aGUgbGlzdCBpcyBlbXB0eSkuXG4gICAgY29uc3Qgb2xkTGFzdCA9IHRoaXMudGFpbC5wcmV2ITtcblxuICAgIC8vIEluc2VydCBgb3BgIGZvbGxvd2luZyB0aGUgb2xkIGxhc3Qgbm9kZS5cbiAgICBvcC5wcmV2ID0gb2xkTGFzdDtcbiAgICBvbGRMYXN0Lm5leHQgPSBvcDtcblxuICAgIC8vIENvbm5lY3QgYG9wYCB3aXRoIHRoZSBsaXN0IHRhaWwuXG4gICAgb3AubmV4dCA9IHRoaXMudGFpbDtcbiAgICB0aGlzLnRhaWwucHJldiA9IG9wO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXBlbmQgb25lIG9yIG1vcmUgbm9kZXMgdG8gdGhlIHN0YXJ0IG9mIHRoZSBsaXN0LlxuICAgKi9cbiAgcHJlcGVuZChvcHM6IE9wVFtdKTogdm9pZCB7XG4gICAgaWYgKG9wcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IG9wIG9mIG9wcykge1xuICAgICAgT3BMaXN0LmFzc2VydElzTm90RW5kKG9wKTtcbiAgICAgIE9wTGlzdC5hc3NlcnRJc1Vub3duZWQob3ApO1xuXG4gICAgICBvcC5kZWJ1Z0xpc3RJZCA9IHRoaXMuZGVidWdMaXN0SWQ7XG4gICAgfVxuXG4gICAgY29uc3QgZmlyc3QgPSB0aGlzLmhlYWQubmV4dCE7XG5cbiAgICBsZXQgcHJldiA9IHRoaXMuaGVhZDtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIG9wcykge1xuICAgICAgcHJldi5uZXh0ID0gb3A7XG4gICAgICBvcC5wcmV2ID0gcHJldjtcblxuICAgICAgcHJldiA9IG9wO1xuICAgIH1cblxuICAgIHByZXYubmV4dCA9IGZpcnN0O1xuICAgIGZpcnN0LnByZXYgPSBwcmV2O1xuICB9XG5cbiAgLyoqXG4gICAqIGBPcExpc3RgIGlzIGl0ZXJhYmxlIHZpYSB0aGUgaXRlcmF0aW9uIHByb3RvY29sLlxuICAgKlxuICAgKiBJdCdzIHNhZmUgdG8gbXV0YXRlIHRoZSBwYXJ0IG9mIHRoZSBsaXN0IHRoYXQgaGFzIGFscmVhZHkgYmVlbiByZXR1cm5lZCBieSB0aGUgaXRlcmF0b3IsIHVwIHRvXG4gICAqIGFuZCBpbmNsdWRpbmcgdGhlIGxhc3Qgb3BlcmF0aW9uIHJldHVybmVkLiBNdXRhdGlvbnMgYmV5b25kIHRoYXQgcG9pbnQgX21heV8gYmUgc2FmZSwgYnV0IG1heVxuICAgKiBhbHNvIGNvcnJ1cHQgdGhlIGl0ZXJhdGlvbiBwb3NpdGlvbiBhbmQgc2hvdWxkIGJlIGF2b2lkZWQuXG4gICAqL1xuICAqW1N5bWJvbC5pdGVyYXRvcl0oKTogR2VuZXJhdG9yPE9wVD4ge1xuICAgIGxldCBjdXJyZW50ID0gdGhpcy5oZWFkLm5leHQhO1xuICAgIHdoaWxlIChjdXJyZW50ICE9PSB0aGlzLnRhaWwpIHtcbiAgICAgIC8vIEd1YXJkcyBhZ2FpbnN0IGNvcnJ1cHRpb24gb2YgdGhlIGl0ZXJhdG9yIHN0YXRlIGJ5IG11dGF0aW9ucyB0byB0aGUgdGFpbCBvZiB0aGUgbGlzdCBkdXJpbmdcbiAgICAgIC8vIGl0ZXJhdGlvbi5cbiAgICAgIE9wTGlzdC5hc3NlcnRJc093bmVkKGN1cnJlbnQsIHRoaXMuZGVidWdMaXN0SWQpO1xuXG4gICAgICBjb25zdCBuZXh0ID0gY3VycmVudC5uZXh0ITtcbiAgICAgIHlpZWxkIGN1cnJlbnQ7XG4gICAgICBjdXJyZW50ID0gbmV4dDtcbiAgICB9XG4gIH1cblxuICAqcmV2ZXJzZWQoKTogR2VuZXJhdG9yPE9wVD4ge1xuICAgIGxldCBjdXJyZW50ID0gdGhpcy50YWlsLnByZXYhO1xuICAgIHdoaWxlIChjdXJyZW50ICE9PSB0aGlzLmhlYWQpIHtcbiAgICAgIE9wTGlzdC5hc3NlcnRJc093bmVkKGN1cnJlbnQsIHRoaXMuZGVidWdMaXN0SWQpO1xuXG4gICAgICBjb25zdCBwcmV2ID0gY3VycmVudC5wcmV2ITtcbiAgICAgIHlpZWxkIGN1cnJlbnQ7XG4gICAgICBjdXJyZW50ID0gcHJldjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVwbGFjZSBgb2xkT3BgIHdpdGggYG5ld09wYCBpbiB0aGUgbGlzdC5cbiAgICovXG4gIHN0YXRpYyByZXBsYWNlPE9wVCBleHRlbmRzIE9wPE9wVD4+KG9sZE9wOiBPcFQsIG5ld09wOiBPcFQpOiB2b2lkIHtcbiAgICBPcExpc3QuYXNzZXJ0SXNOb3RFbmQob2xkT3ApO1xuICAgIE9wTGlzdC5hc3NlcnRJc05vdEVuZChuZXdPcCk7XG5cbiAgICBPcExpc3QuYXNzZXJ0SXNPd25lZChvbGRPcCk7XG4gICAgT3BMaXN0LmFzc2VydElzVW5vd25lZChuZXdPcCk7XG5cbiAgICBuZXdPcC5kZWJ1Z0xpc3RJZCA9IG9sZE9wLmRlYnVnTGlzdElkO1xuICAgIGlmIChvbGRPcC5wcmV2ICE9PSBudWxsKSB7XG4gICAgICBvbGRPcC5wcmV2Lm5leHQgPSBuZXdPcDtcbiAgICAgIG5ld09wLnByZXYgPSBvbGRPcC5wcmV2O1xuICAgIH1cbiAgICBpZiAob2xkT3AubmV4dCAhPT0gbnVsbCkge1xuICAgICAgb2xkT3AubmV4dC5wcmV2ID0gbmV3T3A7XG4gICAgICBuZXdPcC5uZXh0ID0gb2xkT3AubmV4dDtcbiAgICB9XG4gICAgb2xkT3AuZGVidWdMaXN0SWQgPSBudWxsO1xuICAgIG9sZE9wLnByZXYgPSBudWxsO1xuICAgIG9sZE9wLm5leHQgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcGxhY2UgYG9sZE9wYCB3aXRoIHNvbWUgbnVtYmVyIG9mIG5ldyBvcGVyYXRpb25zIGluIHRoZSBsaXN0ICh3aGljaCBtYXkgaW5jbHVkZSBgb2xkT3BgKS5cbiAgICovXG4gIHN0YXRpYyByZXBsYWNlV2l0aE1hbnk8T3BUIGV4dGVuZHMgT3A8T3BUPj4ob2xkT3A6IE9wVCwgbmV3T3BzOiBPcFRbXSk6IHZvaWQge1xuICAgIGlmIChuZXdPcHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyBSZXBsYWNpbmcgd2l0aCBhbiBlbXB0eSBsaXN0IC0+IHB1cmUgcmVtb3ZhbC5cbiAgICAgIE9wTGlzdC5yZW1vdmUob2xkT3ApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIE9wTGlzdC5hc3NlcnRJc05vdEVuZChvbGRPcCk7XG4gICAgT3BMaXN0LmFzc2VydElzT3duZWQob2xkT3ApO1xuXG4gICAgY29uc3QgbGlzdElkID0gb2xkT3AuZGVidWdMaXN0SWQ7XG4gICAgb2xkT3AuZGVidWdMaXN0SWQgPSBudWxsO1xuXG4gICAgZm9yIChjb25zdCBuZXdPcCBvZiBuZXdPcHMpIHtcbiAgICAgIE9wTGlzdC5hc3NlcnRJc05vdEVuZChuZXdPcCk7XG5cbiAgICAgIC8vIGBuZXdPcGAgbWlnaHQgYmUgYG9sZE9wYCwgYnV0IGF0IHRoaXMgcG9pbnQgaXQncyBiZWVuIG1hcmtlZCBhcyB1bm93bmVkLlxuICAgICAgT3BMaXN0LmFzc2VydElzVW5vd25lZChuZXdPcCk7XG4gICAgfVxuXG4gICAgLy8gSXQgc2hvdWxkIGJlIHNhZmUgdG8gcmV1c2UgYG9sZE9wYCBpbiB0aGUgYG5ld09wc2AgbGlzdCAtIG1heWJlIHlvdSB3YW50IHRvIHNhbmR3aWNoIGFuXG4gICAgLy8gb3BlcmF0aW9uIGJldHdlZW4gdHdvIG5ldyBvcHMuXG4gICAgY29uc3Qge3ByZXY6IG9sZFByZXYsIG5leHQ6IG9sZE5leHR9ID0gb2xkT3A7XG4gICAgb2xkT3AucHJldiA9IG51bGw7XG4gICAgb2xkT3AubmV4dCA9IG51bGw7XG5cbiAgICBsZXQgcHJldjogT3BUID0gb2xkUHJldiE7XG4gICAgZm9yIChjb25zdCBuZXdPcCBvZiBuZXdPcHMpIHtcbiAgICAgIHRoaXMuYXNzZXJ0SXNVbm93bmVkKG5ld09wKTtcbiAgICAgIG5ld09wLmRlYnVnTGlzdElkID0gbGlzdElkO1xuXG4gICAgICBwcmV2IS5uZXh0ID0gbmV3T3A7XG4gICAgICBuZXdPcC5wcmV2ID0gcHJldjtcblxuICAgICAgLy8gVGhpcyBfc2hvdWxkXyBiZSB0aGUgY2FzZSwgYnV0IHNldCBpdCBqdXN0IGluIGNhc2UuXG4gICAgICBuZXdPcC5uZXh0ID0gbnVsbDtcblxuICAgICAgcHJldiA9IG5ld09wO1xuICAgIH1cbiAgICAvLyBBdCB0aGUgZW5kIG9mIGl0ZXJhdGlvbiwgYHByZXZgIGhvbGRzIHRoZSBsYXN0IG5vZGUgaW4gdGhlIGxpc3QuXG4gICAgY29uc3QgZmlyc3QgPSBuZXdPcHNbMF0hO1xuICAgIGNvbnN0IGxhc3QgPSBwcmV2ITtcblxuICAgIC8vIFJlcGxhY2UgYG9sZE9wYCB3aXRoIHRoZSBjaGFpbiBgZmlyc3RgIC0+IGBsYXN0YC5cbiAgICBpZiAob2xkUHJldiAhPT0gbnVsbCkge1xuICAgICAgb2xkUHJldi5uZXh0ID0gZmlyc3Q7XG4gICAgICBmaXJzdC5wcmV2ID0gb2xkUHJldjtcbiAgICB9XG5cbiAgICBpZiAob2xkTmV4dCAhPT0gbnVsbCkge1xuICAgICAgb2xkTmV4dC5wcmV2ID0gbGFzdDtcbiAgICAgIGxhc3QubmV4dCA9IG9sZE5leHQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB0aGUgZ2l2ZW4gbm9kZSBmcm9tIHRoZSBsaXN0IHdoaWNoIGNvbnRhaW5zIGl0LlxuICAgKi9cbiAgc3RhdGljIHJlbW92ZTxPcFQgZXh0ZW5kcyBPcDxPcFQ+PihvcDogT3BUKTogdm9pZCB7XG4gICAgT3BMaXN0LmFzc2VydElzTm90RW5kKG9wKTtcbiAgICBPcExpc3QuYXNzZXJ0SXNPd25lZChvcCk7XG5cbiAgICBvcC5wcmV2IS5uZXh0ID0gb3AubmV4dDtcbiAgICBvcC5uZXh0IS5wcmV2ID0gb3AucHJldjtcblxuICAgIC8vIEJyZWFrIGFueSBsaW5rIGJldHdlZW4gdGhlIG5vZGUgYW5kIHRoaXMgbGlzdCB0byBzYWZlZ3VhcmQgYWdhaW5zdCBpdHMgdXNhZ2UgaW4gZnV0dXJlXG4gICAgLy8gb3BlcmF0aW9ucy5cbiAgICBvcC5kZWJ1Z0xpc3RJZCA9IG51bGw7XG4gICAgb3AucHJldiA9IG51bGw7XG4gICAgb3AubmV4dCA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogSW5zZXJ0IGBvcGAgYmVmb3JlIGB0YXJnZXRgLlxuICAgKi9cbiAgc3RhdGljIGluc2VydEJlZm9yZTxPcFQgZXh0ZW5kcyBPcDxPcFQ+PihvcDogT3BUIHwgT3BUW10sIHRhcmdldDogT3BUKTogdm9pZCB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkob3ApKSB7XG4gICAgICBmb3IgKGNvbnN0IG8gb2Ygb3ApIHtcbiAgICAgICAgdGhpcy5pbnNlcnRCZWZvcmUobywgdGFyZ2V0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBPcExpc3QuYXNzZXJ0SXNPd25lZCh0YXJnZXQpO1xuICAgIGlmICh0YXJnZXQucHJldiA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3NlcnRpb25FcnJvcjogaWxsZWdhbCBvcGVyYXRpb24gb24gbGlzdCBzdGFydGApO1xuICAgIH1cblxuICAgIE9wTGlzdC5hc3NlcnRJc05vdEVuZChvcCk7XG5cbiAgICBPcExpc3QuYXNzZXJ0SXNVbm93bmVkKG9wKTtcblxuICAgIG9wLmRlYnVnTGlzdElkID0gdGFyZ2V0LmRlYnVnTGlzdElkO1xuXG4gICAgLy8gSnVzdCBpbiBjYXNlLlxuICAgIG9wLnByZXYgPSBudWxsO1xuXG4gICAgdGFyZ2V0LnByZXYhLm5leHQgPSBvcDtcbiAgICBvcC5wcmV2ID0gdGFyZ2V0LnByZXY7XG5cbiAgICBvcC5uZXh0ID0gdGFyZ2V0O1xuICAgIHRhcmdldC5wcmV2ID0gb3A7XG4gIH1cblxuICAvKipcbiAgICogSW5zZXJ0IGBvcGAgYWZ0ZXIgYHRhcmdldGAuXG4gICAqL1xuICBzdGF0aWMgaW5zZXJ0QWZ0ZXI8T3BUIGV4dGVuZHMgT3A8T3BUPj4ob3A6IE9wVCwgdGFyZ2V0OiBPcFQpOiB2b2lkIHtcbiAgICBPcExpc3QuYXNzZXJ0SXNPd25lZCh0YXJnZXQpO1xuICAgIGlmICh0YXJnZXQubmV4dCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3NlcnRpb25FcnJvcjogaWxsZWdhbCBvcGVyYXRpb24gb24gbGlzdCBlbmRgKTtcbiAgICB9XG5cbiAgICBPcExpc3QuYXNzZXJ0SXNOb3RFbmQob3ApO1xuXG4gICAgT3BMaXN0LmFzc2VydElzVW5vd25lZChvcCk7XG5cbiAgICBvcC5kZWJ1Z0xpc3RJZCA9IHRhcmdldC5kZWJ1Z0xpc3RJZDtcblxuICAgIHRhcmdldC5uZXh0LnByZXYgPSBvcDtcbiAgICBvcC5uZXh0ID0gdGFyZ2V0Lm5leHQ7XG5cbiAgICBvcC5wcmV2ID0gdGFyZ2V0O1xuICAgIHRhcmdldC5uZXh0ID0gb3A7XG4gIH1cblxuICAvKipcbiAgICogQXNzZXJ0cyB0aGF0IGBvcGAgZG9lcyBub3QgY3VycmVudGx5IGJlbG9uZyB0byBhIGxpc3QuXG4gICAqL1xuICBzdGF0aWMgYXNzZXJ0SXNVbm93bmVkPE9wVCBleHRlbmRzIE9wPE9wVD4+KG9wOiBPcFQpOiB2b2lkIHtcbiAgICBpZiAob3AuZGVidWdMaXN0SWQgIT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uRXJyb3I6IGlsbGVnYWwgb3BlcmF0aW9uIG9uIG93bmVkIG5vZGU6ICR7T3BLaW5kW29wLmtpbmRdfWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NlcnRzIHRoYXQgYG9wYCBjdXJyZW50bHkgYmVsb25ncyB0byBhIGxpc3QuIElmIGBieUxpc3RgIGlzIHBhc3NlZCwgYG9wYCBpcyBhc3NlcnRlZCB0b1xuICAgKiBzcGVjaWZpY2FsbHkgYmVsb25nIHRvIHRoYXQgbGlzdC5cbiAgICovXG4gIHN0YXRpYyBhc3NlcnRJc093bmVkPE9wVCBleHRlbmRzIE9wPE9wVD4+KG9wOiBPcFQsIGJ5TGlzdD86IG51bWJlcik6IHZvaWQge1xuICAgIGlmIChvcC5kZWJ1Z0xpc3RJZCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3NlcnRpb25FcnJvcjogaWxsZWdhbCBvcGVyYXRpb24gb24gdW5vd25lZCBub2RlOiAke09wS2luZFtvcC5raW5kXX1gKTtcbiAgICB9IGVsc2UgaWYgKGJ5TGlzdCAhPT0gdW5kZWZpbmVkICYmIG9wLmRlYnVnTGlzdElkICE9PSBieUxpc3QpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEFzc2VydGlvbkVycm9yOiBub2RlIGJlbG9uZ3MgdG8gdGhlIHdyb25nIGxpc3QgKGV4cGVjdGVkICR7YnlMaXN0fSwgYWN0dWFsICR7b3AuZGVidWdMaXN0SWR9KWAsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NlcnRzIHRoYXQgYG9wYCBpcyBub3QgYSBzcGVjaWFsIGBMaXN0RW5kYCBub2RlLlxuICAgKi9cbiAgc3RhdGljIGFzc2VydElzTm90RW5kPE9wVCBleHRlbmRzIE9wPE9wVD4+KG9wOiBPcFQpOiB2b2lkIHtcbiAgICBpZiAob3Aua2luZCA9PT0gT3BLaW5kLkxpc3RFbmQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uRXJyb3I6IGlsbGVnYWwgb3BlcmF0aW9uIG9uIGxpc3QgaGVhZCBvciB0YWlsYCk7XG4gICAgfVxuICB9XG59XG4iXX0=