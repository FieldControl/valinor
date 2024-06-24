import { Creator, ActionCreator, Action, FunctionWithParametersType, NotAllowedCheck, ActionCreatorProps, NotAllowedInPropsCheck } from './models';
export declare function createAction<T extends string>(type: T): ActionCreator<T, () => Action<T>>;
export declare function createAction<T extends string, P extends object>(type: T, config: ActionCreatorProps<P> & NotAllowedCheck<P>): ActionCreator<T, (props: P & NotAllowedCheck<P>) => P & Action<T>>;
export declare function createAction<T extends string, P extends any[], R extends object>(type: T, creator: Creator<P, R & NotAllowedCheck<R>>): FunctionWithParametersType<P, R & Action<T>> & Action<T>;
export declare function props<P extends SafeProps, SafeProps = NotAllowedInPropsCheck<P>>(): ActionCreatorProps<P>;
export declare function union<C extends {
    [key: string]: ActionCreator<string, Creator>;
}>(creators: C): ReturnType<C[keyof C]>;
