import { Injector, } from '@angular/core';
import { MockState } from './mock_state';
import { ActionsSubject, INITIAL_STATE, ReducerManager, StateObservable, Store, setNgrxMockEnvironment, } from '@ngrx/store';
import { MockStore } from './mock_store';
import { MockReducerManager } from './mock_reducer_manager';
import { MOCK_SELECTORS } from './tokens';
/**
 * @description
 * Creates mock store providers.
 *
 * @param config `MockStoreConfig<T>` to provide the values for `INITIAL_STATE` and `MOCK_SELECTORS` tokens.
 * By default, `initialState` and `selectors` are not defined.
 * @returns Mock store providers that can be used with both `TestBed.configureTestingModule` and `Injector.create`.
 *
 * @usageNotes
 *
 * **With `TestBed.configureTestingModule`**
 *
 * ```typescript
 * describe('Books Component', () => {
 *   let store: MockStore;
 *
 *   beforeEach(() => {
 *     TestBed.configureTestingModule({
 *       providers: [
 *         provideMockStore({
 *           initialState: { books: { entities: [] } },
 *           selectors: [
 *             { selector: selectAllBooks, value: ['Book 1', 'Book 2'] },
 *             { selector: selectVisibleBooks, value: ['Book 1'] },
 *           ],
 *         }),
 *       ],
 *     });
 *
 *     store = TestBed.inject(MockStore);
 *   });
 * });
 * ```
 *
 * **With `Injector.create`**
 *
 * ```typescript
 * describe('Counter Component', () => {
 *   let injector: Injector;
 *   let store: MockStore;
 *
 *   beforeEach(() => {
 *     injector = Injector.create({
 *       providers: [
 *         provideMockStore({ initialState: { counter: 0 } }),
 *       ],
 *     });
 *     store = injector.get(MockStore);
 *   });
 * });
 * ```
 */
export function provideMockStore(config = {}) {
    setNgrxMockEnvironment(true);
    return [
        {
            provide: ActionsSubject,
            useFactory: () => new ActionsSubject(),
            deps: [],
        },
        { provide: MockState, useFactory: () => new MockState(), deps: [] },
        {
            provide: MockReducerManager,
            useFactory: () => new MockReducerManager(),
            deps: [],
        },
        { provide: INITIAL_STATE, useValue: config.initialState || {} },
        { provide: MOCK_SELECTORS, useValue: config.selectors },
        { provide: StateObservable, useExisting: MockState },
        { provide: ReducerManager, useExisting: MockReducerManager },
        {
            provide: MockStore,
            useFactory: mockStoreFactory,
            deps: [
                MockState,
                ActionsSubject,
                ReducerManager,
                INITIAL_STATE,
                MOCK_SELECTORS,
            ],
        },
        { provide: Store, useExisting: MockStore },
    ];
}
function mockStoreFactory(mockState, actionsSubject, reducerManager, initialState, mockSelectors) {
    return new MockStore(mockState, actionsSubject, reducerManager, initialState, mockSelectors);
}
/**
 * @description
 * Creates mock store with all necessary dependencies outside of the `TestBed`.
 *
 * @param config `MockStoreConfig<T>` to provide the values for `INITIAL_STATE` and `MOCK_SELECTORS` tokens.
 * By default, `initialState` and `selectors` are not defined.
 * @returns `MockStore<T>`
 *
 * @usageNotes
 *
 * ```typescript
 * describe('Books Effects', () => {
 *   let store: MockStore;
 *
 *   beforeEach(() => {
 *     store = createMockStore({
 *       initialState: { books: { entities: ['Book 1', 'Book 2', 'Book 3'] } },
 *       selectors: [
 *         { selector: selectAllBooks, value: ['Book 1', 'Book 2'] },
 *         { selector: selectVisibleBooks, value: ['Book 1'] },
 *       ],
 *     });
 *   });
 * });
 * ```
 */
