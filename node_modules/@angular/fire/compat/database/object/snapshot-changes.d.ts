import { Observable, SchedulerLike } from 'rxjs';
import { DatabaseQuery, SnapshotAction } from '../interfaces';
export declare function createObjectSnapshotChanges<T>(query: DatabaseQuery, scheduler?: SchedulerLike): () => Observable<SnapshotAction<T>>;
