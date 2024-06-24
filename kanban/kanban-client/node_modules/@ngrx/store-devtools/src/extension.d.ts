import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { SerializationOptions, StoreDevtoolsConfig } from './config';
import { DevtoolsDispatcher } from './devtools-dispatcher';
import { LiftedAction, LiftedState } from './reducer';
import * as i0 from "@angular/core";
export declare const ExtensionActionTypes: {
    START: string;
    DISPATCH: string;
    STOP: string;
    ACTION: string;
};
export declare const REDUX_DEVTOOLS_EXTENSION: InjectionToken<ReduxDevtoolsExtension>;
export interface ReduxDevtoolsExtensionConnection {
    subscribe(listener: (change: any) => void): void;
    unsubscribe(): void;
    send(action: any, state: any): void;
    init(state?: any): void;
    error(anyErr: any): void;
}
export interface ReduxDevtoolsExtensionConfig {
    features?: object | boolean;
    name: string | undefined;
    maxAge?: number;
    autoPause?: boolean;
    serialize?: boolean | SerializationOptions;
    trace?: boolean | (() => string);
    traceLimit?: number;
}
export interface ReduxDevtoolsExtension {
    connect(options: ReduxDevtoolsExtensionConfig): ReduxDevtoolsExtensionConnection;
    send(action: any, state: any, options: ReduxDevtoolsExtensionConfig): void;
}
export declare class DevtoolsExtension {
    private config;
    private dispatcher;
    private devtoolsExtension;
    private extensionConnection;
    liftedActions$: Observable<any>;
    actions$: Observable<any>;
    start$: Observable<any>;
    private zoneConfig;
    constructor(devtoolsExtension: ReduxDevtoolsExtension, config: StoreDevtoolsConfig, dispatcher: DevtoolsDispatcher);
    notify(action: LiftedAction, state: LiftedState): void;
    private createChangesObservable;
    private createActionStreams;
    private unwrapAction;
    private getExtensionConfig;
    private sendToReduxDevtools;
    static ɵfac: i0.ɵɵFactoryDeclaration<DevtoolsExtension, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DevtoolsExtension>;
}
