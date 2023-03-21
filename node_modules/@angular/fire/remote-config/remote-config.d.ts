import { RemoteConfig as FirebaseRemoteConfig } from 'firebase/remote-config';
export interface RemoteConfig extends FirebaseRemoteConfig {
}
export declare class RemoteConfig {
    constructor(remoteConfig: FirebaseRemoteConfig);
}
export declare const REMOTE_CONFIG_PROVIDER_NAME = "remote-config";
export interface RemoteConfigInstances extends Array<FirebaseRemoteConfig> {
}
export declare class RemoteConfigInstances {
    constructor();
}
export declare const remoteConfigInstance$: import("rxjs").Observable<FirebaseRemoteConfig>;
