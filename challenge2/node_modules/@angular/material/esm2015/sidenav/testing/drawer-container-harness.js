/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { MatDrawerContentHarness } from './drawer-content-harness';
import { MatDrawerHarness } from './drawer-harness';
/** Harness for interacting with a standard mat-drawer-container in tests. */
export class MatDrawerContainerHarness extends ContentContainerComponentHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatDrawerContainerHarness` that
     * meets certain criteria.
     * @param options Options for filtering which container instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatDrawerContainerHarness, options);
    }
    /**
     * Gets drawers that match particular criteria within the container.
     * @param filter Optionally filters which chips are included.
     */
    getDrawers(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorForAll(MatDrawerHarness.with(filter))();
        });
    }
    /** Gets the element that has the container's content. */
    getContent() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorFor(MatDrawerContentHarness)();
        });
    }
}
/** The selector for the host element of a `MatDrawerContainer` instance. */
MatDrawerContainerHarness.hostSelector = '.mat-drawer-container';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhd2VyLWNvbnRhaW5lci1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3NpZGVuYXYvdGVzdGluZy9kcmF3ZXItY29udGFpbmVyLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxnQ0FBZ0MsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBRXhGLE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ2pFLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRWxELDZFQUE2RTtBQUM3RSxNQUFNLE9BQU8seUJBQTBCLFNBQVEsZ0NBQXdDO0lBSXJGOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUF5QyxFQUFFO1FBRXJELE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyx5QkFBeUIsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0csVUFBVSxDQUFDLFNBQStCLEVBQUU7O1lBQ2hELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzdELENBQUM7S0FBQTtJQUVELHlEQUF5RDtJQUNuRCxVQUFVOztZQUNkLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLENBQUM7UUFDcEQsQ0FBQztLQUFBOztBQXpCRCw0RUFBNEU7QUFDckUsc0NBQVksR0FBRyx1QkFBdUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbnRlbnRDb250YWluZXJDb21wb25lbnRIYXJuZXNzLCBIYXJuZXNzUHJlZGljYXRlfSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XG5pbXBvcnQge0RyYXdlckNvbnRhaW5lckhhcm5lc3NGaWx0ZXJzLCBEcmF3ZXJIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9kcmF3ZXItaGFybmVzcy1maWx0ZXJzJztcbmltcG9ydCB7TWF0RHJhd2VyQ29udGVudEhhcm5lc3N9IGZyb20gJy4vZHJhd2VyLWNvbnRlbnQtaGFybmVzcyc7XG5pbXBvcnQge01hdERyYXdlckhhcm5lc3N9IGZyb20gJy4vZHJhd2VyLWhhcm5lc3MnO1xuXG4vKiogSGFybmVzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIHN0YW5kYXJkIG1hdC1kcmF3ZXItY29udGFpbmVyIGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdERyYXdlckNvbnRhaW5lckhhcm5lc3MgZXh0ZW5kcyBDb250ZW50Q29udGFpbmVyQ29tcG9uZW50SGFybmVzczxzdHJpbmc+IHtcbiAgLyoqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGBNYXREcmF3ZXJDb250YWluZXJgIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtZHJhd2VyLWNvbnRhaW5lcic7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc1ByZWRpY2F0ZWAgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWFyY2ggZm9yIGEgYE1hdERyYXdlckNvbnRhaW5lckhhcm5lc3NgIHRoYXRcbiAgICogbWVldHMgY2VydGFpbiBjcml0ZXJpYS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIGNvbnRhaW5lciBpbnN0YW5jZXMgYXJlIGNvbnNpZGVyZWQgYSBtYXRjaC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBEcmF3ZXJDb250YWluZXJIYXJuZXNzRmlsdGVycyA9IHt9KTpcbiAgICBIYXJuZXNzUHJlZGljYXRlPE1hdERyYXdlckNvbnRhaW5lckhhcm5lc3M+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0RHJhd2VyQ29udGFpbmVySGFybmVzcywgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBkcmF3ZXJzIHRoYXQgbWF0Y2ggcGFydGljdWxhciBjcml0ZXJpYSB3aXRoaW4gdGhlIGNvbnRhaW5lci5cbiAgICogQHBhcmFtIGZpbHRlciBPcHRpb25hbGx5IGZpbHRlcnMgd2hpY2ggY2hpcHMgYXJlIGluY2x1ZGVkLlxuICAgKi9cbiAgYXN5bmMgZ2V0RHJhd2VycyhmaWx0ZXI6IERyYXdlckhhcm5lc3NGaWx0ZXJzID0ge30pOiBQcm9taXNlPE1hdERyYXdlckhhcm5lc3NbXT4ge1xuICAgIHJldHVybiB0aGlzLmxvY2F0b3JGb3JBbGwoTWF0RHJhd2VySGFybmVzcy53aXRoKGZpbHRlcikpKCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgZWxlbWVudCB0aGF0IGhhcyB0aGUgY29udGFpbmVyJ3MgY29udGVudC4gKi9cbiAgYXN5bmMgZ2V0Q29udGVudCgpOiBQcm9taXNlPE1hdERyYXdlckNvbnRlbnRIYXJuZXNzPiB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZvcihNYXREcmF3ZXJDb250ZW50SGFybmVzcykoKTtcbiAgfVxufVxuIl19