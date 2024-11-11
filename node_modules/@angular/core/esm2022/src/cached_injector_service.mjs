/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ɵɵdefineInjectable as defineInjectable } from './di/interface/defs';
import { createEnvironmentInjector } from './render3/ng_module_ref';
/**
 * A service used by the framework to create and cache injector instances.
 *
 * This service is used to create a single injector instance for each defer
 * block definition, to avoid creating an injector for each defer block instance
 * of a certain type.
 */
export class CachedInjectorService {
    constructor() {
        this.cachedInjectors = new Map();
    }
    getOrCreateInjector(key, parentInjector, providers, debugName) {
        if (!this.cachedInjectors.has(key)) {
            const injector = providers.length > 0
                ? createEnvironmentInjector(providers, parentInjector, debugName)
                : null;
            this.cachedInjectors.set(key, injector);
        }
        return this.cachedInjectors.get(key);
    }
    ngOnDestroy() {
        try {
            for (const injector of this.cachedInjectors.values()) {
                if (injector !== null) {
                    injector.destroy();
                }
            }
        }
        finally {
            this.cachedInjectors.clear();
        }
    }
    /** @nocollapse */
    static { this.ɵprov = defineInjectable({
        token: CachedInjectorService,
        providedIn: 'environment',
        factory: () => new CachedInjectorService(),
    }); }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FjaGVkX2luamVjdG9yX3NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9jYWNoZWRfaW5qZWN0b3Jfc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsa0JBQWtCLElBQUksZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUkzRSxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUVsRTs7Ozs7O0dBTUc7QUFDSCxNQUFNLE9BQU8scUJBQXFCO0lBQWxDO1FBQ1Usb0JBQWUsR0FBRyxJQUFJLEdBQUcsRUFBdUMsQ0FBQztJQW9DM0UsQ0FBQztJQWxDQyxtQkFBbUIsQ0FDakIsR0FBWSxFQUNaLGNBQW1DLEVBQ25DLFNBQXFCLEVBQ3JCLFNBQWtCO1FBRWxCLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ25DLE1BQU0sUUFBUSxHQUNaLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQztnQkFDbEIsQ0FBQyxDQUFDLHlCQUF5QixDQUFDLFNBQVMsRUFBRSxjQUFjLEVBQUUsU0FBUyxDQUFDO2dCQUNqRSxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ1gsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBRSxDQUFDO0lBQ3hDLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDO1lBQ0gsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7Z0JBQ3JELElBQUksUUFBUSxLQUFLLElBQUksRUFBRSxDQUFDO29CQUN0QixRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3JCLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztnQkFBUyxDQUFDO1lBQ1QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMvQixDQUFDO0lBQ0gsQ0FBQztJQUVELGtCQUFrQjthQUNYLFVBQUssR0FBNkIsZ0JBQWdCLENBQUM7UUFDeEQsS0FBSyxFQUFFLHFCQUFxQjtRQUM1QixVQUFVLEVBQUUsYUFBYTtRQUN6QixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxxQkFBcUIsRUFBRTtLQUMzQyxDQUFDLEFBSlUsQ0FJVCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHvJtcm1ZGVmaW5lSW5qZWN0YWJsZSBhcyBkZWZpbmVJbmplY3RhYmxlfSBmcm9tICcuL2RpL2ludGVyZmFjZS9kZWZzJztcbmltcG9ydCB7UHJvdmlkZXJ9IGZyb20gJy4vZGkvaW50ZXJmYWNlL3Byb3ZpZGVyJztcbmltcG9ydCB7RW52aXJvbm1lbnRJbmplY3Rvcn0gZnJvbSAnLi9kaS9yM19pbmplY3Rvcic7XG5pbXBvcnQge09uRGVzdHJveX0gZnJvbSAnLi9pbnRlcmZhY2UvbGlmZWN5Y2xlX2hvb2tzJztcbmltcG9ydCB7Y3JlYXRlRW52aXJvbm1lbnRJbmplY3Rvcn0gZnJvbSAnLi9yZW5kZXIzL25nX21vZHVsZV9yZWYnO1xuXG4vKipcbiAqIEEgc2VydmljZSB1c2VkIGJ5IHRoZSBmcmFtZXdvcmsgdG8gY3JlYXRlIGFuZCBjYWNoZSBpbmplY3RvciBpbnN0YW5jZXMuXG4gKlxuICogVGhpcyBzZXJ2aWNlIGlzIHVzZWQgdG8gY3JlYXRlIGEgc2luZ2xlIGluamVjdG9yIGluc3RhbmNlIGZvciBlYWNoIGRlZmVyXG4gKiBibG9jayBkZWZpbml0aW9uLCB0byBhdm9pZCBjcmVhdGluZyBhbiBpbmplY3RvciBmb3IgZWFjaCBkZWZlciBibG9jayBpbnN0YW5jZVxuICogb2YgYSBjZXJ0YWluIHR5cGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDYWNoZWRJbmplY3RvclNlcnZpY2UgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIGNhY2hlZEluamVjdG9ycyA9IG5ldyBNYXA8dW5rbm93biwgRW52aXJvbm1lbnRJbmplY3RvciB8IG51bGw+KCk7XG5cbiAgZ2V0T3JDcmVhdGVJbmplY3RvcihcbiAgICBrZXk6IHVua25vd24sXG4gICAgcGFyZW50SW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3IsXG4gICAgcHJvdmlkZXJzOiBQcm92aWRlcltdLFxuICAgIGRlYnVnTmFtZT86IHN0cmluZyxcbiAgKSB7XG4gICAgaWYgKCF0aGlzLmNhY2hlZEluamVjdG9ycy5oYXMoa2V5KSkge1xuICAgICAgY29uc3QgaW5qZWN0b3IgPVxuICAgICAgICBwcm92aWRlcnMubGVuZ3RoID4gMFxuICAgICAgICAgID8gY3JlYXRlRW52aXJvbm1lbnRJbmplY3Rvcihwcm92aWRlcnMsIHBhcmVudEluamVjdG9yLCBkZWJ1Z05hbWUpXG4gICAgICAgICAgOiBudWxsO1xuICAgICAgdGhpcy5jYWNoZWRJbmplY3RvcnMuc2V0KGtleSwgaW5qZWN0b3IpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jYWNoZWRJbmplY3RvcnMuZ2V0KGtleSkhO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdHJ5IHtcbiAgICAgIGZvciAoY29uc3QgaW5qZWN0b3Igb2YgdGhpcy5jYWNoZWRJbmplY3RvcnMudmFsdWVzKCkpIHtcbiAgICAgICAgaWYgKGluamVjdG9yICE9PSBudWxsKSB7XG4gICAgICAgICAgaW5qZWN0b3IuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuY2FjaGVkSW5qZWN0b3JzLmNsZWFyKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBub2NvbGxhcHNlICovXG4gIHN0YXRpYyDJtXByb3YgPSAvKiogQHB1cmVPckJyZWFrTXlDb2RlICovIGRlZmluZUluamVjdGFibGUoe1xuICAgIHRva2VuOiBDYWNoZWRJbmplY3RvclNlcnZpY2UsXG4gICAgcHJvdmlkZWRJbjogJ2Vudmlyb25tZW50JyxcbiAgICBmYWN0b3J5OiAoKSA9PiBuZXcgQ2FjaGVkSW5qZWN0b3JTZXJ2aWNlKCksXG4gIH0pO1xufVxuIl19