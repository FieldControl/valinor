import { Messaging as FirebaseMessaging } from 'firebase/messaging';
export interface Messaging extends FirebaseMessaging {
}
export declare class Messaging {
    constructor(messaging: FirebaseMessaging);
}
export declare const MESSAGING_PROVIDER_NAME = "messaging";
export interface MessagingInstances extends Array<FirebaseMessaging> {
}
export declare class MessagingInstances {
    constructor();
}
export declare const messagingInstance$: import("rxjs").Observable<FirebaseMessaging>;
