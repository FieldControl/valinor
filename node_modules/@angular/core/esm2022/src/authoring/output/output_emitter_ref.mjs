/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { setActiveConsumer } from '@angular/core/primitives/signals';
import { inject } from '../../di/injector_compatibility';
import { ErrorHandler } from '../../error_handler';
import { RuntimeError } from '../../errors';
import { DestroyRef } from '../../linker/destroy_ref';
/**
 * An `OutputEmitterRef` is created by the `output()` function and can be
 * used to emit values to consumers of your directive or component.
 *
 * Consumers of your directive/component can bind to the output and
 * subscribe to changes via the bound event syntax. For example:
 *
 * ```html
 * <my-comp (valueChange)="processNewValue($event)" />
 * ```
 *
 * @developerPreview
 */
export class OutputEmitterRef {
    constructor() {
        this.destroyed = false;
        this.listeners = null;
        this.errorHandler = inject(ErrorHandler, { optional: true });
        /** @internal */
        this.destroyRef = inject(DestroyRef);
        // Clean-up all listeners and mark as destroyed upon destroy.
        this.destroyRef.onDestroy(() => {
            this.destroyed = true;
            this.listeners = null;
        });
    }
    subscribe(callback) {
        if (this.destroyed) {
            throw new RuntimeError(953 /* RuntimeErrorCode.OUTPUT_REF_DESTROYED */, ngDevMode &&
                'Unexpected subscription to destroyed `OutputRef`. ' +
                    'The owning directive/component is destroyed.');
        }
        (this.listeners ??= []).push(callback);
        return {
            unsubscribe: () => {
                const idx = this.listeners?.indexOf(callback);
                if (idx !== undefined && idx !== -1) {
                    this.listeners?.splice(idx, 1);
                }
            },
        };
    }
    /** Emits a new value to the output. */
    emit(value) {
        if (this.destroyed) {
            throw new RuntimeError(953 /* RuntimeErrorCode.OUTPUT_REF_DESTROYED */, ngDevMode &&
                'Unexpected emit for destroyed `OutputRef`. ' +
                    'The owning directive/component is destroyed.');
        }
        if (this.listeners === null) {
            return;
        }
        const previousConsumer = setActiveConsumer(null);
        try {
            for (const listenerFn of this.listeners) {
                try {
                    listenerFn(value);
                }
                catch (err) {
                    this.errorHandler?.handleError(err);
                }
            }
        }
        finally {
            setActiveConsumer(previousConsumer);
        }
    }
}
/** Gets the owning `DestroyRef` for the given output. */
export function getOutputDestroyRef(ref) {
    return ref.destroyRef;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0X2VtaXR0ZXJfcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvYXV0aG9yaW5nL291dHB1dC9vdXRwdXRfZW1pdHRlcl9yZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sa0NBQWtDLENBQUM7QUFFbkUsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQ3ZELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsWUFBWSxFQUFtQixNQUFNLGNBQWMsQ0FBQztBQUM1RCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFJcEQ7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0gsTUFBTSxPQUFPLGdCQUFnQjtJQVEzQjtRQVBRLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFDbEIsY0FBUyxHQUFxQyxJQUFJLENBQUM7UUFDbkQsaUJBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFFOUQsZ0JBQWdCO1FBQ2hCLGVBQVUsR0FBZSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7UUFHMUMsNkRBQTZEO1FBQzdELElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtZQUM3QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN0QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUN4QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxTQUFTLENBQUMsUUFBNEI7UUFDcEMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDbkIsTUFBTSxJQUFJLFlBQVksa0RBRXBCLFNBQVM7Z0JBQ1Asb0RBQW9EO29CQUNsRCw4Q0FBOEMsQ0FDbkQsQ0FBQztRQUNKLENBQUM7UUFFRCxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXZDLE9BQU87WUFDTCxXQUFXLEVBQUUsR0FBRyxFQUFFO2dCQUNoQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDOUMsSUFBSSxHQUFHLEtBQUssU0FBUyxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUNwQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLENBQUM7WUFDSCxDQUFDO1NBQ0YsQ0FBQztJQUNKLENBQUM7SUFFRCx1Q0FBdUM7SUFDdkMsSUFBSSxDQUFDLEtBQVE7UUFDWCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNuQixNQUFNLElBQUksWUFBWSxrREFFcEIsU0FBUztnQkFDUCw2Q0FBNkM7b0JBQzNDLDhDQUE4QyxDQUNuRCxDQUFDO1FBQ0osQ0FBQztRQUVELElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUM1QixPQUFPO1FBQ1QsQ0FBQztRQUVELE1BQU0sZ0JBQWdCLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDO1lBQ0gsS0FBSyxNQUFNLFVBQVUsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ3hDLElBQUksQ0FBQztvQkFDSCxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3BCLENBQUM7Z0JBQUMsT0FBTyxHQUFZLEVBQUUsQ0FBQztvQkFDdEIsSUFBSSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3RDLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztnQkFBUyxDQUFDO1lBQ1QsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN0QyxDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBRUQseURBQXlEO0FBQ3pELE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxHQUF1QjtJQUN6RCxPQUFPLEdBQUcsQ0FBQyxVQUFVLENBQUM7QUFDeEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtzZXRBY3RpdmVDb25zdW1lcn0gZnJvbSAnQGFuZ3VsYXIvY29yZS9wcmltaXRpdmVzL3NpZ25hbHMnO1xuXG5pbXBvcnQge2luamVjdH0gZnJvbSAnLi4vLi4vZGkvaW5qZWN0b3JfY29tcGF0aWJpbGl0eSc7XG5pbXBvcnQge0Vycm9ySGFuZGxlcn0gZnJvbSAnLi4vLi4vZXJyb3JfaGFuZGxlcic7XG5pbXBvcnQge1J1bnRpbWVFcnJvciwgUnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vLi4vZXJyb3JzJztcbmltcG9ydCB7RGVzdHJveVJlZn0gZnJvbSAnLi4vLi4vbGlua2VyL2Rlc3Ryb3lfcmVmJztcblxuaW1wb3J0IHtPdXRwdXRSZWYsIE91dHB1dFJlZlN1YnNjcmlwdGlvbn0gZnJvbSAnLi9vdXRwdXRfcmVmJztcblxuLyoqXG4gKiBBbiBgT3V0cHV0RW1pdHRlclJlZmAgaXMgY3JlYXRlZCBieSB0aGUgYG91dHB1dCgpYCBmdW5jdGlvbiBhbmQgY2FuIGJlXG4gKiB1c2VkIHRvIGVtaXQgdmFsdWVzIHRvIGNvbnN1bWVycyBvZiB5b3VyIGRpcmVjdGl2ZSBvciBjb21wb25lbnQuXG4gKlxuICogQ29uc3VtZXJzIG9mIHlvdXIgZGlyZWN0aXZlL2NvbXBvbmVudCBjYW4gYmluZCB0byB0aGUgb3V0cHV0IGFuZFxuICogc3Vic2NyaWJlIHRvIGNoYW5nZXMgdmlhIHRoZSBib3VuZCBldmVudCBzeW50YXguIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYGh0bWxcbiAqIDxteS1jb21wICh2YWx1ZUNoYW5nZSk9XCJwcm9jZXNzTmV3VmFsdWUoJGV2ZW50KVwiIC8+XG4gKiBgYGBcbiAqXG4gKiBAZGV2ZWxvcGVyUHJldmlld1xuICovXG5leHBvcnQgY2xhc3MgT3V0cHV0RW1pdHRlclJlZjxUPiBpbXBsZW1lbnRzIE91dHB1dFJlZjxUPiB7XG4gIHByaXZhdGUgZGVzdHJveWVkID0gZmFsc2U7XG4gIHByaXZhdGUgbGlzdGVuZXJzOiBBcnJheTwodmFsdWU6IFQpID0+IHZvaWQ+IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgZXJyb3JIYW5kbGVyID0gaW5qZWN0KEVycm9ySGFuZGxlciwge29wdGlvbmFsOiB0cnVlfSk7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBkZXN0cm95UmVmOiBEZXN0cm95UmVmID0gaW5qZWN0KERlc3Ryb3lSZWYpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8vIENsZWFuLXVwIGFsbCBsaXN0ZW5lcnMgYW5kIG1hcmsgYXMgZGVzdHJveWVkIHVwb24gZGVzdHJveS5cbiAgICB0aGlzLmRlc3Ryb3lSZWYub25EZXN0cm95KCgpID0+IHtcbiAgICAgIHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgIHRoaXMubGlzdGVuZXJzID0gbnVsbDtcbiAgICB9KTtcbiAgfVxuXG4gIHN1YnNjcmliZShjYWxsYmFjazogKHZhbHVlOiBUKSA9PiB2b2lkKTogT3V0cHV0UmVmU3Vic2NyaXB0aW9uIHtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuT1VUUFVUX1JFRl9ERVNUUk9ZRUQsXG4gICAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICAgICdVbmV4cGVjdGVkIHN1YnNjcmlwdGlvbiB0byBkZXN0cm95ZWQgYE91dHB1dFJlZmAuICcgK1xuICAgICAgICAgICAgJ1RoZSBvd25pbmcgZGlyZWN0aXZlL2NvbXBvbmVudCBpcyBkZXN0cm95ZWQuJyxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgKHRoaXMubGlzdGVuZXJzID8/PSBbXSkucHVzaChjYWxsYmFjayk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdW5zdWJzY3JpYmU6ICgpID0+IHtcbiAgICAgICAgY29uc3QgaWR4ID0gdGhpcy5saXN0ZW5lcnM/LmluZGV4T2YoY2FsbGJhY2spO1xuICAgICAgICBpZiAoaWR4ICE9PSB1bmRlZmluZWQgJiYgaWR4ICE9PSAtMSkge1xuICAgICAgICAgIHRoaXMubGlzdGVuZXJzPy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgLyoqIEVtaXRzIGEgbmV3IHZhbHVlIHRvIHRoZSBvdXRwdXQuICovXG4gIGVtaXQodmFsdWU6IFQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuT1VUUFVUX1JFRl9ERVNUUk9ZRUQsXG4gICAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICAgICdVbmV4cGVjdGVkIGVtaXQgZm9yIGRlc3Ryb3llZCBgT3V0cHV0UmVmYC4gJyArXG4gICAgICAgICAgICAnVGhlIG93bmluZyBkaXJlY3RpdmUvY29tcG9uZW50IGlzIGRlc3Ryb3llZC4nLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5saXN0ZW5lcnMgPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwcmV2aW91c0NvbnN1bWVyID0gc2V0QWN0aXZlQ29uc3VtZXIobnVsbCk7XG4gICAgdHJ5IHtcbiAgICAgIGZvciAoY29uc3QgbGlzdGVuZXJGbiBvZiB0aGlzLmxpc3RlbmVycykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGxpc3RlbmVyRm4odmFsdWUpO1xuICAgICAgICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcbiAgICAgICAgICB0aGlzLmVycm9ySGFuZGxlcj8uaGFuZGxlRXJyb3IoZXJyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRBY3RpdmVDb25zdW1lcihwcmV2aW91c0NvbnN1bWVyKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqIEdldHMgdGhlIG93bmluZyBgRGVzdHJveVJlZmAgZm9yIHRoZSBnaXZlbiBvdXRwdXQuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3V0cHV0RGVzdHJveVJlZihyZWY6IE91dHB1dFJlZjx1bmtub3duPik6IERlc3Ryb3lSZWYgfCB1bmRlZmluZWQge1xuICByZXR1cm4gcmVmLmRlc3Ryb3lSZWY7XG59XG4iXX0=