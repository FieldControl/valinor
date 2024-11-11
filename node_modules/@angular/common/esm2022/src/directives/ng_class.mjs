/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Directive, ElementRef, Input, Renderer2, ɵstringify as stringify, } from '@angular/core';
import * as i0 from "@angular/core";
const WS_REGEXP = /\s+/;
const EMPTY_ARRAY = [];
/**
 * @ngModule CommonModule
 *
 * @usageNotes
 * ```
 *     <some-element [ngClass]="'first second'">...</some-element>
 *
 *     <some-element [ngClass]="['first', 'second']">...</some-element>
 *
 *     <some-element [ngClass]="{'first': true, 'second': true, 'third': false}">...</some-element>
 *
 *     <some-element [ngClass]="stringExp|arrayExp|objExp">...</some-element>
 *
 *     <some-element [ngClass]="{'class1 class2 class3' : true}">...</some-element>
 * ```
 *
 * @description
 *
 * Adds and removes CSS classes on an HTML element.
 *
 * The CSS classes are updated as follows, depending on the type of the expression evaluation:
 * - `string` - the CSS classes listed in the string (space delimited) are added,
 * - `Array` - the CSS classes declared as Array elements are added,
 * - `Object` - keys are CSS classes that get added when the expression given in the value
 *              evaluates to a truthy value, otherwise they are removed.
 *
 * @publicApi
 */
