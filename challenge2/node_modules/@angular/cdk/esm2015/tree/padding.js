/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { Directive, ElementRef, Input, Optional } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CdkTree, CdkTreeNode } from './tree';
/** Regex used to split a string on its CSS units. */
const cssUnitPattern = /([A-Za-z%]+)$/;
/**
 * Indent for the children tree dataNodes.
 * This directive will add left-padding to the node to show hierarchy.
 */
export class CdkTreeNodePadding {
    constructor(_treeNode, _tree, _element, _dir) {
        this._treeNode = _treeNode;
        this._tree = _tree;
        this._element = _element;
        this._dir = _dir;
        /** Subject that emits when the component has been destroyed. */
        this._destroyed = new Subject();
        /** CSS units used for the indentation value. */
        this.indentUnits = 'px';
        this._indent = 40;
        this._setPadding();
        if (_dir) {
            _dir.change.pipe(takeUntil(this._destroyed)).subscribe(() => this._setPadding(true));
        }
        // In Ivy the indentation binding might be set before the tree node's data has been added,
        // which means that we'll miss the first render. We have to subscribe to changes in the
        // data to ensure that everything is up to date.
        _treeNode._dataChanges.subscribe(() => this._setPadding());
    }
    /** The level of depth of the tree node. The padding will be `level * indent` pixels. */
    get level() { return this._level; }
    set level(value) { this._setLevelInput(value); }
    /**
     * The indent for each level. Can be a number or a CSS string.
     * Default number 40px from material design menu sub-menu spec.
     */
    get indent() { return this._indent; }
    set indent(indent) { this._setIndentInput(indent); }
    ngOnDestroy() {
        this._destroyed.next();
        this._destroyed.complete();
    }
    /** The padding indent value for the tree node. Returns a string with px numbers if not null. */
    _paddingIndent() {
        const nodeLevel = (this._treeNode.data && this._tree.treeControl.getLevel)
            ? this._tree.treeControl.getLevel(this._treeNode.data)
            : null;
        const level = this._level == null ? nodeLevel : this._level;
        return typeof level === 'number' ? `${level * this._indent}${this.indentUnits}` : null;
    }
    _setPadding(forceChange = false) {
        const padding = this._paddingIndent();
        if (padding !== this._currentPadding || forceChange) {
            const element = this._element.nativeElement;
            const paddingProp = this._dir && this._dir.value === 'rtl' ? 'paddingRight' : 'paddingLeft';
            const resetProp = paddingProp === 'paddingLeft' ? 'paddingRight' : 'paddingLeft';
            element.style[paddingProp] = padding || '';
            element.style[resetProp] = '';
            this._currentPadding = padding;
        }
    }
    /**
     * This has been extracted to a util because of TS 4 and VE.
     * View Engine doesn't support property rename inheritance.
     * TS 4.0 doesn't allow properties to override accessors or vice-versa.
     * @docs-private
     */
    _setLevelInput(value) {
        // Set to null as the fallback value so that _setPadding can fall back to the node level if the
        // consumer set the directive as `cdkTreeNodePadding=""`. We still want to take this value if
        // they set 0 explicitly.
        this._level = coerceNumberProperty(value, null);
        this._setPadding();
    }
    /**
     * This has been extracted to a util because of TS 4 and VE.
     * View Engine doesn't support property rename inheritance.
     * TS 4.0 doesn't allow properties to override accessors or vice-versa.
     * @docs-private
     */
    _setIndentInput(indent) {
        let value = indent;
        let units = 'px';
        if (typeof indent === 'string') {
            const parts = indent.split(cssUnitPattern);
            value = parts[0];
            units = parts[1] || units;
        }
        this.indentUnits = units;
        this._indent = coerceNumberProperty(value);
        this._setPadding();
    }
}
CdkTreeNodePadding.decorators = [
    { type: Directive, args: [{
                selector: '[cdkTreeNodePadding]',
            },] }
];
CdkTreeNodePadding.ctorParameters = () => [
    { type: CdkTreeNode },
    { type: CdkTree },
    { type: ElementRef },
    { type: Directionality, decorators: [{ type: Optional }] }
];
CdkTreeNodePadding.propDecorators = {
    level: [{ type: Input, args: ['cdkTreeNodePadding',] }],
    indent: [{ type: Input, args: ['cdkTreeNodePaddingIndent',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFkZGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdHJlZS9wYWRkaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsb0JBQW9CLEVBQWMsTUFBTSx1QkFBdUIsQ0FBQztBQUN4RSxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQWEsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2hGLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6QyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzdCLE9BQU8sRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBRTVDLHFEQUFxRDtBQUNyRCxNQUFNLGNBQWMsR0FBRyxlQUFlLENBQUM7QUFFdkM7OztHQUdHO0FBSUgsTUFBTSxPQUFPLGtCQUFrQjtJQXlCN0IsWUFBb0IsU0FBNEIsRUFDNUIsS0FBb0IsRUFDcEIsUUFBaUMsRUFDckIsSUFBb0I7UUFIaEMsY0FBUyxHQUFULFNBQVMsQ0FBbUI7UUFDNUIsVUFBSyxHQUFMLEtBQUssQ0FBZTtRQUNwQixhQUFRLEdBQVIsUUFBUSxDQUF5QjtRQUNyQixTQUFJLEdBQUosSUFBSSxDQUFnQjtRQXhCcEQsZ0VBQWdFO1FBQy9DLGVBQVUsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBRWxELGdEQUFnRDtRQUNoRCxnQkFBVyxHQUFHLElBQUksQ0FBQztRQWVuQixZQUFPLEdBQVcsRUFBRSxDQUFDO1FBTW5CLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNuQixJQUFJLElBQUksRUFBRTtZQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMs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Q0FBQztJQUVEOzs7OztPQUtHO0lBQ08sZUFBZSxDQUFDLE1BQXVCO1FBQy9DLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQztRQUNuQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7UUFFakIsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7WUFDOUIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUMzQyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDO1NBQzNCO1FBRUQsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDekIsSUFBSSxDQUFDLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDckIsQ0FBQzs7O1lBdkdGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsc0JBQXNCO2FBQ2pDOzs7WUFYZ0IsV0FBVztZQUFwQixPQUFPO1lBSEksVUFBVTtZQUZyQixjQUFjLHVCQTZDUCxRQUFROzs7b0JBakJwQixLQUFLLFNBQUMsb0JBQW9CO3FCQVMxQixLQUFLLFNBQUMsMEJBQTBCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7Y29lcmNlTnVtYmVyUHJvcGVydHksIE51bWJlcklucHV0fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIElucHV0LCBPbkRlc3Ryb3ksIE9wdGlvbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7dGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtDZGtUcmVlLCBDZGtUcmVlTm9kZX0gZnJvbSAnLi90cmVlJztcblxuLyoqIFJlZ2V4IHVzZWQgdG8gc3BsaXQgYSBzdHJpbmcgb24gaXRzIENTUyB1bml0cy4gKi9cbmNvbnN0IGNzc1VuaXRQYXR0ZXJuID0gLyhbQS1aYS16JV0rKSQvO1xuXG4vKipcbiAqIEluZGVudCBmb3IgdGhlIGNoaWxkcmVuIHRyZWUgZGF0YU5vZGVzLlxuICogVGhpcyBkaXJlY3RpdmUgd2lsbCBhZGQgbGVmdC1wYWRkaW5nIHRvIHRoZSBub2RlIHRvIHNob3cgaGllcmFyY2h5LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrVHJlZU5vZGVQYWRkaW5nXScsXG59KVxuZXhwb3J0IGNsYXNzIENka1RyZWVOb2RlUGFkZGluZzxULCBLID0gVD4gaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogQ3VycmVudCBwYWRkaW5nIHZhbHVlIGFwcGxpZWQgdG8gdGhlIGVsZW1lbnQuIFVzZWQgdG8gYXZvaWQgdW5uZWNlc3NhcmlseSBoaXR0aW5nIHRoZSBET00uICovXG4gIHByaXZhdGUgX2N1cnJlbnRQYWRkaW5nOiBzdHJpbmd8bnVsbDtcblxuICAvKiogU3ViamVjdCB0aGF0IGVtaXRzIHdoZW4gdGhlIGNvbXBvbmVudCBoYXMgYmVlbiBkZXN0cm95ZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2Rlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqIENTUyB1bml0cyB1c2VkIGZvciB0aGUgaW5kZW50YXRpb24gdmFsdWUuICovXG4gIGluZGVudFVuaXRzID0gJ3B4JztcblxuICAvKiogVGhlIGxldmVsIG9mIGRlcHRoIG9mIHRoZSB0cmVlIG5vZGUuIFRoZSBwYWRkaW5nIHdpbGwgYmUgYGxldmVsICogaW5kZW50YCBwaXhlbHMuICovXG4gIEBJbnB1dCgnY2RrVHJlZU5vZGVQYWRkaW5nJylcbiAgZ2V0IGxldmVsKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9sZXZlbDsgfVxuICBzZXQgbGV2ZWwodmFsdWU6IG51bWJlcikgeyB0aGlzLl9zZXRMZXZlbElucHV0KHZhbHVlKTsgfVxuICBfbGV2ZWw6IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIGluZGVudCBmb3IgZWFjaCBsZXZlbC4gQ2FuIGJlIGEgbnVtYmVyIG9yIGEgQ1NTIHN0cmluZy5cbiAgICogRGVmYXVsdCBudW1iZXIgNDBweCBmcm9tIG1hdGVyaWFsIGRlc2lnbiBtZW51IHN1Yi1tZW51IHNwZWMuXG4gICAqL1xuICBASW5wdXQoJ2Nka1RyZWVOb2RlUGFkZGluZ0luZGVudCcpXG4gIGdldCBpbmRlbnQoKTogbnVtYmVyIHwgc3RyaW5nIHsgcmV0dXJuIHRoaXMuX2luZGVudDsgfVxuICBzZXQgaW5kZW50KGluZGVudDogbnVtYmVyIHwgc3RyaW5nKSB7IHRoaXMuX3NldEluZGVudElucHV0KGluZGVudCk7IH1cbiAgX2luZGVudDogbnVtYmVyID0gNDA7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdHJlZU5vZGU6IENka1RyZWVOb2RlPFQsIEs+LFxuICAgICAgICAgICAgICBwcml2YXRlIF90cmVlOiBDZGtUcmVlPFQsIEs+LFxuICAgICAgICAgICAgICBwcml2YXRlIF9lbGVtZW50OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBfZGlyOiBEaXJlY3Rpb25hbGl0eSkge1xuICAgIHRoaXMuX3NldFBhZGRpbmcoKTtcbiAgICBpZiAoX2Rpcikge1xuICAgICAgX2Rpci5jaGFuZ2UucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSkuc3Vic2NyaWJlKCgpID0+IHRoaXMuX3NldFBhZGRpbmcodHJ1ZSkpO1xuICAgIH1cblxuICAgIC8vIEluIEl2eSB0aGUgaW5kZW50YXRpb24gYmluZGluZyBtaWdodCBiZSBzZXQgYmVmb3JlIHRoZSB0cmVlIG5vZGUncyBkYXRhIGhhcyBiZWVuIGFkZGVkLFxuICAgIC8vIHdoaWNoIG1lYW5zIHRoYXQgd2UnbGwgbWlzcyB0aGUgZmlyc3QgcmVuZGVyLiBXZSBoYXZlIHRvIHN1YnNjcmliZSB0byBjaGFuZ2VzIGluIHRoZVxuICAgIC8vIGRhdGEgdG8gZW5zdXJlIHRoYXQgZXZlcnl0aGluZyBpcyB1cCB0byBkYXRlLlxuICAgIF90cmVlTm9kZS5fZGF0YUNoYW5nZXMuc3Vic2NyaWJlKCgpID0+IHRoaXMuX3NldFBhZGRpbmcoKSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqIFRoZSBwYWRkaW5nIGluZGVudCB2YWx1ZSBmb3IgdGhlIHRyZWUgbm9kZS4gUmV0dXJucyBhIHN0cmluZyB3aXRoIHB4IG51bWJlcnMgaWYgbm90IG51bGwuICovXG4gIF9wYWRkaW5nSW5kZW50KCk6IHN0cmluZ3xudWxsIHtcbiAgICBjb25zdCBub2RlTGV2ZWwgPSAodGhpcy5fdHJlZU5vZGUuZGF0YSAmJiB0aGlzLl90cmVlLnRyZWVDb250cm9sLmdldExldmVsKVxuICAgICAgPyB0aGlzLl90cmVlLnRyZWVDb250cm9sLmdldExldmVsKHRoaXMuX3RyZWVOb2RlLmRhdGEpXG4gICAgICA6IG51bGw7XG4gICAgY29uc3QgbGV2ZWwgPSB0aGlzLl9sZXZlbCA9PSBudWxsID8gbm9kZUxldmVsIDogdGhpcy5fbGV2ZWw7XG4gICAgcmV0dXJuIHR5cGVvZiBsZXZlbCA9PT0gJ251bWJlcicgPyBgJHtsZXZlbCAqIHRoaXMuX2luZGVudH0ke3RoaXMuaW5kZW50VW5pdHN9YCA6IG51bGw7XG4gIH1cblxuICBfc2V0UGFkZGluZyhmb3JjZUNoYW5nZSA9IGZhbHNlKSB7XG4gICAgY29uc3QgcGFkZGluZyA9IHRoaXMuX3BhZGRpbmdJbmRlbnQoKTtcblxuICAgIGlmIChwYWRkaW5nICE9PSB0aGlzLl9jdXJyZW50UGFkZGluZyB8fCBmb3JjZUNoYW5nZSkge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnQubmF0aXZlRWxlbWVudDtcbiAgICAgIGNvbnN0IHBhZGRpbmdQcm9wID0gdGhpcy5fZGlyICYmIHRoaXMuX2Rpci52YWx1ZSA9PT0gJ3J0bCcgPyAncGFkZGluZ1JpZ2h0JyA6ICdwYWRkaW5nTGVmdCc7XG4gICAgICBjb25zdCByZXNldFByb3AgPSBwYWRkaW5nUHJvcCA9PT0gJ3BhZGRpbmdMZWZ0JyA/ICdwYWRkaW5nUmlnaHQnIDogJ3BhZGRpbmdMZWZ0JztcbiAgICAgIGVsZW1lbnQuc3R5bGVbcGFkZGluZ1Byb3BdID0gcGFkZGluZyB8fCAnJztcbiAgICAgIGVsZW1lbnQuc3R5bGVbcmVzZXRQcm9wXSA9ICcnO1xuICAgICAgdGhpcy5fY3VycmVudFBhZGRpbmcgPSBwYWRkaW5nO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGhhcyBiZWVuIGV4dHJhY3RlZCB0byBhIHV0aWwgYmVjYXVzZSBvZiBUUyA0IGFuZCBWRS5cbiAgICogVmlldyBFbmdpbmUgZG9lc24ndCBzdXBwb3J0IHByb3BlcnR5IHJlbmFtZSBpbmhlcml0YW5jZS5cbiAgICogVFMgNC4wIGRvZXNuJ3QgYWxsb3cgcHJvcGVydGllcyB0byBvdmVycmlkZSBhY2Nlc3NvcnMgb3IgdmljZS12ZXJzYS5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgcHJvdGVjdGVkIF9zZXRMZXZlbElucHV0KHZhbHVlOiBudW1iZXIpIHtcbiAgICAvLyBTZXQgdG8gbnVsbCBhcyB0aGUgZmFsbGJhY2sgdmFsdWUgc28gdGhhdCBfc2V0UGFkZGluZyBjYW4gZmFsbCBiYWNrIHRvIHRoZSBub2RlIGxldmVsIGlmIHRoZVxuICAgIC8vIGNvbnN1bWVyIHNldCB0aGUgZGlyZWN0aXZlIGFzIGBjZGtUcmVlTm9kZVBhZGRpbmc9XCJcImAuIFdlIHN0aWxsIHdhbnQgdG8gdGFrZSB0aGlzIHZhbHVlIGlmXG4gICAgLy8gdGhleSBzZXQgMCBleHBsaWNpdGx5LlxuICAgIHRoaXMuX2xldmVsID0gY29lcmNlTnVtYmVyUHJvcGVydHkodmFsdWUsIG51bGwpITtcbiAgICB0aGlzLl9zZXRQYWRkaW5nKCk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBoYXMgYmVlbiBleHRyYWN0ZWQgdG8gYSB1dGlsIGJlY2F1c2Ugb2YgVFMgNCBhbmQgVkUuXG4gICAqIFZpZXcgRW5naW5lIGRvZXNuJ3Qgc3VwcG9ydCBwcm9wZXJ0eSByZW5hbWUgaW5oZXJpdGFuY2UuXG4gICAqIFRTIDQuMCBkb2Vzbid0IGFsbG93IHByb3BlcnRpZXMgdG8gb3ZlcnJpZGUgYWNjZXNzb3JzIG9yIHZpY2UtdmVyc2EuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIHByb3RlY3RlZCBfc2V0SW5kZW50SW5wdXQoaW5kZW50OiBudW1iZXIgfCBzdHJpbmcpIHtcbiAgICBsZXQgdmFsdWUgPSBpbmRlbnQ7XG4gICAgbGV0IHVuaXRzID0gJ3B4JztcblxuICAgIGlmICh0eXBlb2YgaW5kZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgcGFydHMgPSBpbmRlbnQuc3BsaXQoY3NzVW5pdFBhdHRlcm4pO1xuICAgICAgdmFsdWUgPSBwYXJ0c1swXTtcbiAgICAgIHVuaXRzID0gcGFydHNbMV0gfHwgdW5pdHM7XG4gICAgfVxuXG4gICAgdGhpcy5pbmRlbnRVbml0cyA9IHVuaXRzO1xuICAgIHRoaXMuX2luZGVudCA9IGNvZXJjZU51bWJlclByb3BlcnR5KHZhbHVlKTtcbiAgICB0aGlzLl9zZXRQYWRkaW5nKCk7XG4gIH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbGV2ZWw6IE51bWJlcklucHV0O1xufVxuIl19