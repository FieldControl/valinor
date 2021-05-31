/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, ContentChildren, QueryList, } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { CdkAccordion } from '@angular/cdk/accordion';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { startWith } from 'rxjs/operators';
import { MAT_ACCORDION } from './accordion-base';
import { MatExpansionPanelHeader } from './expansion-panel-header';
/**
 * Directive for a Material Design Accordion.
 */
export class MatAccordion extends CdkAccordion {
    constructor() {
        super(...arguments);
        /** Headers belonging to this accordion. */
        this._ownHeaders = new QueryList();
        this._hideToggle = false;
        /**
         * Display mode used for all expansion panels in the accordion. Currently two display
         * modes exist:
         *  default - a gutter-like spacing is placed around any expanded panel, placing the expanded
         *     panel at a different elevation from the rest of the accordion.
         *  flat - no spacing is placed around expanded panels, showing all panels at the same
         *     elevation.
         */
        this.displayMode = 'default';
        /** The position of the expansion indicator. */
        this.togglePosition = 'after';
    }
    /** Whether the expansion indicator should be hidden. */
    get hideToggle() { return this._hideToggle; }
    set hideToggle(show) { this._hideToggle = coerceBooleanProperty(show); }
    ngAfterContentInit() {
        this._headers.changes
            .pipe(startWith(this._headers))
            .subscribe((headers) => {
            this._ownHeaders.reset(headers.filter(header => header.panel.accordion === this));
            this._ownHeaders.notifyOnChanges();
        });
        this._keyManager = new FocusKeyManager(this._ownHeaders).withWrap().withHomeAndEnd();
    }
    /** Handles keyboard events coming in from the panel headers. */
    _handleHeaderKeydown(event) {
        this._keyManager.onKeydown(event);
    }
    _handleHeaderFocus(header) {
        this._keyManager.updateActiveItem(header);
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this._ownHeaders.destroy();
    }
}
MatAccordion.decorators = [
    { type: Directive, args: [{
                selector: 'mat-accordion',
                exportAs: 'matAccordion',
                inputs: ['multi'],
                providers: [{
                        provide: MAT_ACCORDION,
                        useExisting: MatAccordion
                    }],
                host: {
                    class: 'mat-accordion',
                    // Class binding which is only used by the test harness as there is no other
                    // way for the harness to detect if multiple panel support is enabled.
                    '[class.mat-accordion-multi]': 'this.multi',
                }
            },] }
];
MatAccordion.propDecorators = {
    _headers: [{ type: ContentChildren, args: [MatExpansionPanelHeader, { descendants: true },] }],
    hideToggle: [{ type: Input }],
    displayMode: [{ type: Input }],
    togglePosition: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2V4cGFuc2lvbi9hY2NvcmRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsZUFBZSxFQUNmLFNBQVMsR0FHVixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQWUscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDcEQsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2xELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6QyxPQUFPLEVBQ0wsYUFBYSxFQUlkLE1BQU0sa0JBQWtCLENBQUM7QUFDMUIsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFFakU7O0dBRUc7QUFnQkgsTUFBTSxPQUFPLFlBQWEsU0FBUSxZQUFZO0lBZjlDOztRQW1CRSwyQ0FBMkM7UUFDbkMsZ0JBQVcsR0FBRyxJQUFJLFNBQVMsRUFBMkIsQ0FBQztRQVV2RCxnQkFBVyxHQUFZLEtBQUssQ0FBQztRQUVyQzs7Ozs7OztXQU9HO1FBQ00sZ0JBQVcsR0FBNEIsU0FBUyxDQUFDO1FBRTFELCtDQUErQztRQUN0QyxtQkFBYyxHQUErQixPQUFPLENBQUM7SUE0QmhFLENBQUM7SUE3Q0Msd0RBQXdEO0lBQ3hELElBQ0ksVUFBVSxLQUFjLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFDdEQsSUFBSSxVQUFVLENBQUMsSUFBYSxJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBZ0JqRixrQkFBa0I7UUFDaEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPO2FBQ2xCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzlCLFNBQVMsQ0FBQyxDQUFDLE9BQTJDLEVBQUUsRUFBRTtZQUN6RCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNsRixJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxDQUFDO1FBRUwsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDdkYsQ0FBQztJQUVELGdFQUFnRTtJQUNoRSxvQkFBb0IsQ0FBQyxLQUFvQjtRQUN2QyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsa0JBQWtCLENBQUMsTUFBK0I7UUFDaEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzdCLENBQUM7OztZQXBFRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGVBQWU7Z0JBQ3pCLFFBQVEsRUFBRSxjQUFjO2dCQUN4QixNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUM7Z0JBQ2pCLFNBQVMsRUFBRSxDQUFDO3dCQUNWLE9BQU8sRUFBRSxhQUFhO3dCQUN0QixXQUFXLEVBQUUsWUFBWTtxQkFDMUIsQ0FBQztnQkFDRixJQUFJLEVBQUU7b0JBQ0osS0FBSyxFQUFFLGVBQWU7b0JBQ3RCLDRFQUE0RTtvQkFDNUUsc0VBQXNFO29CQUN0RSw2QkFBNkIsRUFBRSxZQUFZO2lCQUM1QzthQUNGOzs7dUJBU0UsZUFBZSxTQUFDLHVCQUF1QixFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQzt5QkFJNUQsS0FBSzswQkFhTCxLQUFLOzZCQUdMLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBJbnB1dCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBRdWVyeUxpc3QsXG4gIEFmdGVyQ29udGVudEluaXQsXG4gIE9uRGVzdHJveSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtDZGtBY2NvcmRpb259IGZyb20gJ0Bhbmd1bGFyL2Nkay9hY2NvcmRpb24nO1xuaW1wb3J0IHtGb2N1c0tleU1hbmFnZXJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7c3RhcnRXaXRofSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge1xuICBNQVRfQUNDT1JESU9OLFxuICBNYXRBY2NvcmRpb25CYXNlLFxuICBNYXRBY2NvcmRpb25EaXNwbGF5TW9kZSxcbiAgTWF0QWNjb3JkaW9uVG9nZ2xlUG9zaXRpb25cbn0gZnJvbSAnLi9hY2NvcmRpb24tYmFzZSc7XG5pbXBvcnQge01hdEV4cGFuc2lvblBhbmVsSGVhZGVyfSBmcm9tICcuL2V4cGFuc2lvbi1wYW5lbC1oZWFkZXInO1xuXG4vKipcbiAqIERpcmVjdGl2ZSBmb3IgYSBNYXRlcmlhbCBEZXNpZ24gQWNjb3JkaW9uLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdtYXQtYWNjb3JkaW9uJyxcbiAgZXhwb3J0QXM6ICdtYXRBY2NvcmRpb24nLFxuICBpbnB1dHM6IFsnbXVsdGknXSxcbiAgcHJvdmlkZXJzOiBbe1xuICAgIHByb3ZpZGU6IE1BVF9BQ0NPUkRJT04sXG4gICAgdXNlRXhpc3Rpbmc6IE1hdEFjY29yZGlvblxuICB9XSxcbiAgaG9zdDoge1xuICAgIGNsYXNzOiAnbWF0LWFjY29yZGlvbicsXG4gICAgLy8gQ2xhc3MgYmluZGluZyB3aGljaCBpcyBvbmx5IHVzZWQgYnkgdGhlIHRlc3QgaGFybmVzcyBhcyB0aGVyZSBpcyBubyBvdGhlclxuICAgIC8vIHdheSBmb3IgdGhlIGhhcm5lc3MgdG8gZGV0ZWN0IGlmIG11bHRpcGxlIHBhbmVsIHN1cHBvcnQgaXMgZW5hYmxlZC5cbiAgICAnW2NsYXNzLm1hdC1hY2NvcmRpb24tbXVsdGldJzogJ3RoaXMubXVsdGknLFxuICB9XG59KVxuZXhwb3J0IGNsYXNzIE1hdEFjY29yZGlvbiBleHRlbmRzIENka0FjY29yZGlvbiBpbXBsZW1lbnRzIE1hdEFjY29yZGlvbkJhc2UsXG4gIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX2tleU1hbmFnZXI6IEZvY3VzS2V5TWFuYWdlcjxNYXRFeHBhbnNpb25QYW5lbEhlYWRlcj47XG5cbiAgLyoqIEhlYWRlcnMgYmVsb25naW5nIHRvIHRoaXMgYWNjb3JkaW9uLiAqL1xuICBwcml2YXRlIF9vd25IZWFkZXJzID0gbmV3IFF1ZXJ5TGlzdDxNYXRFeHBhbnNpb25QYW5lbEhlYWRlcj4oKTtcblxuICAvKiogQWxsIGhlYWRlcnMgaW5zaWRlIHRoZSBhY2NvcmRpb24uIEluY2x1ZGVzIGhlYWRlcnMgaW5zaWRlIG5lc3RlZCBhY2NvcmRpb25zLiAqL1xuICBAQ29udGVudENoaWxkcmVuKE1hdEV4cGFuc2lvblBhbmVsSGVhZGVyLCB7ZGVzY2VuZGFudHM6IHRydWV9KVxuICBfaGVhZGVyczogUXVlcnlMaXN0PE1hdEV4cGFuc2lvblBhbmVsSGVhZGVyPjtcblxuICAvKiogV2hldGhlciB0aGUgZXhwYW5zaW9uIGluZGljYXRvciBzaG91bGQgYmUgaGlkZGVuLiAqL1xuICBASW5wdXQoKVxuICBnZXQgaGlkZVRvZ2dsZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX2hpZGVUb2dnbGU7IH1cbiAgc2V0IGhpZGVUb2dnbGUoc2hvdzogYm9vbGVhbikgeyB0aGlzLl9oaWRlVG9nZ2xlID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHNob3cpOyB9XG4gIHByaXZhdGUgX2hpZGVUb2dnbGU6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKipcbiAgICogRGlzcGxheSBtb2RlIHVzZWQgZm9yIGFsbCBleHBhbnNpb24gcGFuZWxzIGluIHRoZSBhY2NvcmRpb24uIEN1cnJlbnRseSB0d28gZGlzcGxheVxuICAgKiBtb2RlcyBleGlzdDpcbiAgICogIGRlZmF1bHQgLSBhIGd1dHRlci1saWtlIHNwYWNpbmcgaXMgcGxhY2VkIGFyb3VuZCBhbnkgZXhwYW5kZWQgcGFuZWwsIHBsYWNpbmcgdGhlIGV4cGFuZGVkXG4gICAqICAgICBwYW5lbCBhdCBhIGRpZmZlcmVudCBlbGV2YXRpb24gZnJvbSB0aGUgcmVzdCBvZiB0aGUgYWNjb3JkaW9uLlxuICAgKiAgZmxhdCAtIG5vIHNwYWNpbmcgaXMgcGxhY2VkIGFyb3VuZCBleHBhbmRlZCBwYW5lbHMsIHNob3dpbmcgYWxsIHBhbmVscyBhdCB0aGUgc2FtZVxuICAgKiAgICAgZWxldmF0aW9uLlxuICAgKi9cbiAgQElucHV0KCkgZGlzcGxheU1vZGU6IE1hdEFjY29yZGlvbkRpc3BsYXlNb2RlID0gJ2RlZmF1bHQnO1xuXG4gIC8qKiBUaGUgcG9zaXRpb24gb2YgdGhlIGV4cGFuc2lvbiBpbmRpY2F0b3IuICovXG4gIEBJbnB1dCgpIHRvZ2dsZVBvc2l0aW9uOiBNYXRBY2NvcmRpb25Ub2dnbGVQb3NpdGlvbiA9ICdhZnRlcic7XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHRoaXMuX2hlYWRlcnMuY2hhbmdlc1xuICAgICAgLnBpcGUoc3RhcnRXaXRoKHRoaXMuX2hlYWRlcnMpKVxuICAgICAgLnN1YnNjcmliZSgoaGVhZGVyczogUXVlcnlMaXN0PE1hdEV4cGFuc2lvblBhbmVsSGVhZGVyPikgPT4ge1xuICAgICAgICB0aGlzLl9vd25IZWFkZXJzLnJlc2V0KGhlYWRlcnMuZmlsdGVyKGhlYWRlciA9PiBoZWFkZXIucGFuZWwuYWNjb3JkaW9uID09PSB0aGlzKSk7XG4gICAgICAgIHRoaXMuX293bkhlYWRlcnMubm90aWZ5T25DaGFuZ2VzKCk7XG4gICAgICB9KTtcblxuICAgIHRoaXMuX2tleU1hbmFnZXIgPSBuZXcgRm9jdXNLZXlNYW5hZ2VyKHRoaXMuX293bkhlYWRlcnMpLndpdGhXcmFwKCkud2l0aEhvbWVBbmRFbmQoKTtcbiAgfVxuXG4gIC8qKiBIYW5kbGVzIGtleWJvYXJkIGV2ZW50cyBjb21pbmcgaW4gZnJvbSB0aGUgcGFuZWwgaGVhZGVycy4gKi9cbiAgX2hhbmRsZUhlYWRlcktleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICB0aGlzLl9rZXlNYW5hZ2VyLm9uS2V5ZG93bihldmVudCk7XG4gIH1cblxuICBfaGFuZGxlSGVhZGVyRm9jdXMoaGVhZGVyOiBNYXRFeHBhbnNpb25QYW5lbEhlYWRlcikge1xuICAgIHRoaXMuX2tleU1hbmFnZXIudXBkYXRlQWN0aXZlSXRlbShoZWFkZXIpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgICB0aGlzLl9vd25IZWFkZXJzLmRlc3Ryb3koKTtcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9oaWRlVG9nZ2xlOiBCb29sZWFuSW5wdXQ7XG59XG4iXX0=