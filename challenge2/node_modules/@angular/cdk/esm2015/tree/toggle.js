/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, HostListener, Input } from '@angular/core';
import { CdkTree, CdkTreeNode } from './tree';
/**
 * Node toggle to expand/collapse the node.
 */
export class CdkTreeNodeToggle {
    constructor(_tree, _treeNode) {
        this._tree = _tree;
        this._treeNode = _treeNode;
        this._recursive = false;
    }
    /** Whether expand/collapse the node recursively. */
    get recursive() { return this._recursive; }
    set recursive(value) { this._recursive = coerceBooleanProperty(value); }
    // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
    // In Ivy the `host` bindings will be merged when this class is extended, whereas in
    // ViewEngine they're overwritten.
    // TODO(crisbeto): we move this back into `host` once Ivy is turned on by default.
    // tslint:disable-next-line:no-host-decorator-in-concrete
    _toggle(event) {
        this.recursive
            ? this._tree.treeControl.toggleDescendants(this._treeNode.data)
            : this._tree.treeControl.toggle(this._treeNode.data);
        event.stopPropagation();
    }
}
CdkTreeNodeToggle.decorators = [
    { type: Directive, args: [{ selector: '[cdkTreeNodeToggle]' },] }
];
CdkTreeNodeToggle.ctorParameters = () => [
    { type: CdkTree },
    { type: CdkTreeNode }
];
CdkTreeNodeToggle.propDecorators = {
    recursive: [{ type: Input, args: ['cdkTreeNodeToggleRecursive',] }],
    _toggle: [{ type: HostListener, args: ['click', ['$event'],] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay90cmVlL3RvZ2dsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQWUscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFN0QsT0FBTyxFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFFNUM7O0dBRUc7QUFFSCxNQUFNLE9BQU8saUJBQWlCO0lBTzVCLFlBQXNCLEtBQW9CLEVBQ3BCLFNBQTRCO1FBRDVCLFVBQUssR0FBTCxLQUFLLENBQWU7UUFDcEIsY0FBUyxHQUFULFNBQVMsQ0FBbUI7UUFIeEMsZUFBVSxHQUFHLEtBQUssQ0FBQztJQUd3QixDQUFDO0lBUHRELG9EQUFvRDtJQUNwRCxJQUNJLFNBQVMsS0FBYyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQ3BELElBQUksU0FBUyxDQUFDLEtBQWMsSUFBSSxJQUFJLENBQUMsVUFBVSxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQU1qRixvRkFBb0Y7SUFDcEYsb0ZBQW9GO0lBQ3BGLGtDQUFrQztJQUNsQyxrRkFBa0Y7SUFDbEYseURBQXlEO0lBRXpELE9BQU8sQ0FBQyxLQUFZO1FBQ2xCLElBQUksQ0FBQyxTQUFTO1lBQ1osQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQy9ELENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV2RCxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDMUIsQ0FBQzs7O1lBdkJGLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSxxQkFBcUIsRUFBQzs7O1lBTHBDLE9BQU87WUFBRSxXQUFXOzs7d0JBUXpCLEtBQUssU0FBQyw0QkFBNEI7c0JBYWxDLFlBQVksU0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7RGlyZWN0aXZlLCBIb3N0TGlzdGVuZXIsIElucHV0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtDZGtUcmVlLCBDZGtUcmVlTm9kZX0gZnJvbSAnLi90cmVlJztcblxuLyoqXG4gKiBOb2RlIHRvZ2dsZSB0byBleHBhbmQvY29sbGFwc2UgdGhlIG5vZGUuXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW2Nka1RyZWVOb2RlVG9nZ2xlXSd9KVxuZXhwb3J0IGNsYXNzIENka1RyZWVOb2RlVG9nZ2xlPFQsIEsgPSBUPiB7XG4gIC8qKiBXaGV0aGVyIGV4cGFuZC9jb2xsYXBzZSB0aGUgbm9kZSByZWN1cnNpdmVseS4gKi9cbiAgQElucHV0KCdjZGtUcmVlTm9kZVRvZ2dsZVJlY3Vyc2l2ZScpXG4gIGdldCByZWN1cnNpdmUoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9yZWN1cnNpdmU7IH1cbiAgc2V0IHJlY3Vyc2l2ZSh2YWx1ZTogYm9vbGVhbikgeyB0aGlzLl9yZWN1cnNpdmUgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpOyB9XG4gIHByb3RlY3RlZCBfcmVjdXJzaXZlID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIF90cmVlOiBDZGtUcmVlPFQsIEs+LFxuICAgICAgICAgICAgICBwcm90ZWN0ZWQgX3RyZWVOb2RlOiBDZGtUcmVlTm9kZTxULCBLPikge31cblxuICAvLyBXZSBoYXZlIHRvIHVzZSBhIGBIb3N0TGlzdGVuZXJgIGhlcmUgaW4gb3JkZXIgdG8gc3VwcG9ydCBib3RoIEl2eSBhbmQgVmlld0VuZ2luZS5cbiAgLy8gSW4gSXZ5IHRoZSBgaG9zdGAgYmluZGluZ3Mgd2lsbCBiZSBtZXJnZWQgd2hlbiB0aGlzIGNsYXNzIGlzIGV4dGVuZGVkLCB3aGVyZWFzIGluXG4gIC8vIFZpZXdFbmdpbmUgdGhleSdyZSBvdmVyd3JpdHRlbi5cbiAgLy8gVE9ETyhjcmlzYmV0byk6IHdlIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgIG9uY2UgSXZ5IGlzIHR1cm5lZCBvbiBieSBkZWZhdWx0LlxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcbiAgQEhvc3RMaXN0ZW5lcignY2xpY2snLCBbJyRldmVudCddKVxuICBfdG9nZ2xlKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIHRoaXMucmVjdXJzaXZlXG4gICAgICA/IHRoaXMuX3RyZWUudHJlZUNvbnRyb2wudG9nZ2xlRGVzY2VuZGFudHModGhpcy5fdHJlZU5vZGUuZGF0YSlcbiAgICAgIDogdGhpcy5fdHJlZS50cmVlQ29udHJvbC50b2dnbGUodGhpcy5fdHJlZU5vZGUuZGF0YSk7XG5cbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZWN1cnNpdmU6IEJvb2xlYW5JbnB1dDtcbn1cbiJdfQ==