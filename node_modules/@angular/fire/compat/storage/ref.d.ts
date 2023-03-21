import { ListOptions, ListResult, Reference, SettableMetadata, UploadMetadata } from './interfaces';
import { AngularFireUploadTask } from './task';
import { Observable } from 'rxjs';
export interface AngularFireStorageReference {
    getDownloadURL(): Observable<any>;
    getMetadata(): Observable<any>;
    delete(): Observable<any>;
    child(path: string): AngularFireStorageReference;
    updateMetadata(meta: SettableMetadata): Observable<any>;
    put(data: any, metadata?: UploadMetadata | undefined): AngularFireUploadTask;
    putString(data: string, format?: string | undefined, metadata?: UploadMetadata | undefined): AngularFireUploadTask;
    list(options?: ListOptions): Observable<ListResult>;
    listAll(): Observable<ListResult>;
}
/**
 * Create an AngularFire wrapped Storage Reference. This object
 * creates observable methods from promise based methods.
 */
export declare function createStorageRef(ref: Reference): AngularFireStorageReference;
