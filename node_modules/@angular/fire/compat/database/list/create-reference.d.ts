import { AngularFireList, DatabaseQuery } from '../interfaces';
import { AngularFireDatabase } from '../database';
export declare function createListReference<T = any>(query: DatabaseQuery, afDatabase: AngularFireDatabase): AngularFireList<T>;
