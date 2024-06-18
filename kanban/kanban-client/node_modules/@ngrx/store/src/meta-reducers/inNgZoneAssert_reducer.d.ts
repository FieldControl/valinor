import { Action, ActionReducer } from '../models';
export declare function inNgZoneAssertMetaReducer(reducer: ActionReducer<any, Action>, checks: {
    action: (action: Action) => boolean;
}): (state: any, action: Action) => any;
