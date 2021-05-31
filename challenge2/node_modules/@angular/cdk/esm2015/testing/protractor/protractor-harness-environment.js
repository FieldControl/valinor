/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { HarnessEnvironment } from '@angular/cdk/testing';
import { by, element as protractorElement } from 'protractor';
import { ProtractorElement } from './protractor-element';
/** The default environment options. */
const defaultEnvironmentOptions = {
    queryFn: (selector, root) => root.all(by.css(selector))
};
/**
 * A `HarnessEnvironment` implementation for Protractor.
 * @deprecated
 * @breaking-change 13.0.0
 */
export class ProtractorHarnessEnvironment extends HarnessEnvironment {
    constructor(rawRootElement, options) {
        super(rawRootElement);
        this._options = Object.assign(Object.assign({}, defaultEnvironmentOptions), options);
    }
    /** Creates a `HarnessLoader` rooted at the document root. */
    static loader(options) {
        return new ProtractorHarnessEnvironment(protractorElement(by.css('body')), options);
    }
    /** Gets the ElementFinder corresponding to the given TestElement. */
    static getNativeElement(el) {
        if (el instanceof ProtractorElement) {
            return el.element;
        }
        throw Error('This TestElement was not created by the ProtractorHarnessEnvironment');
    }
    /**
     * Flushes change detection and async tasks captured in the Angular zone.
     * In most cases it should not be necessary to call this manually. However, there may be some edge
     * cases where it is needed to fully flush animation events.
     */
    forceStabilize() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /** @docs-private */
    waitForTasksOutsideAngular() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: figure out how we can do this for the protractor environment.
            // https://github.com/angular/components/issues/17412
        });
    }
    /** Gets the root element for the document. */
    getDocumentRoot() {
        return protractorElement(by.css('body'));
    }
    /** Creates a `TestElement` from a raw element. */
    createTestElement(element) {
        return new ProtractorElement(element);
    }
    /** Creates a `HarnessLoader` rooted at the given raw element. */
    createEnvironment(element) {
        return new ProtractorHarnessEnvironment(element, this._options);
    }
    /**
     * Gets a list of all elements matching the given selector under this environment's root element.
     */
    getAllRawElements(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            const elementArrayFinder = this._options.queryFn(selector, this.rawRootElement);
            const length = yield elementArrayFinder.count();
            const elements = [];
            for (let i = 0; i < length; i++) {
                elements.push(elementArrayFinder.get(i));
            }
            return elements;
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdHJhY3Rvci1oYXJuZXNzLWVudmlyb25tZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay90ZXN0aW5nL3Byb3RyYWN0b3IvcHJvdHJhY3Rvci1oYXJuZXNzLWVudmlyb25tZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsa0JBQWtCLEVBQTZCLE1BQU0sc0JBQXNCLENBQUM7QUFDcEYsT0FBTyxFQUFDLEVBQUUsRUFBRSxPQUFPLElBQUksaUJBQWlCLEVBQW9DLE1BQU0sWUFBWSxDQUFDO0FBQy9GLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBWXZELHVDQUF1QztBQUN2QyxNQUFNLHlCQUF5QixHQUF3QztJQUNyRSxPQUFPLEVBQUUsQ0FBQyxRQUFnQixFQUFFLElBQW1CLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUMvRSxDQUFDO0FBRUY7Ozs7R0FJRztBQUNILE1BQU0sT0FBTyw0QkFBNkIsU0FBUSxrQkFBaUM7SUFJakYsWUFDSSxjQUE2QixFQUFFLE9BQTZDO1FBQzlFLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsUUFBUSxtQ0FBTyx5QkFBeUIsR0FBSyxPQUFPLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBRUQsNkRBQTZEO0lBQzdELE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBNkM7UUFDekQsT0FBTyxJQUFJLDRCQUE0QixDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0RixDQUFDO0lBRUQscUVBQXFFO0lBQ3JFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFlO1FBQ3JDLElBQUksRUFBRSxZQUFZLGlCQUFpQixFQUFFO1lBQ25DLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQztTQUNuQjtRQUNELE1BQU0sS0FBSyxDQUFDLHNFQUFzRSxDQUFDLENBQUM7SUFDdEYsQ0FBQztJQUVEOzs7O09BSUc7SUFDRyxjQUFjOzhEQUFtQixDQUFDO0tBQUE7SUFFeEMsb0JBQW9CO0lBQ2QsMEJBQTBCOztZQUM5QixzRUFBc0U7WUFDdEUscURBQXFEO1FBQ3ZELENBQUM7S0FBQTtJQUVELDhDQUE4QztJQUNwQyxlQUFlO1FBQ3ZCLE9BQU8saUJBQWlCLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRCxrREFBa0Q7SUFDeEMsaUJBQWlCLENBQUMsT0FBc0I7UUFDaEQsT0FBTyxJQUFJLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRCxpRUFBaUU7SUFDdkQsaUJBQWlCLENBQUMsT0FBc0I7UUFDaEQsT0FBTyxJQUFJLDRCQUE0QixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVEOztPQUVHO0lBQ2EsaUJBQWlCLENBQUMsUUFBZ0I7O1lBQ2hELE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNoRixNQUFNLE1BQU0sR0FBRyxNQUFNLGtCQUFrQixDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2hELE1BQU0sUUFBUSxHQUFvQixFQUFFLENBQUM7WUFDckMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDL0IsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMxQztZQUNELE9BQU8sUUFBUSxDQUFDO1FBQ2xCLENBQUM7S0FBQTtDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SGFybmVzc0Vudmlyb25tZW50LCBIYXJuZXNzTG9hZGVyLCBUZXN0RWxlbWVudH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtieSwgZWxlbWVudCBhcyBwcm90cmFjdG9yRWxlbWVudCwgRWxlbWVudEFycmF5RmluZGVyLCBFbGVtZW50RmluZGVyfSBmcm9tICdwcm90cmFjdG9yJztcbmltcG9ydCB7UHJvdHJhY3RvckVsZW1lbnR9IGZyb20gJy4vcHJvdHJhY3Rvci1lbGVtZW50JztcblxuLyoqXG4gKiBPcHRpb25zIHRvIGNvbmZpZ3VyZSB0aGUgZW52aXJvbm1lbnQuXG4gKiBAZGVwcmVjYXRlZFxuICogQGJyZWFraW5nLWNoYW5nZSAxMy4wLjBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQcm90cmFjdG9ySGFybmVzc0Vudmlyb25tZW50T3B0aW9ucyB7XG4gIC8qKiBUaGUgcXVlcnkgZnVuY3Rpb24gdXNlZCB0byBmaW5kIERPTSBlbGVtZW50cy4gKi9cbiAgcXVlcnlGbjogKHNlbGVjdG9yOiBzdHJpbmcsIHJvb3Q6IEVsZW1lbnRGaW5kZXIpID0+IEVsZW1lbnRBcnJheUZpbmRlcjtcbn1cblxuLyoqIFRoZSBkZWZhdWx0IGVudmlyb25tZW50IG9wdGlvbnMuICovXG5jb25zdCBkZWZhdWx0RW52aXJvbm1lbnRPcHRpb25zOiBQcm90cmFjdG9ySGFybmVzc0Vudmlyb25tZW50T3B0aW9ucyA9IHtcbiAgcXVlcnlGbjogKHNlbGVjdG9yOiBzdHJpbmcsIHJvb3Q6IEVsZW1lbnRGaW5kZXIpID0+IHJvb3QuYWxsKGJ5LmNzcyhzZWxlY3RvcikpXG59O1xuXG4vKipcbiAqIEEgYEhhcm5lc3NFbnZpcm9ubWVudGAgaW1wbGVtZW50YXRpb24gZm9yIFByb3RyYWN0b3IuXG4gKiBAZGVwcmVjYXRlZFxuICogQGJyZWFraW5nLWNoYW5nZSAxMy4wLjBcbiAqL1xuZXhwb3J0IGNsYXNzIFByb3RyYWN0b3JIYXJuZXNzRW52aXJvbm1lbnQgZXh0ZW5kcyBIYXJuZXNzRW52aXJvbm1lbnQ8RWxlbWVudEZpbmRlcj4ge1xuICAvKiogVGhlIG9wdGlvbnMgZm9yIHRoaXMgZW52aXJvbm1lbnQuICovXG4gIHByaXZhdGUgX29wdGlvbnM6IFByb3RyYWN0b3JIYXJuZXNzRW52aXJvbm1lbnRPcHRpb25zO1xuXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihcbiAgICAgIHJhd1Jvb3RFbGVtZW50OiBFbGVtZW50RmluZGVyLCBvcHRpb25zPzogUHJvdHJhY3Rvckhhcm5lc3NFbnZpcm9ubWVudE9wdGlvbnMpIHtcbiAgICBzdXBlcihyYXdSb290RWxlbWVudCk7XG4gICAgdGhpcy5fb3B0aW9ucyA9IHsuLi5kZWZhdWx0RW52aXJvbm1lbnRPcHRpb25zLCAuLi5vcHRpb25zfTtcbiAgfVxuXG4gIC8qKiBDcmVhdGVzIGEgYEhhcm5lc3NMb2FkZXJgIHJvb3RlZCBhdCB0aGUgZG9jdW1lbnQgcm9vdC4gKi9cbiAgc3RhdGljIGxvYWRlcihvcHRpb25zPzogUHJvdHJhY3Rvckhhcm5lc3NFbnZpcm9ubWVudE9wdGlvbnMpOiBIYXJuZXNzTG9hZGVyIHtcbiAgICByZXR1cm4gbmV3IFByb3RyYWN0b3JIYXJuZXNzRW52aXJvbm1lbnQocHJvdHJhY3RvckVsZW1lbnQoYnkuY3NzKCdib2R5JykpLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBFbGVtZW50RmluZGVyIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuIFRlc3RFbGVtZW50LiAqL1xuICBzdGF0aWMgZ2V0TmF0aXZlRWxlbWVudChlbDogVGVzdEVsZW1lbnQpOiBFbGVtZW50RmluZGVyIHtcbiAgICBpZiAoZWwgaW5zdGFuY2VvZiBQcm90cmFjdG9yRWxlbWVudCkge1xuICAgICAgcmV0dXJuIGVsLmVsZW1lbnQ7XG4gICAgfVxuICAgIHRocm93IEVycm9yKCdUaGlzIFRlc3RFbGVtZW50IHdhcyBub3QgY3JlYXRlZCBieSB0aGUgUHJvdHJhY3Rvckhhcm5lc3NFbnZpcm9ubWVudCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZsdXNoZXMgY2hhbmdlIGRldGVjdGlvbiBhbmQgYXN5bmMgdGFza3MgY2FwdHVyZWQgaW4gdGhlIEFuZ3VsYXIgem9uZS5cbiAgICogSW4gbW9zdCBjYXNlcyBpdCBzaG91bGQgbm90IGJlIG5lY2Vzc2FyeSB0byBjYWxsIHRoaXMgbWFudWFsbHkuIEhvd2V2ZXIsIHRoZXJlIG1heSBiZSBzb21lIGVkZ2VcbiAgICogY2FzZXMgd2hlcmUgaXQgaXMgbmVlZGVkIHRvIGZ1bGx5IGZsdXNoIGFuaW1hdGlvbiBldmVudHMuXG4gICAqL1xuICBhc3luYyBmb3JjZVN0YWJpbGl6ZSgpOiBQcm9taXNlPHZvaWQ+IHt9XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgKi9cbiAgYXN5bmMgd2FpdEZvclRhc2tzT3V0c2lkZUFuZ3VsYXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gVE9ETzogZmlndXJlIG91dCBob3cgd2UgY2FuIGRvIHRoaXMgZm9yIHRoZSBwcm90cmFjdG9yIGVudmlyb25tZW50LlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvaXNzdWVzLzE3NDEyXG4gIH1cblxuICAvKiogR2V0cyB0aGUgcm9vdCBlbGVtZW50IGZvciB0aGUgZG9jdW1lbnQuICovXG4gIHByb3RlY3RlZCBnZXREb2N1bWVudFJvb3QoKTogRWxlbWVudEZpbmRlciB7XG4gICAgcmV0dXJuIHByb3RyYWN0b3JFbGVtZW50KGJ5LmNzcygnYm9keScpKTtcbiAgfVxuXG4gIC8qKiBDcmVhdGVzIGEgYFRlc3RFbGVtZW50YCBmcm9tIGEgcmF3IGVsZW1lbnQuICovXG4gIHByb3RlY3RlZCBjcmVhdGVUZXN0RWxlbWVudChlbGVtZW50OiBFbGVtZW50RmluZGVyKTogVGVzdEVsZW1lbnQge1xuICAgIHJldHVybiBuZXcgUHJvdHJhY3RvckVsZW1lbnQoZWxlbWVudCk7XG4gIH1cblxuICAvKiogQ3JlYXRlcyBhIGBIYXJuZXNzTG9hZGVyYCByb290ZWQgYXQgdGhlIGdpdmVuIHJhdyBlbGVtZW50LiAqL1xuICBwcm90ZWN0ZWQgY3JlYXRlRW52aXJvbm1lbnQoZWxlbWVudDogRWxlbWVudEZpbmRlcik6IEhhcm5lc3NFbnZpcm9ubWVudDxFbGVtZW50RmluZGVyPiB7XG4gICAgcmV0dXJuIG5ldyBQcm90cmFjdG9ySGFybmVzc0Vudmlyb25tZW50KGVsZW1lbnQsIHRoaXMuX29wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBsaXN0IG9mIGFsbCBlbGVtZW50cyBtYXRjaGluZyB0aGUgZ2l2ZW4gc2VsZWN0b3IgdW5kZXIgdGhpcyBlbnZpcm9ubWVudCdzIHJvb3QgZWxlbWVudC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBnZXRBbGxSYXdFbGVtZW50cyhzZWxlY3Rvcjogc3RyaW5nKTogUHJvbWlzZTxFbGVtZW50RmluZGVyW10+IHtcbiAgICBjb25zdCBlbGVtZW50QXJyYXlGaW5kZXIgPSB0aGlzLl9vcHRpb25zLnF1ZXJ5Rm4oc2VsZWN0b3IsIHRoaXMucmF3Um9vdEVsZW1lbnQpO1xuICAgIGNvbnN0IGxlbmd0aCA9IGF3YWl0IGVsZW1lbnRBcnJheUZpbmRlci5jb3VudCgpO1xuICAgIGNvbnN0IGVsZW1lbnRzOiBFbGVtZW50RmluZGVyW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBlbGVtZW50cy5wdXNoKGVsZW1lbnRBcnJheUZpbmRlci5nZXQoaSkpO1xuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudHM7XG4gIH1cbn1cbiJdfQ==