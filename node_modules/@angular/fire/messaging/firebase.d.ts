export * from 'firebase/messaging';
import { deleteToken as _deleteToken, getMessaging as _getMessaging, getToken as _getToken, onMessage as _onMessage } from 'firebase/messaging';
export { isSupported } from './overrides';
export declare const deleteToken: typeof _deleteToken;
export declare const getMessaging: typeof _getMessaging;
export declare const getToken: typeof _getToken;
export declare const onMessage: typeof _onMessage;
