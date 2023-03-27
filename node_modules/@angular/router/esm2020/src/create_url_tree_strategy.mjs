/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import { createSegmentGroupFromRoute, createUrlTree, createUrlTreeFromSegmentGroup } from './create_url_tree';
import * as i0 from "@angular/core";
const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;
export class LegacyCreateUrlTree {
    createUrlTree(relativeTo, currentState, currentUrlTree, commands, queryParams, fragment) {
        const a = relativeTo || currentState.root;
        const tree = createUrlTree(a, currentUrlTree, commands, queryParams, fragment);
        if (NG_DEV_MODE) {
            const treeFromSnapshotStrategy = new CreateUrlTreeUsingSnapshot().createUrlTree(relativeTo, currentState, currentUrlTree, commands, queryParams, fragment);
            if (treeFromSnapshotStrategy.toString() !== tree.toString()) {
                let warningString = `The navigation to ${tree.toString()} will instead go to ${treeFromSnapshotStrategy.toString()} in an upcoming version of Angular.`;
                if (!!relativeTo) {
                    warningString += ' `relativeTo` might need to be removed from the `UrlCreationOptions`.';
                }
                tree._warnIfUsedForNavigation = warningString;
            }
        }
        return tree;
    }
}
LegacyCreateUrlTree.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: LegacyCreateUrlTree, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
LegacyCreateUrlTree.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: LegacyCreateUrlTree });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: LegacyCreateUrlTree, decorators: [{
            type: Injectable
        }] });
export class CreateUrlTreeUsingSnapshot {
    createUrlTree(relativeTo, currentState, currentUrlTree, commands, queryParams, fragment) {
        let relativeToUrlSegmentGroup;
        try {
            const relativeToSnapshot = relativeTo ? relativeTo.snapshot : currentState.snapshot.root;
            relativeToUrlSegmentGroup = createSegmentGroupFromRoute(relativeToSnapshot);
        }
        catch (e) {
            // This is strictly for backwards compatibility with tests that create
            // invalid `ActivatedRoute` mocks.
            // Note: the difference between having this fallback for invalid `ActivatedRoute` setups and
            // just throwing is ~500 test failures. Fixing all of those tests by hand is not feasible at
            // the moment.
            if (typeof commands[0] !== 'string' || !commands[0].startsWith('/')) {
                // Navigations that were absolute in the old way of creating UrlTrees
                // would still work because they wouldn't attempt to match the
                // segments in the `ActivatedRoute` to the `currentUrlTree` but
                // instead just replace the root segment with the navigation result.
                // Non-absolute navigations would fail to apply the commands because
                // the logic could not find the segment to replace (so they'd act like there were no
                // commands).
                commands = [];
            }
            relativeToUrlSegmentGroup = currentUrlTree.root;
        }
        return createUrlTreeFromSegmentGroup(relativeToUrlSegmentGroup, commands, queryParams, fragment);
    }
}
CreateUrlTreeUsingSnapshot.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: CreateUrlTreeUsingSnapshot, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
CreateUrlTreeUsingSnapshot.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: CreateUrlTreeUsingSnapshot });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: CreateUrlTreeUsingSnapshot, decorators: [{
            type: Injectable
        }] });
