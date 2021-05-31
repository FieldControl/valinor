/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
/**
 * Base class for the drawer harness functionality.
 * @docs-private
 */
export class MatDrawerHarnessBase extends ContentContainerComponentHarness {
    /** Whether the drawer is open. */
    isOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass('mat-drawer-opened');
        });
    }
    /** Gets the position of the drawer inside its container. */
    getPosition() {
        return __awaiter(this, void 0, void 0, function* () {
            const host = yield this.host();
            return (yield host.hasClass('mat-drawer-end')) ? 'end' : 'start';
        });
    }
    /** Gets the mode that the drawer is in. */
    getMode() {
        return __awaiter(this, void 0, void 0, function* () {
            const host = yield this.host();
            if (yield host.hasClass('mat-drawer-push')) {
                return 'push';
            }
            if (yield host.hasClass('mat-drawer-side')) {
                return 'side';
            }
            return 'over';
        });
    }
}
/** Harness for interacting with a standard mat-drawer in tests. */
export class MatDrawerHarness extends MatDrawerHarnessBase {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatDrawerHarness` that meets
     * certain criteria.
     * @param options Options for filtering which drawer instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatDrawerHarness, options)
            .addOption('position', options.position, (harness, position) => __awaiter(this, void 0, void 0, function* () { return (yield harness.getPosition()) === position; }));
    }
}
/** The selector for the host element of a `MatDrawer` instance. */
MatDrawerHarness.hostSelector = '.mat-drawer';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhd2VyLWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2lkZW5hdi90ZXN0aW5nL2RyYXdlci1oYXJuZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsZ0NBQWdDLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUd4Rjs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sb0JBQXFCLFNBQVEsZ0NBQXdDO0lBQ2hGLGtDQUFrQztJQUM1QixNQUFNOztZQUNWLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQzNELENBQUM7S0FBQTtJQUVELDREQUE0RDtJQUN0RCxXQUFXOztZQUNmLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQy9CLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUNuRSxDQUFDO0tBQUE7SUFFRCwyQ0FBMkM7SUFDckMsT0FBTzs7WUFDWCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUUvQixJQUFJLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO2dCQUMxQyxPQUFPLE1BQU0sQ0FBQzthQUNmO1lBRUQsSUFBSSxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsRUFBRTtnQkFDMUMsT0FBTyxNQUFNLENBQUM7YUFDZjtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUM7S0FBQTtDQUNGO0FBRUQsbUVBQW1FO0FBQ25FLE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxvQkFBb0I7SUFJeEQ7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQWdDLEVBQUU7UUFDNUMsT0FBTyxJQUFJLGdCQUFnQixDQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQzthQUNqRCxTQUFTLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQ25DLENBQU8sT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFLGdEQUFDLE9BQUEsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLFFBQVEsQ0FBQSxHQUFBLENBQUMsQ0FBQztJQUNuRixDQUFDOztBQWJELG1FQUFtRTtBQUM1RCw2QkFBWSxHQUFHLGFBQWEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbnRlbnRDb250YWluZXJDb21wb25lbnRIYXJuZXNzLCBIYXJuZXNzUHJlZGljYXRlfSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XG5pbXBvcnQge0RyYXdlckhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL2RyYXdlci1oYXJuZXNzLWZpbHRlcnMnO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIHRoZSBkcmF3ZXIgaGFybmVzcyBmdW5jdGlvbmFsaXR5LlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY2xhc3MgTWF0RHJhd2VySGFybmVzc0Jhc2UgZXh0ZW5kcyBDb250ZW50Q29udGFpbmVyQ29tcG9uZW50SGFybmVzczxzdHJpbmc+IHtcbiAgLyoqIFdoZXRoZXIgdGhlIGRyYXdlciBpcyBvcGVuLiAqL1xuICBhc3luYyBpc09wZW4oKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuaGFzQ2xhc3MoJ21hdC1kcmF3ZXItb3BlbmVkJyk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgcG9zaXRpb24gb2YgdGhlIGRyYXdlciBpbnNpZGUgaXRzIGNvbnRhaW5lci4gKi9cbiAgYXN5bmMgZ2V0UG9zaXRpb24oKTogUHJvbWlzZTwnc3RhcnQnfCdlbmQnPiB7XG4gICAgY29uc3QgaG9zdCA9IGF3YWl0IHRoaXMuaG9zdCgpO1xuICAgIHJldHVybiAoYXdhaXQgaG9zdC5oYXNDbGFzcygnbWF0LWRyYXdlci1lbmQnKSkgPyAnZW5kJyA6ICdzdGFydCc7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbW9kZSB0aGF0IHRoZSBkcmF3ZXIgaXMgaW4uICovXG4gIGFzeW5jIGdldE1vZGUoKTogUHJvbWlzZTwnb3Zlcid8J3B1c2gnfCdzaWRlJz4ge1xuICAgIGNvbnN0IGhvc3QgPSBhd2FpdCB0aGlzLmhvc3QoKTtcblxuICAgIGlmIChhd2FpdCBob3N0Lmhhc0NsYXNzKCdtYXQtZHJhd2VyLXB1c2gnKSkge1xuICAgICAgcmV0dXJuICdwdXNoJztcbiAgICB9XG5cbiAgICBpZiAoYXdhaXQgaG9zdC5oYXNDbGFzcygnbWF0LWRyYXdlci1zaWRlJykpIHtcbiAgICAgIHJldHVybiAnc2lkZSc7XG4gICAgfVxuXG4gICAgcmV0dXJuICdvdmVyJztcbiAgfVxufVxuXG4vKiogSGFybmVzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIHN0YW5kYXJkIG1hdC1kcmF3ZXIgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0RHJhd2VySGFybmVzcyBleHRlbmRzIE1hdERyYXdlckhhcm5lc3NCYXNlIHtcbiAgLyoqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGBNYXREcmF3ZXJgIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtZHJhd2VyJztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSBgTWF0RHJhd2VySGFybmVzc2AgdGhhdCBtZWV0c1xuICAgKiBjZXJ0YWluIGNyaXRlcmlhLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBmaWx0ZXJpbmcgd2hpY2ggZHJhd2VyIGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IERyYXdlckhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdERyYXdlckhhcm5lc3M+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0RHJhd2VySGFybmVzcywgb3B0aW9ucylcbiAgICAgICAgLmFkZE9wdGlvbigncG9zaXRpb24nLCBvcHRpb25zLnBvc2l0aW9uLFxuICAgICAgICAgICAgYXN5bmMgKGhhcm5lc3MsIHBvc2l0aW9uKSA9PiAoYXdhaXQgaGFybmVzcy5nZXRQb3NpdGlvbigpKSA9PT0gcG9zaXRpb24pO1xuICB9XG59XG4iXX0=