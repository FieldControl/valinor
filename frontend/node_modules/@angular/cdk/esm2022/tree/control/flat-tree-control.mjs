/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BaseTreeControl } from './base-tree-control';
/** Flat tree control. Able to expand/collapse a subtree recursively for flattened tree. */
export class FlatTreeControl extends BaseTreeControl {
    /** Construct with flat tree data node functions getLevel and isExpandable. */
    constructor(getLevel, isExpandable, options) {
        super();
        this.getLevel = getLevel;
        this.isExpandable = isExpandable;
        this.options = options;
        if (this.options) {
            this.trackBy = this.options.trackBy;
        }
    }
    /**
     * Gets a list of the data node's subtree of descendent data nodes.
     *
     * To make this working, the `dataNodes` of the TreeControl must be flattened tree nodes
     * with correct levels.
     */
    getDescendants(dataNode) {
        const startIndex = this.dataNodes.indexOf(dataNode);
        const results = [];
        // Goes through flattened tree nodes in the `dataNodes` array, and get all descendants.
        // The level of descendants of a tree node must be greater than the level of the given
        // tree node.
        // If we reach a node whose level is equal to the level of the tree node, we hit a sibling.
        // If we reach a node whose level is greater than the level of the tree node, we hit a
        // sibling of an ancestor.
        for (let i = startIndex + 1; i < this.dataNodes.length && this.getLevel(dataNode) < this.getLevel(this.dataNodes[i]); i++) {
            results.push(this.dataNodes[i]);
        }
        return results;
    }
    /**
     * Expands all data nodes in the tree.
     *
     * To make this working, the `dataNodes` variable of the TreeControl must be set to all flattened
     * data nodes of the tree.
     */
    expandAll() {
        this.expansionModel.select(...this.dataNodes.map(node => this._trackByValue(node)));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhdC10cmVlLWNvbnRyb2wuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3RyZWUvY29udHJvbC9mbGF0LXRyZWUtY29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFPcEQsMkZBQTJGO0FBQzNGLE1BQU0sT0FBTyxlQUEwQixTQUFRLGVBQXFCO0lBQ2xFLDhFQUE4RTtJQUM5RSxZQUNrQixRQUFpQyxFQUNqQyxZQUFzQyxFQUMvQyxPQUFzQztRQUU3QyxLQUFLLEVBQUUsQ0FBQztRQUpRLGFBQVEsR0FBUixRQUFRLENBQXlCO1FBQ2pDLGlCQUFZLEdBQVosWUFBWSxDQUEwQjtRQUMvQyxZQUFPLEdBQVAsT0FBTyxDQUErQjtRQUk3QyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQ3RDLENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxjQUFjLENBQUMsUUFBVztRQUN4QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNwRCxNQUFNLE9BQU8sR0FBUSxFQUFFLENBQUM7UUFFeEIsdUZBQXVGO1FBQ3ZGLHNGQUFzRjtRQUN0RixhQUFhO1FBQ2IsMkZBQTJGO1FBQzNGLHNGQUFzRjtRQUN0RiwwQkFBMEI7UUFDMUIsS0FDRSxJQUFJLENBQUMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxFQUN0QixDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDdkYsQ0FBQyxFQUFFLEVBQ0gsQ0FBQztZQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFDRCxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFTO1FBQ1AsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RGLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Jhc2VUcmVlQ29udHJvbH0gZnJvbSAnLi9iYXNlLXRyZWUtY29udHJvbCc7XG5cbi8qKiBPcHRpb25hbCBzZXQgb2YgY29uZmlndXJhdGlvbiB0aGF0IGNhbiBiZSBwcm92aWRlZCB0byB0aGUgRmxhdFRyZWVDb250cm9sLiAqL1xuZXhwb3J0IGludGVyZmFjZSBGbGF0VHJlZUNvbnRyb2xPcHRpb25zPFQsIEs+IHtcbiAgdHJhY2tCeT86IChkYXRhTm9kZTogVCkgPT4gSztcbn1cblxuLyoqIEZsYXQgdHJlZSBjb250cm9sLiBBYmxlIHRvIGV4cGFuZC9jb2xsYXBzZSBhIHN1YnRyZWUgcmVjdXJzaXZlbHkgZm9yIGZsYXR0ZW5lZCB0cmVlLiAqL1xuZXhwb3J0IGNsYXNzIEZsYXRUcmVlQ29udHJvbDxULCBLID0gVD4gZXh0ZW5kcyBCYXNlVHJlZUNvbnRyb2w8VCwgSz4ge1xuICAvKiogQ29uc3RydWN0IHdpdGggZmxhdCB0cmVlIGRhdGEgbm9kZSBmdW5jdGlvbnMgZ2V0TGV2ZWwgYW5kIGlzRXhwYW5kYWJsZS4gKi9cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIG92ZXJyaWRlIGdldExldmVsOiAoZGF0YU5vZGU6IFQpID0+IG51bWJlcixcbiAgICBwdWJsaWMgb3ZlcnJpZGUgaXNFeHBhbmRhYmxlOiAoZGF0YU5vZGU6IFQpID0+IGJvb2xlYW4sXG4gICAgcHVibGljIG9wdGlvbnM/OiBGbGF0VHJlZUNvbnRyb2xPcHRpb25zPFQsIEs+LFxuICApIHtcbiAgICBzdXBlcigpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucykge1xuICAgICAgdGhpcy50cmFja0J5ID0gdGhpcy5vcHRpb25zLnRyYWNrQnk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBsaXN0IG9mIHRoZSBkYXRhIG5vZGUncyBzdWJ0cmVlIG9mIGRlc2NlbmRlbnQgZGF0YSBub2Rlcy5cbiAgICpcbiAgICogVG8gbWFrZSB0aGlzIHdvcmtpbmcsIHRoZSBgZGF0YU5vZGVzYCBvZiB0aGUgVHJlZUNvbnRyb2wgbXVzdCBiZSBmbGF0dGVuZWQgdHJlZSBub2Rlc1xuICAgKiB3aXRoIGNvcnJlY3QgbGV2ZWxzLlxuICAgKi9cbiAgZ2V0RGVzY2VuZGFudHMoZGF0YU5vZGU6IFQpOiBUW10ge1xuICAgIGNvbnN0IHN0YXJ0SW5kZXggPSB0aGlzLmRhdGFOb2Rlcy5pbmRleE9mKGRhdGFOb2RlKTtcbiAgICBjb25zdCByZXN1bHRzOiBUW10gPSBbXTtcblxuICAgIC8vIEdvZXMgdGhyb3VnaCBmbGF0dGVuZWQgdHJlZSBub2RlcyBpbiB0aGUgYGRhdGFOb2Rlc2AgYXJyYXksIGFuZCBnZXQgYWxsIGRlc2NlbmRhbnRzLlxuICAgIC8vIFRoZSBsZXZlbCBvZiBkZXNjZW5kYW50cyBvZiBhIHRyZWUgbm9kZSBtdXN0IGJlIGdyZWF0ZXIgdGhhbiB0aGUgbGV2ZWwgb2YgdGhlIGdpdmVuXG4gICAgLy8gdHJlZSBub2RlLlxuICAgIC8vIElmIHdlIHJlYWNoIGEgbm9kZSB3aG9zZSBsZXZlbCBpcyBlcXVhbCB0byB0aGUgbGV2ZWwgb2YgdGhlIHRyZWUgbm9kZSwgd2UgaGl0IGEgc2libGluZy5cbiAgICAvLyBJZiB3ZSByZWFjaCBhIG5vZGUgd2hvc2UgbGV2ZWwgaXMgZ3JlYXRlciB0aGFuIHRoZSBsZXZlbCBvZiB0aGUgdHJlZSBub2RlLCB3ZSBoaXQgYVxuICAgIC8vIHNpYmxpbmcgb2YgYW4gYW5jZXN0b3IuXG4gICAgZm9yIChcbiAgICAgIGxldCBpID0gc3RhcnRJbmRleCArIDE7XG4gICAgICBpIDwgdGhpcy5kYXRhTm9kZXMubGVuZ3RoICYmIHRoaXMuZ2V0TGV2ZWwoZGF0YU5vZGUpIDwgdGhpcy5nZXRMZXZlbCh0aGlzLmRhdGFOb2Rlc1tpXSk7XG4gICAgICBpKytcbiAgICApIHtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmRhdGFOb2Rlc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZHMgYWxsIGRhdGEgbm9kZXMgaW4gdGhlIHRyZWUuXG4gICAqXG4gICAqIFRvIG1ha2UgdGhpcyB3b3JraW5nLCB0aGUgYGRhdGFOb2Rlc2AgdmFyaWFibGUgb2YgdGhlIFRyZWVDb250cm9sIG11c3QgYmUgc2V0IHRvIGFsbCBmbGF0dGVuZWRcbiAgICogZGF0YSBub2RlcyBvZiB0aGUgdHJlZS5cbiAgICovXG4gIGV4cGFuZEFsbCgpOiB2b2lkIHtcbiAgICB0aGlzLmV4cGFuc2lvbk1vZGVsLnNlbGVjdCguLi50aGlzLmRhdGFOb2Rlcy5tYXAobm9kZSA9PiB0aGlzLl90cmFja0J5VmFsdWUobm9kZSkpKTtcbiAgfVxufVxuIl19