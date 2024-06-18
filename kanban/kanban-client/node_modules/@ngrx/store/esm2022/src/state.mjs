import { Inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, queueScheduler, } from 'rxjs';
import { observeOn, scan, withLatestFrom } from 'rxjs/operators';
import { INIT } from './actions_subject';
import { INITIAL_STATE } from './tokens';
import * as i0 from "@angular/core";
import * as i1 from "./actions_subject";
import * as i2 from "./reducer_manager";
import * as i3 from "./scanned_actions_subject";
export class StateObservable extends Observable {
}
export class State extends BehaviorSubject {
    static { this.INIT = INIT; }
    constructor(actions$, reducer$, scannedActions, initialState) {
        super(initialState);
        const actionsOnQueue$ = actions$.pipe(observeOn(queueScheduler));
        const withLatestReducer$ = actionsOnQueue$.pipe(withLatestFrom(reducer$));
        const seed = { state: initialState };
        const stateAndAction$ = withLatestReducer$.pipe(scan(reduceState, seed));
        this.stateSubscription = stateAndAction$.subscribe(({ state, action }) => {
            this.next(state);
            scannedActions.next(action);
        });
        this.state = toSignal(this, { manualCleanup: true, requireSync: true });
    }
    ngOnDestroy() {
        this.stateSubscription.unsubscribe();
        this.complete();
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: State, deps: [{ token: i1.ActionsSubject }, { token: i2.ReducerObservable }, { token: i3.ScannedActionsSubject }, { token: INITIAL_STATE }], target: i0.ɵɵFactoryTarget.Injectable }); }
    /** @nocollapse */ static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: State }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: State, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.ActionsSubject }, { type: i2.ReducerObservable }, { type: i3.ScannedActionsSubject }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [INITIAL_STATE]
                }] }] });