export class CreateUrlTreeStrategy {
}
CreateUrlTreeStrategy.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: CreateUrlTreeStrategy, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
CreateUrlTreeStrategy.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: CreateUrlTreeStrategy, providedIn: 'root', useClass: LegacyCreateUrlTree });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: CreateUrlTreeStrategy, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root', useClass: LegacyCreateUrlTree }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlX3VybF90cmVlX3N0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9jcmVhdGVfdXJsX3RyZWVfc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV6QyxPQUFPLEVBQUMsMkJBQTJCLEVBQUUsYUFBYSxFQUFFLDZCQUE2QixFQUFDLE1BQU0sbUJBQW1CLENBQUM7O0FBSzVHLE1BQU0sV0FBVyxHQUFHLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLENBQUM7QUFHbEUsTUFBTSxPQUFPLG1CQUFtQjtJQUM5QixhQUFhLENBQ1QsVUFBeUMsRUFBRSxZQUF5QixFQUFFLGNBQXVCLEVBQzdGLFFBQWUsRUFBRSxXQUF3QixFQUFFLFFBQXFCO1FBQ2xFLE1BQU0sQ0FBQyxHQUFHLFVBQVUsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDO1FBQzFDLE1BQU0sSUFBSSxHQUFHLGFBQWEsQ0FBQyxDQUFDLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDL0UsSUFBSSxXQUFXLEVBQUU7WUFDZixNQUFNLHdCQUF3QixHQUFHLElBQUksMEJBQTBCLEVBQUUsQ0FBQyxhQUFhLENBQzNFLFVBQVUsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDL0UsSUFBSSx3QkFBd0IsQ0FBQyxRQUFRLEVBQUUsS0FBSyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQzNELElBQUksYUFBYSxHQUFHLHFCQUFxQixJQUFJLENBQUMsUUFBUSxFQUFFLHVCQUNwRCx3QkFBd0IsQ0FBQyxRQUFRLEVBQUUscUNBQXFDLENBQUM7Z0JBQzdFLElBQUksQ0FBQyxDQUFDLFVBQVUsRUFBRTtvQkFDaEIsYUFBYSxJQUFJLHVFQUF1RSxDQUFDO2lCQUMxRjtnQkFDRCxJQUFJLENBQUMsd0JBQXdCLEdBQUcsYUFBYSxDQUFDO2FBQy9DO1NBQ0Y7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7OzJIQW5CVSxtQkFBbUI7K0hBQW5CLG1CQUFtQjtzR0FBbkIsbUJBQW1CO2tCQUQvQixVQUFVOztBQXdCWCxNQUFNLE9BQU8sMEJBQTBCO0lBQ3JDLGFBQWEsQ0FDVCxVQUF5QyxFQUFFLFlBQXlCLEVBQUUsY0FBdUIsRUFDN0YsUUFBZSxFQUFFLFdBQXdCLEVBQUUsUUFBcUI7UUFDbEUsSUFBSSx5QkFBb0QsQ0FBQztRQUN6RCxJQUFJO1lBQ0YsTUFBTSxrQkFBa0IsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQ3pGLHlCQUF5QixHQUFHLDJCQUEyQixDQUFDLGtCQUFrQixDQUFDLENBQUM7U0FDN0U7UUFBQyxPQUFPLENBQVUsRUFBRTtZQUNuQixzRUFBc0U7WUFDdEUsa0NBQWtDO1lBQ2xDLDRGQUE0RjtZQUM1Riw0RkFBNEY7WUFDNUYsY0FBYztZQUNkLElBQUksT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbkUscUVBQXFFO2dCQUNyRSw4REFBOEQ7Z0JBQzlELCtEQUErRDtnQkFDL0Qsb0VBQW9FO2dCQUNwRSxvRUFBb0U7Z0JBQ3BFLG9GQUFvRjtnQkFDcEYsYUFBYTtnQkFDYixRQUFRLEdBQUcsRUFBRSxDQUFDO2FBQ2Y7WUFDRCx5QkFBeUIsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDO1NBQ2pEO1FBQ0QsT0FBTyw2QkFBNkIsQ0FDaEMseUJBQXlCLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNsRSxDQUFDOztrSUE1QlUsMEJBQTBCO3NJQUExQiwwQkFBMEI7c0dBQTFCLDBCQUEwQjtrQkFEdEMsVUFBVTs7QUFpQ1gsTUFBTSxPQUFnQixxQkFBcUI7OzZIQUFyQixxQkFBcUI7aUlBQXJCLHFCQUFxQixjQURsQixNQUFNLFlBQVksbUJBQW1CO3NHQUN4QyxxQkFBcUI7a0JBRDFDLFVBQVU7bUJBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxtQkFBbUIsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge2NyZWF0ZVNlZ21lbnRHcm91cEZyb21Sb3V0ZSwgY3JlYXRlVXJsVHJlZSwgY3JlYXRlVXJsVHJlZUZyb21TZWdtZW50R3JvdXB9IGZyb20gJy4vY3JlYXRlX3VybF90cmVlJztcbmltcG9ydCB7QWN0aXZhdGVkUm91dGUsIFJvdXRlclN0YXRlfSBmcm9tICcuL3JvdXRlcl9zdGF0ZSc7XG5pbXBvcnQge1BhcmFtc30gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHtVcmxTZWdtZW50R3JvdXAsIFVybFRyZWV9IGZyb20gJy4vdXJsX3RyZWUnO1xuXG5jb25zdCBOR19ERVZfTU9ERSA9IHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZTtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIExlZ2FjeUNyZWF0ZVVybFRyZWUgaW1wbGVtZW50cyBDcmVhdGVVcmxUcmVlU3RyYXRlZ3kge1xuICBjcmVhdGVVcmxUcmVlKFxuICAgICAgcmVsYXRpdmVUbzogQWN0aXZhdGVkUm91dGV8bnVsbHx1bmRlZmluZWQsIGN1cnJlbnRTdGF0ZTogUm91dGVyU3RhdGUsIGN1cnJlbnRVcmxUcmVlOiBVcmxUcmVlLFxuICAgICAgY29tbWFuZHM6IGFueVtdLCBxdWVyeVBhcmFtczogUGFyYW1zfG51bGwsIGZyYWdtZW50OiBzdHJpbmd8bnVsbCk6IFVybFRyZWUge1xuICAgIGNvbnN0IGEgPSByZWxhdGl2ZVRvIHx8IGN1cnJlbnRTdGF0ZS5yb290O1xuICAgIGNvbnN0IHRyZWUgPSBjcmVhdGVVcmxUcmVlKGEsIGN1cnJlbnRVcmxUcmVlLCBjb21tYW5kcywgcXVlcnlQYXJhbXMsIGZyYWdtZW50KTtcbiAgICBpZiAoTkdfREVWX01PREUpIHtcbiAgICAgIGNvbnN0IHRyZWVGcm9tU25hcHNob3RTdHJhdGVneSA9IG5ldyBDcmVhdGVVcmxUcmVlVXNpbmdTbmFwc2hvdCgpLmNyZWF0ZVVybFRyZWUoXG4gICAgICAgICAgcmVsYXRpdmVUbywgY3VycmVudFN0YXRlLCBjdXJyZW50VXJsVHJlZSwgY29tbWFuZHMsIHF1ZXJ5UGFyYW1zLCBmcmFnbWVudCk7XG4gICAgICBpZiAodHJlZUZyb21TbmFwc2hvdFN0cmF0ZWd5LnRvU3RyaW5nKCkgIT09IHRyZWUudG9TdHJpbmcoKSkge1xuICAgICAgICBsZXQgd2FybmluZ1N0cmluZyA9IGBUaGUgbmF2aWdhdGlvbiB0byAke3RyZWUudG9TdHJpbmcoKX0gd2lsbCBpbnN0ZWFkIGdvIHRvICR7XG4gICAgICAgICAgICB0cmVlRnJvbVNuYXBzaG90U3RyYXRlZ3kudG9TdHJpbmcoKX0gaW4gYW4gdXBjb21pbmcgdmVyc2lvbiBvZiBBbmd1bGFyLmA7XG4gICAgICAgIGlmICghIXJlbGF0aXZlVG8pIHtcbiAgICAgICAgICB3YXJuaW5nU3RyaW5nICs9ICcgYHJlbGF0aXZlVG9gIG1pZ2h0IG5lZWQgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBgVXJsQ3JlYXRpb25PcHRpb25zYC4nO1xuICAgICAgICB9XG4gICAgICAgIHRyZWUuX3dhcm5JZlVzZWRGb3JOYXZpZ2F0aW9uID0gd2FybmluZ1N0cmluZztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRyZWU7XG4gIH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENyZWF0ZVVybFRyZWVVc2luZ1NuYXBzaG90IGltcGxlbWVudHMgQ3JlYXRlVXJsVHJlZVN0cmF0ZWd5IHtcbiAgY3JlYXRlVXJsVHJlZShcbiAgICAgIHJlbGF0aXZlVG86IEFjdGl2YXRlZFJvdXRlfG51bGx8dW5kZWZpbmVkLCBjdXJyZW50U3RhdGU6IFJvdXRlclN0YXRlLCBjdXJyZW50VXJsVHJlZTogVXJsVHJlZSxcbiAgICAgIGNvbW1hbmRzOiBhbnlbXSwgcXVlcnlQYXJhbXM6IFBhcmFtc3xudWxsLCBmcmFnbWVudDogc3RyaW5nfG51bGwpOiBVcmxUcmVlIHtcbiAgICBsZXQgcmVsYXRpdmVUb1VybFNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwfHVuZGVmaW5lZDtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVsYXRpdmVUb1NuYXBzaG90ID0gcmVsYXRpdmVUbyA/IHJlbGF0aXZlVG8uc25hcHNob3QgOiBjdXJyZW50U3RhdGUuc25hcHNob3Qucm9vdDtcbiAgICAgIHJlbGF0aXZlVG9VcmxTZWdtZW50R3JvdXAgPSBjcmVhdGVTZWdtZW50R3JvdXBGcm9tUm91dGUocmVsYXRpdmVUb1NuYXBzaG90KTtcbiAgICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgICAvLyBUaGlzIGlzIHN0cmljdGx5IGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSB3aXRoIHRlc3RzIHRoYXQgY3JlYXRlXG4gICAgICAvLyBpbnZhbGlkIGBBY3RpdmF0ZWRSb3V0ZWAgbW9ja3MuXG4gICAgICAvLyBOb3RlOiB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIGhhdmluZyB0aGlzIGZhbGxiYWNrIGZvciBpbnZhbGlkIGBBY3RpdmF0ZWRSb3V0ZWAgc2V0dXBzIGFuZFxuICAgICAgLy8ganVzdCB0aHJvd2luZyBpcyB+NTAwIHRlc3QgZmFpbHVyZXMuIEZpeGluZyBhbGwgb2YgdGhvc2UgdGVzdHMgYnkgaGFuZCBpcyBub3QgZmVhc2libGUgYXRcbiAgICAgIC8vIHRoZSBtb21lbnQuXG4gICAgICBpZiAodHlwZW9mIGNvbW1hbmRzWzBdICE9PSAnc3RyaW5nJyB8fCAhY29tbWFuZHNbMF0uc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICAgIC8vIE5hdmlnYXRpb25zIHRoYXQgd2VyZSBhYnNvbHV0ZSBpbiB0aGUgb2xkIHdheSBvZiBjcmVhdGluZyBVcmxUcmVlc1xuICAgICAgICAvLyB3b3VsZCBzdGlsbCB3b3JrIGJlY2F1c2UgdGhleSB3b3VsZG4ndCBhdHRlbXB0IHRvIG1hdGNoIHRoZVxuICAgICAgICAvLyBzZWdtZW50cyBpbiB0aGUgYEFjdGl2YXRlZFJvdXRlYCB0byB0aGUgYGN1cnJlbnRVcmxUcmVlYCBidXRcbiAgICAgICAgLy8gaW5zdGVhZCBqdXN0IHJlcGxhY2UgdGhlIHJvb3Qgc2VnbWVudCB3aXRoIHRoZSBuYXZpZ2F0aW9uIHJlc3VsdC5cbiAgICAgICAgLy8gTm9uLWFic29sdXRlIG5hdmlnYXRpb25zIHdvdWxkIGZhaWwgdG8gYXBwbHkgdGhlIGNvbW1hbmRzIGJlY2F1c2VcbiAgICAgICAgLy8gdGhlIGxvZ2ljIGNvdWxkIG5vdCBmaW5kIHRoZSBzZWdtZW50IHRvIHJlcGxhY2UgKHNvIHRoZXknZCBhY3QgbGlrZSB0aGVyZSB3ZXJlIG5vXG4gICAgICAgIC8vIGNvbW1hbmRzKS5cbiAgICAgICAgY29tbWFuZHMgPSBbXTtcbiAgICAgIH1cbiAgICAgIHJlbGF0aXZlVG9VcmxTZWdtZW50R3JvdXAgPSBjdXJyZW50VXJsVHJlZS5yb290O1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlVXJsVHJlZUZyb21TZWdtZW50R3JvdXAoXG4gICAgICAgIHJlbGF0aXZlVG9VcmxTZWdtZW50R3JvdXAsIGNvbW1hbmRzLCBxdWVyeVBhcmFtcywgZnJhZ21lbnQpO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCcsIHVzZUNsYXNzOiBMZWdhY3lDcmVhdGVVcmxUcmVlfSlcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDcmVhdGVVcmxUcmVlU3RyYXRlZ3kge1xuICBhYnN0cmFjdCBjcmVhdGVVcmxUcmVlKFxuICAgICAgcmVsYXRpdmVUbzogQWN0aXZhdGVkUm91dGV8bnVsbHx1bmRlZmluZWQsIGN1cnJlbnRTdGF0ZTogUm91dGVyU3RhdGUsIGN1cnJlbnRVcmxUcmVlOiBVcmxUcmVlLFxuICAgICAgY29tbWFuZHM6IGFueVtdLCBxdWVyeVBhcmFtczogUGFyYW1zfG51bGwsIGZyYWdtZW50OiBzdHJpbmd8bnVsbCk6IFVybFRyZWU7XG59XG4iXX0=