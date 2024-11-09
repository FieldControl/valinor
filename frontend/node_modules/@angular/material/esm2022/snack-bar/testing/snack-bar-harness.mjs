/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ContentContainerComponentHarness, HarnessPredicate, parallel } from '@angular/cdk/testing';
/** Harness for interacting with an MDC-based mat-snack-bar in tests. */
export class MatSnackBarHarness extends ContentContainerComponentHarness {
    constructor() {
        super(...arguments);
        this._messageSelector = '.mdc-snackbar__label';
        this._actionButtonSelector = '.mat-mdc-snack-bar-action';
        this._snackBarLiveRegion = this.locatorFor('[aria-live]');
    }
    // Developers can provide a custom component or template for the
    // snackbar. The canonical snack-bar parent is the "MatSnackBarContainer".
    /** The selector for the host element of a `MatSnackBar` instance. */
    static { this.hostSelector = '.mat-mdc-snack-bar-container:not([mat-exit])'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatSnackBarHarness` that meets
     * certain criteria.
     * @param options Options for filtering which snack bar instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatSnackBarHarness, options);
    }
    /**
     * Gets the role of the snack-bar. The role of a snack-bar is determined based
     * on the ARIA politeness specified in the snack-bar config.
     * @deprecated Use `getAriaLive` instead.
     * @breaking-change 13.0.0
     */
    async getRole() {
        return (await this.host()).getAttribute('role');
    }
    /**
     * Gets the aria-live of the snack-bar's live region. The aria-live of a snack-bar is
     * determined based on the ARIA politeness specified in the snack-bar config.
     */
    async getAriaLive() {
        return (await this._snackBarLiveRegion()).getAttribute('aria-live');
    }
    /**
     * Whether the snack-bar has an action. Method cannot be used for snack-bar's with custom content.
     */
    async hasAction() {
        return (await this._getActionButton()) !== null;
    }
    /**
     * Gets the description of the snack-bar. Method cannot be used for snack-bar's without action or
     * with custom content.
     */
    async getActionDescription() {
        await this._assertHasAction();
        return (await this._getActionButton()).text();
    }
    /**
     * Dismisses the snack-bar by clicking the action button. Method cannot be used for snack-bar's
     * without action or with custom content.
     */
    async dismissWithAction() {
        await this._assertHasAction();
        await (await this._getActionButton()).click();
    }
    /**
     * Gets the message of the snack-bar. Method cannot be used for snack-bar's with custom content.
     */
    async getMessage() {
        return (await this.locatorFor(this._messageSelector)()).text();
    }
    /** Gets whether the snack-bar has been dismissed. */
    async isDismissed() {
        // We consider the snackbar dismissed if it's not in the DOM. We can assert that the
        // element isn't in the DOM by seeing that its width and height are zero.
        const host = await this.host();
        const [exit, dimensions] = await parallel(() => [
            // The snackbar container is marked with the "exit" attribute after it has been dismissed
            // but before the animation has finished (after which it's removed from the DOM).
            host.getAttribute('mat-exit'),
            host.getDimensions(),
        ]);
        return exit != null || (!!dimensions && dimensions.height === 0 && dimensions.width === 0);
    }
    /**
     * Asserts that the current snack-bar has an action defined. Otherwise the
     * promise will reject.
     */
    async _assertHasAction() {
        if (!(await this.hasAction())) {
            throw Error('Method cannot be used for a snack-bar without an action.');
        }
    }
    /** Gets the simple snack bar action button. */
    async _getActionButton() {
        return this.locatorForOptional(this._actionButtonSelector)();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25hY2stYmFyLWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc25hY2stYmFyL3Rlc3Rpbmcvc25hY2stYmFyLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdDQUFnQyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBSWxHLHdFQUF3RTtBQUN4RSxNQUFNLE9BQU8sa0JBQW1CLFNBQVEsZ0NBQXdDO0lBQWhGOztRQUtVLHFCQUFnQixHQUFHLHNCQUFzQixDQUFDO1FBQzFDLDBCQUFxQixHQUFHLDJCQUEyQixDQUFDO1FBRXBELHdCQUFtQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7SUE4Ri9ELENBQUM7SUFyR0MsZ0VBQWdFO0lBQ2hFLDBFQUEwRTtJQUMxRSxxRUFBcUU7YUFDOUQsaUJBQVksR0FBRyw4Q0FBOEMsQUFBakQsQ0FBa0Q7SUFNckU7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQWtDLEVBQUU7UUFDOUMsT0FBTyxJQUFJLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxPQUFPO1FBQ1gsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBdUMsQ0FBQztJQUN4RixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLFdBQVc7UUFDZixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FDcEQsV0FBVyxDQUNtQixDQUFDO0lBQ25DLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxTQUFTO1FBQ2IsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsS0FBSyxJQUFJLENBQUM7SUFDbEQsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxvQkFBb0I7UUFDeEIsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUM5QixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBRSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2pELENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsaUJBQWlCO1FBQ3JCLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDOUIsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsVUFBVTtRQUNkLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2pFLENBQUM7SUFFRCxxREFBcUQ7SUFDckQsS0FBSyxDQUFDLFdBQVc7UUFDZixvRkFBb0Y7UUFDcEYseUVBQXlFO1FBRXpFLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQy9CLE1BQU0sQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEdBQUcsTUFBTSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDOUMseUZBQXlGO1lBQ3pGLGlGQUFpRjtZQUNqRixJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQztZQUM3QixJQUFJLENBQUMsYUFBYSxFQUFFO1NBQ3JCLENBQUMsQ0FBQztRQUVILE9BQU8sSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksVUFBVSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM3RixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssS0FBSyxDQUFDLGdCQUFnQjtRQUM1QixJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDOUIsTUFBTSxLQUFLLENBQUMsMERBQTBELENBQUMsQ0FBQztRQUMxRSxDQUFDO0lBQ0gsQ0FBQztJQUVELCtDQUErQztJQUN2QyxLQUFLLENBQUMsZ0JBQWdCO1FBQzVCLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUM7SUFDL0QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbnRlbnRDb250YWluZXJDb21wb25lbnRIYXJuZXNzLCBIYXJuZXNzUHJlZGljYXRlLCBwYXJhbGxlbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtBcmlhTGl2ZVBvbGl0ZW5lc3N9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7U25hY2tCYXJIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9zbmFjay1iYXItaGFybmVzcy1maWx0ZXJzJztcblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYW4gTURDLWJhc2VkIG1hdC1zbmFjay1iYXIgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0U25hY2tCYXJIYXJuZXNzIGV4dGVuZHMgQ29udGVudENvbnRhaW5lckNvbXBvbmVudEhhcm5lc3M8c3RyaW5nPiB7XG4gIC8vIERldmVsb3BlcnMgY2FuIHByb3ZpZGUgYSBjdXN0b20gY29tcG9uZW50IG9yIHRlbXBsYXRlIGZvciB0aGVcbiAgLy8gc25hY2tiYXIuIFRoZSBjYW5vbmljYWwgc25hY2stYmFyIHBhcmVudCBpcyB0aGUgXCJNYXRTbmFja0JhckNvbnRhaW5lclwiLlxuICAvKiogVGhlIHNlbGVjdG9yIGZvciB0aGUgaG9zdCBlbGVtZW50IG9mIGEgYE1hdFNuYWNrQmFyYCBpbnN0YW5jZS4gKi9cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LW1kYy1zbmFjay1iYXItY29udGFpbmVyOm5vdChbbWF0LWV4aXRdKSc7XG4gIHByaXZhdGUgX21lc3NhZ2VTZWxlY3RvciA9ICcubWRjLXNuYWNrYmFyX19sYWJlbCc7XG4gIHByaXZhdGUgX2FjdGlvbkJ1dHRvblNlbGVjdG9yID0gJy5tYXQtbWRjLXNuYWNrLWJhci1hY3Rpb24nO1xuXG4gIHByaXZhdGUgX3NuYWNrQmFyTGl2ZVJlZ2lvbiA9IHRoaXMubG9jYXRvckZvcignW2FyaWEtbGl2ZV0nKTtcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSBgTWF0U25hY2tCYXJIYXJuZXNzYCB0aGF0IG1lZXRzXG4gICAqIGNlcnRhaW4gY3JpdGVyaWEuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGZpbHRlcmluZyB3aGljaCBzbmFjayBiYXIgaW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkIGEgbWF0Y2guXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGgob3B0aW9uczogU25hY2tCYXJIYXJuZXNzRmlsdGVycyA9IHt9KTogSGFybmVzc1ByZWRpY2F0ZTxNYXRTbmFja0Jhckhhcm5lc3M+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0U25hY2tCYXJIYXJuZXNzLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSByb2xlIG9mIHRoZSBzbmFjay1iYXIuIFRoZSByb2xlIG9mIGEgc25hY2stYmFyIGlzIGRldGVybWluZWQgYmFzZWRcbiAgICogb24gdGhlIEFSSUEgcG9saXRlbmVzcyBzcGVjaWZpZWQgaW4gdGhlIHNuYWNrLWJhciBjb25maWcuXG4gICAqIEBkZXByZWNhdGVkIFVzZSBgZ2V0QXJpYUxpdmVgIGluc3RlYWQuXG4gICAqIEBicmVha2luZy1jaGFuZ2UgMTMuMC4wXG4gICAqL1xuICBhc3luYyBnZXRSb2xlKCk6IFByb21pc2U8J2FsZXJ0JyB8ICdzdGF0dXMnIHwgbnVsbD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgncm9sZScpIGFzIFByb21pc2U8J2FsZXJ0JyB8ICdzdGF0dXMnIHwgbnVsbD47XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgYXJpYS1saXZlIG9mIHRoZSBzbmFjay1iYXIncyBsaXZlIHJlZ2lvbi4gVGhlIGFyaWEtbGl2ZSBvZiBhIHNuYWNrLWJhciBpc1xuICAgKiBkZXRlcm1pbmVkIGJhc2VkIG9uIHRoZSBBUklBIHBvbGl0ZW5lc3Mgc3BlY2lmaWVkIGluIHRoZSBzbmFjay1iYXIgY29uZmlnLlxuICAgKi9cbiAgYXN5bmMgZ2V0QXJpYUxpdmUoKTogUHJvbWlzZTxBcmlhTGl2ZVBvbGl0ZW5lc3M+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX3NuYWNrQmFyTGl2ZVJlZ2lvbigpKS5nZXRBdHRyaWJ1dGUoXG4gICAgICAnYXJpYS1saXZlJyxcbiAgICApIGFzIFByb21pc2U8QXJpYUxpdmVQb2xpdGVuZXNzPjtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBzbmFjay1iYXIgaGFzIGFuIGFjdGlvbi4gTWV0aG9kIGNhbm5vdCBiZSB1c2VkIGZvciBzbmFjay1iYXIncyB3aXRoIGN1c3RvbSBjb250ZW50LlxuICAgKi9cbiAgYXN5bmMgaGFzQWN0aW9uKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fZ2V0QWN0aW9uQnV0dG9uKCkpICE9PSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGRlc2NyaXB0aW9uIG9mIHRoZSBzbmFjay1iYXIuIE1ldGhvZCBjYW5ub3QgYmUgdXNlZCBmb3Igc25hY2stYmFyJ3Mgd2l0aG91dCBhY3Rpb24gb3JcbiAgICogd2l0aCBjdXN0b20gY29udGVudC5cbiAgICovXG4gIGFzeW5jIGdldEFjdGlvbkRlc2NyaXB0aW9uKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgYXdhaXQgdGhpcy5fYXNzZXJ0SGFzQWN0aW9uKCk7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9nZXRBY3Rpb25CdXR0b24oKSkhLnRleHQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNtaXNzZXMgdGhlIHNuYWNrLWJhciBieSBjbGlja2luZyB0aGUgYWN0aW9uIGJ1dHRvbi4gTWV0aG9kIGNhbm5vdCBiZSB1c2VkIGZvciBzbmFjay1iYXInc1xuICAgKiB3aXRob3V0IGFjdGlvbiBvciB3aXRoIGN1c3RvbSBjb250ZW50LlxuICAgKi9cbiAgYXN5bmMgZGlzbWlzc1dpdGhBY3Rpb24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5fYXNzZXJ0SGFzQWN0aW9uKCk7XG4gICAgYXdhaXQgKGF3YWl0IHRoaXMuX2dldEFjdGlvbkJ1dHRvbigpKSEuY2xpY2soKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBtZXNzYWdlIG9mIHRoZSBzbmFjay1iYXIuIE1ldGhvZCBjYW5ub3QgYmUgdXNlZCBmb3Igc25hY2stYmFyJ3Mgd2l0aCBjdXN0b20gY29udGVudC5cbiAgICovXG4gIGFzeW5jIGdldE1lc3NhZ2UoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMubG9jYXRvckZvcih0aGlzLl9tZXNzYWdlU2VsZWN0b3IpKCkpLnRleHQoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIHNuYWNrLWJhciBoYXMgYmVlbiBkaXNtaXNzZWQuICovXG4gIGFzeW5jIGlzRGlzbWlzc2VkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIC8vIFdlIGNvbnNpZGVyIHRoZSBzbmFja2JhciBkaXNtaXNzZWQgaWYgaXQncyBub3QgaW4gdGhlIERPTS4gV2UgY2FuIGFzc2VydCB0aGF0IHRoZVxuICAgIC8vIGVsZW1lbnQgaXNuJ3QgaW4gdGhlIERPTSBieSBzZWVpbmcgdGhhdCBpdHMgd2lkdGggYW5kIGhlaWdodCBhcmUgemVyby5cblxuICAgIGNvbnN0IGhvc3QgPSBhd2FpdCB0aGlzLmhvc3QoKTtcbiAgICBjb25zdCBbZXhpdCwgZGltZW5zaW9uc10gPSBhd2FpdCBwYXJhbGxlbCgoKSA9PiBbXG4gICAgICAvLyBUaGUgc25hY2tiYXIgY29udGFpbmVyIGlzIG1hcmtlZCB3aXRoIHRoZSBcImV4aXRcIiBhdHRyaWJ1dGUgYWZ0ZXIgaXQgaGFzIGJlZW4gZGlzbWlzc2VkXG4gICAgICAvLyBidXQgYmVmb3JlIHRoZSBhbmltYXRpb24gaGFzIGZpbmlzaGVkIChhZnRlciB3aGljaCBpdCdzIHJlbW92ZWQgZnJvbSB0aGUgRE9NKS5cbiAgICAgIGhvc3QuZ2V0QXR0cmlidXRlKCdtYXQtZXhpdCcpLFxuICAgICAgaG9zdC5nZXREaW1lbnNpb25zKCksXG4gICAgXSk7XG5cbiAgICByZXR1cm4gZXhpdCAhPSBudWxsIHx8ICghIWRpbWVuc2lvbnMgJiYgZGltZW5zaW9ucy5oZWlnaHQgPT09IDAgJiYgZGltZW5zaW9ucy53aWR0aCA9PT0gMCk7XG4gIH1cblxuICAvKipcbiAgICogQXNzZXJ0cyB0aGF0IHRoZSBjdXJyZW50IHNuYWNrLWJhciBoYXMgYW4gYWN0aW9uIGRlZmluZWQuIE90aGVyd2lzZSB0aGVcbiAgICogcHJvbWlzZSB3aWxsIHJlamVjdC5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX2Fzc2VydEhhc0FjdGlvbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmhhc0FjdGlvbigpKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ01ldGhvZCBjYW5ub3QgYmUgdXNlZCBmb3IgYSBzbmFjay1iYXIgd2l0aG91dCBhbiBhY3Rpb24uJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEdldHMgdGhlIHNpbXBsZSBzbmFjayBiYXIgYWN0aW9uIGJ1dHRvbi4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0QWN0aW9uQnV0dG9uKCkge1xuICAgIHJldHVybiB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbCh0aGlzLl9hY3Rpb25CdXR0b25TZWxlY3RvcikoKTtcbiAgfVxufVxuIl19