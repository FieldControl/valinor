import { NgZone } from '@angular/core';
import { Observable } from 'rxjs';
declare type MyFunction = (...args: any[]) => any;
declare type FunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends MyFunction ? K : never;
}[keyof T];
declare type ReturnTypeOrNever<T> = T extends MyFunction ? ReturnType<T> : never;
declare type ParametersOrNever<T> = T extends MyFunction ? Parameters<T> : never;
declare type PromiseReturningFunctionPropertyNames<T> = {
    [K in FunctionPropertyNames<T>]: ReturnTypeOrNever<T[K]> extends Promise<any> ? K : never;
}[FunctionPropertyNames<T>];
declare type NonPromiseReturningFunctionPropertyNames<T> = {
    [K in FunctionPropertyNames<T>]: ReturnTypeOrNever<T[K]> extends Promise<any> ? never : K;
}[FunctionPropertyNames<T>];
declare type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends MyFunction ? never : K;
}[keyof T];
export declare type ɵPromiseProxy<T> = {
    [K in NonFunctionPropertyNames<T>]: Promise<T[K]>;
} & {
    [K in NonPromiseReturningFunctionPropertyNames<T>]: (...args: ParametersOrNever<T[K]>) => Promise<ReturnTypeOrNever<T[K]>>;
} & {
    [K in PromiseReturningFunctionPropertyNames<T>]: T[K];
};
export declare const ɵlazySDKProxy: (klass: any, observable: Observable<any>, zone: NgZone, options?: {
    spy?: {
        get?: (name: string, it: any) => void;
        apply?: (name: string, args: any[], it: any) => void;
    };
}) => any;
export declare const ɵapplyMixins: (derivedCtor: any, constructors: any[]) => void;
export {};
