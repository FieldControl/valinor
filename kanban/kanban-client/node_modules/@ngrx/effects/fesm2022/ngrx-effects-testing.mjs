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
function provideMockActions(factoryOrSource) {
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

/**
 * Generated bundle index. Do not edit.
 */

export { provideMockActions };
//# sourceMappingURL=ngrx-effects-testing.mjs.map
