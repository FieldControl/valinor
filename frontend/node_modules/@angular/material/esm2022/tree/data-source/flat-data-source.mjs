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
    get data() {
        return this._data.value;
    }
    set data(value) {
        this._data.next(value);
        this._flattenedData.next(this._treeFlattener.flattenNodes(this.data));
        this._treeControl.dataNodes = this._flattenedData.value;
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhdC1kYXRhLXNvdXJjZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC90cmVlL2RhdGEtc291cmNlL2ZsYXQtZGF0YS1zb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFtQixVQUFVLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUV0RSxPQUFPLEVBQUMsZUFBZSxFQUFFLEtBQUssRUFBYSxNQUFNLE1BQU0sQ0FBQztBQUN4RCxPQUFPLEVBQUMsR0FBRyxFQUFFLElBQUksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRXpDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpQ0c7QUFDSCxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCLFlBQ1MsaUJBQWdELEVBQ2hELFFBQTZCLEVBQzdCLFlBQWtDLEVBQ2xDLFdBQWtFO1FBSGxFLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBK0I7UUFDaEQsYUFBUSxHQUFSLFFBQVEsQ0FBcUI7UUFDN0IsaUJBQVksR0FBWixZQUFZLENBQXNCO1FBQ2xDLGdCQUFXLEdBQVgsV0FBVyxDQUF1RDtJQUN4RSxDQUFDO0lBRUosWUFBWSxDQUFDLElBQU8sRUFBRSxLQUFhLEVBQUUsV0FBZ0IsRUFBRSxTQUFvQjtRQUN6RSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JELFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFM0IsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDaEMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QyxJQUFJLGFBQWEsRUFBRSxDQUFDO2dCQUNsQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMs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O0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb2xsZWN0aW9uVmlld2VyLCBEYXRhU291cmNlfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHtGbGF0VHJlZUNvbnRyb2wsIFRyZWVDb250cm9sfSBmcm9tICdAYW5ndWxhci9jZGsvdHJlZSc7XG5pbXBvcnQge0JlaGF2aW9yU3ViamVjdCwgbWVyZ2UsIE9ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHttYXAsIHRha2V9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuLyoqXG4gKiBUcmVlIGZsYXR0ZW5lciB0byBjb252ZXJ0IGEgbm9ybWFsIHR5cGUgb2Ygbm9kZSB0byBub2RlIHdpdGggY2hpbGRyZW4gJiBsZXZlbCBpbmZvcm1hdGlvbi5cbiAqIFRyYW5zZm9ybSBuZXN0ZWQgbm9kZXMgb2YgdHlwZSBgVGAgdG8gZmxhdHRlbmVkIG5vZGVzIG9mIHR5cGUgYEZgLlxuICpcbiAqIEZvciBleGFtcGxlLCB0aGUgaW5wdXQgZGF0YSBvZiB0eXBlIGBUYCBpcyBuZXN0ZWQsIGFuZCBjb250YWlucyBpdHMgY2hpbGRyZW4gZGF0YTpcbiAqICAgU29tZU5vZGU6IHtcbiAqICAgICBrZXk6ICdGcnVpdHMnLFxuICogICAgIGNoaWxkcmVuOiBbXG4gKiAgICAgICBOb2RlT25lOiB7XG4gKiAgICAgICAgIGtleTogJ0FwcGxlJyxcbiAqICAgICAgIH0sXG4gKiAgICAgICBOb2RlVHdvOiB7XG4gKiAgICAgICAga2V5OiAnUGVhcicsXG4gKiAgICAgIH1cbiAqICAgIF1cbiAqICB9XG4gKiAgQWZ0ZXIgZmxhdHRlbmVyIGZsYXR0ZW4gdGhlIHRyZWUsIHRoZSBzdHJ1Y3R1cmUgd2lsbCBiZWNvbWVcbiAqICBTb21lTm9kZToge1xuICogICAga2V5OiAnRnJ1aXRzJyxcbiAqICAgIGV4cGFuZGFibGU6IHRydWUsXG4gKiAgICBsZXZlbDogMVxuICogIH0sXG4gKiAgTm9kZU9uZToge1xuICogICAga2V5OiAnQXBwbGUnLFxuICogICAgZXhwYW5kYWJsZTogZmFsc2UsXG4gKiAgICBsZXZlbDogMlxuICogIH0sXG4gKiAgTm9kZVR3bzoge1xuICogICBrZXk6ICdQZWFyJyxcbiAqICAgZXhwYW5kYWJsZTogZmFsc2UsXG4gKiAgIGxldmVsOiAyXG4gKiB9XG4gKiBhbmQgdGhlIG91dHB1dCBmbGF0dGVuZWQgdHlwZSBpcyBgRmAgd2l0aCBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgTWF0VHJlZUZsYXR0ZW5lcjxULCBGLCBLID0gRj4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdHJhbnNmb3JtRnVuY3Rpb246IChub2RlOiBULCBsZXZlbDogbnVtYmVyKSA9PiBGLFxuICAgIHB1YmxpYyBnZXRMZXZlbDogKG5vZGU6IEYpID0+IG51bWJlcixcbiAgICBwdWJsaWMgaXNFeHBhbmRhYmxlOiAobm9kZTogRikgPT4gYm9vbGVhbixcbiAgICBwdWJsaWMgZ2V0Q2hpbGRyZW46IChub2RlOiBUKSA9PiBPYnNlcnZhYmxlPFRbXT4gfCBUW10gfCB1bmRlZmluZWQgfCBudWxsLFxuICApIHt9XG5cbiAgX2ZsYXR0ZW5Ob2RlKG5vZGU6IFQsIGxldmVsOiBudW1iZXIsIHJlc3VsdE5vZGVzOiBGW10sIHBhcmVudE1hcDogYm9vbGVhbltdKTogRltdIHtcbiAgICBjb25zdCBmbGF0Tm9kZSA9IHRoaXMudHJhbnNmb3JtRnVuY3Rpb24obm9kZSwgbGV2ZWwpO1xuICAgIHJlc3VsdE5vZGVzLnB1c2goZmxhdE5vZGUpO1xuXG4gICAgaWYgKHRoaXMuaXNFeHBhbmRhYmxlKGZsYXROb2RlKSkge1xuICAgICAgY29uc3QgY2hpbGRyZW5Ob2RlcyA9IHRoaXMuZ2V0Q2hpbGRyZW4obm9kZSk7XG4gICAgICBpZiAoY2hpbGRyZW5Ob2Rlcykge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjaGlsZHJlbk5vZGVzKSkge1xuICAgICAgICAgIHRoaXMuX2ZsYXR0ZW5DaGlsZHJlbihjaGlsZHJlbk5vZGVzLCBsZXZlbCwgcmVzdWx0Tm9kZXMsIHBhcmVudE1hcCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2hpbGRyZW5Ob2Rlcy5waXBlKHRha2UoMSkpLnN1YnNjcmliZShjaGlsZHJlbiA9PiB7XG4gICAgICAgICAgICB0aGlzLl9mbGF0dGVuQ2hpbGRyZW4oY2hpbGRyZW4sIGxldmVsLCByZXN1bHROb2RlcywgcGFyZW50TWFwKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0Tm9kZXM7XG4gIH1cblxuICBfZmxhdHRlbkNoaWxkcmVuKGNoaWxkcmVuOiBUW10sIGxldmVsOiBudW1iZXIsIHJlc3VsdE5vZGVzOiBGW10sIHBhcmVudE1hcDogYm9vbGVhbltdKTogdm9pZCB7XG4gICAgY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQsIGluZGV4KSA9PiB7XG4gICAgICBsZXQgY2hpbGRQYXJlbnRNYXA6IGJvb2xlYW5bXSA9IHBhcmVudE1hcC5zbGljZSgpO1xuICAgICAgY2hpbGRQYXJlbnRNYXAucHVzaChpbmRleCAhPSBjaGlsZHJlbi5sZW5ndGggLSAxKTtcbiAgICAgIHRoaXMuX2ZsYXR0ZW5Ob2RlKGNoaWxkLCBsZXZlbCArIDEsIHJlc3VsdE5vZGVzLCBjaGlsZFBhcmVudE1hcCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRmxhdHRlbiBhIGxpc3Qgb2Ygbm9kZSB0eXBlIFQgdG8gZmxhdHRlbmVkIHZlcnNpb24gb2Ygbm9kZSBGLlxuICAgKiBQbGVhc2Ugbm90ZSB0aGF0IHR5cGUgVCBtYXkgYmUgbmVzdGVkLCBhbmQgdGhlIGxlbmd0aCBvZiBgc3RydWN0dXJlZERhdGFgIG1heSBiZSBkaWZmZXJlbnRcbiAgICogZnJvbSB0aGF0IG9mIHJldHVybmVkIGxpc3QgYEZbXWAuXG4gICAqL1xuICBmbGF0dGVuTm9kZXMoc3RydWN0dXJlZERhdGE6IFRbXSk6IEZbXSB7XG4gICAgbGV0IHJlc3VsdE5vZGVzOiBGW10gPSBbXTtcbiAgICBzdHJ1Y3R1cmVkRGF0YS5mb3JFYWNoKG5vZGUgPT4gdGhpcy5fZmxhdHRlbk5vZGUobm9kZSwgMCwgcmVzdWx0Tm9kZXMsIFtdKSk7XG4gICAgcmV0dXJuIHJlc3VsdE5vZGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZCBmbGF0dGVuZWQgbm9kZSB3aXRoIGN1cnJlbnQgZXhwYW5zaW9uIHN0YXR1cy5cbiAgICogVGhlIHJldHVybmVkIGxpc3QgbWF5IGhhdmUgZGlmZmVyZW50IGxlbmd0aC5cbiAgICovXG4gIGV4cGFuZEZsYXR0ZW5lZE5vZGVzKG5vZGVzOiBGW10sIHRyZWVDb250cm9sOiBUcmVlQ29udHJvbDxGLCBLPik6IEZbXSB7XG4gICAgbGV0IHJlc3VsdHM6IEZbXSA9IFtdO1xuICAgIGxldCBjdXJyZW50RXhwYW5kOiBib29sZWFuW10gPSBbXTtcbiAgICBjdXJyZW50RXhwYW5kWzBdID0gdHJ1ZTtcblxuICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICBsZXQgZXhwYW5kID0gdHJ1ZTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IHRoaXMuZ2V0TGV2ZWwobm9kZSk7IGkrKykge1xuICAgICAgICBleHBhbmQgPSBleHBhbmQgJiYgY3VycmVudEV4cGFuZFtpXTtcbiAgICAgIH1cbiAgICAgIGlmIChleHBhbmQpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuaXNFeHBhbmRhYmxlKG5vZGUpKSB7XG4gICAgICAgIGN1cnJlbnRFeHBhbmRbdGhpcy5nZXRMZXZlbChub2RlKSArIDFdID0gdHJlZUNvbnRyb2wuaXNFeHBhbmRlZChub2RlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxufVxuXG4vKipcbiAqIERhdGEgc291cmNlIGZvciBmbGF0IHRyZWUuXG4gKiBUaGUgZGF0YSBzb3VyY2UgbmVlZCB0byBoYW5kbGUgZXhwYW5zaW9uL2NvbGxhcHNpb24gb2YgdGhlIHRyZWUgbm9kZSBhbmQgY2hhbmdlIHRoZSBkYXRhIGZlZWRcbiAqIHRvIGBNYXRUcmVlYC5cbiAqIFRoZSBuZXN0ZWQgdHJlZSBub2RlcyBvZiB0eXBlIGBUYCBhcmUgZmxhdHRlbmVkIHRocm91Z2ggYE1hdFRyZWVGbGF0dGVuZXJgLCBhbmQgY29udmVydGVkXG4gKiB0byB0eXBlIGBGYCBmb3IgYE1hdFRyZWVgIHRvIGNvbnN1bWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBNYXRUcmVlRmxhdERhdGFTb3VyY2U8VCwgRiwgSyA9IEY+IGV4dGVuZHMgRGF0YVNvdXJjZTxGPiB7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2ZsYXR0ZW5lZERhdGEgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PEZbXT4oW10pO1xuICBwcml2YXRlIHJlYWRvbmx5IF9leHBhbmRlZERhdGEgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PEZbXT4oW10pO1xuXG4gIGdldCBkYXRhKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnZhbHVlO1xuICB9XG4gIHNldCBkYXRhKHZhbHVlOiBUW10pIHtcbiAgICB0aGlzLl9kYXRhLm5leHQodmFsdWUpO1xuICAgIHRoaXMuX2ZsYXR0ZW5lZERhdGEubmV4dCh0aGlzLl90cmVlRmxhdHRlbmVyLmZsYXR0ZW5Ob2Rlcyh0aGlzLmRhdGEpKTtcbiAgICB0aGlzLl90cmVlQ29udHJvbC5kYXRhTm9kZXMgPSB0aGlzLl9mbGF0dGVuZWREYXRhLnZhbHVlO1xuICB9XG4gIHByaXZhdGUgcmVhZG9ubHkgX2RhdGEgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PFRbXT4oW10pO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX3RyZWVDb250cm9sOiBGbGF0VHJlZUNvbnRyb2w8RiwgSz4sXG4gICAgcHJpdmF0ZSBfdHJlZUZsYXR0ZW5lcjogTWF0VHJlZUZsYXR0ZW5lcjxULCBGLCBLPixcbiAgICBpbml0aWFsRGF0YT86IFRbXSxcbiAgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIGlmIChpbml0aWFsRGF0YSkge1xuICAgICAgLy8gQXNzaWduIHRoZSBkYXRhIHRocm91Z2ggdGhlIGNvbnN0cnVjdG9yIHRvIGVuc3VyZSB0aGF0IGFsbCBvZiB0aGUgbG9naWMgaXMgZXhlY3V0ZWQuXG4gICAgICB0aGlzLmRhdGEgPSBpbml0aWFsRGF0YTtcbiAgICB9XG4gIH1cblxuICBjb25uZWN0KGNvbGxlY3Rpb25WaWV3ZXI6IENvbGxlY3Rpb25WaWV3ZXIpOiBPYnNlcnZhYmxlPEZbXT4ge1xuICAgIHJldHVybiBtZXJnZShcbiAgICAgIGNvbGxlY3Rpb25WaWV3ZXIudmlld0NoYW5nZSxcbiAgICAgIHRoaXMuX3RyZWVDb250cm9sLmV4cGFuc2lvbk1vZGVsLmNoYW5nZWQsXG4gICAgICB0aGlzLl9mbGF0dGVuZWREYXRhLFxuICAgICkucGlwZShcbiAgICAgIG1hcCgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2V4cGFuZGVkRGF0YS5uZXh0KFxuICAgICAgICAgIHRoaXMuX3RyZWVGbGF0dGVuZXIuZXhwYW5kRmxhdHRlbmVkTm9kZXModGhpcy5fZmxhdHRlbmVkRGF0YS52YWx1ZSwgdGhpcy5fdHJlZUNvbnRyb2wpLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gdGhpcy5fZXhwYW5kZWREYXRhLnZhbHVlO1xuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgLy8gbm8gb3BcbiAgfVxufVxuIl19