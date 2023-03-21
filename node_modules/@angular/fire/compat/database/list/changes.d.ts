import { Observable, SchedulerLike } from 'rxjs';
import { ChildEvent, DatabaseQuery, SnapshotAction } from '../interfaces';
export declare function listChanges<T = any>(ref: DatabaseQuery, events: ChildEvent[], scheduler?: SchedulerLike): Observable<SnapshotAction<T>[]>;
