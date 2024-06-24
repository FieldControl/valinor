import { ActionReducer, Action } from '../models';
export declare function immutabilityCheckMetaReducer(reducer: ActionReducer<any, any>, checks: {
    action: (action: Action) => boolean;
    state: () => boolean;
}): ActionReducer<any, any>;
