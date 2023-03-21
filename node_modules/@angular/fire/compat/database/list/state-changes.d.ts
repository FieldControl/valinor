import { ChildEvent, DatabaseQuery } from '../interfaces';
import { SchedulerLike } from 'rxjs';
export declare function stateChanges<T>(query: DatabaseQuery, events?: ChildEvent[], scheduler?: SchedulerLike): import("rxjs").Observable<import("../interfaces").AngularFireAction<import("../interfaces").DatabaseSnapshot<T>>>;
