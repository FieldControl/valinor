import { Observable } from 'rxjs';
import { UploadTask } from '../interfaces';
import firebase from 'firebase/compat/app';
export declare function fromTask(task: UploadTask): Observable<firebase.storage.UploadTaskSnapshot>;
