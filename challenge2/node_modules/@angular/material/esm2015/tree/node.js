/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CDK_TREE_NODE_OUTLET_NODE, CdkNestedTreeNode, CdkTree, CdkTreeNode, CdkTreeNodeDef, } from '@angular/cdk/tree';
import { Attribute, Directive, ElementRef, Input, IterableDiffers, } from '@angular/core';
import { mixinDisabled, mixinTabIndex, } from '@angular/material/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
const _MatTreeNodeMixinBase = mixinTabIndex(mixinDisabled(CdkTreeNode));
/**
 * Wrapper for the CdkTree node with Material design styles.
 */
export class MatTreeNode extends _MatTreeNodeMixinBase {
    constructor(_elementRef, _tree, tabIndex) {
        super(_elementRef, _tree);
        this._elementRef = _elementRef;
        this._tree = _tree;
        this.tabIndex = Number(tabIndex) || 0;
        // The classes are directly added here instead of in the host property because classes on
        // the host property are not inherited with View Engine. It is not set as a @HostBinding because
        // it is not set by the time it's children nodes try to read the class from it.
        // TODO: move to host after View Engine deprecation
        this._elementRef.nativeElement.classList.add('mat-tree-node');
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
        super.ngOnDestroy();
    }
}
MatTreeNode.decorators = [
    { type: Directive, args: [{
                selector: 'mat-tree-node',
                exportAs: 'matTreeNode',
                inputs: ['role', 'disabled', 'tabIndex'],
                providers: [{ provide: CdkTreeNode, useExisting: MatTreeNode }]
            },] }
];
MatTreeNode.ctorParameters = () => [
    { type: ElementRef },
    { type: CdkTree },
    { type: String, decorators: [{ type: Attribute, args: ['tabindex',] }] }
];
/**
 * Wrapper for the CdkTree node definition with Material design styles.
 * Captures the node's template and a when predicate that describes when this node should be used.
 */
export class MatTreeNodeDef extends CdkTreeNodeDef {
}
MatTreeNodeDef.decorators = [
    { type: Directive, args: [{
                selector: '[matTreeNodeDef]',
                inputs: [
                    'when: matTreeNodeDefWhen'
                ],
                providers: [{ provide: CdkTreeNodeDef, useExisting: MatTreeNodeDef }]
            },] }
];
MatTreeNodeDef.propDecorators = {
    data: [{ type: Input, args: ['matTreeNode',] }]
};
/**
 * Wrapper for the CdkTree nested node with Material design styles.
 */
