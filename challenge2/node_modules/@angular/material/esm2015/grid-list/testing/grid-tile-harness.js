/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
/** Harness for interacting with a standard `MatGridTitle` in tests. */
export class MatGridTileHarness extends ContentContainerComponentHarness {
    constructor() {
        super(...arguments);
        this._header = this.locatorForOptional(".mat-grid-tile-header" /* HEADER */);
        this._footer = this.locatorForOptional(".mat-grid-tile-footer" /* FOOTER */);
        this._avatar = this.locatorForOptional('.mat-grid-avatar');
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatGridTileHarness`
     * that meets certain criteria.
     * @param options Options for filtering which dialog instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatGridTileHarness, options)
            .addOption('headerText', options.headerText, (harness, pattern) => HarnessPredicate.stringMatches(harness.getHeaderText(), pattern))
            .addOption('footerText', options.footerText, (harness, pattern) => HarnessPredicate.stringMatches(harness.getFooterText(), pattern));
    }
    /** Gets the amount of rows that the grid-tile takes up. */
    getRowspan() {
        return __awaiter(this, void 0, void 0, function* () {
            return Number(yield (yield this.host()).getAttribute('rowspan'));
        });
    }
    /** Gets the amount of columns that the grid-tile takes up. */
    getColspan() {
        return __awaiter(this, void 0, void 0, function* () {
            return Number(yield (yield this.host()).getAttribute('colspan'));
        });
    }
    /** Whether the grid-tile has a header. */
    hasHeader() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._header()) !== null;
        });
    }
    /** Whether the grid-tile has a footer. */
    hasFooter() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._footer()) !== null;
        });
    }
    /** Whether the grid-tile has an avatar. */
    hasAvatar() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._avatar()) !== null;
        });
    }
    /** Gets the text of the header if present. */
    getHeaderText() {
        return __awaiter(this, void 0, void 0, function* () {
            // For performance reasons, we do not use "hasHeader" as
            // we would then need to query twice for the header.
            const headerEl = yield this._header();
            return headerEl ? headerEl.text() : null;
        });
    }
    /** Gets the text of the footer if present. */
    getFooterText() {
        return __awaiter(this, void 0, void 0, function* () {
            // For performance reasons, we do not use "hasFooter" as
            // we would then need to query twice for the footer.
            const headerEl = yield this._footer();
            return headerEl ? headerEl.text() : null;
        });
    }
}
/** The selector for the host element of a `MatGridTile` instance. */
MatGridTileHarness.hostSelector = '.mat-grid-tile';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZC10aWxlLWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZ3JpZC1saXN0L3Rlc3RpbmcvZ3JpZC10aWxlLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxnQ0FBZ0MsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBU3hGLHVFQUF1RTtBQUN2RSxNQUFNLE9BQU8sa0JBQW1CLFNBQVEsZ0NBQW9EO0lBQTVGOztRQW9CVSxZQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixzQ0FBMkIsQ0FBQztRQUM3RCxZQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixzQ0FBMkIsQ0FBQztRQUM3RCxZQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLENBQUM7SUEwQ2hFLENBQUM7SUE1REM7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQWtDLEVBQUU7UUFDOUMsT0FBTyxJQUFJLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQzthQUNuRCxTQUFTLENBQ04sWUFBWSxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQ2hDLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQzthQUMxRixTQUFTLENBQ04sWUFBWSxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQ2hDLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ2xHLENBQUM7SUFNRCwyREFBMkQ7SUFDckQsVUFBVTs7WUFDZCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNuRSxDQUFDO0tBQUE7SUFFRCw4REFBOEQ7SUFDeEQsVUFBVTs7WUFDZCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNuRSxDQUFDO0tBQUE7SUFFRCwwQ0FBMEM7SUFDcEMsU0FBUzs7WUFDYixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBSyxJQUFJLENBQUM7UUFDekMsQ0FBQztLQUFBO0lBRUQsMENBQTBDO0lBQ3BDLFNBQVM7O1lBQ2IsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssSUFBSSxDQUFDO1FBQ3pDLENBQUM7S0FBQTtJQUVELDJDQUEyQztJQUNyQyxTQUFTOztZQUNiLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLElBQUksQ0FBQztRQUN6QyxDQUFDO0tBQUE7SUFFRCw4Q0FBOEM7SUFDeEMsYUFBYTs7WUFDakIsd0RBQXdEO1lBQ3hELG9EQUFvRDtZQUNwRCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN0QyxPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDM0MsQ0FBQztLQUFBO0lBRUQsOENBQThDO0lBQ3hDLGFBQWE7O1lBQ2pCLHdEQUF3RDtZQUN4RCxvREFBb0Q7WUFDcEQsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdEMsT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQzNDLENBQUM7S0FBQTs7QUE5REQscUVBQXFFO0FBQzlELCtCQUFZLEdBQUcsZ0JBQWdCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb250ZW50Q29udGFpbmVyQ29tcG9uZW50SGFybmVzcywgSGFybmVzc1ByZWRpY2F0ZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtHcmlkVGlsZUhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL2dyaWQtbGlzdC1oYXJuZXNzLWZpbHRlcnMnO1xuXG4vKiogU2VsZWN0b3JzIGZvciB0aGUgdmFyaW91cyBgbWF0LWdyaWQtdGlsZWAgc2VjdGlvbnMgdGhhdCBtYXkgY29udGFpbiB1c2VyIGNvbnRlbnQuICovXG5leHBvcnQgY29uc3QgZW51bSBNYXRHcmlkVGlsZVNlY3Rpb24ge1xuICBIRUFERVIgPSAnLm1hdC1ncmlkLXRpbGUtaGVhZGVyJyxcbiAgRk9PVEVSID0gJy5tYXQtZ3JpZC10aWxlLWZvb3Rlcidcbn1cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBgTWF0R3JpZFRpdGxlYCBpbiB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBNYXRHcmlkVGlsZUhhcm5lc3MgZXh0ZW5kcyBDb250ZW50Q29udGFpbmVyQ29tcG9uZW50SGFybmVzczxNYXRHcmlkVGlsZVNlY3Rpb24+IHtcbiAgLyoqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGBNYXRHcmlkVGlsZWAgaW5zdGFuY2UuICovXG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1ncmlkLXRpbGUnO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIGBNYXRHcmlkVGlsZUhhcm5lc3NgXG4gICAqIHRoYXQgbWVldHMgY2VydGFpbiBjcml0ZXJpYS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIGRpYWxvZyBpbnN0YW5jZXMgYXJlIGNvbnNpZGVyZWQgYSBtYXRjaC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBHcmlkVGlsZUhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdEdyaWRUaWxlSGFybmVzcz4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZShNYXRHcmlkVGlsZUhhcm5lc3MsIG9wdGlvbnMpXG4gICAgICAgIC5hZGRPcHRpb24oXG4gICAgICAgICAgICAnaGVhZGVyVGV4dCcsIG9wdGlvbnMuaGVhZGVyVGV4dCxcbiAgICAgICAgICAgIChoYXJuZXNzLCBwYXR0ZXJuKSA9PiBIYXJuZXNzUHJlZGljYXRlLnN0cmluZ01hdGNoZXMoaGFybmVzcy5nZXRIZWFkZXJUZXh0KCksIHBhdHRlcm4pKVxuICAgICAgICAuYWRkT3B0aW9uKFxuICAgICAgICAgICAgJ2Zvb3RlclRleHQnLCBvcHRpb25zLmZvb3RlclRleHQsXG4gICAgICAgICAgICAoaGFybmVzcywgcGF0dGVybikgPT4gSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0Rm9vdGVyVGV4dCgpLCBwYXR0ZXJuKSk7XG4gIH1cblxuICBwcml2YXRlIF9oZWFkZXIgPSB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbChNYXRHcmlkVGlsZVNlY3Rpb24uSEVBREVSKTtcbiAgcHJpdmF0ZSBfZm9vdGVyID0gdGhpcy5sb2NhdG9yRm9yT3B0aW9uYWwoTWF0R3JpZFRpbGVTZWN0aW9uLkZPT1RFUik7XG4gIHByaXZhdGUgX2F2YXRhciA9IHRoaXMubG9jYXRvckZvck9wdGlvbmFsKCcubWF0LWdyaWQtYXZhdGFyJyk7XG5cbiAgLyoqIEdldHMgdGhlIGFtb3VudCBvZiByb3dzIHRoYXQgdGhlIGdyaWQtdGlsZSB0YWtlcyB1cC4gKi9cbiAgYXN5bmMgZ2V0Um93c3BhbigpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiBOdW1iZXIoYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRBdHRyaWJ1dGUoJ3Jvd3NwYW4nKSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgYW1vdW50IG9mIGNvbHVtbnMgdGhhdCB0aGUgZ3JpZC10aWxlIHRha2VzIHVwLiAqL1xuICBhc3luYyBnZXRDb2xzcGFuKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgcmV0dXJuIE51bWJlcihhd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnY29sc3BhbicpKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBncmlkLXRpbGUgaGFzIGEgaGVhZGVyLiAqL1xuICBhc3luYyBoYXNIZWFkZXIoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9oZWFkZXIoKSkgIT09IG51bGw7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgZ3JpZC10aWxlIGhhcyBhIGZvb3Rlci4gKi9cbiAgYXN5bmMgaGFzRm9vdGVyKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fZm9vdGVyKCkpICE9PSBudWxsO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGdyaWQtdGlsZSBoYXMgYW4gYXZhdGFyLiAqL1xuICBhc3luYyBoYXNBdmF0YXIoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9hdmF0YXIoKSkgIT09IG51bGw7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdGV4dCBvZiB0aGUgaGVhZGVyIGlmIHByZXNlbnQuICovXG4gIGFzeW5jIGdldEhlYWRlclRleHQoKTogUHJvbWlzZTxzdHJpbmd8bnVsbD4ge1xuICAgIC8vIEZvciBwZXJmb3JtYW5jZSByZWFzb25zLCB3ZSBkbyBub3QgdXNlIFwiaGFzSGVhZGVyXCIgYXNcbiAgICAvLyB3ZSB3b3VsZCB0aGVuIG5lZWQgdG8gcXVlcnkgdHdpY2UgZm9yIHRoZSBoZWFkZXIuXG4gICAgY29uc3QgaGVhZGVyRWwgPSBhd2FpdCB0aGlzLl9oZWFkZXIoKTtcbiAgICByZXR1cm4gaGVhZGVyRWwgPyBoZWFkZXJFbC50ZXh0KCkgOiBudWxsO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHRleHQgb2YgdGhlIGZvb3RlciBpZiBwcmVzZW50LiAqL1xuICBhc3luYyBnZXRGb290ZXJUZXh0KCk6IFByb21pc2U8c3RyaW5nfG51bGw+IHtcbiAgICAvLyBGb3IgcGVyZm9ybWFuY2UgcmVhc29ucywgd2UgZG8gbm90IHVzZSBcImhhc0Zvb3RlclwiIGFzXG4gICAgLy8gd2Ugd291bGQgdGhlbiBuZWVkIHRvIHF1ZXJ5IHR3aWNlIGZvciB0aGUgZm9vdGVyLlxuICAgIGNvbnN0IGhlYWRlckVsID0gYXdhaXQgdGhpcy5fZm9vdGVyKCk7XG4gICAgcmV0dXJuIGhlYWRlckVsID8gaGVhZGVyRWwudGV4dCgpIDogbnVsbDtcbiAgfVxufVxuIl19