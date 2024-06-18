import { CREATE_EFFECT_METADATA_KEY, DEFAULT_EFFECT_CONFIG, } from './models';
/**
 * @description
 *
 * Creates an effect from a source and an `EffectConfig`.
 *
 * @param source A function which returns an observable or observable factory.
 * @param config A `EffectConfig` to configure the effect. By default,
 * `dispatch` is true, `functional` is false, and `useEffectsErrorHandler` is
 * true.
 * @returns If `EffectConfig`#`functional` is true, returns the source function.
 * Else, returns the source function result. When `EffectConfig`#`dispatch` is
 * true, the source function result needs to be `Observable<Action>`.
 *
 * @usageNotes
 *
 * ### Class Effects
 *
 * ```ts
 * @Injectable()
 * export class FeatureEffects {
 *   // mapping to a different action
 *   readonly effect1$ = createEffect(
 *     () => this.actions$.pipe(
 *       ofType(FeatureActions.actionOne),
 *       map(() => FeatureActions.actionTwo())
 *     )
 *   );
 *
 *   // non-dispatching effect
 *   readonly effect2$ = createEffect(
 *     () => this.actions$.pipe(
 *       ofType(FeatureActions.actionTwo),
 *       tap(() => console.log('Action Two Dispatched'))
 *     ),
 *     { dispatch: false } // FeatureActions.actionTwo is not dispatched
 *   );
 *
 *   constructor(private readonly actions$: Actions) {}
 * }
 * ```
 *
 * ### Functional Effects
 *
 * ```ts
 * // mapping to a different action
 * export const loadUsers = createEffect(
 *   (actions$ = inject(Actions), usersService = inject(UsersService)) => {
 *     return actions$.pipe(
 *       ofType(UsersPageActions.opened),
 *       exhaustMap(() => {
 *         return usersService.getAll().pipe(
 *           map((users) => UsersApiActions.usersLoadedSuccess({ users })),
 *           catchError((error) =>
 *             of(UsersApiActions.usersLoadedFailure({ error }))
 *           )
 *         );
 *       })
 *     );
 *   },
 *   { functional: true }
 * );
 *
 * // non-dispatching functional effect
 * export const logDispatchedActions = createEffect(
 *   () => inject(Actions).pipe(tap(console.log)),
 *   { functional: true, dispatch: false }
 * );
 * ```
 */
