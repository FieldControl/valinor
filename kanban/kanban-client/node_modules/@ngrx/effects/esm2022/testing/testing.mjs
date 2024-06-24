import { Actions } from '@ngrx/effects';
import { defer } from 'rxjs';
/**
 * @description
 * Creates mock actions provider.
 *
 * @param factoryOrSource Actions' source or source creation function
 *
 * @usageNotes
 *
 * **With `TestBed.configureTestingModule`**
 *
 * ```ts
 * describe('Books Effects', () => {
 *   let actions$ = new Observable<Action>();
 *   let effects: BooksEffects;
 *
 *   beforeEach(() => {
 *     TestBed.configureTestingModule({
 *       providers: [
 *         provideMockActions(() => actions$),
 *         BooksEffects,
 *       ],
 *     });
 *
 *     actions$ = TestBed.inject(Actions);
 *     effects = TestBed.inject(BooksEffects);
 *   });
 * });
 * ```
 *
 * **With `Injector.create`**
 *
 * ```ts
 * describe('Counter Effects', () => {
 *   let injector: Injector;
 *   let actions$ = new Observable<Action>();
 *   let effects: CounterEffects;
 *
 *   beforeEach(() => {
 *     injector = Injector.create({
 *       providers: [
 *         provideMockActions(() => actions$),
 *         CounterEffects,
 *       ],
 *     });
 *
 *     actions$ = injector.get(Actions);
 *     effects = injector.get(CounterEffects);
 *   });
 * });
 * ```
 */
export function provideMockActions(factoryOrSource) {
    return {
        provide: Actions,
        useFactory: () => {
            if (typeof factoryOrSource === 'function') {
                return new Actions(defer(factoryOrSource));
            }
            return new Actions(factoryOrSource);
        },
        deps: [],
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy90ZXN0aW5nL3NyYy90ZXN0aW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDeEMsT0FBTyxFQUFFLEtBQUssRUFBYyxNQUFNLE1BQU0sQ0FBQztBQU16Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrREc7QUFDSCxNQUFNLFVBQVUsa0JBQWtCLENBQ2hDLGVBQTBEO0lBRTFELE9BQU87UUFDTCxPQUFPLEVBQUUsT0FBTztRQUNoQixVQUFVLEVBQUUsR0FBb0IsRUFBRTtZQUNoQyxJQUFJLE9BQU8sZUFBZSxLQUFLLFVBQVUsRUFBRSxDQUFDO2dCQUMxQyxPQUFPLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQzdDLENBQUM7WUFFRCxPQUFPLElBQUksT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFDRCxJQUFJLEVBQUUsRUFBRTtLQUNULENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRmFjdG9yeVByb3ZpZGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBY3Rpb25zIH0gZnJvbSAnQG5ncngvZWZmZWN0cyc7XG5pbXBvcnQgeyBkZWZlciwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZU1vY2tBY3Rpb25zKHNvdXJjZTogT2JzZXJ2YWJsZTxhbnk+KTogRmFjdG9yeVByb3ZpZGVyO1xuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVNb2NrQWN0aW9ucyhcbiAgZmFjdG9yeTogKCkgPT4gT2JzZXJ2YWJsZTxhbnk+XG4pOiBGYWN0b3J5UHJvdmlkZXI7XG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQ3JlYXRlcyBtb2NrIGFjdGlvbnMgcHJvdmlkZXIuXG4gKlxuICogQHBhcmFtIGZhY3RvcnlPclNvdXJjZSBBY3Rpb25zJyBzb3VyY2Ugb3Igc291cmNlIGNyZWF0aW9uIGZ1bmN0aW9uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAqKldpdGggYFRlc3RCZWQuY29uZmlndXJlVGVzdGluZ01vZHVsZWAqKlxuICpcbiAqIGBgYHRzXG4gKiBkZXNjcmliZSgnQm9va3MgRWZmZWN0cycsICgpID0+IHtcbiAqICAgbGV0IGFjdGlvbnMkID0gbmV3IE9ic2VydmFibGU8QWN0aW9uPigpO1xuICogICBsZXQgZWZmZWN0czogQm9va3NFZmZlY3RzO1xuICpcbiAqICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gKiAgICAgVGVzdEJlZC5jb25maWd1cmVUZXN0aW5nTW9kdWxlKHtcbiAqICAgICAgIHByb3ZpZGVyczogW1xuICogICAgICAgICBwcm92aWRlTW9ja0FjdGlvbnMoKCkgPT4gYWN0aW9ucyQpLFxuICogICAgICAgICBCb29rc0VmZmVjdHMsXG4gKiAgICAgICBdLFxuICogICAgIH0pO1xuICpcbiAqICAgICBhY3Rpb25zJCA9IFRlc3RCZWQuaW5qZWN0KEFjdGlvbnMpO1xuICogICAgIGVmZmVjdHMgPSBUZXN0QmVkLmluamVjdChCb29rc0VmZmVjdHMpO1xuICogICB9KTtcbiAqIH0pO1xuICogYGBgXG4gKlxuICogKipXaXRoIGBJbmplY3Rvci5jcmVhdGVgKipcbiAqXG4gKiBgYGB0c1xuICogZGVzY3JpYmUoJ0NvdW50ZXIgRWZmZWN0cycsICgpID0+IHtcbiAqICAgbGV0IGluamVjdG9yOiBJbmplY3RvcjtcbiAqICAgbGV0IGFjdGlvbnMkID0gbmV3IE9ic2VydmFibGU8QWN0aW9uPigpO1xuICogICBsZXQgZWZmZWN0czogQ291bnRlckVmZmVjdHM7XG4gKlxuICogICBiZWZvcmVFYWNoKCgpID0+IHtcbiAqICAgICBpbmplY3RvciA9IEluamVjdG9yLmNyZWF0ZSh7XG4gKiAgICAgICBwcm92aWRlcnM6IFtcbiAqICAgICAgICAgcHJvdmlkZU1vY2tBY3Rpb25zKCgpID0+IGFjdGlvbnMkKSxcbiAqICAgICAgICAgQ291bnRlckVmZmVjdHMsXG4gKiAgICAgICBdLFxuICogICAgIH0pO1xuICpcbiAqICAgICBhY3Rpb25zJCA9IGluamVjdG9yLmdldChBY3Rpb25zKTtcbiAqICAgICBlZmZlY3RzID0gaW5qZWN0b3IuZ2V0KENvdW50ZXJFZmZlY3RzKTtcbiAqICAgfSk7XG4gKiB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZU1vY2tBY3Rpb25zKFxuICBmYWN0b3J5T3JTb3VyY2U6ICgoKSA9PiBPYnNlcnZhYmxlPGFueT4pIHwgT2JzZXJ2YWJsZTxhbnk+XG4pOiBGYWN0b3J5UHJvdmlkZXIge1xuICByZXR1cm4ge1xuICAgIHByb3ZpZGU6IEFjdGlvbnMsXG4gICAgdXNlRmFjdG9yeTogKCk6IE9ic2VydmFibGU8YW55PiA9PiB7XG4gICAgICBpZiAodHlwZW9mIGZhY3RvcnlPclNvdXJjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gbmV3IEFjdGlvbnMoZGVmZXIoZmFjdG9yeU9yU291cmNlKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgQWN0aW9ucyhmYWN0b3J5T3JTb3VyY2UpO1xuICAgIH0sXG4gICAgZGVwczogW10sXG4gIH07XG59XG4iXX0=