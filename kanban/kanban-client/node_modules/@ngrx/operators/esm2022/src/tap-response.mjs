import { EMPTY } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
/**
 * Handles the response in ComponentStore effects in a safe way, without
 * additional boilerplate. It enforces that the error case is handled and
 * that the effect would still be running should an error occur.
 *
 * Takes optional callbacks for `complete` and `finalize`.
 *
 * @usageNotes
 *
 * ```ts
 * readonly dismissAlert = this.effect<Alert>((alert$) => {
 *   return alert$.pipe(
 *     concatMap(
 *       (alert) => this.alertsService.dismissAlert(alert).pipe(
 *         tapResponse(
 *           (dismissedAlert) => this.alertDismissed(dismissedAlert),
 *           (error: { message: string }) => this.logError(error.message)
 *         )
 *       )
 *     )
 *   );
 * });
 *
 * readonly loadUsers = this.effect<void>((trigger$) => {
 *   return trigger$.pipe(
 *     tap(() => this.patchState({ loading: true })),
 *     exhaustMap(() =>
 *       this.usersService.getAll().pipe(
 *         tapResponse({
 *           next: (users) => this.patchState({ users }),
 *           error: (error: HttpErrorResponse) => this.logError(error.message),
 *           finalize: () => this.patchState({ loading: false }),
 *         })
 *       )
 *     )
 *   );
 * });
 * ```
 */