export function createEffect(source, config = {}) {
    const effect = config.functional ? source : source();
    const value = {
        ...DEFAULT_EFFECT_CONFIG,
        ...config, // Overrides any defaults if values are provided
    };
    Object.defineProperty(effect, CREATE_EFFECT_METADATA_KEY, {
        value,
    });
    return effect;
}
export function getCreateEffectMetadata(instance) {
    const propertyNames = Object.getOwnPropertyNames(instance);
    const metadata = propertyNames
        .filter((propertyName) => {
        if (instance[propertyName] &&
            instance[propertyName].hasOwnProperty(CREATE_EFFECT_METADATA_KEY)) {
            // If the property type has overridden `hasOwnProperty` we need to ensure
            // that the metadata is valid (containing a `dispatch` property)
            // https://github.com/ngrx/platform/issues/2975
            const property = instance[propertyName];
            return property[CREATE_EFFECT_METADATA_KEY].hasOwnProperty('dispatch');
        }
        return false;
    })
        .map((propertyName) => {
        const metaData = instance[propertyName][CREATE_EFFECT_METADATA_KEY];
        return {
            propertyName,
            ...metaData,
        };
    });
    return metadata;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0X2NyZWF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9tb2R1bGVzL2VmZmVjdHMvc3JjL2VmZmVjdF9jcmVhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFDTCwwQkFBMEIsRUFFMUIscUJBQXFCLEdBSXRCLE1BQU0sVUFBVSxDQUFDO0FBK0JsQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvRUc7QUFDSCxNQUFNLFVBQVUsWUFBWSxDQUkxQixNQUFjLEVBQ2QsU0FBdUIsRUFBRTtJQUV6QixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3JELE1BQU0sS0FBSyxHQUFpQjtRQUMxQixHQUFHLHFCQUFxQjtRQUN4QixHQUFHLE1BQU0sRUFBRSxnREFBZ0Q7S0FDNUQsQ0FBQztJQUNGLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLDBCQUEwQixFQUFFO1FBQ3hELEtBQUs7S0FDTixDQUFDLENBQUM7SUFDSCxPQUFPLE1BQThDLENBQUM7QUFDeEQsQ0FBQztBQUVELE1BQU0sVUFBVSx1QkFBdUIsQ0FDckMsUUFBVztJQUVYLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQW1CLENBQUM7SUFFN0UsTUFBTSxRQUFRLEdBQXdCLGFBQWE7U0FDaEQsTUFBTSxDQUFDLENBQUMsWUFBWSxFQUFFLEVBQUU7UUFDdkIsSUFDRSxRQUFRLENBQUMsWUFBWSxDQUFDO1lBQ3RCLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxjQUFjLENBQUMsMEJBQTBCLENBQUMsRUFDakUsQ0FBQztZQUNELHlFQUF5RTtZQUN6RSxnRUFBZ0U7WUFDaEUsK0NBQStDO1lBQy9DLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQVEsQ0FBQztZQUMvQyxPQUFPLFFBQVEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6RSxDQUFDO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDLENBQUM7U0FDRCxHQUFHLENBQUMsQ0FBQyxZQUFZLEVBQUUsRUFBRTtRQUNwQixNQUFNLFFBQVEsR0FBSSxRQUFRLENBQUMsWUFBWSxDQUFTLENBQzlDLDBCQUEwQixDQUMzQixDQUFDO1FBQ0YsT0FBTztZQUNMLFlBQVk7WUFDWixHQUFHLFFBQVE7U0FDWixDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7SUFFTCxPQUFPLFFBQVEsQ0FBQztBQUNsQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgQWN0aW9uLCBBY3Rpb25DcmVhdG9yIH0gZnJvbSAnQG5ncngvc3RvcmUnO1xuaW1wb3J0IHtcbiAgQ1JFQVRFX0VGRkVDVF9NRVRBREFUQV9LRVksXG4gIENyZWF0ZUVmZmVjdE1ldGFkYXRhLFxuICBERUZBVUxUX0VGRkVDVF9DT05GSUcsXG4gIEVmZmVjdENvbmZpZyxcbiAgRWZmZWN0TWV0YWRhdGEsXG4gIEZ1bmN0aW9uYWxFZmZlY3QsXG59IGZyb20gJy4vbW9kZWxzJztcblxudHlwZSBEaXNwYXRjaFR5cGU8VD4gPSBUIGV4dGVuZHMgeyBkaXNwYXRjaDogaW5mZXIgVSB9ID8gVSA6IHRydWU7XG50eXBlIE9ic2VydmFibGVUeXBlPFQsIE9yaWdpbmFsVHlwZT4gPSBUIGV4dGVuZHMgZmFsc2UgPyBPcmlnaW5hbFR5cGUgOiBBY3Rpb247XG50eXBlIEVmZmVjdFJlc3VsdDxPVD4gPSBPYnNlcnZhYmxlPE9UPiB8ICgoLi4uYXJnczogYW55W10pID0+IE9ic2VydmFibGU8T1Q+KTtcbnR5cGUgQ29uZGl0aW9uYWxseURpc2FsbG93QWN0aW9uQ3JlYXRvcjxEVCwgUmVzdWx0PiA9IERUIGV4dGVuZHMgZmFsc2VcbiAgPyB1bmtub3duIC8vIElmIERUIChEaXNwYXRjaFR5cGUgaXMgZmFsc2UsIHRoZW4gd2UgZG9uJ3QgZW5mb3JjZSBhbnkgcmV0dXJuIHR5cGVzKVxuICA6IFJlc3VsdCBleHRlbmRzIEVmZmVjdFJlc3VsdDxpbmZlciBPVD5cbiAgPyBPVCBleHRlbmRzIEFjdGlvbkNyZWF0b3JcbiAgICA/ICdBY3Rpb25DcmVhdG9yIGNhbm5vdCBiZSBkaXNwYXRjaGVkLiBEaWQgeW91IGZvcmdldCB0byBjYWxsIHRoZSBhY3Rpb24gY3JlYXRvciBmdW5jdGlvbj8nXG4gICAgOiB1bmtub3duXG4gIDogdW5rbm93bjtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVmZmVjdDxcbiAgQyBleHRlbmRzIEVmZmVjdENvbmZpZyAmIHsgZnVuY3Rpb25hbD86IGZhbHNlIH0sXG4gIERUIGV4dGVuZHMgRGlzcGF0Y2hUeXBlPEM+LFxuICBPVFAsXG4gIFIgZXh0ZW5kcyBFZmZlY3RSZXN1bHQ8T1Q+LFxuICBPVCBleHRlbmRzIE9ic2VydmFibGVUeXBlPERULCBPVFA+XG4+KFxuICBzb3VyY2U6ICgpID0+IFIgJiBDb25kaXRpb25hbGx5RGlzYWxsb3dBY3Rpb25DcmVhdG9yPERULCBSPixcbiAgY29uZmlnPzogQ1xuKTogUiAmIENyZWF0ZUVmZmVjdE1ldGFkYXRhO1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVmZmVjdDxTb3VyY2UgZXh0ZW5kcyAoKSA9PiBPYnNlcnZhYmxlPHVua25vd24+PihcbiAgc291cmNlOiBTb3VyY2UsXG4gIGNvbmZpZzogRWZmZWN0Q29uZmlnICYgeyBmdW5jdGlvbmFsOiB0cnVlOyBkaXNwYXRjaDogZmFsc2UgfVxuKTogRnVuY3Rpb25hbEVmZmVjdDxTb3VyY2U+O1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVmZmVjdDxTb3VyY2UgZXh0ZW5kcyAoKSA9PiBPYnNlcnZhYmxlPEFjdGlvbj4+KFxuICBzb3VyY2U6IFNvdXJjZSAmIENvbmRpdGlvbmFsbHlEaXNhbGxvd0FjdGlvbkNyZWF0b3I8dHJ1ZSwgUmV0dXJuVHlwZTxTb3VyY2U+PixcbiAgY29uZmlnOiBFZmZlY3RDb25maWcgJiB7IGZ1bmN0aW9uYWw6IHRydWU7IGRpc3BhdGNoPzogdHJ1ZSB9XG4pOiBGdW5jdGlvbmFsRWZmZWN0PFNvdXJjZT47XG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIENyZWF0ZXMgYW4gZWZmZWN0IGZyb20gYSBzb3VyY2UgYW5kIGFuIGBFZmZlY3RDb25maWdgLlxuICpcbiAqIEBwYXJhbSBzb3VyY2UgQSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGFuIG9ic2VydmFibGUgb3Igb2JzZXJ2YWJsZSBmYWN0b3J5LlxuICogQHBhcmFtIGNvbmZpZyBBIGBFZmZlY3RDb25maWdgIHRvIGNvbmZpZ3VyZSB0aGUgZWZmZWN0LiBCeSBkZWZhdWx0LFxuICogYGRpc3BhdGNoYCBpcyB0cnVlLCBgZnVuY3Rpb25hbGAgaXMgZmFsc2UsIGFuZCBgdXNlRWZmZWN0c0Vycm9ySGFuZGxlcmAgaXNcbiAqIHRydWUuXG4gKiBAcmV0dXJucyBJZiBgRWZmZWN0Q29uZmlnYCNgZnVuY3Rpb25hbGAgaXMgdHJ1ZSwgcmV0dXJucyB0aGUgc291cmNlIGZ1bmN0aW9uLlxuICogRWxzZSwgcmV0dXJucyB0aGUgc291cmNlIGZ1bmN0aW9uIHJlc3VsdC4gV2hlbiBgRWZmZWN0Q29uZmlnYCNgZGlzcGF0Y2hgIGlzXG4gKiB0cnVlLCB0aGUgc291cmNlIGZ1bmN0aW9uIHJlc3VsdCBuZWVkcyB0byBiZSBgT2JzZXJ2YWJsZTxBY3Rpb24+YC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBDbGFzcyBFZmZlY3RzXG4gKlxuICogYGBgdHNcbiAqIEBJbmplY3RhYmxlKClcbiAqIGV4cG9ydCBjbGFzcyBGZWF0dXJlRWZmZWN0cyB7XG4gKiAgIC8vIG1hcHBpbmcgdG8gYSBkaWZmZXJlbnQgYWN0aW9uXG4gKiAgIHJlYWRvbmx5IGVmZmVjdDEkID0gY3JlYXRlRWZmZWN0KFxuICogICAgICgpID0+IHRoaXMuYWN0aW9ucyQucGlwZShcbiAqICAgICAgIG9mVHlwZShGZWF0dXJlQWN0aW9ucy5hY3Rpb25PbmUpLFxuICogICAgICAgbWFwKCgpID0+IEZlYXR1cmVBY3Rpb25zLmFjdGlvblR3bygpKVxuICogICAgIClcbiAqICAgKTtcbiAqXG4gKiAgIC8vIG5vbi1kaXNwYXRjaGluZyBlZmZlY3RcbiAqICAgcmVhZG9ubHkgZWZmZWN0MiQgPSBjcmVhdGVFZmZlY3QoXG4gKiAgICAgKCkgPT4gdGhpcy5hY3Rpb25zJC5waXBlKFxuICogICAgICAgb2ZUeXBlKEZlYXR1cmVBY3Rpb25zLmFjdGlvblR3byksXG4gKiAgICAgICB0YXAoKCkgPT4gY29uc29sZS5sb2coJ0FjdGlvbiBUd28gRGlzcGF0Y2hlZCcpKVxuICogICAgICksXG4gKiAgICAgeyBkaXNwYXRjaDogZmFsc2UgfSAvLyBGZWF0dXJlQWN0aW9ucy5hY3Rpb25Ud28gaXMgbm90IGRpc3BhdGNoZWRcbiAqICAgKTtcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgYWN0aW9ucyQ6IEFjdGlvbnMpIHt9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiAjIyMgRnVuY3Rpb25hbCBFZmZlY3RzXG4gKlxuICogYGBgdHNcbiAqIC8vIG1hcHBpbmcgdG8gYSBkaWZmZXJlbnQgYWN0aW9uXG4gKiBleHBvcnQgY29uc3QgbG9hZFVzZXJzID0gY3JlYXRlRWZmZWN0KFxuICogICAoYWN0aW9ucyQgPSBpbmplY3QoQWN0aW9ucyksIHVzZXJzU2VydmljZSA9IGluamVjdChVc2Vyc1NlcnZpY2UpKSA9PiB7XG4gKiAgICAgcmV0dXJuIGFjdGlvbnMkLnBpcGUoXG4gKiAgICAgICBvZlR5cGUoVXNlcnNQYWdlQWN0aW9ucy5vcGVuZWQpLFxuICogICAgICAgZXhoYXVzdE1hcCgoKSA9PiB7XG4gKiAgICAgICAgIHJldHVybiB1c2Vyc1NlcnZpY2UuZ2V0QWxsKCkucGlwZShcbiAqICAgICAgICAgICBtYXAoKHVzZXJzKSA9PiBVc2Vyc0FwaUFjdGlvbnMudXNlcnNMb2FkZWRTdWNjZXNzKHsgdXNlcnMgfSkpLFxuICogICAgICAgICAgIGNhdGNoRXJyb3IoKGVycm9yKSA9PlxuICogICAgICAgICAgICAgb2YoVXNlcnNBcGlBY3Rpb25zLnVzZXJzTG9hZGVkRmFpbHVyZSh7IGVycm9yIH0pKVxuICogICAgICAgICAgIClcbiAqICAgICAgICAgKTtcbiAqICAgICAgIH0pXG4gKiAgICAgKTtcbiAqICAgfSxcbiAqICAgeyBmdW5jdGlvbmFsOiB0cnVlIH1cbiAqICk7XG4gKlxuICogLy8gbm9uLWRpc3BhdGNoaW5nIGZ1bmN0aW9uYWwgZWZmZWN0XG4gKiBleHBvcnQgY29uc3QgbG9nRGlzcGF0Y2hlZEFjdGlvbnMgPSBjcmVhdGVFZmZlY3QoXG4gKiAgICgpID0+IGluamVjdChBY3Rpb25zKS5waXBlKHRhcChjb25zb2xlLmxvZykpLFxuICogICB7IGZ1bmN0aW9uYWw6IHRydWUsIGRpc3BhdGNoOiBmYWxzZSB9XG4gKiApO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFZmZlY3Q8XG4gIFJlc3VsdCBleHRlbmRzIEVmZmVjdFJlc3VsdDx1bmtub3duPixcbiAgU291cmNlIGV4dGVuZHMgKCkgPT4gUmVzdWx0XG4+KFxuICBzb3VyY2U6IFNvdXJjZSxcbiAgY29uZmlnOiBFZmZlY3RDb25maWcgPSB7fVxuKTogKFNvdXJjZSB8IFJlc3VsdCkgJiBDcmVhdGVFZmZlY3RNZXRhZGF0YSB7XG4gIGNvbnN0IGVmZmVjdCA9IGNvbmZpZy5mdW5jdGlvbmFsID8gc291cmNlIDogc291cmNlKCk7XG4gIGNvbnN0IHZhbHVlOiBFZmZlY3RDb25maWcgPSB7XG4gICAgLi4uREVGQVVMVF9FRkZFQ1RfQ09ORklHLFxuICAgIC4uLmNvbmZpZywgLy8gT3ZlcnJpZGVzIGFueSBkZWZhdWx0cyBpZiB2YWx1ZXMgYXJlIHByb3ZpZGVkXG4gIH07XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlZmZlY3QsIENSRUFURV9FRkZFQ1RfTUVUQURBVEFfS0VZLCB7XG4gICAgdmFsdWUsXG4gIH0pO1xuICByZXR1cm4gZWZmZWN0IGFzIHR5cGVvZiBlZmZlY3QgJiBDcmVhdGVFZmZlY3RNZXRhZGF0YTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENyZWF0ZUVmZmVjdE1ldGFkYXRhPFQgZXh0ZW5kcyBSZWNvcmQ8a2V5b2YgVCwgT2JqZWN0Pj4oXG4gIGluc3RhbmNlOiBUXG4pOiBFZmZlY3RNZXRhZGF0YTxUPltdIHtcbiAgY29uc3QgcHJvcGVydHlOYW1lcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGluc3RhbmNlKSBhcyBBcnJheTxrZXlvZiBUPjtcblxuICBjb25zdCBtZXRhZGF0YTogRWZmZWN0TWV0YWRhdGE8VD5bXSA9IHByb3BlcnR5TmFtZXNcbiAgICAuZmlsdGVyKChwcm9wZXJ0eU5hbWUpID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgaW5zdGFuY2VbcHJvcGVydHlOYW1lXSAmJlxuICAgICAgICBpbnN0YW5jZVtwcm9wZXJ0eU5hbWVdLmhhc093blByb3BlcnR5KENSRUFURV9FRkZFQ1RfTUVUQURBVEFfS0VZKVxuICAgICAgKSB7XG4gICAgICAgIC8vIElmIHRoZSBwcm9wZXJ0eSB0eXBlIGhhcyBvdmVycmlkZGVuIGBoYXNPd25Qcm9wZXJ0eWAgd2UgbmVlZCB0byBlbnN1cmVcbiAgICAgICAgLy8gdGhhdCB0aGUgbWV0YWRhdGEgaXMgdmFsaWQgKGNvbnRhaW5pbmcgYSBgZGlzcGF0Y2hgIHByb3BlcnR5KVxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbmdyeC9wbGF0Zm9ybS9pc3N1ZXMvMjk3NVxuICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IGluc3RhbmNlW3Byb3BlcnR5TmFtZV0gYXMgYW55O1xuICAgICAgICByZXR1cm4gcHJvcGVydHlbQ1JFQVRFX0VGRkVDVF9NRVRBREFUQV9LRVldLmhhc093blByb3BlcnR5KCdkaXNwYXRjaCcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pXG4gICAgLm1hcCgocHJvcGVydHlOYW1lKSA9PiB7XG4gICAgICBjb25zdCBtZXRhRGF0YSA9IChpbnN0YW5jZVtwcm9wZXJ0eU5hbWVdIGFzIGFueSlbXG4gICAgICAgIENSRUFURV9FRkZFQ1RfTUVUQURBVEFfS0VZXG4gICAgICBdO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcHJvcGVydHlOYW1lLFxuICAgICAgICAuLi5tZXRhRGF0YSxcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgcmV0dXJuIG1ldGFkYXRhO1xufVxuIl19