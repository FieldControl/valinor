import { ActionCreator, ActionReducer, ActionType, Action } from './models';
type ExtractActionTypes<Creators extends readonly ActionCreator[]> = {
    [Key in keyof Creators]: Creators[Key] extends ActionCreator<infer T> ? T : never;
};
/**
 * Return type of the `on` fn.
 * Contains the action reducer coupled to one or more action types.
 */
export interface ReducerTypes<State, Creators extends readonly ActionCreator[]> {
    reducer: OnReducer<State, Creators>;
    types: ExtractActionTypes<Creators>;
}
/**
 *  Specialized Reducer that is aware of the Action type it needs to handle
 */
export interface OnReducer<State, Creators extends readonly ActionCreator[], InferredState = State, ResultState = unknown extends State ? InferredState : State> {
    (state: unknown extends State ? InferredState : State, action: ActionType<Creators[number]>): ResultState;
}
/**
 * @description
 * Associates actions with a given state change function.
 * A state change function must be provided as the last parameter.
 *
 * @param args `ActionCreator`'s followed by a state change function.
 *
 * @returns an association of action types with a state change function.
 *
 * @usageNotes
 * ```ts
 * on(AuthApiActions.loginSuccess, (state, { user }) => ({ ...state, user }))
 * ```
 */
export declare function on<State, Creators extends readonly ActionCreator[], InferredState = State>(...args: [
    ...creators: Creators,
    reducer: OnReducer<State extends infer S ? S : never, Creators, InferredState>
]): ReducerTypes<unknown extends State ? InferredState : State, Creators>;
/**
 * @description
 * Creates a reducer function to handle state transitions.
 *
 * Reducer creators reduce the explicitness of reducer functions with switch statements.
 *
 * @param initialState Provides a state value if the current state is `undefined`, as it is initially.
 * @param ons Associations between actions and state changes.
 * @returns A reducer function.
 *
 * @usageNotes
 *
 * - Must be used with `ActionCreator`'s (returned by `createAction`). Cannot be used with class-based action creators.
 * - The returned `ActionReducer` does not require being wrapped with another function.
 *
 * **Declaring a reducer creator**
 *
 * ```ts
 * export const reducer = createReducer(
 *   initialState,
 *   on(
 *     featureActions.actionOne,
 *     featureActions.actionTwo,
 *     (state, { updatedValue }) => ({ ...state, prop: updatedValue })
 *   ),
 *   on(featureActions.actionThree, () => initialState);
 * );
 * ```
 */
export declare function createReducer<S, A extends Action = Action, R extends ActionReducer<S, A> = ActionReducer<S, A>>(initialState: S, ...ons: ReducerTypes<S, readonly ActionCreator[]>[]): R;
export {};
