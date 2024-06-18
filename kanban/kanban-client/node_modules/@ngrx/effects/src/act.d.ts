import { Action } from '@ngrx/store';
import { Observable, OperatorFunction } from 'rxjs';
/** Represents config with named parameters for act */
export interface ActConfig<Input, OutputAction extends Action, ErrorAction extends Action, CompleteAction extends Action, UnsubscribeAction extends Action> {
    project: (input: Input, index: number) => Observable<OutputAction>;
    error: (error: any, input: Input) => ErrorAction;
    complete?: (count: number, input: Input) => CompleteAction;
    operator?: <Input, OutputAction>(project: (input: Input, index: number) => Observable<OutputAction>) => OperatorFunction<Input, OutputAction>;
    unsubscribe?: (count: number, input: Input) => UnsubscribeAction;
}
/**
 * @deprecated Use plain RxJS operators instead.
 * For more info see: https://github.com/ngrx/platform/issues/4072
 */
export declare function act<Input, OutputAction extends Action, ErrorAction extends Action>(project: (input: Input, index: number) => Observable<OutputAction>, error: (error: any, input: Input) => ErrorAction): (source: Observable<Input>) => Observable<OutputAction | ErrorAction>;
/**
 * @deprecated Use plain RxJS operators instead.
 * For more info see: https://github.com/ngrx/platform/issues/4072
 */
export declare function act<Input, OutputAction extends Action, ErrorAction extends Action, CompleteAction extends Action = never, UnsubscribeAction extends Action = never>(config: ActConfig<Input, OutputAction, ErrorAction, CompleteAction, UnsubscribeAction>): (source: Observable<Input>) => Observable<OutputAction | ErrorAction | CompleteAction | UnsubscribeAction>;
