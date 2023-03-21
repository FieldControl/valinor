import { Observable } from 'rxjs';
declare type UploadTaskSnapshot = import('firebase/storage').UploadTaskSnapshot;
declare type StorageReference = import('firebase/storage').StorageReference;
declare type UploadMetadata = import('firebase/storage').UploadMetadata;
declare type StringFormat = import('firebase/storage').StringFormat;
declare type UploadTask = import('firebase/storage').UploadTask;
declare type UploadResult = import('firebase/storage').UploadResult;
export declare function fromTask(task: UploadTask): Observable<UploadTaskSnapshot>;
export declare function getDownloadURL(ref: StorageReference): Observable<string>;
export declare function getMetadata(ref: StorageReference): Observable<any>;
export declare function uploadBytesResumable(ref: StorageReference, data: Blob | Uint8Array | ArrayBuffer, metadata?: UploadMetadata): Observable<UploadTaskSnapshot>;
export declare function uploadString(ref: StorageReference, data: string, format?: StringFormat, metadata?: UploadMetadata): Observable<UploadResult>;
export declare function percentage(task: UploadTask): Observable<{
    progress: number;
    snapshot: UploadTaskSnapshot;
}>;
export {};