export function createMockStore(config = {}) {
    const injector = Injector.create({ providers: provideMockStore(config) });
    return injector.get(MockStore);
}
export { MockReducerManager } from './mock_reducer_manager';
export { MockState } from './mock_state';
export { MockStore } from './mock_store';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL21vZHVsZXMvc3RvcmUvdGVzdGluZy9zcmMvdGVzdGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBR0wsUUFBUSxHQUVULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDekMsT0FBTyxFQUNMLGNBQWMsRUFDZCxhQUFhLEVBQ2IsY0FBYyxFQUNkLGVBQWUsRUFDZixLQUFLLEVBQ0wsc0JBQXNCLEdBQ3ZCLE1BQU0sYUFBYSxDQUFDO0FBQ3JCLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDekMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFNUQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQU8xQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbURHO0FBQ0gsTUFBTSxVQUFVLGdCQUFnQixDQUM5QixTQUE2QixFQUFFO0lBRS9CLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdCLE9BQU87UUFDTDtZQUNFLE9BQU8sRUFBRSxjQUFjO1lBQ3ZCLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLGNBQWMsRUFBRTtZQUN0QyxJQUFJLEVBQUUsRUFBRTtTQUNUO1FBQ0QsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLFNBQVMsRUFBSyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUU7UUFDdEU7WUFDRSxPQUFPLEVBQUUsa0JBQWtCO1lBQzNCLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLGtCQUFrQixFQUFFO1lBQzFDLElBQUksRUFBRSxFQUFFO1NBQ1Q7UUFDRCxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxZQUFZLElBQUksRUFBRSxFQUFFO1FBQy9ELEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRTtRQUN2RCxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRTtRQUNwRCxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLGtCQUFrQixFQUFFO1FBQzVEO1lBQ0UsT0FBTyxFQUFFLFNBQVM7WUFDbEIsVUFBVSxFQUFFLGdCQUFnQjtZQUM1QixJQUFJLEVBQUU7Z0JBQ0osU0FBUztnQkFDVCxjQUFjO2dCQUNkLGNBQWM7Z0JBQ2QsYUFBYTtnQkFDYixjQUFjO2FBQ2Y7U0FDRjtRQUNELEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFO0tBQzNDLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxnQkFBZ0IsQ0FDdkIsU0FBdUIsRUFDdkIsY0FBOEIsRUFDOUIsY0FBOEIsRUFDOUIsWUFBZSxFQUNmLGFBQTZCO0lBRTdCLE9BQU8sSUFBSSxTQUFTLENBQ2xCLFNBQVMsRUFDVCxjQUFjLEVBQ2QsY0FBYyxFQUNkLFlBQVksRUFDWixhQUFhLENBQ2QsQ0FBQztBQUNKLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlCRztBQUNILE1BQU0sVUFBVSxlQUFlLENBQzdCLFNBQTZCLEVBQUU7SUFFL0IsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUUsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFFRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUM1RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBFeGlzdGluZ1Byb3ZpZGVyLFxuICBGYWN0b3J5UHJvdmlkZXIsXG4gIEluamVjdG9yLFxuICBWYWx1ZVByb3ZpZGVyLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE1vY2tTdGF0ZSB9IGZyb20gJy4vbW9ja19zdGF0ZSc7XG5pbXBvcnQge1xuICBBY3Rpb25zU3ViamVjdCxcbiAgSU5JVElBTF9TVEFURSxcbiAgUmVkdWNlck1hbmFnZXIsXG4gIFN0YXRlT2JzZXJ2YWJsZSxcbiAgU3RvcmUsXG4gIHNldE5ncnhNb2NrRW52aXJvbm1lbnQsXG59IGZyb20gJ0BuZ3J4L3N0b3JlJztcbmltcG9ydCB7IE1vY2tTdG9yZSB9IGZyb20gJy4vbW9ja19zdG9yZSc7XG5pbXBvcnQgeyBNb2NrUmVkdWNlck1hbmFnZXIgfSBmcm9tICcuL21vY2tfcmVkdWNlcl9tYW5hZ2VyJztcbmltcG9ydCB7IE1vY2tTZWxlY3RvciB9IGZyb20gJy4vbW9ja19zZWxlY3Rvcic7XG5pbXBvcnQgeyBNT0NLX1NFTEVDVE9SUyB9IGZyb20gJy4vdG9rZW5zJztcblxuZXhwb3J0IGludGVyZmFjZSBNb2NrU3RvcmVDb25maWc8VD4ge1xuICBpbml0aWFsU3RhdGU/OiBUO1xuICBzZWxlY3RvcnM/OiBNb2NrU2VsZWN0b3JbXTtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIENyZWF0ZXMgbW9jayBzdG9yZSBwcm92aWRlcnMuXG4gKlxuICogQHBhcmFtIGNvbmZpZyBgTW9ja1N0b3JlQ29uZmlnPFQ+YCB0byBwcm92aWRlIHRoZSB2YWx1ZXMgZm9yIGBJTklUSUFMX1NUQVRFYCBhbmQgYE1PQ0tfU0VMRUNUT1JTYCB0b2tlbnMuXG4gKiBCeSBkZWZhdWx0LCBgaW5pdGlhbFN0YXRlYCBhbmQgYHNlbGVjdG9yc2AgYXJlIG5vdCBkZWZpbmVkLlxuICogQHJldHVybnMgTW9jayBzdG9yZSBwcm92aWRlcnMgdGhhdCBjYW4gYmUgdXNlZCB3aXRoIGJvdGggYFRlc3RCZWQuY29uZmlndXJlVGVzdGluZ01vZHVsZWAgYW5kIGBJbmplY3Rvci5jcmVhdGVgLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogKipXaXRoIGBUZXN0QmVkLmNvbmZpZ3VyZVRlc3RpbmdNb2R1bGVgKipcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBkZXNjcmliZSgnQm9va3MgQ29tcG9uZW50JywgKCkgPT4ge1xuICogICBsZXQgc3RvcmU6IE1vY2tTdG9yZTtcbiAqXG4gKiAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICogICAgIFRlc3RCZWQuY29uZmlndXJlVGVzdGluZ01vZHVsZSh7XG4gKiAgICAgICBwcm92aWRlcnM6IFtcbiAqICAgICAgICAgcHJvdmlkZU1vY2tTdG9yZSh7XG4gKiAgICAgICAgICAgaW5pdGlhbFN0YXRlOiB7IGJvb2tzOiB7IGVudGl0aWVzOiBbXSB9IH0sXG4gKiAgICAgICAgICAgc2VsZWN0b3JzOiBbXG4gKiAgICAgICAgICAgICB7IHNlbGVjdG9yOiBzZWxlY3RBbGxCb29rcywgdmFsdWU6IFsnQm9vayAxJywgJ0Jvb2sgMiddIH0sXG4gKiAgICAgICAgICAgICB7IHNlbGVjdG9yOiBzZWxlY3RWaXNpYmxlQm9va3MsIHZhbHVlOiBbJ0Jvb2sgMSddIH0sXG4gKiAgICAgICAgICAgXSxcbiAqICAgICAgICAgfSksXG4gKiAgICAgICBdLFxuICogICAgIH0pO1xuICpcbiAqICAgICBzdG9yZSA9IFRlc3RCZWQuaW5qZWN0KE1vY2tTdG9yZSk7XG4gKiAgIH0pO1xuICogfSk7XG4gKiBgYGBcbiAqXG4gKiAqKldpdGggYEluamVjdG9yLmNyZWF0ZWAqKlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGRlc2NyaWJlKCdDb3VudGVyIENvbXBvbmVudCcsICgpID0+IHtcbiAqICAgbGV0IGluamVjdG9yOiBJbmplY3RvcjtcbiAqICAgbGV0IHN0b3JlOiBNb2NrU3RvcmU7XG4gKlxuICogICBiZWZvcmVFYWNoKCgpID0+IHtcbiAqICAgICBpbmplY3RvciA9IEluamVjdG9yLmNyZWF0ZSh7XG4gKiAgICAgICBwcm92aWRlcnM6IFtcbiAqICAgICAgICAgcHJvdmlkZU1vY2tTdG9yZSh7IGluaXRpYWxTdGF0ZTogeyBjb3VudGVyOiAwIH0gfSksXG4gKiAgICAgICBdLFxuICogICAgIH0pO1xuICogICAgIHN0b3JlID0gaW5qZWN0b3IuZ2V0KE1vY2tTdG9yZSk7XG4gKiAgIH0pO1xuICogfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVNb2NrU3RvcmU8VCA9IGFueT4oXG4gIGNvbmZpZzogTW9ja1N0b3JlQ29uZmlnPFQ+ID0ge31cbik6IChWYWx1ZVByb3ZpZGVyIHwgRXhpc3RpbmdQcm92aWRlciB8IEZhY3RvcnlQcm92aWRlcilbXSB7XG4gIHNldE5ncnhNb2NrRW52aXJvbm1lbnQodHJ1ZSk7XG4gIHJldHVybiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogQWN0aW9uc1N1YmplY3QsXG4gICAgICB1c2VGYWN0b3J5OiAoKSA9PiBuZXcgQWN0aW9uc1N1YmplY3QoKSxcbiAgICAgIGRlcHM6IFtdLFxuICAgIH0sXG4gICAgeyBwcm92aWRlOiBNb2NrU3RhdGUsIHVzZUZhY3Rvcnk6ICgpID0+IG5ldyBNb2NrU3RhdGU8VD4oKSwgZGVwczogW10gfSxcbiAgICB7XG4gICAgICBwcm92aWRlOiBNb2NrUmVkdWNlck1hbmFnZXIsXG4gICAgICB1c2VGYWN0b3J5OiAoKSA9PiBuZXcgTW9ja1JlZHVjZXJNYW5hZ2VyKCksXG4gICAgICBkZXBzOiBbXSxcbiAgICB9LFxuICAgIHsgcHJvdmlkZTogSU5JVElBTF9TVEFURSwgdXNlVmFsdWU6IGNvbmZpZy5pbml0aWFsU3RhdGUgfHwge30gfSxcbiAgICB7IHByb3ZpZGU6IE1PQ0tfU0VMRUNUT1JTLCB1c2VWYWx1ZTogY29uZmlnLnNlbGVjdG9ycyB9LFxuICAgIHsgcHJvdmlkZTogU3RhdGVPYnNlcnZhYmxlLCB1c2VFeGlzdGluZzogTW9ja1N0YXRlIH0sXG4gICAgeyBwcm92aWRlOiBSZWR1Y2VyTWFuYWdlciwgdXNlRXhpc3Rpbmc6IE1vY2tSZWR1Y2VyTWFuYWdlciB9LFxuICAgIHtcbiAgICAgIHByb3ZpZGU6IE1vY2tTdG9yZSxcbiAgICAgIHVzZUZhY3Rvcnk6IG1vY2tTdG9yZUZhY3RvcnksXG4gICAgICBkZXBzOiBbXG4gICAgICAgIE1vY2tTdGF0ZSxcbiAgICAgICAgQWN0aW9uc1N1YmplY3QsXG4gICAgICAgIFJlZHVjZXJNYW5hZ2VyLFxuICAgICAgICBJTklUSUFMX1NUQVRFLFxuICAgICAgICBNT0NLX1NFTEVDVE9SUyxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7IHByb3ZpZGU6IFN0b3JlLCB1c2VFeGlzdGluZzogTW9ja1N0b3JlIH0sXG4gIF07XG59XG5cbmZ1bmN0aW9uIG1vY2tTdG9yZUZhY3Rvcnk8VD4oXG4gIG1vY2tTdGF0ZTogTW9ja1N0YXRlPFQ+LFxuICBhY3Rpb25zU3ViamVjdDogQWN0aW9uc1N1YmplY3QsXG4gIHJlZHVjZXJNYW5hZ2VyOiBSZWR1Y2VyTWFuYWdlcixcbiAgaW5pdGlhbFN0YXRlOiBULFxuICBtb2NrU2VsZWN0b3JzOiBNb2NrU2VsZWN0b3JbXVxuKTogTW9ja1N0b3JlPFQ+IHtcbiAgcmV0dXJuIG5ldyBNb2NrU3RvcmUoXG4gICAgbW9ja1N0YXRlLFxuICAgIGFjdGlvbnNTdWJqZWN0LFxuICAgIHJlZHVjZXJNYW5hZ2VyLFxuICAgIGluaXRpYWxTdGF0ZSxcbiAgICBtb2NrU2VsZWN0b3JzXG4gICk7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBDcmVhdGVzIG1vY2sgc3RvcmUgd2l0aCBhbGwgbmVjZXNzYXJ5IGRlcGVuZGVuY2llcyBvdXRzaWRlIG9mIHRoZSBgVGVzdEJlZGAuXG4gKlxuICogQHBhcmFtIGNvbmZpZyBgTW9ja1N0b3JlQ29uZmlnPFQ+YCB0byBwcm92aWRlIHRoZSB2YWx1ZXMgZm9yIGBJTklUSUFMX1NUQVRFYCBhbmQgYE1PQ0tfU0VMRUNUT1JTYCB0b2tlbnMuXG4gKiBCeSBkZWZhdWx0LCBgaW5pdGlhbFN0YXRlYCBhbmQgYHNlbGVjdG9yc2AgYXJlIG5vdCBkZWZpbmVkLlxuICogQHJldHVybnMgYE1vY2tTdG9yZTxUPmBcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGRlc2NyaWJlKCdCb29rcyBFZmZlY3RzJywgKCkgPT4ge1xuICogICBsZXQgc3RvcmU6IE1vY2tTdG9yZTtcbiAqXG4gKiAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICogICAgIHN0b3JlID0gY3JlYXRlTW9ja1N0b3JlKHtcbiAqICAgICAgIGluaXRpYWxTdGF0ZTogeyBib29rczogeyBlbnRpdGllczogWydCb29rIDEnLCAnQm9vayAyJywgJ0Jvb2sgMyddIH0gfSxcbiAqICAgICAgIHNlbGVjdG9yczogW1xuICogICAgICAgICB7IHNlbGVjdG9yOiBzZWxlY3RBbGxCb29rcywgdmFsdWU6IFsnQm9vayAxJywgJ0Jvb2sgMiddIH0sXG4gKiAgICAgICAgIHsgc2VsZWN0b3I6IHNlbGVjdFZpc2libGVCb29rcywgdmFsdWU6IFsnQm9vayAxJ10gfSxcbiAqICAgICAgIF0sXG4gKiAgICAgfSk7XG4gKiAgIH0pO1xuICogfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1vY2tTdG9yZTxUPihcbiAgY29uZmlnOiBNb2NrU3RvcmVDb25maWc8VD4gPSB7fVxuKTogTW9ja1N0b3JlPFQ+IHtcbiAgY29uc3QgaW5qZWN0b3IgPSBJbmplY3Rvci5jcmVhdGUoeyBwcm92aWRlcnM6IHByb3ZpZGVNb2NrU3RvcmUoY29uZmlnKSB9KTtcbiAgcmV0dXJuIGluamVjdG9yLmdldChNb2NrU3RvcmUpO1xufVxuXG5leHBvcnQgeyBNb2NrUmVkdWNlck1hbmFnZXIgfSBmcm9tICcuL21vY2tfcmVkdWNlcl9tYW5hZ2VyJztcbmV4cG9ydCB7IE1vY2tTdGF0ZSB9IGZyb20gJy4vbW9ja19zdGF0ZSc7XG5leHBvcnQgeyBNb2NrU3RvcmUgfSBmcm9tICcuL21vY2tfc3RvcmUnO1xuZXhwb3J0IHsgTW9ja1NlbGVjdG9yIH0gZnJvbSAnLi9tb2NrX3NlbGVjdG9yJztcbiJdfQ==