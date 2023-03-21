import { Injectable, NgZone } from '@angular/core';
import { asyncScheduler, Observable, queueScheduler } from 'rxjs';
import { observeOn, subscribeOn, tap } from 'rxjs/operators';
import * as i0 from "@angular/core";
function noop() {
}
/**
 * Schedules tasks so that they are invoked inside the Zone that is passed in the constructor.
 */
// tslint:disable-next-line:class-name
export class ɵZoneScheduler {
    constructor(zone, delegate = queueScheduler) {
        this.zone = zone;
        this.delegate = delegate;
    }
    now() {
        return this.delegate.now();
    }
    schedule(work, delay, state) {
        const targetZone = this.zone;
        // Wrap the specified work function to make sure that if nested scheduling takes place the
        // work is executed in the correct zone
        const workInZone = function (state) {
            targetZone.runGuarded(() => {
                work.apply(this, [state]);
            });
        };
        // Scheduling itself needs to be run in zone to ensure setInterval calls for async scheduling are done
        // inside the correct zone. This scheduler needs to schedule asynchronously always to ensure that
        // firebase emissions are never synchronous. Specifying a delay causes issues with the queueScheduler delegate.
        return this.delegate.schedule(workInZone, delay, state);
    }
}
class BlockUntilFirstOperator {
    constructor(zone) {
        this.zone = zone;
        this.task = null;
    }
    call(subscriber, source) {
        const unscheduleTask = this.unscheduleTask.bind(this);
        this.task = this.zone.run(() => Zone.current.scheduleMacroTask('firebaseZoneBlock', noop, {}, noop, noop));
        return source.pipe(tap({ next: unscheduleTask, complete: unscheduleTask, error: unscheduleTask })).subscribe(subscriber).add(unscheduleTask);
    }
    unscheduleTask() {
        // maybe this is a race condition, invoke in a timeout
        // hold for 10ms while I try to figure out what is going on
        setTimeout(() => {
            if (this.task != null && this.task.state === 'scheduled') {
                this.task.invoke();
                this.task = null;
            }
        }, 10);
    }
}
// tslint:disable-next-line:class-name
export class ɵAngularFireSchedulers {
    constructor(ngZone) {
        this.ngZone = ngZone;
        this.outsideAngular = ngZone.runOutsideAngular(() => new ɵZoneScheduler(Zone.current));
        this.insideAngular = ngZone.run(() => new ɵZoneScheduler(Zone.current, asyncScheduler));
        globalThis.ɵAngularFireScheduler || (globalThis.ɵAngularFireScheduler = this);
    }
}
ɵAngularFireSchedulers.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: ɵAngularFireSchedulers, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable });
ɵAngularFireSchedulers.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: ɵAngularFireSchedulers, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: ɵAngularFireSchedulers, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: function () { return [{ type: i0.NgZone }]; } });
function getSchedulers() {
    const schedulers = globalThis.ɵAngularFireScheduler;
    if (!schedulers) {
        throw new Error(`Either AngularFireModule has not been provided in your AppModule (this can be done manually or implictly using
provideFirebaseApp) or you're calling an AngularFire method outside of an NgModule (which is not supported).`);
    }
    return schedulers;
}
function runOutsideAngular(fn) {
    return getSchedulers().ngZone.runOutsideAngular(() => fn());
}
function run(fn) {
    return getSchedulers().ngZone.run(() => fn());
}
export function observeOutsideAngular(obs$) {
    return obs$.pipe(observeOn(getSchedulers().outsideAngular));
}
export function observeInsideAngular(obs$) {
    return obs$.pipe(observeOn(getSchedulers().insideAngular));
}
export function keepUnstableUntilFirst(obs$) {
    const scheduler = getSchedulers();
    return ɵkeepUnstableUntilFirstFactory(getSchedulers())(obs$);
}
/**
 * Operator to block the zone until the first value has been emitted or the observable
 * has completed/errored. This is used to make sure that universal waits until the first
 * value from firebase but doesn't block the zone forever since the firebase subscription
 * is still alive.
 */
