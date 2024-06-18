import { InjectionToken, Type } from '@angular/core';
export declare function getSourceForInstance<T>(instance: T): T;
export declare function isClassInstance(obj: object): boolean;
export declare function isClass(classOrRecord: Type<unknown> | Record<string, unknown>): classOrRecord is Type<unknown>;
export declare function getClasses(classesAndRecords: Array<Type<unknown> | Record<string, unknown>>): Type<unknown>[];
export declare function isToken(tokenOrRecord: Type<unknown> | InjectionToken<unknown> | Record<string, unknown>): tokenOrRecord is Type<unknown> | InjectionToken<unknown>;
export interface NextNotification<T> {
    kind: 'N';
    value: T;
}
export interface ErrorNotification {
    kind: 'E';
    error: any;
}
export interface CompleteNotification {
    kind: 'C';
}
export type ObservableNotification<T> = NextNotification<T> | ErrorNotification | CompleteNotification;
