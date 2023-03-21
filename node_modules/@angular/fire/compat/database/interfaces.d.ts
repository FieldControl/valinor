import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
export declare type FirebaseOperation = string | firebase.database.Reference | firebase.database.DataSnapshot;
export interface AngularFireList<T> {
    query: DatabaseQuery;
    valueChanges(events?: ChildEvent[], options?: {}): Observable<T[]>;
    valueChanges<K extends string>(events?: ChildEvent[], options?: {
        idField: K;
    }): Observable<(T & {
        [T in K]?: string;
    })[]>;
    snapshotChanges(events?: ChildEvent[]): Observable<SnapshotAction<T>[]>;
    stateChanges(events?: ChildEvent[]): Observable<SnapshotAction<T>>;
    auditTrail(events?: ChildEvent[]): Observable<SnapshotAction<T>[]>;
    update(item: FirebaseOperation, data: Partial<T>): Promise<void>;
    set(item: FirebaseOperation, data: T): Promise<void>;
    push(data: T): firebase.database.ThenableReference;
    remove(item?: FirebaseOperation): Promise<void>;
}
export interface AngularFireObject<T> {
    query: DatabaseQuery;
    valueChanges(): Observable<T | null>;
    snapshotChanges(): Observable<SnapshotAction<T>>;
    update(data: Partial<T>): Promise<void>;
    set(data: T): Promise<void>;
    remove(): Promise<void>;
}
export interface FirebaseOperationCases {
    stringCase: () => Promise<void>;
    firebaseCase?: () => Promise<void>;
    snapshotCase?: () => Promise<void>;
    unwrappedSnapshotCase?: () => Promise<void>;
}
export declare type QueryFn = (ref: DatabaseReference) => DatabaseQuery;
export declare type ChildEvent = 'child_added' | 'child_removed' | 'child_changed' | 'child_moved';
export declare type ListenEvent = 'value' | ChildEvent;
export interface Action<T> {
    type: ListenEvent;
    payload: T;
}
export interface AngularFireAction<T> extends Action<T> {
    prevKey: string | null | undefined;
    key: string | null;
}
export declare type SnapshotAction<T> = AngularFireAction<DatabaseSnapshot<T>>;
export declare type Primitive = number | string | boolean;
export interface DatabaseSnapshotExists<T> extends firebase.database.DataSnapshot {
    exists(): true;
    val(): T;
    forEach(action: (a: DatabaseSnapshot<T>) => boolean): boolean;
}
export interface DatabaseSnapshotDoesNotExist<T> extends firebase.database.DataSnapshot {
    exists(): false;
    val(): null;
    forEach(action: (a: DatabaseSnapshot<T>) => boolean): boolean;
}
export declare type DatabaseSnapshot<T> = DatabaseSnapshotExists<T> | DatabaseSnapshotDoesNotExist<T>;
export declare type DatabaseReference = firebase.database.Reference;
export declare type DatabaseQuery = firebase.database.Query;
export declare type DataSnapshot = firebase.database.DataSnapshot;
export declare type QueryReference = DatabaseReference | DatabaseQuery;
export declare type PathReference = QueryReference | string;
