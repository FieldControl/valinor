/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, merge } from 'rxjs';
import { map, take } from 'rxjs/operators';
/**
 * Tree flattener to convert a normal type of node to node with children & level information.
 * Transform nested nodes of type `T` to flattened nodes of type `F`.
 *
 * For example, the input data of type `T` is nested, and contains its children data:
 *   SomeNode: {
 *     key: 'Fruits',
 *     children: [
 *       NodeOne: {
 *         key: 'Apple',
 *       },
 *       NodeTwo: {
 *        key: 'Pear',
 *      }
 *    ]
 *  }
 *  After flattener flatten the tree, the structure will become
 *  SomeNode: {
 *    key: 'Fruits',
 *    expandable: true,
 *    level: 1
 *  },
 *  NodeOne: {
 *    key: 'Apple',
 *    expandable: false,
 *    level: 2
 *  },
 *  NodeTwo: {
 *   key: 'Pear',
 *   expandable: false,
 *   level: 2
 * }
 * and the output flattened type is `F` with additional information.
 */
export class MatTreeFlattener {
    constructor(transformFunction, getLevel, isExpandable, getChildren) {
        this.transformFunction = transformFunction;
        this.getLevel = getLevel;
        this.isExpandable = isExpandable;
        this.getChildren = getChildren;
    }
    _flattenNode(node, level, resultNodes, parentMap) {
        const flatNode = this.transformFunction(node, level);
        resultNodes.push(flatNode);
        if (this.isExpandable(flatNode)) {
            const childrenNodes = this.getChildren(node);
            if (childrenNodes) {
                if (Array.isArray(childrenNodes)) {
                    this._flattenChildren(childrenNodes, level, resultNodes, parentMap);
                }
                else {
                    childrenNodes.pipe(take(1)).subscribe(children => {
                        this._flattenChildren(children, level, resultNodes, parentMap);
                    });
                }
            }
        }
        return resultNodes;
    }
    _flattenChildren(children, level, resultNodes, parentMap) {
        children.forEach((child, index) => {
            let childParentMap = parentMap.slice();
            childParentMap.push(index != children.length - 1);
            this._flattenNode(child, level + 1, resultNodes, childParentMap);
        });
    }
    /**
     * Flatten a list of node type T to flattened version of node F.
     * Please note that type T may be nested, and the length of `structuredData` may be different
     * from that of returned list `F[]`.
     */
    flattenNodes(structuredData) {
        let resultNodes = [];
        structuredData.forEach(node => this._flattenNode(node, 0, resultNodes, []));
        return resultNodes;
    }
    /**
     * Expand flattened node with current expansion status.
     * The returned list may have different length.
     */
    expandFlattenedNodes(nodes, treeControl) {
        let results = [];
        let currentExpand = [];
        currentExpand[0] = true;
        nodes.forEach(node => {
            let expand = true;
            for (let i = 0; i <= this.getLevel(node); i++) {
                expand = expand && currentExpand[i];
            }
            if (expand) {
                results.push(node);
            }
            if (this.isExpandable(node)) {
                currentExpand[this.getLevel(node) + 1] = treeControl.isExpanded(node);
            }
        });
        return results;
    }
}
/**
 * Data source for flat tree.
 * The data source need to handle expansion/collapsion of the tree node and change the data feed
 * to `MatTree`.
 * The nested tree nodes of type `T` are flattened through `MatTreeFlattener`, and converted
 * to type `F` for `MatTree` to consume.
 */
