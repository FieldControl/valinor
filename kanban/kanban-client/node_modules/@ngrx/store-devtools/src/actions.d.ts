import { Action } from '@ngrx/store';
export declare const PERFORM_ACTION = "PERFORM_ACTION";
export declare const REFRESH = "REFRESH";
export declare const RESET = "RESET";
export declare const ROLLBACK = "ROLLBACK";
export declare const COMMIT = "COMMIT";
export declare const SWEEP = "SWEEP";
export declare const TOGGLE_ACTION = "TOGGLE_ACTION";
export declare const SET_ACTIONS_ACTIVE = "SET_ACTIONS_ACTIVE";
export declare const JUMP_TO_STATE = "JUMP_TO_STATE";
export declare const JUMP_TO_ACTION = "JUMP_TO_ACTION";
export declare const IMPORT_STATE = "IMPORT_STATE";
export declare const LOCK_CHANGES = "LOCK_CHANGES";
export declare const PAUSE_RECORDING = "PAUSE_RECORDING";
export declare class PerformAction implements Action {
    action: Action;
    timestamp: number;
    readonly type = "PERFORM_ACTION";
    constructor(action: Action, timestamp: number);
}
export declare class Refresh implements Action {
    readonly type = "REFRESH";
}
export declare class Reset implements Action {
    timestamp: number;
    readonly type = "RESET";
    constructor(timestamp: number);
}
export declare class Rollback implements Action {
    timestamp: number;
    readonly type = "ROLLBACK";
    constructor(timestamp: number);
}
export declare class Commit implements Action {
    timestamp: number;
    readonly type = "COMMIT";
    constructor(timestamp: number);
}
export declare class Sweep implements Action {
    readonly type = "SWEEP";
}
export declare class ToggleAction implements Action {
    id: number;
    readonly type = "TOGGLE_ACTION";
    constructor(id: number);
}
export declare class SetActionsActive implements Action {
    start: number;
    end: number;
    active: boolean;
    readonly type = "SET_ACTIONS_ACTIVE";
    constructor(start: number, end: number, active?: boolean);
}
export declare class JumpToState implements Action {
    index: number;
    readonly type = "JUMP_TO_STATE";
    constructor(index: number);
}
export declare class JumpToAction implements Action {
    actionId: number;
    readonly type = "JUMP_TO_ACTION";
    constructor(actionId: number);
}
export declare class ImportState implements Action {
    nextLiftedState: any;
    readonly type = "IMPORT_STATE";
    constructor(nextLiftedState: any);
}
export declare class LockChanges implements Action {
    status: boolean;
    readonly type = "LOCK_CHANGES";
    constructor(status: boolean);
}
export declare class PauseRecording implements Action {
    status: boolean;
    readonly type = "PAUSE_RECORDING";
    constructor(status: boolean);
}
export type All = PerformAction | Refresh | Reset | Rollback | Commit | Sweep | ToggleAction | SetActionsActive | JumpToState | JumpToAction | ImportState | LockChanges | PauseRecording;