export class NgClass {
    constructor(_ngEl, _renderer) {
        this._ngEl = _ngEl;
        this._renderer = _renderer;
        this.initialClasses = EMPTY_ARRAY;
        this.stateMap = new Map();
    }
    set klass(value) {
        this.initialClasses = value != null ? value.trim().split(WS_REGEXP) : EMPTY_ARRAY;
    }
    set ngClass(value) {
        this.rawClass = typeof value === 'string' ? value.trim().split(WS_REGEXP) : value;
    }
    /*
    The NgClass directive uses the custom change detection algorithm for its inputs. The custom
    algorithm is necessary since inputs are represented as complex object or arrays that need to be
    deeply-compared.
  
    This algorithm is perf-sensitive since NgClass is used very frequently and its poor performance
    might negatively impact runtime performance of the entire change detection cycle. The design of
    this algorithm is making sure that:
    - there is no unnecessary DOM manipulation (CSS classes are added / removed from the DOM only when
    needed), even if references to bound objects change;
    - there is no memory allocation if nothing changes (even relatively modest memory allocation
    during the change detection cycle can result in GC pauses for some of the CD cycles).
  
    The algorithm works by iterating over the set of bound classes, staring with [class] binding and
    then going over [ngClass] binding. For each CSS class name:
    - check if it was seen before (this information is tracked in the state map) and if its value
    changed;
    - mark it as "touched" - names that are not marked are not present in the latest set of binding
    and we can remove such class name from the internal data structures;
  
    After iteration over all the CSS class names we've got data structure with all the information
    necessary to synchronize changes to the DOM - it is enough to iterate over the state map, flush
    changes to the DOM and reset internal data structures so those are ready for the next change
    detection cycle.
     */
    ngDoCheck() {
        // classes from the [class] binding
        for (const klass of this.initialClasses) {
            this._updateState(klass, true);
        }
        // classes from the [ngClass] binding
        const rawClass = this.rawClass;
        if (Array.isArray(rawClass) || rawClass instanceof Set) {
            for (const klass of rawClass) {
                this._updateState(klass, true);
            }
        }
        else if (rawClass != null) {
            for (const klass of Object.keys(rawClass)) {
                this._updateState(klass, Boolean(rawClass[klass]));
            }
        }
        this._applyStateDiff();
    }
    _updateState(klass, nextEnabled) {
        const state = this.stateMap.get(klass);
        if (state !== undefined) {
            if (state.enabled !== nextEnabled) {
                state.changed = true;
                state.enabled = nextEnabled;
            }
            state.touched = true;
        }
        else {
            this.stateMap.set(klass, { enabled: nextEnabled, changed: true, touched: true });
        }
    }
    _applyStateDiff() {
        for (const stateEntry of this.stateMap) {
            const klass = stateEntry[0];
            const state = stateEntry[1];
            if (state.changed) {
                this._toggleClass(klass, state.enabled);
                state.changed = false;
            }
            else if (!state.touched) {
                // A class that was previously active got removed from the new collection of classes -
                // remove from the DOM as well.
                if (state.enabled) {
                    this._toggleClass(klass, false);
                }
                this.stateMap.delete(klass);
            }
            state.touched = false;
        }
    }
    _toggleClass(klass, enabled) {
        if (ngDevMode) {
            if (typeof klass !== 'string') {
                throw new Error(`NgClass can only toggle CSS classes expressed as strings, got ${stringify(klass)}`);
            }
        }
        klass = klass.trim();
        if (klass.length > 0) {
            klass.split(WS_REGEXP).forEach((klass) => {
                if (enabled) {
                    this._renderer.addClass(this._ngEl.nativeElement, klass);
                }
                else {
                    this._renderer.removeClass(this._ngEl.nativeElement, klass);
                }
            });
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NgClass, deps: [{ token: i0.ElementRef }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.7", type: NgClass, isStandalone: true, selector: "[ngClass]", inputs: { klass: ["class", "klass"], ngClass: "ngClass" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NgClass, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngClass]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.Renderer2 }], propDecorators: { klass: [{
                type: Input,
                args: ['class']
            }], ngClass: [{
                type: Input,
                args: ['ngClass']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUNMLFNBQVMsRUFFVCxVQUFVLEVBQ1YsS0FBSyxFQUdMLFNBQVMsRUFDVCxVQUFVLElBQUksU0FBUyxHQUN4QixNQUFNLGVBQWUsQ0FBQzs7QUFJdkIsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBRXhCLE1BQU0sV0FBVyxHQUFhLEVBQUUsQ0FBQztBQWtCakM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTJCRztBQUtILE1BQU0sT0FBTyxPQUFPO0lBTWxCLFlBQ1UsS0FBaUIsRUFDakIsU0FBb0I7UUFEcEIsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUNqQixjQUFTLEdBQVQsU0FBUyxDQUFXO1FBUHRCLG1CQUFjLEdBQUcsV0FBVyxDQUFDO1FBRzdCLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBeUIsQ0FBQztJQUtqRCxDQUFDO0lBRUosSUFDSSxLQUFLLENBQUMsS0FBYTtRQUNyQixJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztJQUNwRixDQUFDO0lBRUQsSUFDSSxPQUFPLENBQUMsS0FBa0Y7UUFDNUYsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNwRixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXdCRztJ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LENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FDcEYsQ0FBQztZQUNKLENBQUM7UUFDSCxDQUFDO1FBQ0QsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNyQixJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDckIsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDdkMsSUFBSSxPQUFPLEVBQUUsQ0FBQztvQkFDWixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDM0QsQ0FBQztxQkFBTSxDQUFDO29CQUNOLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM5RCxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQzt5SEF2SFUsT0FBTzs2R0FBUCxPQUFPOztzR0FBUCxPQUFPO2tCQUpuQixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxXQUFXO29CQUNyQixVQUFVLEVBQUUsSUFBSTtpQkFDakI7dUdBYUssS0FBSztzQkFEUixLQUFLO3VCQUFDLE9BQU87Z0JBTVYsT0FBTztzQkFEVixLQUFLO3VCQUFDLFNBQVMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIERvQ2hlY2ssXG4gIEVsZW1lbnRSZWYsXG4gIElucHV0LFxuICBJdGVyYWJsZURpZmZlcnMsXG4gIEtleVZhbHVlRGlmZmVycyxcbiAgUmVuZGVyZXIyLFxuICDJtXN0cmluZ2lmeSBhcyBzdHJpbmdpZnksXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG50eXBlIE5nQ2xhc3NTdXBwb3J0ZWRUeXBlcyA9IHN0cmluZ1tdIHwgU2V0PHN0cmluZz4gfCB7W2tsYXNzOiBzdHJpbmddOiBhbnl9IHwgbnVsbCB8IHVuZGVmaW5lZDtcblxuY29uc3QgV1NfUkVHRVhQID0gL1xccysvO1xuXG5jb25zdCBFTVBUWV9BUlJBWTogc3RyaW5nW10gPSBbXTtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGludGVybmFsIG9iamVjdCB1c2VkIHRvIHRyYWNrIHN0YXRlIG9mIGVhY2ggQ1NTIGNsYXNzLiBUaGVyZSBhcmUgMyBkaWZmZXJlbnQgKGJvb2xlYW4pXG4gKiBmbGFncyB0aGF0LCBjb21iaW5lZCB0b2dldGhlciwgaW5kaWNhdGUgc3RhdGUgb2YgYSBnaXZlbiBDU1MgY2xhc3M6XG4gKiAtIGVuYWJsZWQ6IGluZGljYXRlcyBpZiBhIGNsYXNzIHNob3VsZCBiZSBwcmVzZW50IGluIHRoZSBET00gKHRydWUpIG9yIG5vdCAoZmFsc2UpO1xuICogLSBjaGFuZ2VkOiB0cmFja3MgaWYgYSBjbGFzcyB3YXMgdG9nZ2xlZCAoYWRkZWQgb3IgcmVtb3ZlZCkgZHVyaW5nIHRoZSBjdXN0b20gZGlydHktY2hlY2tpbmdcbiAqIHByb2Nlc3M7IGNoYW5nZWQgY2xhc3NlcyBtdXN0IGJlIHN5bmNocm9uaXplZCB3aXRoIHRoZSBET007XG4gKiAtIHRvdWNoZWQ6IHRyYWNrcyBpZiBhIGNsYXNzIGlzIHByZXNlbnQgaW4gdGhlIGN1cnJlbnQgb2JqZWN0IGJvdW5kIHRvIHRoZSBjbGFzcyAvIG5nQ2xhc3MgaW5wdXQ7XG4gKiBjbGFzc2VzIHRoYXQgYXJlIG5vdCBwcmVzZW50IGFueSBtb3JlIGNhbiBiZSByZW1vdmVkIGZyb20gdGhlIGludGVybmFsIGRhdGEgc3RydWN0dXJlcztcbiAqL1xuaW50ZXJmYWNlIENzc0NsYXNzU3RhdGUge1xuICAvLyBQRVJGOiBjb3VsZCB1c2UgYSBiaXQgbWFzayB0byByZXByZXNlbnQgc3RhdGUgYXMgYWxsIGZpZWxkcyBhcmUgYm9vbGVhbiBmbGFnc1xuICBlbmFibGVkOiBib29sZWFuO1xuICBjaGFuZ2VkOiBib29sZWFuO1xuICB0b3VjaGVkOiBib29sZWFuO1xufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCInZmlyc3Qgc2Vjb25kJ1wiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cIlsnZmlyc3QnLCAnc2Vjb25kJ11cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJ7J2ZpcnN0JzogdHJ1ZSwgJ3NlY29uZCc6IHRydWUsICd0aGlyZCc6IGZhbHNlfVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICpcbiAqICAgICA8c29tZS1lbGVtZW50IFtuZ0NsYXNzXT1cInN0cmluZ0V4cHxhcnJheUV4cHxvYmpFeHBcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJ7J2NsYXNzMSBjbGFzczIgY2xhc3MzJyA6IHRydWV9XCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBZGRzIGFuZCByZW1vdmVzIENTUyBjbGFzc2VzIG9uIGFuIEhUTUwgZWxlbWVudC5cbiAqXG4gKiBUaGUgQ1NTIGNsYXNzZXMgYXJlIHVwZGF0ZWQgYXMgZm9sbG93cywgZGVwZW5kaW5nIG9uIHRoZSB0eXBlIG9mIHRoZSBleHByZXNzaW9uIGV2YWx1YXRpb246XG4gKiAtIGBzdHJpbmdgIC0gdGhlIENTUyBjbGFzc2VzIGxpc3RlZCBpbiB0aGUgc3RyaW5nIChzcGFjZSBkZWxpbWl0ZWQpIGFyZSBhZGRlZCxcbiAqIC0gYEFycmF5YCAtIHRoZSBDU1MgY2xhc3NlcyBkZWNsYXJlZCBhcyBBcnJheSBlbGVtZW50cyBhcmUgYWRkZWQsXG4gKiAtIGBPYmplY3RgIC0ga2V5cyBhcmUgQ1NTIGNsYXNzZXMgdGhhdCBnZXQgYWRkZWQgd2hlbiB0aGUgZXhwcmVzc2lvbiBnaXZlbiBpbiB0aGUgdmFsdWVcbiAqICAgICAgICAgICAgICBldmFsdWF0ZXMgdG8gYSB0cnV0aHkgdmFsdWUsIG90aGVyd2lzZSB0aGV5IGFyZSByZW1vdmVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW25nQ2xhc3NdJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgTmdDbGFzcyBpbXBsZW1lbnRzIERvQ2hlY2sge1xuICBwcml2YXRlIGluaXRpYWxDbGFzc2VzID0gRU1QVFlfQVJSQVk7XG4gIHByaXZhdGUgcmF3Q2xhc3M6IE5nQ2xhc3NTdXBwb3J0ZWRUeXBlcztcblxuICBwcml2YXRlIHN0YXRlTWFwID0gbmV3IE1hcDxzdHJpbmcsIENzc0NsYXNzU3RhdGU+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfbmdFbDogRWxlbWVudFJlZixcbiAgICBwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIyLFxuICApIHt9XG5cbiAgQElucHV0KCdjbGFzcycpXG4gIHNldCBrbGFzcyh2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5pbml0aWFsQ2xhc3NlcyA9IHZhbHVlICE9IG51bGwgPyB2YWx1ZS50cmltKCkuc3BsaXQoV1NfUkVHRVhQKSA6IEVNUFRZX0FSUkFZO1xuICB9XG5cbiAgQElucHV0KCduZ0NsYXNzJylcbiAgc2V0IG5nQ2xhc3ModmFsdWU6IHN0cmluZyB8IHN0cmluZ1tdIHwgU2V0PHN0cmluZz4gfCB7W2tsYXNzOiBzdHJpbmddOiBhbnl9IHwgbnVsbCB8IHVuZGVmaW5lZCkge1xuICAgIHRoaXMucmF3Q2xhc3MgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gdmFsdWUudHJpbSgpLnNwbGl0KFdTX1JFR0VYUCkgOiB2YWx1ZTtcbiAgfVxuXG4gIC8qXG4gIFRoZSBOZ0NsYXNzIGRpcmVjdGl2ZSB1c2VzIHRoZSBjdXN0b20gY2hhbmdlIGRldGVjdGlvbiBhbGdvcml0aG0gZm9yIGl0cyBpbnB1dHMuIFRoZSBjdXN0b21cbiAgYWxnb3JpdGhtIGlzIG5lY2Vzc2FyeSBzaW5jZSBpbnB1dHMgYXJlIHJlcHJlc2VudGVkIGFzIGNvbXBsZXggb2JqZWN0IG9yIGFycmF5cyB0aGF0IG5lZWQgdG8gYmVcbiAgZGVlcGx5LWNvbXBhcmVkLlxuXG4gIFRoaXMgYWxnb3JpdGhtIGlzIHBlcmYtc2Vuc2l0aXZlIHNpbmNlIE5nQ2xhc3MgaXMgdXNlZCB2ZXJ5IGZyZXF1ZW50bHkgYW5kIGl0cyBwb29yIHBlcmZvcm1hbmNlXG4gIG1pZ2h0IG5lZ2F0aXZlbHkgaW1wYWN0IHJ1bnRpbWUgcGVyZm9ybWFuY2Ugb2YgdGhlIGVudGlyZSBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlLiBUaGUgZGVzaWduIG9mXG4gIHRoaXMgYWxnb3JpdGhtIGlzIG1ha2luZyBzdXJlIHRoYXQ6XG4gIC0gdGhlcmUgaXMgbm8gdW5uZWNlc3NhcnkgRE9NIG1hbmlwdWxhdGlvbiAoQ1NTIGNsYXNzZXMgYXJlIGFkZGVkIC8gcmVtb3ZlZCBmcm9tIHRoZSBET00gb25seSB3aGVuXG4gIG5lZWRlZCksIGV2ZW4gaWYgcmVmZXJlbmNlcyB0byBib3VuZCBvYmplY3RzIGNoYW5nZTtcbiAgLSB0aGVyZSBpcyBubyBtZW1vcnkgYWxsb2NhdGlvbiBpZiBub3RoaW5nIGNoYW5nZXMgKGV2ZW4gcmVsYXRpdmVseSBtb2Rlc3QgbWVtb3J5IGFsbG9jYXRpb25cbiAgZHVyaW5nIHRoZSBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlIGNhbiByZXN1bHQgaW4gR0MgcGF1c2VzIGZvciBzb21lIG9mIHRoZSBDRCBjeWNsZXMpLlxuXG4gIFRoZSBhbGdvcml0aG0gd29ya3MgYnkgaXRlcmF0aW5nIG92ZXIgdGhlIHNldCBvZiBib3VuZCBjbGFzc2VzLCBzdGFyaW5nIHdpdGggW2NsYXNzXSBiaW5kaW5nIGFuZFxuICB0aGVuIGdvaW5nIG92ZXIgW25nQ2xhc3NdIGJpbmRpbmcuIEZvciBlYWNoIENTUyBjbGFzcyBuYW1lOlxuICAtIGNoZWNrIGlmIGl0IHdhcyBzZWVuIGJlZm9yZSAodGhpcyBpbmZvcm1hdGlvbiBpcyB0cmFja2VkIGluIHRoZSBzdGF0ZSBtYXApIGFuZCBpZiBpdHMgdmFsdWVcbiAgY2hhbmdlZDtcbiAgLSBtYXJrIGl0IGFzIFwidG91Y2hlZFwiIC0gbmFtZXMgdGhhdCBhcmUgbm90IG1hcmtlZCBhcmUgbm90IHByZXNlbnQgaW4gdGhlIGxhdGVzdCBzZXQgb2YgYmluZGluZ1xuICBhbmQgd2UgY2FuIHJlbW92ZSBzdWNoIGNsYXNzIG5hbWUgZnJvbSB0aGUgaW50ZXJuYWwgZGF0YSBzdHJ1Y3R1cmVzO1xuXG4gIEFmdGVyIGl0ZXJhdGlvbiBvdmVyIGFsbCB0aGUgQ1NTIGNsYXNzIG5hbWVzIHdlJ3ZlIGdvdCBkYXRhIHN0cnVjdHVyZSB3aXRoIGFsbCB0aGUgaW5mb3JtYXRpb25cbiAgbmVjZXNzYXJ5IHRvIHN5bmNocm9uaXplIGNoYW5nZXMgdG8gdGhlIERPTSAtIGl0IGlzIGVub3VnaCB0byBpdGVyYXRlIG92ZXIgdGhlIHN0YXRlIG1hcCwgZmx1c2hcbiAgY2hhbmdlcyB0byB0aGUgRE9NIGFuZCByZXNldCBpbnRlcm5hbCBkYXRhIHN0cnVjdHVyZXMgc28gdGhvc2UgYXJlIHJlYWR5IGZvciB0aGUgbmV4dCBjaGFuZ2VcbiAgZGV0ZWN0aW9uIGN5Y2xlLlxuICAgKi9cbiAgbmdEb0NoZWNrKCk6IHZvaWQge1xuICAgIC8vIGNsYXNzZXMgZnJvbSB0aGUgW2NsYXNzXSBiaW5kaW5nXG4gICAgZm9yIChjb25zdCBrbGFzcyBvZiB0aGlzLmluaXRpYWxDbGFzc2VzKSB7XG4gICAgICB0aGlzLl91cGRhdGVTdGF0ZShrbGFzcywgdHJ1ZSk7XG4gICAgfVxuXG4gICAgLy8gY2xhc3NlcyBmcm9tIHRoZSBbbmdDbGFzc10gYmluZGluZ1xuICAgIGNvbnN0IHJhd0NsYXNzID0gdGhpcy5yYXdDbGFzcztcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyYXdDbGFzcykgfHwgcmF3Q2xhc3MgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgIGZvciAoY29uc3Qga2xhc3Mgb2YgcmF3Q2xhc3MpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlU3RhdGUoa2xhc3MsIHRydWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAocmF3Q2xhc3MgIT0gbnVsbCkge1xuICAgICAgZm9yIChjb25zdCBrbGFzcyBvZiBPYmplY3Qua2V5cyhyYXdDbGFzcykpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlU3RhdGUoa2xhc3MsIEJvb2xlYW4ocmF3Q2xhc3Nba2xhc3NdKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fYXBwbHlTdGF0ZURpZmYoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVN0YXRlKGtsYXNzOiBzdHJpbmcsIG5leHRFbmFibGVkOiBib29sZWFuKSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLnN0YXRlTWFwLmdldChrbGFzcyk7XG4gICAgaWYgKHN0YXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChzdGF0ZS5lbmFibGVkICE9PSBuZXh0RW5hYmxlZCkge1xuICAgICAgICBzdGF0ZS5jaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgc3RhdGUuZW5hYmxlZCA9IG5leHRFbmFibGVkO1xuICAgICAgfVxuICAgICAgc3RhdGUudG91Y2hlZCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3RhdGVNYXAuc2V0KGtsYXNzLCB7ZW5hYmxlZDogbmV4dEVuYWJsZWQsIGNoYW5nZWQ6IHRydWUsIHRvdWNoZWQ6IHRydWV9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hcHBseVN0YXRlRGlmZigpIHtcbiAgICBmb3IgKGNvbnN0IHN0YXRlRW50cnkgb2YgdGhpcy5zdGF0ZU1hcCkge1xuICAgICAgY29uc3Qga2xhc3MgPSBzdGF0ZUVudHJ5WzBdO1xuICAgICAgY29uc3Qgc3RhdGUgPSBzdGF0ZUVudHJ5WzFdO1xuXG4gICAgICBpZiAoc3RhdGUuY2hhbmdlZCkge1xuICAgICAgICB0aGlzLl90b2dnbGVDbGFzcyhrbGFzcywgc3RhdGUuZW5hYmxlZCk7XG4gICAgICAgIHN0YXRlLmNoYW5nZWQgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSBpZiAoIXN0YXRlLnRvdWNoZWQpIHtcbiAgICAgICAgLy8gQSBjbGFzcyB0aGF0IHdhcyBwcmV2aW91c2x5IGFjdGl2ZSBnb3QgcmVtb3ZlZCBmcm9tIHRoZSBuZXcgY29sbGVjdGlvbiBvZiBjbGFzc2VzIC1cbiAgICAgICAgLy8gcmVtb3ZlIGZyb20gdGhlIERPTSBhcyB3ZWxsLlxuICAgICAgICBpZiAoc3RhdGUuZW5hYmxlZCkge1xuICAgICAgICAgIHRoaXMuX3RvZ2dsZUNsYXNzKGtsYXNzLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdGF0ZU1hcC5kZWxldGUoa2xhc3MpO1xuICAgICAgfVxuXG4gICAgICBzdGF0ZS50b3VjaGVkID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdG9nZ2xlQ2xhc3Moa2xhc3M6IHN0cmluZywgZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGlmICh0eXBlb2Yga2xhc3MgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgTmdDbGFzcyBjYW4gb25seSB0b2dnbGUgQ1NTIGNsYXNzZXMgZXhwcmVzc2VkIGFzIHN0cmluZ3MsIGdvdCAke3N0cmluZ2lmeShrbGFzcyl9YCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAga2xhc3MgPSBrbGFzcy50cmltKCk7XG4gICAgaWYgKGtsYXNzLmxlbmd0aCA+IDApIHtcbiAgICAgIGtsYXNzLnNwbGl0KFdTX1JFR0VYUCkuZm9yRWFjaCgoa2xhc3MpID0+IHtcbiAgICAgICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgICB0aGlzLl9yZW5kZXJlci5hZGRDbGFzcyh0aGlzLl9uZ0VsLm5hdGl2ZUVsZW1lbnQsIGtsYXNzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLl9uZ0VsLm5hdGl2ZUVsZW1lbnQsIGtsYXNzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iXX0=