export function ɵkeepUnstableUntilFirstFactory(schedulers) {
    return function keepUnstableUntilFirst(obs$) {
        obs$ = obs$.lift(new BlockUntilFirstOperator(schedulers.ngZone));
        return obs$.pipe(
        // Run the subscribe body outside of Angular (e.g. calling Firebase SDK to add a listener to a change event)
        subscribeOn(schedulers.outsideAngular), 
        // Run operators inside the angular zone (e.g. side effects via tap())
        observeOn(schedulers.insideAngular)
        // INVESTIGATE https://github.com/angular/angularfire/pull/2315
        // share()
        );
    };
}
const zoneWrapFn = (it, macrotask) => {
    const _this = this;
    // function() is needed for the arguments object
    // tslint:disable-next-line:only-arrow-functions
    return function () {
        const _arguments = arguments;
        if (macrotask) {
            setTimeout(() => {
                if (macrotask.state === 'scheduled') {
                    macrotask.invoke();
                }
            }, 10);
        }
        return run(() => it.apply(_this, _arguments));
    };
};
export const ɵzoneWrap = (it, blockUntilFirst) => {
    // function() is needed for the arguments object
    // tslint:disable-next-line:only-arrow-functions
    return function () {
        let macrotask;
        const _arguments = arguments;
        // if this is a callback function, e.g, onSnapshot, we should create a microtask and invoke it
        // only once one of the callback functions is tripped.
        for (let i = 0; i < arguments.length; i++) {
            if (typeof _arguments[i] === 'function') {
                if (blockUntilFirst) {
                    macrotask || (macrotask = run(() => Zone.current.scheduleMacroTask('firebaseZoneBlock', noop, {}, noop, noop)));
                }
                // TODO create a microtask to track callback functions
                _arguments[i] = zoneWrapFn(_arguments[i], macrotask);
            }
        }
        const ret = runOutsideAngular(() => it.apply(this, _arguments));
        if (!blockUntilFirst) {
            if (ret instanceof Observable) {
                const schedulers = getSchedulers();
                return ret.pipe(subscribeOn(schedulers.outsideAngular), observeOn(schedulers.insideAngular));
            }
            else {
                return run(() => ret);
            }
        }
        if (ret instanceof Observable) {
            return ret.pipe(keepUnstableUntilFirst);
        }
        else if (ret instanceof Promise) {
            return run(() => new Promise((resolve, reject) => ret.then(it => run(() => resolve(it)), reason => run(() => reject(reason)))));
        }
        else if (typeof ret === 'function' && macrotask) {
            // Handle unsubscribe
            // function() is needed for the arguments object
            // tslint:disable-next-line:only-arrow-functions
            return function () {
                setTimeout(() => {
                    if (macrotask && macrotask.state === 'scheduled') {
                        macrotask.invoke();
                    }
                }, 10);
                return ret.apply(this, arguments);
            };
        }
        else {
            // TODO how do we handle storage uploads in Zone? and other stuff with cancel() etc?
            return run(() => ret);
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiem9uZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvem9uZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkQsT0FBTyxFQUNMLGNBQWMsRUFDZCxVQUFVLEVBRVYsY0FBYyxFQU1mLE1BQU0sTUFBTSxDQUFDO0FBQ2QsT0FBTyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7O0FBRTdELFNBQVMsSUFBSTtBQUNiLENBQUM7QUFFRDs7R0FFRztBQUNILHNDQUFzQztBQUN0QyxNQUFNLE9BQU8sY0FBYztJQUN6QixZQUFvQixJQUFTLEVBQVUsV0FBZ0IsY0FBYztRQUFqRCxTQUFJLEdBQUosSUFBSSxDQUFLO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBc0I7SUFDckUsQ0FBQztJQUVELEdBQUc7UUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVELFFBQVEsQ0FBQyxJQUF1RCxFQUFFLEtBQWMsRUFBRSxLQUFXO1FBQzNGLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDN0IsMEZBQTBGO1FBQzFGLHVDQUF1QztRQUN2QyxNQUFNLFVBQVUsR0FBRyxVQUFxQyxLQUFVO1lBQ2hFLFVBQVUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDNUIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7UUFFRixzR0FBc0c7UUFDdEcsaUdBQWlHO1FBQ2pHLCtHQUErRztRQUMvRyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7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Q0FBQyxDQUFDO1lBQ3BDLENBQUMsQ0FBQztTQUNIO2FBQU07WUFDTCxvRkFBb0Y7WUFDcEYsT0FBTyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdkI7SUFDSCxDQUFRLENBQUM7QUFDWCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBOZ1pvbmUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIGFzeW5jU2NoZWR1bGVyLFxuICBPYnNlcnZhYmxlLFxuICBPcGVyYXRvcixcbiAgcXVldWVTY2hlZHVsZXIsXG4gIFNjaGVkdWxlckFjdGlvbixcbiAgU2NoZWR1bGVyTGlrZSxcbiAgU3Vic2NyaWJlcixcbiAgU3Vic2NyaXB0aW9uLFxuICBUZWFyZG93bkxvZ2ljXG59IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgb2JzZXJ2ZU9uLCBzdWJzY3JpYmVPbiwgdGFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5mdW5jdGlvbiBub29wKCkge1xufVxuXG4vKipcbiAqIFNjaGVkdWxlcyB0YXNrcyBzbyB0aGF0IHRoZXkgYXJlIGludm9rZWQgaW5zaWRlIHRoZSBab25lIHRoYXQgaXMgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAqL1xuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmNsYXNzLW5hbWVcbmV4cG9ydCBjbGFzcyDJtVpvbmVTY2hlZHVsZXIgaW1wbGVtZW50cyBTY2hlZHVsZXJMaWtlIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSB6b25lOiBhbnksIHByaXZhdGUgZGVsZWdhdGU6IGFueSA9IHF1ZXVlU2NoZWR1bGVyKSB7XG4gIH1cblxuICBub3coKSB7XG4gICAgcmV0dXJuIHRoaXMuZGVsZWdhdGUubm93KCk7XG4gIH1cblxuICBzY2hlZHVsZSh3b3JrOiAodGhpczogU2NoZWR1bGVyQWN0aW9uPGFueT4sIHN0YXRlPzogYW55KSA9PiB2b2lkLCBkZWxheT86IG51bWJlciwgc3RhdGU/OiBhbnkpOiBTdWJzY3JpcHRpb24ge1xuICAgIGNvbnN0IHRhcmdldFpvbmUgPSB0aGlzLnpvbmU7XG4gICAgLy8gV3JhcCB0aGUgc3BlY2lmaWVkIHdvcmsgZnVuY3Rpb24gdG8gbWFrZSBzdXJlIHRoYXQgaWYgbmVzdGVkIHNjaGVkdWxpbmcgdGFrZXMgcGxhY2UgdGhlXG4gICAgLy8gd29yayBpcyBleGVjdXRlZCBpbiB0aGUgY29ycmVjdCB6b25lXG4gICAgY29uc3Qgd29ya0luWm9uZSA9IGZ1bmN0aW9uKHRoaXM6IFNjaGVkdWxlckFjdGlvbjxhbnk+LCBzdGF0ZTogYW55KSB7XG4gICAgICB0YXJnZXRab25lLnJ1bkd1YXJkZWQoKCkgPT4ge1xuICAgICAgICB3b3JrLmFwcGx5KHRoaXMsIFtzdGF0ZV0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIFNjaGVkdWxpbmcgaXRzZWxmIG5lZWRzIHRvIGJlIHJ1biBpbiB6b25lIHRvIGVuc3VyZSBzZXRJbnRlcnZhbCBjYWxscyBmb3IgYXN5bmMgc2NoZWR1bGluZyBhcmUgZG9uZVxuICAgIC8vIGluc2lkZSB0aGUgY29ycmVjdCB6b25lLiBUaGlzIHNjaGVkdWxlciBuZWVkcyB0byBzY2hlZHVsZSBhc3luY2hyb25vdXNseSBhbHdheXMgdG8gZW5zdXJlIHRoYXRcbiAgICAvLyBmaXJlYmFzZSBlbWlzc2lvbnMgYXJlIG5ldmVyIHN5bmNocm9ub3VzLiBTcGVjaWZ5aW5nIGEgZGVsYXkgY2F1c2VzIGlzc3VlcyB3aXRoIHRoZSBxdWV1ZVNjaGVkdWxlciBkZWxlZ2F0ZS5cbiAgICByZXR1cm4gdGhpcy5kZWxlZ2F0ZS5zY2hlZHVsZSh3b3JrSW5ab25lLCBkZWxheSwgc3RhdGUpO1xuICB9XG59XG5cbmNsYXNzIEJsb2NrVW50aWxGaXJzdE9wZXJhdG9yPFQ+IGltcGxlbWVudHMgT3BlcmF0b3I8VCwgVD4ge1xuICBwcml2YXRlIHRhc2s6IE1hY3JvVGFzayB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgem9uZTogYW55KSB7XG4gIH1cblxuICBjYWxsKHN1YnNjcmliZXI6IFN1YnNjcmliZXI8VD4sIHNvdXJjZTogT2JzZXJ2YWJsZTxUPik6IFRlYXJkb3duTG9naWMge1xuICAgIGNvbnN0IHVuc2NoZWR1bGVUYXNrID0gdGhpcy51bnNjaGVkdWxlVGFzay5iaW5kKHRoaXMpO1xuICAgIHRoaXMudGFzayA9IHRoaXMuem9uZS5ydW4oKCkgPT4gWm9uZS5jdXJyZW50LnNjaGVkdWxlTWFjcm9UYXNrKCdmaXJlYmFzZVpvbmVCbG9jaycsIG5vb3AsIHt9LCBub29wLCBub29wKSk7XG5cbiAgICByZXR1cm4gc291cmNlLnBpcGUoXG4gICAgICB0YXAoeyBuZXh0OiB1bnNjaGVkdWxlVGFzaywgY29tcGxldGU6IHVuc2NoZWR1bGVUYXNrLCBlcnJvcjogdW5zY2hlZHVsZVRhc2sgfSlcbiAgICApLnN1YnNjcmliZShzdWJzY3JpYmVyKS5hZGQodW5zY2hlZHVsZVRhc2spO1xuICB9XG5cbiAgcHJpdmF0ZSB1bnNjaGVkdWxlVGFzaygpIHtcbiAgICAvLyBtYXliZSB0aGlzIGlzIGEgcmFjZSBjb25kaXRpb24sIGludm9rZSBpbiBhIHRpbWVvdXRcbiAgICAvLyBob2xkIGZvciAxMG1zIHdoaWxlIEkgdHJ5IHRvIGZpZ3VyZSBvdXQgd2hhdCBpcyBnb2luZyBvblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMudGFzayAhPSBudWxsICYmIHRoaXMudGFzay5zdGF0ZSA9PT0gJ3NjaGVkdWxlZCcpIHtcbiAgICAgICAgdGhpcy50YXNrLmludm9rZSgpO1xuICAgICAgICB0aGlzLnRhc2sgPSBudWxsO1xuICAgICAgfVxuICAgIH0sIDEwKTtcbiAgfVxufVxuXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290Jyxcbn0pXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6Y2xhc3MtbmFtZVxuZXhwb3J0IGNsYXNzIMm1QW5ndWxhckZpcmVTY2hlZHVsZXJzIHtcbiAgcHVibGljIHJlYWRvbmx5IG91dHNpZGVBbmd1bGFyOiDJtVpvbmVTY2hlZHVsZXI7XG4gIHB1YmxpYyByZWFkb25seSBpbnNpZGVBbmd1bGFyOiDJtVpvbmVTY2hlZHVsZXI7XG5cbiAgY29uc3RydWN0b3IocHVibGljIG5nWm9uZTogTmdab25lKSB7XG4gICAgdGhpcy5vdXRzaWRlQW5ndWxhciA9IG5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiBuZXcgybVab25lU2NoZWR1bGVyKFpvbmUuY3VycmVudCkpO1xuICAgIHRoaXMuaW5zaWRlQW5ndWxhciA9IG5nWm9uZS5ydW4oKCkgPT4gbmV3IMm1Wm9uZVNjaGVkdWxlcihab25lLmN1cnJlbnQsIGFzeW5jU2NoZWR1bGVyKSk7XG4gICAgZ2xvYmFsVGhpcy7JtUFuZ3VsYXJGaXJlU2NoZWR1bGVyIHx8PSB0aGlzO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFNjaGVkdWxlcnMoKSB7XG4gIGNvbnN0IHNjaGVkdWxlcnMgPSBnbG9iYWxUaGlzLsm1QW5ndWxhckZpcmVTY2hlZHVsZXIgYXMgybVBbmd1bGFyRmlyZVNjaGVkdWxlcnN8dW5kZWZpbmVkO1xuICBpZiAoIXNjaGVkdWxlcnMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG5gRWl0aGVyIEFuZ3VsYXJGaXJlTW9kdWxlIGhhcyBub3QgYmVlbiBwcm92aWRlZCBpbiB5b3VyIEFwcE1vZHVsZSAodGhpcyBjYW4gYmUgZG9uZSBtYW51YWxseSBvciBpbXBsaWN0bHkgdXNpbmdcbnByb3ZpZGVGaXJlYmFzZUFwcCkgb3IgeW91J3JlIGNhbGxpbmcgYW4gQW5ndWxhckZpcmUgbWV0aG9kIG91dHNpZGUgb2YgYW4gTmdNb2R1bGUgKHdoaWNoIGlzIG5vdCBzdXBwb3J0ZWQpLmApO1xuICB9XG4gIHJldHVybiBzY2hlZHVsZXJzO1xufVxuXG5mdW5jdGlvbiBydW5PdXRzaWRlQW5ndWxhcjxUPihmbjogKC4uLmFyZ3M6IGFueVtdKSA9PiBUKTogVCB7XG4gIHJldHVybiBnZXRTY2hlZHVsZXJzKCkubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IGZuKCkpO1xufVxuXG5mdW5jdGlvbiBydW48VD4oZm46ICguLi5hcmdzOiBhbnlbXSkgPT4gVCk6IFQge1xuICByZXR1cm4gZ2V0U2NoZWR1bGVycygpLm5nWm9uZS5ydW4oKCkgPT4gZm4oKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvYnNlcnZlT3V0c2lkZUFuZ3VsYXI8VD4ob2JzJDogT2JzZXJ2YWJsZTxUPik6IE9ic2VydmFibGU8VD4ge1xuICByZXR1cm4gb2JzJC5waXBlKG9ic2VydmVPbihnZXRTY2hlZHVsZXJzKCkub3V0c2lkZUFuZ3VsYXIpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9ic2VydmVJbnNpZGVBbmd1bGFyPFQ+KG9icyQ6IE9ic2VydmFibGU8VD4pOiBPYnNlcnZhYmxlPFQ+IHtcbiAgcmV0dXJuIG9icyQucGlwZShvYnNlcnZlT24oZ2V0U2NoZWR1bGVycygpLmluc2lkZUFuZ3VsYXIpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGtlZXBVbnN0YWJsZVVudGlsRmlyc3Q8VD4ob2JzJDogT2JzZXJ2YWJsZTxUPik6IE9ic2VydmFibGU8VD4ge1xuICBjb25zdCBzY2hlZHVsZXIgPSBnZXRTY2hlZHVsZXJzKCk7XG4gIHJldHVybiDJtWtlZXBVbnN0YWJsZVVudGlsRmlyc3RGYWN0b3J5KGdldFNjaGVkdWxlcnMoKSkob2JzJCk7XG59XG5cbi8qKlxuICogT3BlcmF0b3IgdG8gYmxvY2sgdGhlIHpvbmUgdW50aWwgdGhlIGZpcnN0IHZhbHVlIGhhcyBiZWVuIGVtaXR0ZWQgb3IgdGhlIG9ic2VydmFibGVcbiAqIGhhcyBjb21wbGV0ZWQvZXJyb3JlZC4gVGhpcyBpcyB1c2VkIHRvIG1ha2Ugc3VyZSB0aGF0IHVuaXZlcnNhbCB3YWl0cyB1bnRpbCB0aGUgZmlyc3RcbiAqIHZhbHVlIGZyb20gZmlyZWJhc2UgYnV0IGRvZXNuJ3QgYmxvY2sgdGhlIHpvbmUgZm9yZXZlciBzaW5jZSB0aGUgZmlyZWJhc2Ugc3Vic2NyaXB0aW9uXG4gKiBpcyBzdGlsbCBhbGl2ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1a2VlcFVuc3RhYmxlVW50aWxGaXJzdEZhY3Rvcnkoc2NoZWR1bGVyczogybVBbmd1bGFyRmlyZVNjaGVkdWxlcnMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGtlZXBVbnN0YWJsZVVudGlsRmlyc3Q8VD4ob2JzJDogT2JzZXJ2YWJsZTxUPik6IE9ic2VydmFibGU8VD4ge1xuICAgIG9icyQgPSBvYnMkLmxpZnQoXG4gICAgICBuZXcgQmxvY2tVbnRpbEZpcnN0T3BlcmF0b3Ioc2NoZWR1bGVycy5uZ1pvbmUpXG4gICAgKTtcblxuICAgIHJldHVybiBvYnMkLnBpcGUoXG4gICAgICAvLyBSdW4gdGhlIHN1YnNjcmliZSBib2R5IG91dHNpZGUgb2YgQW5ndWxhciAoZS5nLiBjYWxsaW5nIEZpcmViYXNlIFNESyB0byBhZGQgYSBsaXN0ZW5lciB0byBhIGNoYW5nZSBldmVudClcbiAgICAgIHN1YnNjcmliZU9uKHNjaGVkdWxlcnMub3V0c2lkZUFuZ3VsYXIpLFxuICAgICAgLy8gUnVuIG9wZXJhdG9ycyBpbnNpZGUgdGhlIGFuZ3VsYXIgem9uZSAoZS5nLiBzaWRlIGVmZmVjdHMgdmlhIHRhcCgpKVxuICAgICAgb2JzZXJ2ZU9uKHNjaGVkdWxlcnMuaW5zaWRlQW5ndWxhcilcbiAgICAgIC8vIElOVkVTVElHQVRFIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXJmaXJlL3B1bGwvMjMxNVxuICAgICAgLy8gc2hhcmUoKVxuICAgICk7XG4gIH07XG59XG5cbmNvbnN0IHpvbmVXcmFwRm4gPSAoaXQ6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55LCBtYWNyb3Rhc2s6IE1hY3JvVGFza3x1bmRlZmluZWQpID0+IHtcbiAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAvLyBmdW5jdGlvbigpIGlzIG5lZWRlZCBmb3IgdGhlIGFyZ3VtZW50cyBvYmplY3RcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm9ubHktYXJyb3ctZnVuY3Rpb25zXG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBfYXJndW1lbnRzID0gYXJndW1lbnRzO1xuICAgIGlmIChtYWNyb3Rhc2spIHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpZiAobWFjcm90YXNrLnN0YXRlID09PSAnc2NoZWR1bGVkJykge1xuICAgICAgICAgIG1hY3JvdGFzay5pbnZva2UoKTtcbiAgICAgICAgfVxuICAgICAgfSwgMTApO1xuICAgIH1cbiAgICByZXR1cm4gcnVuKCgpID0+IGl0LmFwcGx5KF90aGlzLCBfYXJndW1lbnRzKSk7XG4gIH07XG59O1xuXG5leHBvcnQgY29uc3QgybV6b25lV3JhcCA9IDxUPSB1bmtub3duPihpdDogVCwgYmxvY2tVbnRpbEZpcnN0OiBib29sZWFuKTogVCA9PiB7XG4gIC8vIGZ1bmN0aW9uKCkgaXMgbmVlZGVkIGZvciB0aGUgYXJndW1lbnRzIG9iamVjdFxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6b25seS1hcnJvdy1mdW5jdGlvbnNcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGxldCBtYWNyb3Rhc2s6IE1hY3JvVGFzayB8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBfYXJndW1lbnRzID0gYXJndW1lbnRzO1xuICAgIC8vIGlmIHRoaXMgaXMgYSBjYWxsYmFjayBmdW5jdGlvbiwgZS5nLCBvblNuYXBzaG90LCB3ZSBzaG91bGQgY3JlYXRlIGEgbWljcm90YXNrIGFuZCBpbnZva2UgaXRcbiAgICAvLyBvbmx5IG9uY2Ugb25lIG9mIHRoZSBjYWxsYmFjayBmdW5jdGlvbnMgaXMgdHJpcHBlZC5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHR5cGVvZiBfYXJndW1lbnRzW2ldID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGlmIChibG9ja1VudGlsRmlyc3QpIHtcbiAgICAgICAgICBtYWNyb3Rhc2sgfHw9IHJ1bigoKSA9PiBab25lLmN1cnJlbnQuc2NoZWR1bGVNYWNyb1Rhc2soJ2ZpcmViYXNlWm9uZUJsb2NrJywgbm9vcCwge30sIG5vb3AsIG5vb3ApKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPIGNyZWF0ZSBhIG1pY3JvdGFzayB0byB0cmFjayBjYWxsYmFjayBmdW5jdGlvbnNcbiAgICAgICAgX2FyZ3VtZW50c1tpXSA9IHpvbmVXcmFwRm4oX2FyZ3VtZW50c1tpXSwgbWFjcm90YXNrKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcmV0ID0gcnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gKGl0IGFzIGFueSkuYXBwbHkodGhpcywgX2FyZ3VtZW50cykpO1xuICAgIGlmICghYmxvY2tVbnRpbEZpcnN0KSB7XG4gICAgICBpZiAocmV0IGluc3RhbmNlb2YgT2JzZXJ2YWJsZSkge1xuICAgICAgICBjb25zdCBzY2hlZHVsZXJzID0gZ2V0U2NoZWR1bGVycygpO1xuICAgICAgICByZXR1cm4gcmV0LnBpcGUoXG4gICAgICAgICAgc3Vic2NyaWJlT24oc2NoZWR1bGVycy5vdXRzaWRlQW5ndWxhciksXG4gICAgICAgICAgb2JzZXJ2ZU9uKHNjaGVkdWxlcnMuaW5zaWRlQW5ndWxhciksXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcnVuKCgpID0+IHJldCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChyZXQgaW5zdGFuY2VvZiBPYnNlcnZhYmxlKSB7XG4gICAgICByZXR1cm4gcmV0LnBpcGUoa2VlcFVuc3RhYmxlVW50aWxGaXJzdCkgYXMgYW55O1xuICAgIH0gZWxzZSBpZiAocmV0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgcmV0dXJuIHJ1bigoKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiByZXQudGhlbihpdCA9PiBydW4oKCkgPT4gcmVzb2x2ZShpdCkpLCByZWFzb24gPT4gcnVuKCgpID0+IHJlamVjdChyZWFzb24pKSkpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiByZXQgPT09ICdmdW5jdGlvbicgJiYgbWFjcm90YXNrKSB7XG4gICAgICAvLyBIYW5kbGUgdW5zdWJzY3JpYmVcbiAgICAgIC8vIGZ1bmN0aW9uKCkgaXMgbmVlZGVkIGZvciB0aGUgYXJndW1lbnRzIG9iamVjdFxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm9ubHktYXJyb3ctZnVuY3Rpb25zXG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGlmIChtYWNyb3Rhc2sgJiYgbWFjcm90YXNrLnN0YXRlID09PSAnc2NoZWR1bGVkJykge1xuICAgICAgICAgICAgbWFjcm90YXNrLmludm9rZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgMTApO1xuICAgICAgICByZXR1cm4gcmV0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUT0RPIGhvdyBkbyB3ZSBoYW5kbGUgc3RvcmFnZSB1cGxvYWRzIGluIFpvbmU/IGFuZCBvdGhlciBzdHVmZiB3aXRoIGNhbmNlbCgpIGV0Yz9cbiAgICAgIHJldHVybiBydW4oKCkgPT4gcmV0KTtcbiAgICB9XG4gIH0gYXMgYW55O1xufTtcbiJdfQ==