export function tapResponse(observerOrNext, error, complete) {
    const observer = typeof observerOrNext === 'function'
        ? {
            next: observerOrNext,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            error: error,
            complete,
        }
        : observerOrNext;
    return (source) => source.pipe(tap({ next: observer.next, complete: observer.complete }), catchError((error) => {
        observer.error(error);
        return EMPTY;
    }), observer.finalize ? finalize(observer.finalize) : (source$) => source$);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFwLXJlc3BvbnNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbW9kdWxlcy9vcGVyYXRvcnMvc3JjL3RhcC1yZXNwb25zZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBaUIzRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7QUFDSCxNQUFNLFVBQVUsV0FBVyxDQUN6QixjQUFnRSxFQUNoRSxLQUEwQixFQUMxQixRQUFxQjtJQUVyQixNQUFNLFFBQVEsR0FDWixPQUFPLGNBQWMsS0FBSyxVQUFVO1FBQ2xDLENBQUMsQ0FBQztZQUNFLElBQUksRUFBRSxjQUFjO1lBQ3BCLG9FQUFvRTtZQUNwRSxLQUFLLEVBQUUsS0FBTTtZQUNiLFFBQVE7U0FDVDtRQUNILENBQUMsQ0FBQyxjQUFjLENBQUM7SUFFckIsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQ2hCLE1BQU0sQ0FBQyxJQUFJLENBQ1QsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUN6RCxVQUFVLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtRQUNuQixRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQyxDQUFDLEVBQ0YsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FDdkUsQ0FBQztBQUNOLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFTVBUWSwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgY2F0Y2hFcnJvciwgZmluYWxpemUsIHRhcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxudHlwZSBUYXBSZXNwb25zZU9ic2VydmVyPFQsIEU+ID0ge1xuICBuZXh0OiAodmFsdWU6IFQpID0+IHZvaWQ7XG4gIGVycm9yOiAoZXJyb3I6IEUpID0+IHZvaWQ7XG4gIGNvbXBsZXRlPzogKCkgPT4gdm9pZDtcbiAgZmluYWxpemU/OiAoKSA9PiB2b2lkO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHRhcFJlc3BvbnNlPFQsIEUgPSB1bmtub3duPihcbiAgb2JzZXJ2ZXI6IFRhcFJlc3BvbnNlT2JzZXJ2ZXI8VCwgRT5cbik6IChzb3VyY2UkOiBPYnNlcnZhYmxlPFQ+KSA9PiBPYnNlcnZhYmxlPFQ+O1xuZXhwb3J0IGZ1bmN0aW9uIHRhcFJlc3BvbnNlPFQsIEUgPSB1bmtub3duPihcbiAgbmV4dDogKHZhbHVlOiBUKSA9PiB2b2lkLFxuICBlcnJvcjogKGVycm9yOiBFKSA9PiB2b2lkLFxuICBjb21wbGV0ZT86ICgpID0+IHZvaWRcbik6IChzb3VyY2UkOiBPYnNlcnZhYmxlPFQ+KSA9PiBPYnNlcnZhYmxlPFQ+O1xuLyoqXG4gKiBIYW5kbGVzIHRoZSByZXNwb25zZSBpbiBDb21wb25lbnRTdG9yZSBlZmZlY3RzIGluIGEgc2FmZSB3YXksIHdpdGhvdXRcbiAqIGFkZGl0aW9uYWwgYm9pbGVycGxhdGUuIEl0IGVuZm9yY2VzIHRoYXQgdGhlIGVycm9yIGNhc2UgaXMgaGFuZGxlZCBhbmRcbiAqIHRoYXQgdGhlIGVmZmVjdCB3b3VsZCBzdGlsbCBiZSBydW5uaW5nIHNob3VsZCBhbiBlcnJvciBvY2N1ci5cbiAqXG4gKiBUYWtlcyBvcHRpb25hbCBjYWxsYmFja3MgZm9yIGBjb21wbGV0ZWAgYW5kIGBmaW5hbGl6ZWAuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBgYGB0c1xuICogcmVhZG9ubHkgZGlzbWlzc0FsZXJ0ID0gdGhpcy5lZmZlY3Q8QWxlcnQ+KChhbGVydCQpID0+IHtcbiAqICAgcmV0dXJuIGFsZXJ0JC5waXBlKFxuICogICAgIGNvbmNhdE1hcChcbiAqICAgICAgIChhbGVydCkgPT4gdGhpcy5hbGVydHNTZXJ2aWNlLmRpc21pc3NBbGVydChhbGVydCkucGlwZShcbiAqICAgICAgICAgdGFwUmVzcG9uc2UoXG4gKiAgICAgICAgICAgKGRpc21pc3NlZEFsZXJ0KSA9PiB0aGlzLmFsZXJ0RGlzbWlzc2VkKGRpc21pc3NlZEFsZXJ0KSxcbiAqICAgICAgICAgICAoZXJyb3I6IHsgbWVzc2FnZTogc3RyaW5nIH0pID0+IHRoaXMubG9nRXJyb3IoZXJyb3IubWVzc2FnZSlcbiAqICAgICAgICAgKVxuICogICAgICAgKVxuICogICAgIClcbiAqICAgKTtcbiAqIH0pO1xuICpcbiAqIHJlYWRvbmx5IGxvYWRVc2VycyA9IHRoaXMuZWZmZWN0PHZvaWQ+KCh0cmlnZ2VyJCkgPT4ge1xuICogICByZXR1cm4gdHJpZ2dlciQucGlwZShcbiAqICAgICB0YXAoKCkgPT4gdGhpcy5wYXRjaFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KSksXG4gKiAgICAgZXhoYXVzdE1hcCgoKSA9PlxuICogICAgICAgdGhpcy51c2Vyc1NlcnZpY2UuZ2V0QWxsKCkucGlwZShcbiAqICAgICAgICAgdGFwUmVzcG9uc2Uoe1xuICogICAgICAgICAgIG5leHQ6ICh1c2VycykgPT4gdGhpcy5wYXRjaFN0YXRlKHsgdXNlcnMgfSksXG4gKiAgICAgICAgICAgZXJyb3I6IChlcnJvcjogSHR0cEVycm9yUmVzcG9uc2UpID0+IHRoaXMubG9nRXJyb3IoZXJyb3IubWVzc2FnZSksXG4gKiAgICAgICAgICAgZmluYWxpemU6ICgpID0+IHRoaXMucGF0Y2hTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlIH0pLFxuICogICAgICAgICB9KVxuICogICAgICAgKVxuICogICAgIClcbiAqICAgKTtcbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0YXBSZXNwb25zZTxULCBFPihcbiAgb2JzZXJ2ZXJPck5leHQ6IFRhcFJlc3BvbnNlT2JzZXJ2ZXI8VCwgRT4gfCAoKHZhbHVlOiBUKSA9PiB2b2lkKSxcbiAgZXJyb3I/OiAoZXJyb3I6IEUpID0+IHZvaWQsXG4gIGNvbXBsZXRlPzogKCkgPT4gdm9pZFxuKTogKHNvdXJjZSQ6IE9ic2VydmFibGU8VD4pID0+IE9ic2VydmFibGU8VD4ge1xuICBjb25zdCBvYnNlcnZlcjogVGFwUmVzcG9uc2VPYnNlcnZlcjxULCBFPiA9XG4gICAgdHlwZW9mIG9ic2VydmVyT3JOZXh0ID09PSAnZnVuY3Rpb24nXG4gICAgICA/IHtcbiAgICAgICAgICBuZXh0OiBvYnNlcnZlck9yTmV4dCxcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgICAgIGVycm9yOiBlcnJvciEsXG4gICAgICAgICAgY29tcGxldGUsXG4gICAgICAgIH1cbiAgICAgIDogb2JzZXJ2ZXJPck5leHQ7XG5cbiAgcmV0dXJuIChzb3VyY2UpID0+XG4gICAgc291cmNlLnBpcGUoXG4gICAgICB0YXAoeyBuZXh0OiBvYnNlcnZlci5uZXh0LCBjb21wbGV0ZTogb2JzZXJ2ZXIuY29tcGxldGUgfSksXG4gICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xuICAgICAgICBvYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIHJldHVybiBFTVBUWTtcbiAgICAgIH0pLFxuICAgICAgb2JzZXJ2ZXIuZmluYWxpemUgPyBmaW5hbGl6ZShvYnNlcnZlci5maW5hbGl6ZSkgOiAoc291cmNlJCkgPT4gc291cmNlJFxuICAgICk7XG59XG4iXX0=