export class MatNestedTreeNode extends CdkNestedTreeNode {
    constructor(_elementRef, _tree, _differs, tabIndex) {
        super(_elementRef, _tree, _differs);
        this._elementRef = _elementRef;
        this._tree = _tree;
        this._differs = _differs;
        this._disabled = false;
        this.tabIndex = Number(tabIndex) || 0;
        // The classes are directly added here instead of in the host property because classes on
        // the host property are not inherited with View Engine. It is not set as a @HostBinding because
        // it is not set by the time it's children nodes try to read the class from it.
        // TODO: move to host after View Engine deprecation
        this._elementRef.nativeElement.classList.add('mat-nested-tree-node');
    }
    /** Whether the node is disabled. */
    get disabled() { return this._disabled; }
    set disabled(value) { this._disabled = coerceBooleanProperty(value); }
    /** Tabindex for the node. */
    get tabIndex() { return this.disabled ? -1 : this._tabIndex; }
    set tabIndex(value) {
        // If the specified tabIndex value is null or undefined, fall back to the default value.
        this._tabIndex = value != null ? value : 0;
    }
    // This is a workaround for https://github.com/angular/angular/issues/19145
    // In aot mode, the lifecycle hooks from parent class are not called.
    // TODO(tinayuangao): Remove when the angular issue #19145 is fixed
    ngOnInit() {
        super.ngOnInit();
    }
    ngDoCheck() {
        super.ngDoCheck();
    }
    ngAfterContentInit() {
        super.ngAfterContentInit();
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
MatNestedTreeNode.decorators = [
    { type: Directive, args: [{
                selector: 'mat-nested-tree-node',
                exportAs: 'matNestedTreeNode',
                inputs: ['role', 'disabled', 'tabIndex'],
                providers: [
                    { provide: CdkNestedTreeNode, useExisting: MatNestedTreeNode },
                    { provide: CdkTreeNode, useExisting: MatNestedTreeNode },
                    { provide: CDK_TREE_NODE_OUTLET_NODE, useExisting: MatNestedTreeNode }
                ]
            },] }
];
MatNestedTreeNode.ctorParameters = () => [
    { type: ElementRef },
    { type: CdkTree },
    { type: IterableDiffers },
    { type: String, decorators: [{ type: Attribute, args: ['tabindex',] }] }
];
MatNestedTreeNode.propDecorators = {
    node: [{ type: Input, args: ['matNestedTreeNode',] }],
    disabled: [{ type: Input }],
    tabIndex: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC90cmVlL25vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLHlCQUF5QixFQUN6QixpQkFBaUIsRUFDakIsT0FBTyxFQUNQLFdBQVcsRUFDWCxjQUFjLEdBQ2YsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLEVBRUwsU0FBUyxFQUNULFNBQVMsRUFFVCxVQUFVLEVBQ1YsS0FBSyxFQUNMLGVBQWUsR0FFaEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUtMLGFBQWEsRUFDYixhQUFhLEdBQ2QsTUFBTSx3QkFBd0IsQ0FBQztBQUNoQyxPQUFPLEVBQWUscUJBQXFCLEVBQWMsTUFBTSx1QkFBdUIsQ0FBQztBQUV2RixNQUFNLHFCQUFxQixHQUN2QixhQUFhLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFFOUM7O0dBRUc7QUFPSCxNQUFNLE9BQU8sV0FBc0IsU0FBUSxxQkFBMkI7SUFJcEUsWUFBc0IsV0FBb0MsRUFDcEMsS0FBb0IsRUFDUCxRQUFnQjtRQUNqRCxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBSE4sZ0JBQVcsR0FBWCxXQUFXLENBQXlCO1FBQ3BDLFVBQUssR0FBTCxLQUFLLENBQWU7UUFJeEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLHlGQUF5RjtRQUN6RixnR0FBZ0c7UUFDaEcsK0VBQStFO1FBQy9FLG1EQUFtRDtRQUNuRCxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRCwyRUFBMkU7SUFDM0UscUVBQXFFO0lBQ3JFLFFBQVE7UUFDTixLQUFLLENBQUMs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QUFNLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQztnQkFDeEMsU0FBUyxFQUFFO29CQUNULEVBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBQztvQkFDNUQsRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBQztvQkFDdEQsRUFBQyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFDO2lCQUNyRTthQUNGOzs7WUF6RkMsVUFBVTtZQVRWLE9BQU87WUFXUCxlQUFlO3lDQThHRixTQUFTLFNBQUMsVUFBVTs7O21CQXBCaEMsS0FBSyxTQUFDLG1CQUFtQjt1QkFHekIsS0FBSzt1QkFNTCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIENES19UUkVFX05PREVfT1VUTEVUX05PREUsXG4gIENka05lc3RlZFRyZWVOb2RlLFxuICBDZGtUcmVlLFxuICBDZGtUcmVlTm9kZSxcbiAgQ2RrVHJlZU5vZGVEZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay90cmVlJztcbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIEF0dHJpYnV0ZSxcbiAgRGlyZWN0aXZlLFxuICBEb0NoZWNrLFxuICBFbGVtZW50UmVmLFxuICBJbnB1dCxcbiAgSXRlcmFibGVEaWZmZXJzLFxuICBPbkRlc3Ryb3ksIE9uSW5pdCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICBDYW5EaXNhYmxlLFxuICBDYW5EaXNhYmxlQ3RvcixcbiAgSGFzVGFiSW5kZXgsXG4gIEhhc1RhYkluZGV4Q3RvcixcbiAgbWl4aW5EaXNhYmxlZCxcbiAgbWl4aW5UYWJJbmRleCxcbn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5LCBOdW1iZXJJbnB1dH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcblxuY29uc3QgX01hdFRyZWVOb2RlTWl4aW5CYXNlOiBIYXNUYWJJbmRleEN0b3IgJiBDYW5EaXNhYmxlQ3RvciAmIHR5cGVvZiBDZGtUcmVlTm9kZSA9XG4gICAgbWl4aW5UYWJJbmRleChtaXhpbkRpc2FibGVkKENka1RyZWVOb2RlKSk7XG5cbi8qKlxuICogV3JhcHBlciBmb3IgdGhlIENka1RyZWUgbm9kZSB3aXRoIE1hdGVyaWFsIGRlc2lnbiBzdHlsZXMuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ21hdC10cmVlLW5vZGUnLFxuICBleHBvcnRBczogJ21hdFRyZWVOb2RlJyxcbiAgaW5wdXRzOiBbJ3JvbGUnLCAnZGlzYWJsZWQnLCAndGFiSW5kZXgnXSxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IENka1RyZWVOb2RlLCB1c2VFeGlzdGluZzogTWF0VHJlZU5vZGV9XVxufSlcbmV4cG9ydCBjbGFzcyBNYXRUcmVlTm9kZTxULCBLID0gVD4gZXh0ZW5kcyBfTWF0VHJlZU5vZGVNaXhpbkJhc2U8VCwgSz5cbiAgICBpbXBsZW1lbnRzIENhbkRpc2FibGUsIERvQ2hlY2ssIEhhc1RhYkluZGV4LCBPbkluaXQsIE9uRGVzdHJveSB7XG5cblxuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgICAgICAgICAgICBwcm90ZWN0ZWQgX3RyZWU6IENka1RyZWU8VCwgSz4sXG4gICAgICAgICAgICAgIEBBdHRyaWJ1dGUoJ3RhYmluZGV4JykgdGFiSW5kZXg6IHN0cmluZykge1xuICAgIHN1cGVyKF9lbGVtZW50UmVmLCBfdHJlZSk7XG5cbiAgICB0aGlzLnRhYkluZGV4ID0gTnVtYmVyKHRhYkluZGV4KSB8fCAwO1xuICAgIC8vIFRoZSBjbGFzc2VzIGFyZSBkaXJlY3RseSBhZGRlZCBoZXJlIGluc3RlYWQgb2YgaW4gdGhlIGhvc3QgcHJvcGVydHkgYmVjYXVzZSBjbGFzc2VzIG9uXG4gICAgLy8gdGhlIGhvc3QgcHJvcGVydHkgYXJlIG5vdCBpbmhlcml0ZWQgd2l0aCBWaWV3IEVuZ2luZS4gSXQgaXMgbm90IHNldCBhcyBhIEBIb3N0QmluZGluZyBiZWNhdXNlXG4gICAgLy8gaXQgaXMgbm90IHNldCBieSB0aGUgdGltZSBpdCdzIGNoaWxkcmVuIG5vZGVzIHRyeSB0byByZWFkIHRoZSBjbGFzcyBmcm9tIGl0LlxuICAgIC8vIFRPRE86IG1vdmUgdG8gaG9zdCBhZnRlciBWaWV3IEVuZ2luZSBkZXByZWNhdGlvblxuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdtYXQtdHJlZS1ub2RlJyk7XG4gIH1cblxuICAvLyBUaGlzIGlzIGEgd29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMjMwOTFcbiAgLy8gSW4gYW90IG1vZGUsIHRoZSBsaWZlY3ljbGUgaG9va3MgZnJvbSBwYXJlbnQgY2xhc3MgYXJlIG5vdCBjYWxsZWQuXG4gIG5nT25Jbml0KCkge1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7XG4gICAgc3VwZXIubmdEb0NoZWNrKCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Rpc2FibGVkOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV90YWJJbmRleDogTnVtYmVySW5wdXQ7XG59XG5cbi8qKlxuICogV3JhcHBlciBmb3IgdGhlIENka1RyZWUgbm9kZSBkZWZpbml0aW9uIHdpdGggTWF0ZXJpYWwgZGVzaWduIHN0eWxlcy5cbiAqIENhcHR1cmVzIHRoZSBub2RlJ3MgdGVtcGxhdGUgYW5kIGEgd2hlbiBwcmVkaWNhdGUgdGhhdCBkZXNjcmliZXMgd2hlbiB0aGlzIG5vZGUgc2hvdWxkIGJlIHVzZWQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXRUcmVlTm9kZURlZl0nLFxuICBpbnB1dHM6IFtcbiAgICAnd2hlbjogbWF0VHJlZU5vZGVEZWZXaGVuJ1xuICBdLFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogQ2RrVHJlZU5vZGVEZWYsIHVzZUV4aXN0aW5nOiBNYXRUcmVlTm9kZURlZn1dXG59KVxuZXhwb3J0IGNsYXNzIE1hdFRyZWVOb2RlRGVmPFQ+IGV4dGVuZHMgQ2RrVHJlZU5vZGVEZWY8VD4ge1xuICBASW5wdXQoJ21hdFRyZWVOb2RlJykgZGF0YTogVDtcbn1cblxuLyoqXG4gKiBXcmFwcGVyIGZvciB0aGUgQ2RrVHJlZSBuZXN0ZWQgbm9kZSB3aXRoIE1hdGVyaWFsIGRlc2lnbiBzdHlsZXMuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ21hdC1uZXN0ZWQtdHJlZS1ub2RlJyxcbiAgZXhwb3J0QXM6ICdtYXROZXN0ZWRUcmVlTm9kZScsXG4gIGlucHV0czogWydyb2xlJywgJ2Rpc2FibGVkJywgJ3RhYkluZGV4J10sXG4gIHByb3ZpZGVyczogW1xuICAgIHtwcm92aWRlOiBDZGtOZXN0ZWRUcmVlTm9kZSwgdXNlRXhpc3Rpbmc6IE1hdE5lc3RlZFRyZWVOb2RlfSxcbiAgICB7cHJvdmlkZTogQ2RrVHJlZU5vZGUsIHVzZUV4aXN0aW5nOiBNYXROZXN0ZWRUcmVlTm9kZX0sXG4gICAge3Byb3ZpZGU6IENES19UUkVFX05PREVfT1VUTEVUX05PREUsIHVzZUV4aXN0aW5nOiBNYXROZXN0ZWRUcmVlTm9kZX1cbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBNYXROZXN0ZWRUcmVlTm9kZTxULCBLID0gVD4gZXh0ZW5kcyBDZGtOZXN0ZWRUcmVlTm9kZTxULCBLPlxuICAgIGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgRG9DaGVjaywgT25EZXN0cm95LCBPbkluaXQge1xuICBASW5wdXQoJ21hdE5lc3RlZFRyZWVOb2RlJykgbm9kZTogVDtcblxuICAvKiogV2hldGhlciB0aGUgbm9kZSBpcyBkaXNhYmxlZC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGRpc2FibGVkKCkgeyByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7IH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBhbnkpIHsgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpOyB9XG4gIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgLyoqIFRhYmluZGV4IGZvciB0aGUgbm9kZS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHRhYkluZGV4KCk6IG51bWJlciB7IHJldHVybiB0aGlzLmRpc2FibGVkID8gLTEgOiB0aGlzLl90YWJJbmRleDsgfVxuICBzZXQgdGFiSW5kZXgodmFsdWU6IG51bWJlcikge1xuICAgIC8vIElmIHRoZSBzcGVjaWZpZWQgdGFiSW5kZXggdmFsdWUgaXMgbnVsbCBvciB1bmRlZmluZWQsIGZhbGwgYmFjayB0byB0aGUgZGVmYXVsdCB2YWx1ZS5cbiAgICB0aGlzLl90YWJJbmRleCA9IHZhbHVlICE9IG51bGwgPyB2YWx1ZSA6IDA7XG4gIH1cbiAgcHJpdmF0ZSBfdGFiSW5kZXg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgICAgICAgICAgICBwcm90ZWN0ZWQgX3RyZWU6IENka1RyZWU8VCwgSz4sXG4gICAgICAgICAgICAgIHByb3RlY3RlZCBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzLFxuICAgICAgICAgICAgICBAQXR0cmlidXRlKCd0YWJpbmRleCcpIHRhYkluZGV4OiBzdHJpbmcpIHtcbiAgICBzdXBlcihfZWxlbWVudFJlZiwgX3RyZWUsIF9kaWZmZXJzKTtcbiAgICB0aGlzLnRhYkluZGV4ID0gTnVtYmVyKHRhYkluZGV4KSB8fCAwO1xuICAgIC8vIFRoZSBjbGFzc2VzIGFyZSBkaXJlY3RseSBhZGRlZCBoZXJlIGluc3RlYWQgb2YgaW4gdGhlIGhvc3QgcHJvcGVydHkgYmVjYXVzZSBjbGFzc2VzIG9uXG4gICAgLy8gdGhlIGhvc3QgcHJvcGVydHkgYXJlIG5vdCBpbmhlcml0ZWQgd2l0aCBWaWV3IEVuZ2luZS4gSXQgaXMgbm90IHNldCBhcyBhIEBIb3N0QmluZGluZyBiZWNhdXNlXG4gICAgLy8gaXQgaXMgbm90IHNldCBieSB0aGUgdGltZSBpdCdzIGNoaWxkcmVuIG5vZGVzIHRyeSB0byByZWFkIHRoZSBjbGFzcyBmcm9tIGl0LlxuICAgIC8vIFRPRE86IG1vdmUgdG8gaG9zdCBhZnRlciBWaWV3IEVuZ2luZSBkZXByZWNhdGlvblxuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdtYXQtbmVzdGVkLXRyZWUtbm9kZScpO1xuICB9XG5cbiAgLy8gVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzE5MTQ1XG4gIC8vIEluIGFvdCBtb2RlLCB0aGUgbGlmZWN5Y2xlIGhvb2tzIGZyb20gcGFyZW50IGNsYXNzIGFyZSBub3QgY2FsbGVkLlxuICAvLyBUT0RPKHRpbmF5dWFuZ2FvKTogUmVtb3ZlIHdoZW4gdGhlIGFuZ3VsYXIgaXNzdWUgIzE5MTQ1IGlzIGZpeGVkXG4gIG5nT25Jbml0KCkge1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7XG4gICAgc3VwZXIubmdEb0NoZWNrKCk7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgc3VwZXIubmdBZnRlckNvbnRlbnRJbml0KCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Rpc2FibGVkOiBCb29sZWFuSW5wdXQ7XG59XG4iXX0=