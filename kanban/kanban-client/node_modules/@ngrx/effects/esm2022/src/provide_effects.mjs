import { ENVIRONMENT_INITIALIZER, inject, makeEnvironmentProviders, } from '@angular/core';
import { FEATURE_STATE_PROVIDER, ROOT_STORE_PROVIDER, Store, } from '@ngrx/store';
import { EffectsRunner } from './effects_runner';
import { EffectSources } from './effect_sources';
import { rootEffectsInit as effectsInit } from './effects_actions';
import { getClasses, isClass } from './utils';
/**
 * @usageNotes
 *
 * ### Providing effects at the root level
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideEffects(RouterEffects)],
 * });
 * ```
 *
 * ### Providing effects at the feature level
 *
 * ```ts
 * const booksRoutes: Route[] = [
 *   {
 *     path: '',
 *     providers: [provideEffects(BooksApiEffects)],
 *     children: [
 *       { path: '', component: BookListComponent },
 *       { path: ':id', component: BookDetailsComponent },
 *     ],
 *   },
 * ];
 * ```
 */
export function provideEffects(...effects) {
    const effectsClassesAndRecords = effects.flat();
    const effectsClasses = getClasses(effectsClassesAndRecords);
    return makeEnvironmentProviders([
        effectsClasses,
        {
            provide: ENVIRONMENT_INITIALIZER,
            multi: true,
            useValue: () => {
                inject(ROOT_STORE_PROVIDER);
                inject(FEATURE_STATE_PROVIDER, { optional: true });
                const effectsRunner = inject(EffectsRunner);
                const effectSources = inject(EffectSources);
                const shouldInitEffects = !effectsRunner.isStarted;
                if (shouldInitEffects) {
                    effectsRunner.start();
                }
                for (const effectsClassOrRecord of effectsClassesAndRecords) {
                    const effectsInstance = isClass(effectsClassOrRecord)
                        ? inject(effectsClassOrRecord)
                        : effectsClassOrRecord;
                    effectSources.addEffects(effectsInstance);
                }
                if (shouldInitEffects) {
                    const store = inject(Store);
                    store.dispatch(effectsInit());
                }
            },
        },
    ]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZV9lZmZlY3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbW9kdWxlcy9lZmZlY3RzL3NyYy9wcm92aWRlX2VmZmVjdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLHVCQUF1QixFQUV2QixNQUFNLEVBQ04sd0JBQXdCLEdBRXpCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFDTCxzQkFBc0IsRUFDdEIsbUJBQW1CLEVBQ25CLEtBQUssR0FDTixNQUFNLGFBQWEsQ0FBQztBQUNyQixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDakQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxlQUFlLElBQUksV0FBVyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFbkUsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFnQjlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBeUJHO0FBQ0gsTUFBTSxVQUFVLGNBQWMsQ0FDNUIsR0FBRyxPQUUwRDtJQUU3RCxNQUFNLHdCQUF3QixHQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNoRCxNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUU1RCxPQUFPLHdCQUF3QixDQUFDO1FBQzlCLGNBQWM7UUFDZDtZQUNFLE9BQU8sRUFBRSx1QkFBdUI7WUFDaEMsS0FBSyxFQUFFLElBQUk7WUFDWCxRQUFRLEVBQUUsR0FBRyxFQUFFO2dCQUNiLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2dCQUM1QixNQUFNLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFFbkQsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQzVDLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDO2dCQUVuRCxJQUFJLGlCQUFpQixFQUFFLENBQUM7b0JBQ3RCLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDeEIsQ0FBQztnQkFFRCxLQUFLLE1BQU0sb0JBQW9CLElBQUksd0JBQXdCLEVBQUUsQ0FBQztvQkFDNUQsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDO3dCQUNuRCxDQUFDLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDO3dCQUM5QixDQUFDLENBQUMsb0JBQW9CLENBQUM7b0JBQ3pCLGFBQWEsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQzVDLENBQUM7Z0JBRUQsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO29CQUN0QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzVCLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztnQkFDaEMsQ0FBQztZQUNILENBQUM7U0FDRjtLQUNGLENBQUMsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBFTlZJUk9OTUVOVF9JTklUSUFMSVpFUixcbiAgRW52aXJvbm1lbnRQcm92aWRlcnMsXG4gIGluamVjdCxcbiAgbWFrZUVudmlyb25tZW50UHJvdmlkZXJzLFxuICBUeXBlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIEZFQVRVUkVfU1RBVEVfUFJPVklERVIsXG4gIFJPT1RfU1RPUkVfUFJPVklERVIsXG4gIFN0b3JlLFxufSBmcm9tICdAbmdyeC9zdG9yZSc7XG5pbXBvcnQgeyBFZmZlY3RzUnVubmVyIH0gZnJvbSAnLi9lZmZlY3RzX3J1bm5lcic7XG5pbXBvcnQgeyBFZmZlY3RTb3VyY2VzIH0gZnJvbSAnLi9lZmZlY3Rfc291cmNlcyc7XG5pbXBvcnQgeyByb290RWZmZWN0c0luaXQgYXMgZWZmZWN0c0luaXQgfSBmcm9tICcuL2VmZmVjdHNfYWN0aW9ucyc7XG5pbXBvcnQgeyBGdW5jdGlvbmFsRWZmZWN0IH0gZnJvbSAnLi9tb2RlbHMnO1xuaW1wb3J0IHsgZ2V0Q2xhc3NlcywgaXNDbGFzcyB9IGZyb20gJy4vdXRpbHMnO1xuXG4vKipcbiAqIFJ1bnMgdGhlIHByb3ZpZGVkIGVmZmVjdHMuXG4gKiBDYW4gYmUgY2FsbGVkIGF0IHRoZSByb290IGFuZCBmZWF0dXJlIGxldmVscy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVFZmZlY3RzKFxuICBlZmZlY3RzOiBBcnJheTxUeXBlPHVua25vd24+IHwgUmVjb3JkPHN0cmluZywgRnVuY3Rpb25hbEVmZmVjdD4+XG4pOiBFbnZpcm9ubWVudFByb3ZpZGVycztcbi8qKlxuICogUnVucyB0aGUgcHJvdmlkZWQgZWZmZWN0cy5cbiAqIENhbiBiZSBjYWxsZWQgYXQgdGhlIHJvb3QgYW5kIGZlYXR1cmUgbGV2ZWxzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUVmZmVjdHMoXG4gIC4uLmVmZmVjdHM6IEFycmF5PFR5cGU8dW5rbm93bj4gfCBSZWNvcmQ8c3RyaW5nLCBGdW5jdGlvbmFsRWZmZWN0Pj5cbik6IEVudmlyb25tZW50UHJvdmlkZXJzO1xuLyoqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBQcm92aWRpbmcgZWZmZWN0cyBhdCB0aGUgcm9vdCBsZXZlbFxuICpcbiAqIGBgYHRzXG4gKiBib290c3RyYXBBcHBsaWNhdGlvbihBcHBDb21wb25lbnQsIHtcbiAqICAgcHJvdmlkZXJzOiBbcHJvdmlkZUVmZmVjdHMoUm91dGVyRWZmZWN0cyldLFxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiAjIyMgUHJvdmlkaW5nIGVmZmVjdHMgYXQgdGhlIGZlYXR1cmUgbGV2ZWxcbiAqXG4gKiBgYGB0c1xuICogY29uc3QgYm9va3NSb3V0ZXM6IFJvdXRlW10gPSBbXG4gKiAgIHtcbiAqICAgICBwYXRoOiAnJyxcbiAqICAgICBwcm92aWRlcnM6IFtwcm92aWRlRWZmZWN0cyhCb29rc0FwaUVmZmVjdHMpXSxcbiAqICAgICBjaGlsZHJlbjogW1xuICogICAgICAgeyBwYXRoOiAnJywgY29tcG9uZW50OiBCb29rTGlzdENvbXBvbmVudCB9LFxuICogICAgICAgeyBwYXRoOiAnOmlkJywgY29tcG9uZW50OiBCb29rRGV0YWlsc0NvbXBvbmVudCB9LFxuICogICAgIF0sXG4gKiAgIH0sXG4gKiBdO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlRWZmZWN0cyhcbiAgLi4uZWZmZWN0czpcbiAgICB8IEFycmF5PFR5cGU8dW5rbm93bj4gfCBSZWNvcmQ8c3RyaW5nLCBGdW5jdGlvbmFsRWZmZWN0Pj5cbiAgICB8IFtBcnJheTxUeXBlPHVua25vd24+IHwgUmVjb3JkPHN0cmluZywgRnVuY3Rpb25hbEVmZmVjdD4+XVxuKTogRW52aXJvbm1lbnRQcm92aWRlcnMge1xuICBjb25zdCBlZmZlY3RzQ2xhc3Nlc0FuZFJlY29yZHMgPSBlZmZlY3RzLmZsYXQoKTtcbiAgY29uc3QgZWZmZWN0c0NsYXNzZXMgPSBnZXRDbGFzc2VzKGVmZmVjdHNDbGFzc2VzQW5kUmVjb3Jkcyk7XG5cbiAgcmV0dXJuIG1ha2VFbnZpcm9ubWVudFByb3ZpZGVycyhbXG4gICAgZWZmZWN0c0NsYXNzZXMsXG4gICAge1xuICAgICAgcHJvdmlkZTogRU5WSVJPTk1FTlRfSU5JVElBTElaRVIsXG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICAgIHVzZVZhbHVlOiAoKSA9PiB7XG4gICAgICAgIGluamVjdChST09UX1NUT1JFX1BST1ZJREVSKTtcbiAgICAgICAgaW5qZWN0KEZFQVRVUkVfU1RBVEVfUFJPVklERVIsIHsgb3B0aW9uYWw6IHRydWUgfSk7XG5cbiAgICAgICAgY29uc3QgZWZmZWN0c1J1bm5lciA9IGluamVjdChFZmZlY3RzUnVubmVyKTtcbiAgICAgICAgY29uc3QgZWZmZWN0U291cmNlcyA9IGluamVjdChFZmZlY3RTb3VyY2VzKTtcbiAgICAgICAgY29uc3Qgc2hvdWxkSW5pdEVmZmVjdHMgPSAhZWZmZWN0c1J1bm5lci5pc1N0YXJ0ZWQ7XG5cbiAgICAgICAgaWYgKHNob3VsZEluaXRFZmZlY3RzKSB7XG4gICAgICAgICAgZWZmZWN0c1J1bm5lci5zdGFydCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBlZmZlY3RzQ2xhc3NPclJlY29yZCBvZiBlZmZlY3RzQ2xhc3Nlc0FuZFJlY29yZHMpIHtcbiAgICAgICAgICBjb25zdCBlZmZlY3RzSW5zdGFuY2UgPSBpc0NsYXNzKGVmZmVjdHNDbGFzc09yUmVjb3JkKVxuICAgICAgICAgICAgPyBpbmplY3QoZWZmZWN0c0NsYXNzT3JSZWNvcmQpXG4gICAgICAgICAgICA6IGVmZmVjdHNDbGFzc09yUmVjb3JkO1xuICAgICAgICAgIGVmZmVjdFNvdXJjZXMuYWRkRWZmZWN0cyhlZmZlY3RzSW5zdGFuY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNob3VsZEluaXRFZmZlY3RzKSB7XG4gICAgICAgICAgY29uc3Qgc3RvcmUgPSBpbmplY3QoU3RvcmUpO1xuICAgICAgICAgIHN0b3JlLmRpc3BhdGNoKGVmZmVjdHNJbml0KCkpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0sXG4gIF0pO1xufVxuIl19