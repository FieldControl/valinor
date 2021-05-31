/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { MatButtonToggleHarness } from './button-toggle-harness';
/** Harness for interacting with a standard mat-button-toggle in tests. */
export class MatButtonToggleGroupHarness extends ComponentHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatButtonToggleGroupHarness`
     * that meets certain criteria.
     * @param options Options for filtering which button toggle instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatButtonToggleGroupHarness, options);
    }
    /**
     * Gets the button toggles that are inside the group.
     * @param filter Optionally filters which toggles are included.
     */
    getToggles(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorForAll(MatButtonToggleHarness.with(filter))();
        });
    }
    /** Gets whether the button toggle group is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield (yield this.host()).getAttribute('aria-disabled')) === 'true';
        });
    }
    /** Gets whether the button toggle group is laid out vertically. */
    isVertical() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass('mat-button-toggle-vertical');
        });
    }
    /** Gets the appearance that the group is using. */
    getAppearance() {
        return __awaiter(this, void 0, void 0, function* () {
            const host = yield this.host();
            const className = 'mat-button-toggle-group-appearance-standard';
            return (yield host.hasClass(className)) ? 'standard' : 'legacy';
        });
    }
}
/** The selector for the host element of a `MatButton` instance. */
MatButtonToggleGroupHarness.hostSelector = '.mat-button-toggle-group';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLXRvZ2dsZS1ncm91cC1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2J1dHRvbi10b2dnbGUvdGVzdGluZy9idXR0b24tdG9nZ2xlLWdyb3VwLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBSXhFLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBRy9ELDBFQUEwRTtBQUMxRSxNQUFNLE9BQU8sMkJBQTRCLFNBQVEsZ0JBQWdCO0lBSS9EOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUEyQyxFQUFFO1FBRXZELE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQywyQkFBMkIsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0csVUFBVSxDQUFDLFNBQXFDLEVBQUU7O1lBQ3RELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ25FLENBQUM7S0FBQTtJQUVELHdEQUF3RDtJQUNsRCxVQUFVOztZQUNkLE9BQU8sQ0FBQSxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLE1BQUssTUFBTSxDQUFDO1FBQzVFLENBQUM7S0FBQTtJQUVELG1FQUFtRTtJQUM3RCxVQUFVOztZQUNkLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQ3BFLENBQUM7S0FBQTtJQUVELG1EQUFtRDtJQUM3QyxhQUFhOztZQUNqQixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMvQixNQUFNLFNBQVMsR0FBRyw2Q0FBNkMsQ0FBQztZQUNoRSxPQUFPLENBQUEsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUNoRSxDQUFDO0tBQUE7O0FBckNELG1FQUFtRTtBQUM1RCx3Q0FBWSxHQUFHLDBCQUEwQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcG9uZW50SGFybmVzcywgSGFybmVzc1ByZWRpY2F0ZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtNYXRCdXR0b25Ub2dnbGVBcHBlYXJhbmNlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9idXR0b24tdG9nZ2xlJztcbmltcG9ydCB7QnV0dG9uVG9nZ2xlR3JvdXBIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9idXR0b24tdG9nZ2xlLWdyb3VwLWhhcm5lc3MtZmlsdGVycyc7XG5pbXBvcnQge0J1dHRvblRvZ2dsZUhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL2J1dHRvbi10b2dnbGUtaGFybmVzcy1maWx0ZXJzJztcbmltcG9ydCB7TWF0QnV0dG9uVG9nZ2xlSGFybmVzc30gZnJvbSAnLi9idXR0b24tdG9nZ2xlLWhhcm5lc3MnO1xuXG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgc3RhbmRhcmQgbWF0LWJ1dHRvbi10b2dnbGUgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0QnV0dG9uVG9nZ2xlR3JvdXBIYXJuZXNzIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcyB7XG4gIC8qKiBUaGUgc2VsZWN0b3IgZm9yIHRoZSBob3N0IGVsZW1lbnQgb2YgYSBgTWF0QnV0dG9uYCBpbnN0YW5jZS4gKi9cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LWJ1dHRvbi10b2dnbGUtZ3JvdXAnO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIGBNYXRCdXR0b25Ub2dnbGVHcm91cEhhcm5lc3NgXG4gICAqIHRoYXQgbWVldHMgY2VydGFpbiBjcml0ZXJpYS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIGJ1dHRvbiB0b2dnbGUgaW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkIGEgbWF0Y2guXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGgob3B0aW9uczogQnV0dG9uVG9nZ2xlR3JvdXBIYXJuZXNzRmlsdGVycyA9IHt9KTpcbiAgICBIYXJuZXNzUHJlZGljYXRlPE1hdEJ1dHRvblRvZ2dsZUdyb3VwSGFybmVzcz4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZShNYXRCdXR0b25Ub2dnbGVHcm91cEhhcm5lc3MsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGJ1dHRvbiB0b2dnbGVzIHRoYXQgYXJlIGluc2lkZSB0aGUgZ3JvdXAuXG4gICAqIEBwYXJhbSBmaWx0ZXIgT3B0aW9uYWxseSBmaWx0ZXJzIHdoaWNoIHRvZ2dsZXMgYXJlIGluY2x1ZGVkLlxuICAgKi9cbiAgYXN5bmMgZ2V0VG9nZ2xlcyhmaWx0ZXI6IEJ1dHRvblRvZ2dsZUhhcm5lc3NGaWx0ZXJzID0ge30pOiBQcm9taXNlPE1hdEJ1dHRvblRvZ2dsZUhhcm5lc3NbXT4ge1xuICAgIHJldHVybiB0aGlzLmxvY2F0b3JGb3JBbGwoTWF0QnV0dG9uVG9nZ2xlSGFybmVzcy53aXRoKGZpbHRlcikpKCk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZSBidXR0b24gdG9nZ2xlIGdyb3VwIGlzIGRpc2FibGVkLiAqL1xuICBhc3luYyBpc0Rpc2FibGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBhd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnYXJpYS1kaXNhYmxlZCcpID09PSAndHJ1ZSc7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZSBidXR0b24gdG9nZ2xlIGdyb3VwIGlzIGxhaWQgb3V0IHZlcnRpY2FsbHkuICovXG4gIGFzeW5jIGlzVmVydGljYWwoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuaGFzQ2xhc3MoJ21hdC1idXR0b24tdG9nZ2xlLXZlcnRpY2FsJyk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgYXBwZWFyYW5jZSB0aGF0IHRoZSBncm91cCBpcyB1c2luZy4gKi9cbiAgYXN5bmMgZ2V0QXBwZWFyYW5jZSgpOiBQcm9taXNlPE1hdEJ1dHRvblRvZ2dsZUFwcGVhcmFuY2U+IHtcbiAgICBjb25zdCBob3N0ID0gYXdhaXQgdGhpcy5ob3N0KCk7XG4gICAgY29uc3QgY2xhc3NOYW1lID0gJ21hdC1idXR0b24tdG9nZ2xlLWdyb3VwLWFwcGVhcmFuY2Utc3RhbmRhcmQnO1xuICAgIHJldHVybiBhd2FpdCBob3N0Lmhhc0NsYXNzKGNsYXNzTmFtZSkgPyAnc3RhbmRhcmQnIDogJ2xlZ2FjeSc7XG4gIH1cbn1cbiJdfQ==