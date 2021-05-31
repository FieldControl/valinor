/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate, parallel } from '@angular/cdk/testing';
import { MatTreeNodeHarness } from './node-harness';
/** Harness for interacting with a standard mat-tree in tests. */
export class MatTreeHarness extends ComponentHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a tree with specific attributes.
     * @param options Options for narrowing the search
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatTreeHarness, options);
    }
    /** Gets all of the nodes in the tree. */
    getNodes(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorForAll(MatTreeNodeHarness.with(filter))();
        });
    }
    /**
     * Gets an object representation for the visible tree structure
     * If a node is under an unexpanded node it will not be included.
     * Eg.
     * Tree (all nodes expanded):
     * `
     * <mat-tree>
     *   <mat-tree-node>Node 1<mat-tree-node>
     *   <mat-nested-tree-node>
     *     Node 2
     *     <mat-nested-tree-node>
     *       Node 2.1
     *       <mat-tree-node>
     *         Node 2.1.1
     *       <mat-tree-node>
     *     <mat-nested-tree-node>
     *     <mat-tree-node>
     *       Node 2.2
     *     <mat-tree-node>
     *   <mat-nested-tree-node>
     * </mat-tree>`
     *
     * Tree structure:
     * {
     *  children: [
     *    {
     *      text: 'Node 1',
     *      children: [
     *        {
     *          text: 'Node 2',
     *          children: [
     *            {
     *              text: 'Node 2.1',
     *              children: [{text: 'Node 2.1.1'}]
     *            },
     *            {text: 'Node 2.2'}
     *          ]
     *        }
     *      ]
     *    }
     *  ]
     * };
     */
    getTreeStructure() {
        return __awaiter(this, void 0, void 0, function* () {
            const nodes = yield this.getNodes();
            const nodeInformation = yield parallel(() => nodes.map(node => {
                return parallel(() => [node.getLevel(), node.getText(), node.isExpanded()]);
            }));
            return this._getTreeStructure(nodeInformation, 1, true);
        });
    }
    /**
     * Recursively collect the structured text of the tree nodes.
     * @param nodes A list of tree nodes
     * @param level The level of nodes that are being accounted for during this iteration
     * @param parentExpanded Whether the parent of the first node in param nodes is expanded
     */
    _getTreeStructure(nodes, level, parentExpanded) {
        var _a, _b, _c;
        const result = {};
        for (let i = 0; i < nodes.length; i++) {
            const [nodeLevel, text, expanded] = nodes[i];
            const nextNodeLevel = (_b = (_a = nodes[i + 1]) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : -1;
            // Return the accumulated value for the current level once we reach a shallower level node
            if (nodeLevel < level) {
                return result;
            }
            // Skip deeper level nodes during this iteration, they will be picked up in a later iteration
            if (nodeLevel > level) {
                continue;
            }
            // Only add to representation if it is visible (parent is expanded)
            if (parentExpanded) {
                // Collect the data under this node according to the following rules:
                // 1. If the next node in the list is a sibling of the current node add it to the child list
                // 2. If the next node is a child of the current node, get the sub-tree structure for the
                //    child and add it under this node
                // 3. If the next node has a shallower level, we've reached the end of the child nodes for
                //    the current parent.
                if (nextNodeLevel === level) {
                    this._addChildToNode(result, { text });
                }
                else if (nextNodeLevel > level) {
                    let children = (_c = this._getTreeStructure(nodes.slice(i + 1), nextNodeLevel, expanded)) === null || _c === void 0 ? void 0 : _c.children;
                    let child = children ? { text, children } : { text };
                    this._addChildToNode(result, child);
                }
                else {
                    this._addChildToNode(result, { text });
                    return result;
                }
            }
        }
        return result;
    }
    _addChildToNode(result, child) {
        result.children ? result.children.push(child) : result.children = [child];
    }
}
/** The selector for the host element of a `MatTableHarness` instance. */
MatTreeHarness.hostSelector = '.mat-tree';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3RyZWUvdGVzdGluZy90cmVlLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRixPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQVFsRCxpRUFBaUU7QUFDakUsTUFBTSxPQUFPLGNBQWUsU0FBUSxnQkFBZ0I7SUFJbEQ7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBOEIsRUFBRTtRQUMxQyxPQUFPLElBQUksZ0JBQWdCLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRCx5Q0FBeUM7SUFDbkMsUUFBUSxDQUFDLFNBQWlDLEVBQUU7O1lBQ2hELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQy9ELENBQUM7S0FBQTtJQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0EwQ0c7SUFDRyxnQkFBZ0I7O1lBQ3BCLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3BDLE1BQU0sZUFBZSxHQUFHLE1BQU0sUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzVELE9BQU8sUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFELENBQUM7S0FBQTtJQUVEOzs7OztPQUtHO0lBQ0ssaUJBQWlCLENBQUMsS0FBa0MsRUFBRSxLQUFhLEVBQ3hDLGNBQXVCOztRQUN4RCxNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7UUFDNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDckMsTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdDLE1BQU0sYUFBYSxHQUFHLE1BQUEsTUFBQSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQywwQ0FBRyxDQUFDLENBQUMsbUNBQUksQ0FBQyxDQUFDLENBQUM7WUFFOUMsMEZBQTBGO1lBQzFGLElBQUksU0FBUyxHQUFHLEtBQUssRUFBRTtnQkFDckIsT0FBTyxNQUFNLENBQUM7YUFDZjtZQUNELDZGQUE2RjtZQUM3RixJQUFJLFNBQVMsR0FBRyxLQUFLLEVBQUU7Z0JBQ3JCLFNBQVM7YUFDVjtZQUNELG1FQUFtRTtZQUNuRSxJQUFJLGNBQWMsRUFBRTtnQkFDbEIscUVBQXFFO2dCQUNyRSw0RkFBNEY7Z0JBQzVGLHlGQUF5RjtnQkFDekYsc0NBQXNDO2dCQUN0QywwRkFBMEY7Z0JBQzFGLHlCQUF5QjtnQkFDekIsSUFBSSxhQUFhLEtBQUssS0FBSyxFQUFFO29CQUMzQixJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBQyxDQUFDLENBQUM7aUJBQ3RDO3FCQUFNLElBQUksYUFBYSxHQUFHLEtBQUssRUFBRTtvQkFDaEMsSUFBSSxRQUFRLEdBQUcsTUFBQSxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQ3RELGFBQWEsRUFDYixRQUFRLENBQUMsMENBQUUsUUFBUSxDQUFDO29CQUN0QixJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksRUFBQyxDQUFDO29CQUNqRCxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDckM7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO29CQUNyQyxPQUFPLE1BQU0sQ0FBQztpQkFDZjthQUNGO1NBQ0Y7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRU8sZUFBZSxDQUFDLE1BQWdCLEVBQUUsS0FBZTtRQUN2RCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVFLENBQUM7O0FBcEhELHlFQUF5RTtBQUNsRSwyQkFBWSxHQUFHLFdBQVcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudEhhcm5lc3MsIEhhcm5lc3NQcmVkaWNhdGUsIHBhcmFsbGVsfSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XG5pbXBvcnQge01hdFRyZWVOb2RlSGFybmVzc30gZnJvbSAnLi9ub2RlLWhhcm5lc3MnO1xuaW1wb3J0IHtUcmVlSGFybmVzc0ZpbHRlcnMsIFRyZWVOb2RlSGFybmVzc0ZpbHRlcnN9IGZyb20gJy4vdHJlZS1oYXJuZXNzLWZpbHRlcnMnO1xuXG5leHBvcnQgdHlwZSBUZXh0VHJlZSA9IHtcbiAgdGV4dD86IHN0cmluZztcbiAgY2hpbGRyZW4/OiBUZXh0VHJlZVtdO1xufTtcblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBtYXQtdHJlZSBpbiB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBNYXRUcmVlSGFybmVzcyBleHRlbmRzIENvbXBvbmVudEhhcm5lc3Mge1xuICAvKiogVGhlIHNlbGVjdG9yIGZvciB0aGUgaG9zdCBlbGVtZW50IG9mIGEgYE1hdFRhYmxlSGFybmVzc2AgaW5zdGFuY2UuICovXG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC10cmVlJztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSB0cmVlIHdpdGggc3BlY2lmaWMgYXR0cmlidXRlcy5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgbmFycm93aW5nIHRoZSBzZWFyY2hcbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBUcmVlSGFybmVzc0ZpbHRlcnMgPSB7fSk6IEhhcm5lc3NQcmVkaWNhdGU8TWF0VHJlZUhhcm5lc3M+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0VHJlZUhhcm5lc3MsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqIEdldHMgYWxsIG9mIHRoZSBub2RlcyBpbiB0aGUgdHJlZS4gKi9cbiAgYXN5bmMgZ2V0Tm9kZXMoZmlsdGVyOiBUcmVlTm9kZUhhcm5lc3NGaWx0ZXJzID0ge30pOiBQcm9taXNlPE1hdFRyZWVOb2RlSGFybmVzc1tdPiB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZvckFsbChNYXRUcmVlTm9kZUhhcm5lc3Mud2l0aChmaWx0ZXIpKSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gb2JqZWN0IHJlcHJlc2VudGF0aW9uIGZvciB0aGUgdmlzaWJsZSB0cmVlIHN0cnVjdHVyZVxuICAgKiBJZiBhIG5vZGUgaXMgdW5kZXIgYW4gdW5leHBhbmRlZCBub2RlIGl0IHdpbGwgbm90IGJlIGluY2x1ZGVkLlxuICAgKiBFZy5cbiAgICogVHJlZSAoYWxsIG5vZGVzIGV4cGFuZGVkKTpcbiAgICogYFxuICAgKiA8bWF0LXRyZWU+XG4gICAqICAgPG1hdC10cmVlLW5vZGU+Tm9kZSAxPG1hdC10cmVlLW5vZGU+XG4gICAqICAgPG1hdC1uZXN0ZWQtdHJlZS1ub2RlPlxuICAgKiAgICAgTm9kZSAyXG4gICAqICAgICA8bWF0LW5lc3RlZC10cmVlLW5vZGU+XG4gICAqICAgICAgIE5vZGUgMi4xXG4gICAqICAgICAgIDxtYXQtdHJlZS1ub2RlPlxuICAgKiAgICAgICAgIE5vZGUgMi4xLjFcbiAgICogICAgICAgPG1hdC10cmVlLW5vZGU+XG4gICAqICAgICA8bWF0LW5lc3RlZC10cmVlLW5vZGU+XG4gICAqICAgICA8bWF0LXRyZWUtbm9kZT5cbiAgICogICAgICAgTm9kZSAyLjJcbiAgICogICAgIDxtYXQtdHJlZS1ub2RlPlxuICAgKiAgIDxtYXQtbmVzdGVkLXRyZWUtbm9kZT5cbiAgICogPC9tYXQtdHJlZT5gXG4gICAqXG4gICAqIFRyZWUgc3RydWN0dXJlOlxuICAgKiB7XG4gICAqICBjaGlsZHJlbjogW1xuICAgKiAgICB7XG4gICAqICAgICAgdGV4dDogJ05vZGUgMScsXG4gICAqICAgICAgY2hpbGRyZW46IFtcbiAgICogICAgICAgIHtcbiAgICogICAgICAgICAgdGV4dDogJ05vZGUgMicsXG4gICAqICAgICAgICAgIGNoaWxkcmVuOiBbXG4gICAqICAgICAgICAgICAge1xuICAgKiAgICAgICAgICAgICAgdGV4dDogJ05vZGUgMi4xJyxcbiAgICogICAgICAgICAgICAgIGNoaWxkcmVuOiBbe3RleHQ6ICdOb2RlIDIuMS4xJ31dXG4gICAqICAgICAgICAgICAgfSxcbiAgICogICAgICAgICAgICB7dGV4dDogJ05vZGUgMi4yJ31cbiAgICogICAgICAgICAgXVxuICAgKiAgICAgICAgfVxuICAgKiAgICAgIF1cbiAgICogICAgfVxuICAgKiAgXVxuICAgKiB9O1xuICAgKi9cbiAgYXN5bmMgZ2V0VHJlZVN0cnVjdHVyZSgpOiBQcm9taXNlPFRleHRUcmVlPiB7XG4gICAgY29uc3Qgbm9kZXMgPSBhd2FpdCB0aGlzLmdldE5vZGVzKCk7XG4gICAgY29uc3Qgbm9kZUluZm9ybWF0aW9uID0gYXdhaXQgcGFyYWxsZWwoKCkgPT4gbm9kZXMubWFwKG5vZGUgPT4ge1xuICAgICAgcmV0dXJuIHBhcmFsbGVsKCgpID0+IFtub2RlLmdldExldmVsKCksIG5vZGUuZ2V0VGV4dCgpLCBub2RlLmlzRXhwYW5kZWQoKV0pO1xuICAgIH0pKTtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VHJlZVN0cnVjdHVyZShub2RlSW5mb3JtYXRpb24sIDEsIHRydWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlY3Vyc2l2ZWx5IGNvbGxlY3QgdGhlIHN0cnVjdHVyZWQgdGV4dCBvZiB0aGUgdHJlZSBub2Rlcy5cbiAgICogQHBhcmFtIG5vZGVzIEEgbGlzdCBvZiB0cmVlIG5vZGVzXG4gICAqIEBwYXJhbSBsZXZlbCBUaGUgbGV2ZWwgb2Ygbm9kZXMgdGhhdCBhcmUgYmVpbmcgYWNjb3VudGVkIGZvciBkdXJpbmcgdGhpcyBpdGVyYXRpb25cbiAgICogQHBhcmFtIHBhcmVudEV4cGFuZGVkIFdoZXRoZXIgdGhlIHBhcmVudCBvZiB0aGUgZmlyc3Qgbm9kZSBpbiBwYXJhbSBub2RlcyBpcyBleHBhbmRlZFxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0VHJlZVN0cnVjdHVyZShub2RlczogW251bWJlciwgc3RyaW5nLCBib29sZWFuXVtdLCBsZXZlbDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudEV4cGFuZGVkOiBib29sZWFuKTogVGV4dFRyZWUge1xuICAgIGNvbnN0IHJlc3VsdDogVGV4dFRyZWUgPSB7fTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBbbm9kZUxldmVsLCB0ZXh0LCBleHBhbmRlZF0gPSBub2Rlc1tpXTtcbiAgICAgIGNvbnN0IG5leHROb2RlTGV2ZWwgPSBub2Rlc1tpICsgMV0/LlswXSA/PyAtMTtcblxuICAgICAgLy8gUmV0dXJuIHRoZSBhY2N1bXVsYXRlZCB2YWx1ZSBmb3IgdGhlIGN1cnJlbnQgbGV2ZWwgb25jZSB3ZSByZWFjaCBhIHNoYWxsb3dlciBsZXZlbCBub2RlXG4gICAgICBpZiAobm9kZUxldmVsIDwgbGV2ZWwpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICAgIC8vIFNraXAgZGVlcGVyIGxldmVsIG5vZGVzIGR1cmluZyB0aGlzIGl0ZXJhdGlvbiwgdGhleSB3aWxsIGJlIHBpY2tlZCB1cCBpbiBhIGxhdGVyIGl0ZXJhdGlvblxuICAgICAgaWYgKG5vZGVMZXZlbCA+IGxldmVsKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgLy8gT25seSBhZGQgdG8gcmVwcmVzZW50YXRpb24gaWYgaXQgaXMgdmlzaWJsZSAocGFyZW50IGlzIGV4cGFuZGVkKVxuICAgICAgaWYgKHBhcmVudEV4cGFuZGVkKSB7XG4gICAgICAgIC8vIENvbGxlY3QgdGhlIGRhdGEgdW5kZXIgdGhpcyBub2RlIGFjY29yZGluZyB0byB0aGUgZm9sbG93aW5nIHJ1bGVzOlxuICAgICAgICAvLyAxLiBJZiB0aGUgbmV4dCBub2RlIGluIHRoZSBsaXN0IGlzIGEgc2libGluZyBvZiB0aGUgY3VycmVudCBub2RlIGFkZCBpdCB0byB0aGUgY2hpbGQgbGlzdFxuICAgICAgICAvLyAyLiBJZiB0aGUgbmV4dCBub2RlIGlzIGEgY2hpbGQgb2YgdGhlIGN1cnJlbnQgbm9kZSwgZ2V0IHRoZSBzdWItdHJlZSBzdHJ1Y3R1cmUgZm9yIHRoZVxuICAgICAgICAvLyAgICBjaGlsZCBhbmQgYWRkIGl0IHVuZGVyIHRoaXMgbm9kZVxuICAgICAgICAvLyAzLiBJZiB0aGUgbmV4dCBub2RlIGhhcyBhIHNoYWxsb3dlciBsZXZlbCwgd2UndmUgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZSBjaGlsZCBub2RlcyBmb3JcbiAgICAgICAgLy8gICAgdGhlIGN1cnJlbnQgcGFyZW50LlxuICAgICAgICBpZiAobmV4dE5vZGVMZXZlbCA9PT0gbGV2ZWwpIHtcbiAgICAgICAgICB0aGlzLl9hZGRDaGlsZFRvTm9kZShyZXN1bHQsIHt0ZXh0fSk7XG4gICAgICAgIH0gZWxzZSBpZiAobmV4dE5vZGVMZXZlbCA+IGxldmVsKSB7XG4gICAgICAgICAgbGV0IGNoaWxkcmVuID0gdGhpcy5fZ2V0VHJlZVN0cnVjdHVyZShub2Rlcy5zbGljZShpICsgMSksXG4gICAgICAgICAgICBuZXh0Tm9kZUxldmVsLFxuICAgICAgICAgICAgZXhwYW5kZWQpPy5jaGlsZHJlbjtcbiAgICAgICAgICBsZXQgY2hpbGQgPSBjaGlsZHJlbiA/IHt0ZXh0LCBjaGlsZHJlbn0gOiB7dGV4dH07XG4gICAgICAgICAgdGhpcy5fYWRkQ2hpbGRUb05vZGUocmVzdWx0LCBjaGlsZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fYWRkQ2hpbGRUb05vZGUocmVzdWx0LCB7dGV4dH0pO1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgX2FkZENoaWxkVG9Ob2RlKHJlc3VsdDogVGV4dFRyZWUsIGNoaWxkOiBUZXh0VHJlZSkge1xuICAgIHJlc3VsdC5jaGlsZHJlbiA/IHJlc3VsdC5jaGlsZHJlbi5wdXNoKGNoaWxkKSA6IHJlc3VsdC5jaGlsZHJlbiA9IFtjaGlsZF07XG4gIH1cbn1cbiJdfQ==