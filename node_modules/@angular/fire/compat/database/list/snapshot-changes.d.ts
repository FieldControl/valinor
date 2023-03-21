import { Observable, SchedulerLike } from 'rxjs';
import { ChildEvent, DatabaseQuery, SnapshotAction } from '../interfaces';
export declare function snapshotChanges<T>(query: DatabaseQuery, events?: ChildEvent[], scheduler?: SchedulerLike): Observable<SnapshotAction<T>[]>;
