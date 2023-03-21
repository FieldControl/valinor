import { Version } from '@angular/core';
import { FirebaseApp } from 'firebase/app';
export declare const VERSION: Version;
export declare const ɵisMessagingSupportedFactory: {
    async: () => any;
    sync: () => any;
};
export declare const ɵisRemoteConfigSupportedFactory: {
    async: () => any;
    sync: () => any;
};
export declare const ɵisAnalyticsSupportedFactory: {
    async: () => any;
    sync: () => any;
};
export declare function ɵgetDefaultInstanceOf<T = unknown>(identifier: string, provided: T[] | undefined, defaultApp: FirebaseApp): T | undefined;
export declare const ɵgetAllInstancesOf: <T = unknown>(identifier: string, app?: FirebaseApp) => T[];