export function reduceState(stateActionPair = { state: undefined }, [action, reducer]) {
    const { state } = stateActionPair;
    return { state: reducer(state, action), action };
}
export const STATE_PROVIDERS = [
    State,
    { provide: StateObservable, useExisting: State },
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9tb2R1bGVzL3N0b3JlL3NyYy9zdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBK0IsTUFBTSxlQUFlLENBQUM7QUFDaEYsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3RELE9BQU8sRUFDTCxlQUFlLEVBQ2YsVUFBVSxFQUNWLGNBQWMsR0FFZixNQUFNLE1BQU0sQ0FBQztBQUNkLE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWpFLE9BQU8sRUFBa0IsSUFBSSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFJekQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLFVBQVUsQ0FBQzs7Ozs7QUFFekMsTUFBTSxPQUFnQixlQUFnQixTQUFRLFVBQWU7Q0FLNUQ7QUFHRCxNQUFNLE9BQU8sS0FBUyxTQUFRLGVBQW9CO2FBQ2hDLFNBQUksR0FBRyxJQUFJLEFBQVAsQ0FBUTtJQVM1QixZQUNFLFFBQXdCLEVBQ3hCLFFBQTJCLEVBQzNCLGNBQXFDLEVBQ2QsWUFBaUI7UUFFeEMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRXBCLE1BQU0sZUFBZSxHQUF1QixRQUFRLENBQUMsSUFBSSxDQUN2RCxTQUFTLENBQUMsY0FBYyxDQUFDLENBQzFCLENBQUM7UUFDRixNQUFNLGtCQUFrQixHQUN0QixlQUFlLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBRWpELE1BQU0sSUFBSSxHQUF1QixFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FBQztRQUN6RCxNQUFNLGVBQWUsR0FHaEIsa0JBQWtCLENBQUMsSUFBSSxDQUMxQixJQUFJLENBQ0YsV0FBVyxFQUNYLElBQUksQ0FDTCxDQUNGLENBQUM7UUFFRixJQUFJLENBQUMsaUJBQWlCLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7WUFDdkUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqQixjQUFjLENBQUMsSUFBSSxDQUFDLE1BQWdCLENBQUMsQ0FBQztRQUN4QyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDckMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2xCLENBQUM7aUlBOUNVLEtBQUssc0hBY04sYUFBYTtxSUFkWixLQUFLOzsyRkFBTCxLQUFLO2tCQURqQixVQUFVOzswQkFlTixNQUFNOzJCQUFDLGFBQWE7O0FBdUN6QixNQUFNLFVBQVUsV0FBVyxDQUN6QixrQkFBeUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEVBQzdELENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBMkI7SUFFM0MsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLGVBQWUsQ0FBQztJQUNsQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDbkQsQ0FBQztBQUVELE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBZTtJQUN6QyxLQUFLO0lBQ0wsRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUU7Q0FDakQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSwgT25EZXN0cm95LCBQcm92aWRlciwgU2lnbmFsIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyB0b1NpZ25hbCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUvcnhqcy1pbnRlcm9wJztcbmltcG9ydCB7XG4gIEJlaGF2aW9yU3ViamVjdCxcbiAgT2JzZXJ2YWJsZSxcbiAgcXVldWVTY2hlZHVsZXIsXG4gIFN1YnNjcmlwdGlvbixcbn0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBvYnNlcnZlT24sIHNjYW4sIHdpdGhMYXRlc3RGcm9tIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQgeyBBY3Rpb25zU3ViamVjdCwgSU5JVCB9IGZyb20gJy4vYWN0aW9uc19zdWJqZWN0JztcbmltcG9ydCB7IEFjdGlvbiwgQWN0aW9uUmVkdWNlciB9IGZyb20gJy4vbW9kZWxzJztcbmltcG9ydCB7IFJlZHVjZXJPYnNlcnZhYmxlIH0gZnJvbSAnLi9yZWR1Y2VyX21hbmFnZXInO1xuaW1wb3J0IHsgU2Nhbm5lZEFjdGlvbnNTdWJqZWN0IH0gZnJvbSAnLi9zY2FubmVkX2FjdGlvbnNfc3ViamVjdCc7XG5pbXBvcnQgeyBJTklUSUFMX1NUQVRFIH0gZnJvbSAnLi90b2tlbnMnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU3RhdGVPYnNlcnZhYmxlIGV4dGVuZHMgT2JzZXJ2YWJsZTxhbnk+IHtcbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgYWJzdHJhY3QgcmVhZG9ubHkgc3RhdGU6IFNpZ25hbDxhbnk+O1xufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU3RhdGU8VD4gZXh0ZW5kcyBCZWhhdmlvclN1YmplY3Q8YW55PiBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIHN0YXRpYyByZWFkb25seSBJTklUID0gSU5JVDtcblxuICBwcml2YXRlIHN0YXRlU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgcHVibGljIHN0YXRlOiBTaWduYWw8VD47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgYWN0aW9ucyQ6IEFjdGlvbnNTdWJqZWN0LFxuICAgIHJlZHVjZXIkOiBSZWR1Y2VyT2JzZXJ2YWJsZSxcbiAgICBzY2FubmVkQWN0aW9uczogU2Nhbm5lZEFjdGlvbnNTdWJqZWN0LFxuICAgIEBJbmplY3QoSU5JVElBTF9TVEFURSkgaW5pdGlhbFN0YXRlOiBhbnlcbiAgKSB7XG4gICAgc3VwZXIoaW5pdGlhbFN0YXRlKTtcblxuICAgIGNvbnN0IGFjdGlvbnNPblF1ZXVlJDogT2JzZXJ2YWJsZTxBY3Rpb24+ID0gYWN0aW9ucyQucGlwZShcbiAgICAgIG9ic2VydmVPbihxdWV1ZVNjaGVkdWxlcilcbiAgICApO1xuICAgIGNvbnN0IHdpdGhMYXRlc3RSZWR1Y2VyJDogT2JzZXJ2YWJsZTxbQWN0aW9uLCBBY3Rpb25SZWR1Y2VyPGFueSwgQWN0aW9uPl0+ID1cbiAgICAgIGFjdGlvbnNPblF1ZXVlJC5waXBlKHdpdGhMYXRlc3RGcm9tKHJlZHVjZXIkKSk7XG5cbiAgICBjb25zdCBzZWVkOiBTdGF0ZUFjdGlvblBhaXI8VD4gPSB7IHN0YXRlOiBpbml0aWFsU3RhdGUgfTtcbiAgICBjb25zdCBzdGF0ZUFuZEFjdGlvbiQ6IE9ic2VydmFibGU8e1xuICAgICAgc3RhdGU6IGFueTtcbiAgICAgIGFjdGlvbj86IEFjdGlvbjtcbiAgICB9PiA9IHdpdGhMYXRlc3RSZWR1Y2VyJC5waXBlKFxuICAgICAgc2NhbjxbQWN0aW9uLCBBY3Rpb25SZWR1Y2VyPFQsIEFjdGlvbj5dLCBTdGF0ZUFjdGlvblBhaXI8VD4+KFxuICAgICAgICByZWR1Y2VTdGF0ZSxcbiAgICAgICAgc2VlZFxuICAgICAgKVxuICAgICk7XG5cbiAgICB0aGlzLnN0YXRlU3Vic2NyaXB0aW9uID0gc3RhdGVBbmRBY3Rpb24kLnN1YnNjcmliZSgoeyBzdGF0ZSwgYWN0aW9uIH0pID0+IHtcbiAgICAgIHRoaXMubmV4dChzdGF0ZSk7XG4gICAgICBzY2FubmVkQWN0aW9ucy5uZXh0KGFjdGlvbiBhcyBBY3Rpb24pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zdGF0ZSA9IHRvU2lnbmFsKHRoaXMsIHsgbWFudWFsQ2xlYW51cDogdHJ1ZSwgcmVxdWlyZVN5bmM6IHRydWUgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLnN0YXRlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5jb21wbGV0ZSgpO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFN0YXRlQWN0aW9uUGFpcjxULCBWIGV4dGVuZHMgQWN0aW9uID0gQWN0aW9uPiA9IHtcbiAgc3RhdGU6IFQgfCB1bmRlZmluZWQ7XG4gIGFjdGlvbj86IFY7XG59O1xuZXhwb3J0IGZ1bmN0aW9uIHJlZHVjZVN0YXRlPFQsIFYgZXh0ZW5kcyBBY3Rpb24gPSBBY3Rpb24+KFxuICBzdGF0ZUFjdGlvblBhaXI6IFN0YXRlQWN0aW9uUGFpcjxULCBWPiA9IHsgc3RhdGU6IHVuZGVmaW5lZCB9LFxuICBbYWN0aW9uLCByZWR1Y2VyXTogW1YsIEFjdGlvblJlZHVjZXI8VCwgVj5dXG4pOiBTdGF0ZUFjdGlvblBhaXI8VCwgVj4ge1xuICBjb25zdCB7IHN0YXRlIH0gPSBzdGF0ZUFjdGlvblBhaXI7XG4gIHJldHVybiB7IHN0YXRlOiByZWR1Y2VyKHN0YXRlLCBhY3Rpb24pLCBhY3Rpb24gfTtcbn1cblxuZXhwb3J0IGNvbnN0IFNUQVRFX1BST1ZJREVSUzogUHJvdmlkZXJbXSA9IFtcbiAgU3RhdGUsXG4gIHsgcHJvdmlkZTogU3RhdGVPYnNlcnZhYmxlLCB1c2VFeGlzdGluZzogU3RhdGUgfSxcbl07XG4iXX0=