/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
export class SharedStylesHost {
    constructor() {
        this.usageCount = new Map();
    }
    addStyles(styles) {
        for (const style of styles) {
            const usageCount = this.changeUsageCount(style, 1);
            if (usageCount === 1) {
                this.onStyleAdded(style);
            }
        }
    }
    removeStyles(styles) {
        for (const style of styles) {
            const usageCount = this.changeUsageCount(style, -1);
            if (usageCount === 0) {
                this.onStyleRemoved(style);
            }
        }
    }
    onStyleRemoved(style) { }
    onStyleAdded(style) { }
    getAllStyles() {
        return this.usageCount.keys();
    }
    changeUsageCount(style, delta) {
        const map = this.usageCount;
        let usage = map.get(style) ?? 0;
        usage += delta;
        if (usage > 0) {
            map.set(style, usage);
        }
        else {
            map.delete(style);
        }
        return usage;
    }
    ngOnDestroy() {
        for (const style of this.getAllStyles()) {
            this.onStyleRemoved(style);
        }
        this.usageCount.clear();
    }
}
SharedStylesHost.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: SharedStylesHost, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
SharedStylesHost.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: SharedStylesHost });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: SharedStylesHost, decorators: [{
            type: Injectable
        }] });
export class DomSharedStylesHost extends SharedStylesHost {
    constructor(doc) {
        super();
        this.doc = doc;
        // Maps all registered host nodes to a list of style nodes that have been added to the host node.
        this.styleRef = new Map();
        this.hostNodes = new Set();
        this.resetHostNodes();
    }
    onStyleAdded(style) {
        for (const host of this.hostNodes) {
            this.addStyleToHost(host, style);
        }
    }
    onStyleRemoved(style) {
        const styleRef = this.styleRef;
        const styleElements = styleRef.get(style);
        styleElements?.forEach(e => e.remove());
        styleRef.delete(style);
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this.styleRef.clear();
        this.resetHostNodes();
    }
    addHost(hostNode) {
        this.hostNodes.add(hostNode);
        for (const style of this.getAllStyles()) {
            this.addStyleToHost(hostNode, style);
        }
    }
    removeHost(hostNode) {
        this.hostNodes.delete(hostNode);
    }
    addStyleToHost(host, style) {
        const styleEl = this.doc.createElement('style');
        styleEl.textContent = style;
        host.appendChild(styleEl);
        const styleElRef = this.styleRef.get(style);
        if (styleElRef) {
            styleElRef.push(styleEl);
        }
        else {
            this.styleRef.set(style, [styleEl]);
        }
    }
    resetHostNodes() {
        const hostNodes = this.hostNodes;
        hostNodes.clear();
        // Re-add the head element back since this is the default host.
        hostNodes.add(this.doc.head);
    }
}
DomSharedStylesHost.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: DomSharedStylesHost, deps: [{ token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
DomSharedStylesHost.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: DomSharedStylesHost });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: DomSharedStylesHost, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkX3N0eWxlc19ob3N0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcGxhdGZvcm0tYnJvd3Nlci9zcmMvZG9tL3NoYXJlZF9zdHlsZXNfaG9zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQVksTUFBTSxlQUFlLENBQUM7O0FBRzVELE1BQU0sT0FBTyxnQkFBZ0I7SUFEN0I7UUFFbUIsZUFBVSxHQUFHLElBQUksR0FBRyxFQUF5RCxDQUFDO0tBbURoRztJQWpEQyxTQUFTLENBQUMsTUFBZ0I7UUFDeEIsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7WUFDMUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVuRCxJQUFJLFVBQVUsS0FBSyxDQUFDLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDMUI7U0FDRjtJQUNILENBQUM7SUFFRCxZQUFZLENBQUMsTUFBZ0I7UUFDM0IsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7WUFDMUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXBELElBQUksVUFBVSxLQUFLLENBQUMsRUFBRTtnQkFDcEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM1QjtTQUNGO0lBQ0gsQ0FBQztJQUVELGNBQWMsQ0FBQyxLQUFhLElBQVMsQ0FBQztJQUV0QyxZQUFZLENBQUMsS0FBYSxJQUFTLENBQUM7SUFFcEMsWUFBWTtRQUNWLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FB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QUssQ0FBQyxDQUFDO1FBQzVDLElBQUksVUFBVSxFQUFFO1lBQ2QsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMxQjthQUFNO1lBQ0wsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUNyQztJQUNILENBQUM7SUFFTyxjQUFjO1FBQ3BCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDakMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2xCLCtEQUErRDtRQUMvRCxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQzs7MkhBM0RVLG1CQUFtQixrQkFLVixRQUFROytIQUxqQixtQkFBbUI7c0dBQW5CLG1CQUFtQjtrQkFEL0IsVUFBVTs7MEJBTUksTUFBTTsyQkFBQyxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgT25EZXN0cm95fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFNoYXJlZFN0eWxlc0hvc3QgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIHJlYWRvbmx5IHVzYWdlQ291bnQgPSBuZXcgTWFwPHN0cmluZyAvKiogU3R5bGUgc3RyaW5nICovLCBudW1iZXIgLyoqIFVzYWdlIGNvdW50ICovPigpO1xuXG4gIGFkZFN0eWxlcyhzdHlsZXM6IHN0cmluZ1tdKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBzdHlsZSBvZiBzdHlsZXMpIHtcbiAgICAgIGNvbnN0IHVzYWdlQ291bnQgPSB0aGlzLmNoYW5nZVVzYWdlQ291bnQoc3R5bGUsIDEpO1xuXG4gICAgICBpZiAodXNhZ2VDb3VudCA9PT0gMSkge1xuICAgICAgICB0aGlzLm9uU3R5bGVBZGRlZChzdHlsZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlU3R5bGVzKHN0eWxlczogc3RyaW5nW10pOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IHN0eWxlIG9mIHN0eWxlcykge1xuICAgICAgY29uc3QgdXNhZ2VDb3VudCA9IHRoaXMuY2hhbmdlVXNhZ2VDb3VudChzdHlsZSwgLTEpO1xuXG4gICAgICBpZiAodXNhZ2VDb3VudCA9PT0gMCkge1xuICAgICAgICB0aGlzLm9uU3R5bGVSZW1vdmVkKHN0eWxlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvblN0eWxlUmVtb3ZlZChzdHlsZTogc3RyaW5nKTogdm9pZCB7fVxuXG4gIG9uU3R5bGVBZGRlZChzdHlsZTogc3RyaW5nKTogdm9pZCB7fVxuXG4gIGdldEFsbFN0eWxlcygpOiBJdGVyYWJsZUl0ZXJhdG9yPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLnVzYWdlQ291bnQua2V5cygpO1xuICB9XG5cbiAgcHJpdmF0ZSBjaGFuZ2VVc2FnZUNvdW50KHN0eWxlOiBzdHJpbmcsIGRlbHRhOiBudW1iZXIpOiBudW1iZXIge1xuICAgIGNvbnN0IG1hcCA9IHRoaXMudXNhZ2VDb3VudDtcbiAgICBsZXQgdXNhZ2UgPSBtYXAuZ2V0KHN0eWxlKSA/PyAwO1xuICAgIHVzYWdlICs9IGRlbHRhO1xuXG4gICAgaWYgKHVzYWdlID4gMCkge1xuICAgICAgbWFwLnNldChzdHlsZSwgdXNhZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtYXAuZGVsZXRlKHN0eWxlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdXNhZ2U7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IHN0eWxlIG9mIHRoaXMuZ2V0QWxsU3R5bGVzKCkpIHtcbiAgICAgIHRoaXMub25TdHlsZVJlbW92ZWQoc3R5bGUpO1xuICAgIH1cblxuICAgIHRoaXMudXNhZ2VDb3VudC5jbGVhcigpO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEb21TaGFyZWRTdHlsZXNIb3N0IGV4dGVuZHMgU2hhcmVkU3R5bGVzSG9zdCBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8vIE1hcHMgYWxsIHJlZ2lzdGVyZWQgaG9zdCBub2RlcyB0byBhIGxpc3Qgb2Ygc3R5bGUgbm9kZXMgdGhhdCBoYXZlIGJlZW4gYWRkZWQgdG8gdGhlIGhvc3Qgbm9kZS5cbiAgcHJpdmF0ZSByZWFkb25seSBzdHlsZVJlZiA9IG5ldyBNYXA8c3RyaW5nLCBIVE1MU3R5bGVFbGVtZW50W10+KCk7XG4gIHByaXZhdGUgaG9zdE5vZGVzID0gbmV3IFNldDxOb2RlPigpO1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgcmVhZG9ubHkgZG9jOiBhbnkpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucmVzZXRIb3N0Tm9kZXMoKTtcbiAgfVxuXG4gIG92ZXJyaWRlIG9uU3R5bGVBZGRlZChzdHlsZTogc3RyaW5nKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBob3N0IG9mIHRoaXMuaG9zdE5vZGVzKSB7XG4gICAgICB0aGlzLmFkZFN0eWxlVG9Ib3N0KGhvc3QsIHN0eWxlKTtcbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSBvblN0eWxlUmVtb3ZlZChzdHlsZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qgc3R5bGVSZWYgPSB0aGlzLnN0eWxlUmVmO1xuICAgIGNvbnN0IHN0eWxlRWxlbWVudHMgPSBzdHlsZVJlZi5nZXQoc3R5bGUpO1xuICAgIHN0eWxlRWxlbWVudHM/LmZvckVhY2goZSA9PiBlLnJlbW92ZSgpKTtcbiAgICBzdHlsZVJlZi5kZWxldGUoc3R5bGUpO1xuICB9XG5cbiAgb3ZlcnJpZGUgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgICB0aGlzLnN0eWxlUmVmLmNsZWFyKCk7XG4gICAgdGhpcy5yZXNldEhvc3ROb2RlcygpO1xuICB9XG5cbiAgYWRkSG9zdChob3N0Tm9kZTogTm9kZSk6IHZvaWQge1xuICAgIHRoaXMuaG9zdE5vZGVzLmFkZChob3N0Tm9kZSk7XG5cbiAgICBmb3IgKGNvbnN0IHN0eWxlIG9mIHRoaXMuZ2V0QWxsU3R5bGVzKCkpIHtcbiAgICAgIHRoaXMuYWRkU3R5bGVUb0hvc3QoaG9zdE5vZGUsIHN0eWxlKTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVIb3N0KGhvc3ROb2RlOiBOb2RlKTogdm9pZCB7XG4gICAgdGhpcy5ob3N0Tm9kZXMuZGVsZXRlKGhvc3ROb2RlKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkU3R5bGVUb0hvc3QoaG9zdDogTm9kZSwgc3R5bGU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHN0eWxlRWwgPSB0aGlzLmRvYy5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHN0eWxlRWwudGV4dENvbnRlbnQgPSBzdHlsZTtcbiAgICBob3N0LmFwcGVuZENoaWxkKHN0eWxlRWwpO1xuXG4gICAgY29uc3Qgc3R5bGVFbFJlZiA9IHRoaXMuc3R5bGVSZWYuZ2V0KHN0eWxlKTtcbiAgICBpZiAoc3R5bGVFbFJlZikge1xuICAgICAgc3R5bGVFbFJlZi5wdXNoKHN0eWxlRWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0eWxlUmVmLnNldChzdHlsZSwgW3N0eWxlRWxdKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlc2V0SG9zdE5vZGVzKCk6IHZvaWQge1xuICAgIGNvbnN0IGhvc3ROb2RlcyA9IHRoaXMuaG9zdE5vZGVzO1xuICAgIGhvc3ROb2Rlcy5jbGVhcigpO1xuICAgIC8vIFJlLWFkZCB0aGUgaGVhZCBlbGVtZW50IGJhY2sgc2luY2UgdGhpcyBpcyB0aGUgZGVmYXVsdCBob3N0LlxuICAgIGhvc3ROb2Rlcy5hZGQodGhpcy5kb2MuaGVhZCk7XG4gIH1cbn1cbiJdfQ==