export class MatTreeFlatDataSource extends DataSource {
    constructor(_treeControl, _treeFlattener, initialData) {
        super();
        this._treeControl = _treeControl;
        this._treeFlattener = _treeFlattener;
        this._flattenedData = new BehaviorSubject([]);
        this._expandedData = new BehaviorSubject([]);
        this._data = new BehaviorSubject([]);
        if (initialData) {
            // Assign the data through the constructor to ensure that all of the logic is executed.
            this.data = initialData;
        }
    }
    get data() { return this._data.value; }
    set data(value) {
        this._data.next(value);
        this._flattenedData.next(this._treeFlattener.flattenNodes(this.data));
        this._treeControl.dataNodes = this._flattenedData.value;
    }
    connect(collectionViewer) {
        return merge(collectionViewer.viewChange, this._treeControl.expansionModel.changed, this._flattenedData).pipe(map(() => {
            this._expandedData.next(this._treeFlattener.expandFlattenedNodes(this._flattenedData.value, this._treeControl));
            return this._expandedData.value;
        }));
    }
    disconnect() {
        // no op
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhdC1kYXRhLXNvdXJjZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC90cmVlL2RhdGEtc291cmNlL2ZsYXQtZGF0YS1zb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFtQixVQUFVLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUV0RSxPQUFPLEVBQUMsZUFBZSxFQUFFLEtBQUssRUFBYSxNQUFNLE1BQU0sQ0FBQztBQUN4RCxPQUFPLEVBQUMsR0FBRyxFQUFFLElBQUksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRXpDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpQ0c7QUFDSCxNQUFNLE9BQU8sZ0JBQWdCO0lBRTNCLFlBQW1CLGlCQUFnRCxFQUNoRCxRQUE2QixFQUM3QixZQUFrQyxFQUNsQyxXQUNxQztRQUpyQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQStCO1FBQ2hELGFBQVEsR0FBUixRQUFRLENBQXFCO1FBQzdCLGlCQUFZLEdBQVosWUFBWSxDQUFzQjtRQUNsQyxnQkFBVyxHQUFYLFdBQVcsQ0FDMEI7SUFBRyxDQUFDO0lBRTVELFlBQVksQ0FBQyxJQUFPLEVBQUUsS0FBYSxFQUN0QixXQUFnQixFQUFFLFNBQW9CO1FBQ2pELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckQsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUUzQixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDL0IsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QyxJQUFJLGFBQWEsRUFBRTtnQkFDakIsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FB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LGVBQWUsQ0FBTSxFQUFFLENBQUMsQ0FBQztRQU9wRCxJQUFJLFdBQVcsRUFBRTtZQUNmLHVGQUF1RjtZQUN2RixJQUFJLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQztTQUN6QjtJQUNILENBQUM7SUFqQkQsSUFBSSxJQUFJLEtBQUssT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkMsSUFBSSxJQUFJLENBQUMsS0FBVTtRQUNqQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQztJQUMxRCxDQUFDO0lBY0QsT0FBTyxDQUFDLGdCQUFrQztRQUN4QyxPQUFPLEtBQUssQ0FDVixnQkFBZ0IsQ0FBQyxVQUFVLEVBQzNCLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFDeEMsSUFBSSxDQUFDLGNBQWMsQ0FDcEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUNkLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUNyQixJQUFJLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQzFGLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNOLENBQUM7SUFFRCxVQUFVO1FBQ1IsUUFBUTtJQUNWLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbGxlY3Rpb25WaWV3ZXIsIERhdGFTb3VyY2V9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2xsZWN0aW9ucyc7XG5pbXBvcnQge0ZsYXRUcmVlQ29udHJvbCwgVHJlZUNvbnRyb2x9IGZyb20gJ0Bhbmd1bGFyL2Nkay90cmVlJztcbmltcG9ydCB7QmVoYXZpb3JTdWJqZWN0LCBtZXJnZSwgT2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge21hcCwgdGFrZX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG4vKipcbiAqIFRyZWUgZmxhdHRlbmVyIHRvIGNvbnZlcnQgYSBub3JtYWwgdHlwZSBvZiBub2RlIHRvIG5vZGUgd2l0aCBjaGlsZHJlbiAmIGxldmVsIGluZm9ybWF0aW9uLlxuICogVHJhbnNmb3JtIG5lc3RlZCBub2RlcyBvZiB0eXBlIGBUYCB0byBmbGF0dGVuZWQgbm9kZXMgb2YgdHlwZSBgRmAuXG4gKlxuICogRm9yIGV4YW1wbGUsIHRoZSBpbnB1dCBkYXRhIG9mIHR5cGUgYFRgIGlzIG5lc3RlZCwgYW5kIGNvbnRhaW5zIGl0cyBjaGlsZHJlbiBkYXRhOlxuICogICBTb21lTm9kZToge1xuICogICAgIGtleTogJ0ZydWl0cycsXG4gKiAgICAgY2hpbGRyZW46IFtcbiAqICAgICAgIE5vZGVPbmU6IHtcbiAqICAgICAgICAga2V5OiAnQXBwbGUnLFxuICogICAgICAgfSxcbiAqICAgICAgIE5vZGVUd286IHtcbiAqICAgICAgICBrZXk6ICdQZWFyJyxcbiAqICAgICAgfVxuICogICAgXVxuICogIH1cbiAqICBBZnRlciBmbGF0dGVuZXIgZmxhdHRlbiB0aGUgdHJlZSwgdGhlIHN0cnVjdHVyZSB3aWxsIGJlY29tZVxuICogIFNvbWVOb2RlOiB7XG4gKiAgICBrZXk6ICdGcnVpdHMnLFxuICogICAgZXhwYW5kYWJsZTogdHJ1ZSxcbiAqICAgIGxldmVsOiAxXG4gKiAgfSxcbiAqICBOb2RlT25lOiB7XG4gKiAgICBrZXk6ICdBcHBsZScsXG4gKiAgICBleHBhbmRhYmxlOiBmYWxzZSxcbiAqICAgIGxldmVsOiAyXG4gKiAgfSxcbiAqICBOb2RlVHdvOiB7XG4gKiAgIGtleTogJ1BlYXInLFxuICogICBleHBhbmRhYmxlOiBmYWxzZSxcbiAqICAgbGV2ZWw6IDJcbiAqIH1cbiAqIGFuZCB0aGUgb3V0cHV0IGZsYXR0ZW5lZCB0eXBlIGlzIGBGYCB3aXRoIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBNYXRUcmVlRmxhdHRlbmVyPFQsIEYsIEsgPSBGPiB7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHRyYW5zZm9ybUZ1bmN0aW9uOiAobm9kZTogVCwgbGV2ZWw6IG51bWJlcikgPT4gRixcbiAgICAgICAgICAgICAgcHVibGljIGdldExldmVsOiAobm9kZTogRikgPT4gbnVtYmVyLFxuICAgICAgICAgICAgICBwdWJsaWMgaXNFeHBhbmRhYmxlOiAobm9kZTogRikgPT4gYm9vbGVhbixcbiAgICAgICAgICAgICAgcHVibGljIGdldENoaWxkcmVuOiAobm9kZTogVCkgPT5cbiAgICAgICAgICAgICAgICAgIE9ic2VydmFibGU8VFtdPiB8IFRbXSB8IHVuZGVmaW5lZCB8IG51bGwpIHt9XG5cbiAgX2ZsYXR0ZW5Ob2RlKG5vZGU6IFQsIGxldmVsOiBudW1iZXIsXG4gICAgICAgICAgICAgICByZXN1bHROb2RlczogRltdLCBwYXJlbnRNYXA6IGJvb2xlYW5bXSk6IEZbXSB7XG4gICAgY29uc3QgZmxhdE5vZGUgPSB0aGlzLnRyYW5zZm9ybUZ1bmN0aW9uKG5vZGUsIGxldmVsKTtcbiAgICByZXN1bHROb2Rlcy5wdXNoKGZsYXROb2RlKTtcblxuICAgIGlmICh0aGlzLmlzRXhwYW5kYWJsZShmbGF0Tm9kZSkpIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuTm9kZXMgPSB0aGlzLmdldENoaWxkcmVuKG5vZGUpO1xuICAgICAgaWYgKGNoaWxkcmVuTm9kZXMpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW5Ob2RlcykpIHtcbiAgICAgICAgICB0aGlzLl9mbGF0dGVuQ2hpbGRyZW4oY2hpbGRyZW5Ob2RlcywgbGV2ZWwsIHJlc3VsdE5vZGVzLCBwYXJlbnRNYXApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNoaWxkcmVuTm9kZXMucGlwZSh0YWtlKDEpKS5zdWJzY3JpYmUoY2hpbGRyZW4gPT4ge1xuICAgICAgICAgICAgdGhpcy5fZmxhdHRlbkNoaWxkcmVuKGNoaWxkcmVuLCBsZXZlbCwgcmVzdWx0Tm9kZXMsIHBhcmVudE1hcCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdE5vZGVzO1xuICB9XG5cbiAgX2ZsYXR0ZW5DaGlsZHJlbihjaGlsZHJlbjogVFtdLCBsZXZlbDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgIHJlc3VsdE5vZGVzOiBGW10sIHBhcmVudE1hcDogYm9vbGVhbltdKTogdm9pZCB7XG4gICAgY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQsIGluZGV4KSA9PiB7XG4gICAgICBsZXQgY2hpbGRQYXJlbnRNYXA6IGJvb2xlYW5bXSA9IHBhcmVudE1hcC5zbGljZSgpO1xuICAgICAgY2hpbGRQYXJlbnRNYXAucHVzaChpbmRleCAhPSBjaGlsZHJlbi5sZW5ndGggLSAxKTtcbiAgICAgIHRoaXMuX2ZsYXR0ZW5Ob2RlKGNoaWxkLCBsZXZlbCArIDEsIHJlc3VsdE5vZGVzLCBjaGlsZFBhcmVudE1hcCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRmxhdHRlbiBhIGxpc3Qgb2Ygbm9kZSB0eXBlIFQgdG8gZmxhdHRlbmVkIHZlcnNpb24gb2Ygbm9kZSBGLlxuICAgKiBQbGVhc2Ugbm90ZSB0aGF0IHR5cGUgVCBtYXkgYmUgbmVzdGVkLCBhbmQgdGhlIGxlbmd0aCBvZiBgc3RydWN0dXJlZERhdGFgIG1heSBiZSBkaWZmZXJlbnRcbiAgICogZnJvbSB0aGF0IG9mIHJldHVybmVkIGxpc3QgYEZbXWAuXG4gICAqL1xuICBmbGF0dGVuTm9kZXMoc3RydWN0dXJlZERhdGE6IFRbXSk6IEZbXSB7XG4gICAgbGV0IHJlc3VsdE5vZGVzOiBGW10gPSBbXTtcbiAgICBzdHJ1Y3R1cmVkRGF0YS5mb3JFYWNoKG5vZGUgPT4gdGhpcy5fZmxhdHRlbk5vZGUobm9kZSwgMCwgcmVzdWx0Tm9kZXMsIFtdKSk7XG4gICAgcmV0dXJuIHJlc3VsdE5vZGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZCBmbGF0dGVuZWQgbm9kZSB3aXRoIGN1cnJlbnQgZXhwYW5zaW9uIHN0YXR1cy5cbiAgICogVGhlIHJldHVybmVkIGxpc3QgbWF5IGhhdmUgZGlmZmVyZW50IGxlbmd0aC5cbiAgICovXG4gIGV4cGFuZEZsYXR0ZW5lZE5vZGVzKG5vZGVzOiBGW10sIHRyZWVDb250cm9sOiBUcmVlQ29udHJvbDxGLCBLPik6IEZbXSB7XG4gICAgbGV0IHJlc3VsdHM6IEZbXSA9IFtdO1xuICAgIGxldCBjdXJyZW50RXhwYW5kOiBib29sZWFuW10gPSBbXTtcbiAgICBjdXJyZW50RXhwYW5kWzBdID0gdHJ1ZTtcblxuICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICBsZXQgZXhwYW5kID0gdHJ1ZTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IHRoaXMuZ2V0TGV2ZWwobm9kZSk7IGkrKykge1xuICAgICAgICBleHBhbmQgPSBleHBhbmQgJiYgY3VycmVudEV4cGFuZFtpXTtcbiAgICAgIH1cbiAgICAgIGlmIChleHBhbmQpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuaXNFeHBhbmRhYmxlKG5vZGUpKSB7XG4gICAgICAgIGN1cnJlbnRFeHBhbmRbdGhpcy5nZXRMZXZlbChub2RlKSArIDFdID0gdHJlZUNvbnRyb2wuaXNFeHBhbmRlZChub2RlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxufVxuXG5cbi8qKlxuICogRGF0YSBzb3VyY2UgZm9yIGZsYXQgdHJlZS5cbiAqIFRoZSBkYXRhIHNvdXJjZSBuZWVkIHRvIGhhbmRsZSBleHBhbnNpb24vY29sbGFwc2lvbiBvZiB0aGUgdHJlZSBub2RlIGFuZCBjaGFuZ2UgdGhlIGRhdGEgZmVlZFxuICogdG8gYE1hdFRyZWVgLlxuICogVGhlIG5lc3RlZCB0cmVlIG5vZGVzIG9mIHR5cGUgYFRgIGFyZSBmbGF0dGVuZWQgdGhyb3VnaCBgTWF0VHJlZUZsYXR0ZW5lcmAsIGFuZCBjb252ZXJ0ZWRcbiAqIHRvIHR5cGUgYEZgIGZvciBgTWF0VHJlZWAgdG8gY29uc3VtZS5cbiAqL1xuZXhwb3J0IGNsYXNzIE1hdFRyZWVGbGF0RGF0YVNvdXJjZTxULCBGLCBLID0gRj4gZXh0ZW5kcyBEYXRhU291cmNlPEY+IHtcbiAgcHJpdmF0ZSByZWFkb25seSBfZmxhdHRlbmVkRGF0YSA9IG5ldyBCZWhhdmlvclN1YmplY3Q8RltdPihbXSk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2V4cGFuZGVkRGF0YSA9IG5ldyBCZWhhdmlvclN1YmplY3Q8RltdPihbXSk7XG5cbiAgZ2V0IGRhdGEoKSB7IHJldHVybiB0aGlzLl9kYXRhLnZhbHVlOyB9XG4gIHNldCBkYXRhKHZhbHVlOiBUW10pIHtcbiAgICB0aGlzLl9kYXRhLm5leHQodmFsdWUpO1xuICAgIHRoaXMuX2ZsYXR0ZW5lZERhdGEubmV4dCh0aGlzLl90cmVlRmxhdHRlbmVyLmZsYXR0ZW5Ob2Rlcyh0aGlzLmRhdGEpKTtcbiAgICB0aGlzLl90cmVlQ29udHJvbC5kYXRhTm9kZXMgPSB0aGlzLl9mbGF0dGVuZWREYXRhLnZhbHVlO1xuICB9XG4gIHByaXZhdGUgcmVhZG9ubHkgX2RhdGEgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PFRbXT4oW10pO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3RyZWVDb250cm9sOiBGbGF0VHJlZUNvbnRyb2w8RiwgSz4sXG4gICAgICAgICAgICAgIHByaXZhdGUgX3RyZWVGbGF0dGVuZXI6IE1hdFRyZWVGbGF0dGVuZXI8VCwgRiwgSz4sXG4gICAgICAgICAgICAgIGluaXRpYWxEYXRhPzogVFtdKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIGlmIChpbml0aWFsRGF0YSkge1xuICAgICAgLy8gQXNzaWduIHRoZSBkYXRhIHRocm91Z2ggdGhlIGNvbnN0cnVjdG9yIHRvIGVuc3VyZSB0aGF0IGFsbCBvZiB0aGUgbG9naWMgaXMgZXhlY3V0ZWQuXG4gICAgICB0aGlzLmRhdGEgPSBpbml0aWFsRGF0YTtcbiAgICB9XG4gIH1cblxuICBjb25uZWN0KGNvbGxlY3Rpb25WaWV3ZXI6IENvbGxlY3Rpb25WaWV3ZXIpOiBPYnNlcnZhYmxlPEZbXT4ge1xuICAgIHJldHVybiBtZXJnZShcbiAgICAgIGNvbGxlY3Rpb25WaWV3ZXIudmlld0NoYW5nZSxcbiAgICAgIHRoaXMuX3RyZWVDb250cm9sLmV4cGFuc2lvbk1vZGVsLmNoYW5nZWQsXG4gICAgICB0aGlzLl9mbGF0dGVuZWREYXRhXG4gICAgKS5waXBlKG1hcCgoKSA9PiB7XG4gICAgICB0aGlzLl9leHBhbmRlZERhdGEubmV4dChcbiAgICAgICAgdGhpcy5fdHJlZUZsYXR0ZW5lci5leHBhbmRGbGF0dGVuZWROb2Rlcyh0aGlzLl9mbGF0dGVuZWREYXRhLnZhbHVlLCB0aGlzLl90cmVlQ29udHJvbCkpO1xuICAgICAgcmV0dXJuIHRoaXMuX2V4cGFuZGVkRGF0YS52YWx1ZTtcbiAgICB9KSk7XG4gIH1cblxuICBkaXNjb25uZWN0KCkge1xuICAgIC8vIG5vIG9wXG4gIH1cbn1cbiJdfQ==