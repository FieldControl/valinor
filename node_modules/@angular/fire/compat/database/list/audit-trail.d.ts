import { ChildEvent, DatabaseQuery, SnapshotAction } from '../interfaces';
import { Observable, SchedulerLike } from 'rxjs';
export declare function auditTrail<T>(query: DatabaseQuery, events?: ChildEvent[], scheduler?: SchedulerLike): Observable<SnapshotAction<T>[]>;
