import { ApplicationRef, Injectable } from '@angular/core';
import { first, tap } from 'rxjs/operators';
import * as i0 from "@angular/core";
const IS_STABLE_START_MARK = 'Zone';
const IS_STABLE_END_MARK = '_isStableEnd';
export class PerformanceMonitoringService {
    constructor(appRef) {
        var _a;
        if (typeof window !== 'undefined' && ((_a = window.performance) === null || _a === void 0 ? void 0 : _a.mark)) {
            this.disposable = appRef.isStable.pipe(first(it => it), tap(() => {
                window.performance.mark(IS_STABLE_END_MARK);
                window.performance.measure('isStable', IS_STABLE_START_MARK, IS_STABLE_END_MARK);
            })).subscribe();
        }
    }
    ngOnDestroy() {
        if (this.disposable) {
            this.disposable.unsubscribe();
        }
    }
}
PerformanceMonitoringService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: PerformanceMonitoringService, deps: [{ token: i0.ApplicationRef }], target: i0.ɵɵFactoryTarget.Injectable });
PerformanceMonitoringService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: PerformanceMonitoringService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: PerformanceMonitoringService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i0.ApplicationRef }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZm9ybWFuY2Uuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wYXQvcGVyZm9ybWFuY2UvcGVyZm9ybWFuY2Uuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBYSxNQUFNLGVBQWUsQ0FBQztBQUV0RSxPQUFPLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDOztBQUU1QyxNQUFNLG9CQUFvQixHQUFHLE1BQU0sQ0FBQztBQUNwQyxNQUFNLGtCQUFrQixHQUFHLGNBQWMsQ0FBQztBQUcxQyxNQUFNLE9BQU8sNEJBQTRCO0lBSXJDLFlBQVksTUFBc0I7O1FBQzlCLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxLQUFJLE1BQUEsTUFBTSxDQUFDLFdBQVcsMENBQUUsSUFBSSxDQUFBLEVBQUU7WUFDM0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FDbEMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQ2YsR0FBRyxDQUFDLEdBQUcsRUFBRTtnQkFDTCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsb0JBQW9CLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUNyRixDQUFDLENBQUMsQ0FDTCxDQUFDLFNBQVMsRUFBRSxDQUFDO1NBQ2pCO0lBQ0wsQ0FBQztJQUVELFdBQVc7UUFDUCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQUU7SUFDM0QsQ0FBQzs7eUhBbEJRLDRCQUE0Qjs2SEFBNUIsNEJBQTRCOzJGQUE1Qiw0QkFBNEI7a0JBRHhDLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBsaWNhdGlvblJlZiwgSW5qZWN0YWJsZSwgT25EZXN0cm95IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGZpcnN0LCB0YXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmNvbnN0IElTX1NUQUJMRV9TVEFSVF9NQVJLID0gJ1pvbmUnO1xuY29uc3QgSVNfU1RBQkxFX0VORF9NQVJLID0gJ19pc1N0YWJsZUVuZCc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBQZXJmb3JtYW5jZU1vbml0b3JpbmdTZXJ2aWNlIGltcGxlbWVudHMgT25EZXN0cm95IHtcblxuICAgIHByaXZhdGUgZGlzcG9zYWJsZTogU3Vic2NyaXB0aW9ufHVuZGVmaW5lZDtcblxuICAgIGNvbnN0cnVjdG9yKGFwcFJlZjogQXBwbGljYXRpb25SZWYpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5wZXJmb3JtYW5jZT8ubWFyaykge1xuICAgICAgICAgICAgdGhpcy5kaXNwb3NhYmxlID0gYXBwUmVmLmlzU3RhYmxlLnBpcGUoXG4gICAgICAgICAgICAgICAgZmlyc3QoaXQgPT4gaXQpLFxuICAgICAgICAgICAgICAgIHRhcCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5wZXJmb3JtYW5jZS5tYXJrKElTX1NUQUJMRV9FTkRfTUFSSyk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5wZXJmb3JtYW5jZS5tZWFzdXJlKCdpc1N0YWJsZScsIElTX1NUQUJMRV9TVEFSVF9NQVJLLCBJU19TVEFCTEVfRU5EX01BUkspO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApLnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc3Bvc2FibGUpIHsgdGhpcy5kaXNwb3NhYmxlLnVuc3Vic2NyaWJlKCk7IH1cbiAgICB9XG5cbn1cbiJdfQ==