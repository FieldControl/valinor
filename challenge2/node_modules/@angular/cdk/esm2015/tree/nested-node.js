/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ContentChildren, Directive, ElementRef, IterableDiffers, QueryList, } from '@angular/core';
import { isObservable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CDK_TREE_NODE_OUTLET_NODE, CdkTreeNodeOutlet } from './outlet';
import { CdkTree, CdkTreeNode } from './tree';
import { getTreeControlFunctionsMissingError } from './tree-errors';
/**
 * Nested node is a child of `<cdk-tree>`. It works with nested tree.
 * By using `cdk-nested-tree-node` component in tree node template, children of the parent node will
 * be added in the `cdkTreeNodeOutlet` in tree node template.
 * The children of node will be automatically added to `cdkTreeNodeOutlet`.
 */
export class CdkNestedTreeNode extends CdkTreeNode {
    constructor(_elementRef, _tree, _differs) {
        super(_elementRef, _tree);
        this._elementRef = _elementRef;
        this._tree = _tree;
        this._differs = _differs;
        // The classes are directly added here instead of in the host property because classes on
        // the host property are not inherited with View Engine. It is not set as a @HostBinding because
        // it is not set by the time it's children nodes try to read the class from it.
        // TODO: move to host after View Engine deprecation
        this._elementRef.nativeElement.classList.add('cdk-nested-tree-node');
    }
    ngAfterContentInit() {
        this._dataDiffer = this._differs.find([]).create(this._tree.trackBy);
        if (!this._tree.treeControl.getChildren && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getTreeControlFunctionsMissingError();
        }
        const childrenNodes = this._tree.treeControl.getChildren(this.data);
        if (Array.isArray(childrenNodes)) {
            this.updateChildrenNodes(childrenNodes);
        }
        else if (isObservable(childrenNodes)) {
            childrenNodes.pipe(takeUntil(this._destroyed))
                .subscribe(result => this.updateChildrenNodes(result));
        }
        this.nodeOutlet.changes.pipe(takeUntil(this._destroyed))
            .subscribe(() => this.updateChildrenNodes());
    }
    // This is a workaround for https://github.com/angular/angular/issues/23091
    // In aot mode, the lifecycle hooks from parent class are not called.
    ngOnInit() {
        super.ngOnInit();
    }
    ngDoCheck() {
        super.ngDoCheck();
    }
    ngOnDestroy() {
        this._clear();
        super.ngOnDestroy();
    }
    /** Add children dataNodes to the NodeOutlet */
    updateChildrenNodes(children) {
        const outlet = this._getNodeOutlet();
        if (children) {
            this._children = children;
        }
        if (outlet && this._children) {
            const viewContainer = outlet.viewContainer;
            this._tree.renderNodeChanges(this._children, this._dataDiffer, viewContainer, this._data);
        }
        else {
            // Reset the data differ if there's no children nodes displayed
            this._dataDiffer.diff([]);
        }
    }
    /** Clear the children dataNodes. */
    _clear() {
        const outlet = this._getNodeOutlet();
        if (outlet) {
            outlet.viewContainer.clear();
            this._dataDiffer.diff([]);
        }
    }
    /** Gets the outlet for the current node. */
    _getNodeOutlet() {
        const outlets = this.nodeOutlet;
        // Note that since we use `descendants: true` on the query, we have to ensure
        // that we don't pick up the outlet of a child node by accident.
        return outlets && outlets.find(outlet => !outlet._node || outlet._node === this);
    }
}
CdkNestedTreeNode.decorators = [
    { type: Directive, args: [{
                selector: 'cdk-nested-tree-node',
                exportAs: 'cdkNestedTreeNode',
                inputs: ['role', 'disabled', 'tabIndex'],
                providers: [
                    { provide: CdkTreeNode, useExisting: CdkNestedTreeNode },
                    { provide: CDK_TREE_NODE_OUTLET_NODE, useExisting: CdkNestedTreeNode }
                ]
            },] }
];
CdkNestedTreeNode.ctorParameters = () => [
    { type: ElementRef },
    { type: CdkTree },
    { type: IterableDiffers }
];
CdkNestedTreeNode.propDecorators = {
    nodeOutlet: [{ type: ContentChildren, args: [CdkTreeNodeOutlet, {
                    // We need to use `descendants: true`, because Ivy will no longer match
                    // indirect descendants if it's left as false.
                    descendants: true
                },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVzdGVkLW5vZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3RyZWUvbmVzdGVkLW5vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUVMLGVBQWUsRUFDZixTQUFTLEVBRVQsVUFBVSxFQUVWLGVBQWUsRUFHZixTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNsQyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFekMsT0FBTyxFQUFDLHlCQUF5QixFQUFFLGlCQUFpQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ3RFLE9BQU8sRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBQzVDLE9BQU8sRUFBQyxtQ0FBbUMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUVsRTs7Ozs7R0FLRztBQVVILE1BQU0sT0FBTyxpQkFBNEIsU0FBUSxXQUFpQjtJQWdCaEUsWUFBc0IsV0FBb0MsRUFDcEMsS0FBb0IsRUFDcEIsUUFBeUI7UUFDN0MsS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUhOLGdCQUFXLEdBQVgsV0FBVyxDQUF5QjtRQUNwQyxVQUFLLEdBQUwsS0FBSyxDQUFlO1FBQ3BCLGFBQVEsR0FBUixRQUFRLENBQWlCO1FBRTdDLHlGQUF5RjtRQUN6RixnR0FBZ0c7UUFDaEcsK0VBQStFO1FBQy9FLG1EQUFtRDtRQUNuRCxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0s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QUUsbUJBQW1CO2dCQUM3QixNQUFNLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQztnQkFDeEMsU0FBUyxFQUFFO29CQUNULEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUM7b0JBQ3RELEVBQUMsT0FBTyxFQUFFLHlCQUF5QixFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBQztpQkFDckU7YUFDRjs7O1lBNUJDLFVBQVU7WUFXSixPQUFPO1lBVGIsZUFBZTs7O3lCQW9DZCxlQUFlLFNBQUMsaUJBQWlCLEVBQUU7b0JBQ2xDLHVFQUF1RTtvQkFDdkUsOENBQThDO29CQUM5QyxXQUFXLEVBQUUsSUFBSTtpQkFDbEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIENvbnRlbnRDaGlsZHJlbixcbiAgRGlyZWN0aXZlLFxuICBEb0NoZWNrLFxuICBFbGVtZW50UmVmLFxuICBJdGVyYWJsZURpZmZlcixcbiAgSXRlcmFibGVEaWZmZXJzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgUXVlcnlMaXN0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7aXNPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcbmltcG9ydCB7dGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7Q0RLX1RSRUVfTk9ERV9PVVRMRVRfTk9ERSwgQ2RrVHJlZU5vZGVPdXRsZXR9IGZyb20gJy4vb3V0bGV0JztcbmltcG9ydCB7Q2RrVHJlZSwgQ2RrVHJlZU5vZGV9IGZyb20gJy4vdHJlZSc7XG5pbXBvcnQge2dldFRyZWVDb250cm9sRnVuY3Rpb25zTWlzc2luZ0Vycm9yfSBmcm9tICcuL3RyZWUtZXJyb3JzJztcblxuLyoqXG4gKiBOZXN0ZWQgbm9kZSBpcyBhIGNoaWxkIG9mIGA8Y2RrLXRyZWU+YC4gSXQgd29ya3Mgd2l0aCBuZXN0ZWQgdHJlZS5cbiAqIEJ5IHVzaW5nIGBjZGstbmVzdGVkLXRyZWUtbm9kZWAgY29tcG9uZW50IGluIHRyZWUgbm9kZSB0ZW1wbGF0ZSwgY2hpbGRyZW4gb2YgdGhlIHBhcmVudCBub2RlIHdpbGxcbiAqIGJlIGFkZGVkIGluIHRoZSBgY2RrVHJlZU5vZGVPdXRsZXRgIGluIHRyZWUgbm9kZSB0ZW1wbGF0ZS5cbiAqIFRoZSBjaGlsZHJlbiBvZiBub2RlIHdpbGwgYmUgYXV0b21hdGljYWxseSBhZGRlZCB0byBgY2RrVHJlZU5vZGVPdXRsZXRgLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdjZGstbmVzdGVkLXRyZWUtbm9kZScsXG4gIGV4cG9ydEFzOiAnY2RrTmVzdGVkVHJlZU5vZGUnLFxuICBpbnB1dHM6IFsncm9sZScsICdkaXNhYmxlZCcsICd0YWJJbmRleCddLFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogQ2RrVHJlZU5vZGUsIHVzZUV4aXN0aW5nOiBDZGtOZXN0ZWRUcmVlTm9kZX0sXG4gICAge3Byb3ZpZGU6IENES19UUkVFX05PREVfT1VUTEVUX05PREUsIHVzZUV4aXN0aW5nOiBDZGtOZXN0ZWRUcmVlTm9kZX1cbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBDZGtOZXN0ZWRUcmVlTm9kZTxULCBLID0gVD4gZXh0ZW5kcyBDZGtUcmVlTm9kZTxULCBLPlxuICAgIGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgRG9DaGVjaywgT25EZXN0cm95LCBPbkluaXQge1xuICAvKiogRGlmZmVyIHVzZWQgdG8gZmluZCB0aGUgY2hhbmdlcyBpbiB0aGUgZGF0YSBwcm92aWRlZCBieSB0aGUgZGF0YSBzb3VyY2UuICovXG4gIHByaXZhdGUgX2RhdGFEaWZmZXI6IEl0ZXJhYmxlRGlmZmVyPFQ+O1xuXG4gIC8qKiBUaGUgY2hpbGRyZW4gZGF0YSBkYXRhTm9kZXMgb2YgY3VycmVudCBub2RlLiBUaGV5IHdpbGwgYmUgcGxhY2VkIGluIGBDZGtUcmVlTm9kZU91dGxldGAuICovXG4gIHByb3RlY3RlZCBfY2hpbGRyZW46IFRbXTtcblxuICAvKiogVGhlIGNoaWxkcmVuIG5vZGUgcGxhY2Vob2xkZXIuICovXG4gIEBDb250ZW50Q2hpbGRyZW4oQ2RrVHJlZU5vZGVPdXRsZXQsIHtcbiAgICAvLyBXZSBuZWVkIHRvIHVzZSBgZGVzY2VuZGFudHM6IHRydWVgLCBiZWNhdXNlIEl2eSB3aWxsIG5vIGxvbmdlciBtYXRjaFxuICAgIC8vIGluZGlyZWN0IGRlc2NlbmRhbnRzIGlmIGl0J3MgbGVmdCBhcyBmYWxzZS5cbiAgICBkZXNjZW5kYW50czogdHJ1ZVxuICB9KVxuICBub2RlT3V0bGV0OiBRdWVyeUxpc3Q8Q2RrVHJlZU5vZGVPdXRsZXQ+O1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgICAgICAgICAgIHByb3RlY3RlZCBfdHJlZTogQ2RrVHJlZTxULCBLPixcbiAgICAgICAgICAgICAgcHJvdGVjdGVkIF9kaWZmZXJzOiBJdGVyYWJsZURpZmZlcnMpIHtcbiAgICBzdXBlcihfZWxlbWVudFJlZiwgX3RyZWUpO1xuICAgIC8vIFRoZSBjbGFzc2VzIGFyZSBkaXJlY3RseSBhZGRlZCBoZXJlIGluc3RlYWQgb2YgaW4gdGhlIGhvc3QgcHJvcGVydHkgYmVjYXVzZSBjbGFzc2VzIG9uXG4gICAgLy8gdGhlIGhvc3QgcHJvcGVydHkgYXJlIG5vdCBpbmhlcml0ZWQgd2l0aCBWaWV3IEVuZ2luZS4gSXQgaXMgbm90IHNldCBhcyBhIEBIb3N0QmluZGluZyBiZWNhdXNlXG4gICAgLy8gaXQgaXMgbm90IHNldCBieSB0aGUgdGltZSBpdCdzIGNoaWxkcmVuIG5vZGVzIHRyeSB0byByZWFkIHRoZSBjbGFzcyBmcm9tIGl0LlxuICAgIC8vIFRPRE86IG1vdmUgdG8gaG9zdCBhZnRlciBWaWV3IEVuZ2luZSBkZXByZWNhdGlvblxuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjZGstbmVzdGVkLXRyZWUtbm9kZScpO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHRoaXMuX2RhdGFEaWZmZXIgPSB0aGlzLl9kaWZmZXJzLmZpbmQoW10pLmNyZWF0ZSh0aGlzLl90cmVlLnRyYWNrQnkpO1xuICAgIGlmICghdGhpcy5fdHJlZS50cmVlQ29udHJvbC5nZXRDaGlsZHJlbiAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgZ2V0VHJlZUNvbnRyb2xGdW5jdGlvbnNNaXNzaW5nRXJyb3IoKTtcbiAgICB9XG4gICAgY29uc3QgY2hpbGRyZW5Ob2RlcyA9IHRoaXMuX3RyZWUudHJlZUNvbnRyb2wuZ2V0Q2hpbGRyZW4odGhpcy5kYXRhKTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShjaGlsZHJlbk5vZGVzKSkge1xuICAgICAgdGhpcy51cGRhdGVDaGlsZHJlbk5vZGVzKGNoaWxkcmVuTm9kZXMgYXMgVFtdKTtcbiAgICB9IGVsc2UgaWYgKGlzT2JzZXJ2YWJsZShjaGlsZHJlbk5vZGVzKSkge1xuICAgICAgY2hpbGRyZW5Ob2Rlcy5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKVxuICAgICAgICAuc3Vic2NyaWJlKHJlc3VsdCA9PiB0aGlzLnVwZGF0ZUNoaWxkcmVuTm9kZXMocmVzdWx0KSk7XG4gICAgfVxuICAgIHRoaXMubm9kZU91dGxldC5jaGFuZ2VzLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpXG4gICAgICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy51cGRhdGVDaGlsZHJlbk5vZGVzKCkpO1xuICB9XG5cbiAgLy8gVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzIzMDkxXG4gIC8vIEluIGFvdCBtb2RlLCB0aGUgbGlmZWN5Y2xlIGhvb2tzIGZyb20gcGFyZW50IGNsYXNzIGFyZSBub3QgY2FsbGVkLlxuICBuZ09uSW5pdCgpIHtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cbiAgbmdEb0NoZWNrKCkge1xuICAgIHN1cGVyLm5nRG9DaGVjaygpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fY2xlYXIoKTtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cbiAgLyoqIEFkZCBjaGlsZHJlbiBkYXRhTm9kZXMgdG8gdGhlIE5vZGVPdXRsZXQgKi9cbiAgcHJvdGVjdGVkIHVwZGF0ZUNoaWxkcmVuTm9kZXMoY2hpbGRyZW4/OiBUW10pOiB2b2lkIHtcbiAgICBjb25zdCBvdXRsZXQgPSB0aGlzLl9nZXROb2RlT3V0bGV0KCk7XG4gICAgaWYgKGNoaWxkcmVuKSB7XG4gICAgICB0aGlzLl9jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgIH1cbiAgICBpZiAob3V0bGV0ICYmIHRoaXMuX2NoaWxkcmVuKSB7XG4gICAgICBjb25zdCB2aWV3Q29udGFpbmVyID0gb3V0bGV0LnZpZXdDb250YWluZXI7XG4gICAgICB0aGlzLl90cmVlLnJlbmRlck5vZGVDaGFuZ2VzKHRoaXMuX2NoaWxkcmVuLCB0aGlzLl9kYXRhRGlmZmVyLCB2aWV3Q29udGFpbmVyLCB0aGlzLl9kYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUmVzZXQgdGhlIGRhdGEgZGlmZmVyIGlmIHRoZXJlJ3Mgbm8gY2hpbGRyZW4gbm9kZXMgZGlzcGxheWVkXG4gICAgICB0aGlzLl9kYXRhRGlmZmVyLmRpZmYoW10pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDbGVhciB0aGUgY2hpbGRyZW4gZGF0YU5vZGVzLiAqL1xuICBwcm90ZWN0ZWQgX2NsZWFyKCk6IHZvaWQge1xuICAgIGNvbnN0IG91dGxldCA9IHRoaXMuX2dldE5vZGVPdXRsZXQoKTtcbiAgICBpZiAob3V0bGV0KSB7XG4gICAgICBvdXRsZXQudmlld0NvbnRhaW5lci5jbGVhcigpO1xuICAgICAgdGhpcy5fZGF0YURpZmZlci5kaWZmKFtdKTtcbiAgICB9XG4gIH1cblxuICAvKiogR2V0cyB0aGUgb3V0bGV0IGZvciB0aGUgY3VycmVudCBub2RlLiAqL1xuICBwcml2YXRlIF9nZXROb2RlT3V0bGV0KCkge1xuICAgIGNvbnN0IG91dGxldHMgPSB0aGlzLm5vZGVPdXRsZXQ7XG5cbiAgICAvLyBOb3RlIHRoYXQgc2luY2Ugd2UgdXNlIGBkZXNjZW5kYW50czogdHJ1ZWAgb24gdGhlIHF1ZXJ5LCB3ZSBoYXZlIHRvIGVuc3VyZVxuICAgIC8vIHRoYXQgd2UgZG9uJ3QgcGljayB1cCB0aGUgb3V0bGV0IG9mIGEgY2hpbGQgbm9kZSBieSBhY2NpZGVudC5cbiAgICByZXR1cm4gb3V0bGV0cyAmJiBvdXRsZXRzLmZpbmQob3V0bGV0ID0+ICFvdXRsZXQuX25vZGUgfHwgb3V0bGV0Ll9ub2RlID09PSB0aGlzKTtcbiAgfVxufVxuIl19