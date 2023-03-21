import { UploadTask, UploadTaskSnapshot } from './interfaces';
import { Observable } from 'rxjs';
export interface AngularFireUploadTask {
    task: UploadTask;
    snapshotChanges(): Observable<UploadTaskSnapshot | undefined>;
    percentageChanges(): Observable<number | undefined>;
    pause(): boolean;
    cancel(): boolean;
    resume(): boolean;
    then(onFulfilled?: ((a: UploadTaskSnapshot) => any) | null, onRejected?: ((a: Error) => any) | null): Promise<any>;
    catch(onRejected: (a: Error) => any): Promise<any>;
}
/**
 * Create an AngularFireUploadTask from a regular UploadTask from the Storage SDK.
 * This method creates an observable of the upload and returns on object that provides
 * multiple methods for controlling and monitoring the file upload.
 */
export declare function createUploadTask(task: UploadTask): AngularFireUploadTask;
