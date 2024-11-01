/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { global } from './global';
/**
 * NOTE: changes to the `ngI18nClosureMode` name must be synced with `compiler-cli/src/tooling.ts`.
 */
if (typeof ngI18nClosureMode === 'undefined') {
    // These property accesses can be ignored because ngI18nClosureMode will be set to false
    // when optimizing code and the whole if statement will be dropped.
    // Make sure to refer to ngI18nClosureMode as ['ngI18nClosureMode'] for closure.
    // NOTE: we need to have it in IIFE so that the tree-shaker is happy.
    (function () {
        // tslint:disable-next-line:no-toplevel-property-access
        global['ngI18nClosureMode'] =
            // TODO(FW-1250): validate that this actually, you know, works.
            // tslint:disable-next-line:no-toplevel-property-access
            typeof goog !== 'undefined' && typeof goog.getMsg === 'function';
    })();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfaTE4bl9jbG9zdXJlX21vZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy91dGlsL25nX2kxOG5fY2xvc3VyZV9tb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFNaEM7O0dBRUc7QUFDSCxJQUFJLE9BQU8saUJBQWlCLEtBQUssV0FBVyxFQUFFLENBQUM7SUFDN0Msd0ZBQXdGO0lBQ3hGLG1FQUFtRTtJQUNuRSxnRkFBZ0Y7SUFDaEYscUVBQXFFO0lBQ3JFLENBQUM7UUFDQyx1REFBdUQ7UUFDdkQsTUFBTSxDQUFDLG1CQUFtQixDQUFDO1lBQ3pCLCtEQUErRDtZQUMvRCx1REFBdUQ7WUFDdkQsT0FBTyxJQUFJLEtBQUssV0FBVyxJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxVQUFVLENBQUM7SUFDckUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNQLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7Z2xvYmFsfSBmcm9tICcuL2dsb2JhbCc7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgY29uc3QgbmdJMThuQ2xvc3VyZU1vZGU6IGJvb2xlYW47XG59XG5cbi8qKlxuICogTk9URTogY2hhbmdlcyB0byB0aGUgYG5nSTE4bkNsb3N1cmVNb2RlYCBuYW1lIG11c3QgYmUgc3luY2VkIHdpdGggYGNvbXBpbGVyLWNsaS9zcmMvdG9vbGluZy50c2AuXG4gKi9cbmlmICh0eXBlb2YgbmdJMThuQ2xvc3VyZU1vZGUgPT09ICd1bmRlZmluZWQnKSB7XG4gIC8vIFRoZXNlIHByb3BlcnR5IGFjY2Vzc2VzIGNhbiBiZSBpZ25vcmVkIGJlY2F1c2UgbmdJMThuQ2xvc3VyZU1vZGUgd2lsbCBiZSBzZXQgdG8gZmFsc2VcbiAgLy8gd2hlbiBvcHRpbWl6aW5nIGNvZGUgYW5kIHRoZSB3aG9sZSBpZiBzdGF0ZW1lbnQgd2lsbCBiZSBkcm9wcGVkLlxuICAvLyBNYWtlIHN1cmUgdG8gcmVmZXIgdG8gbmdJMThuQ2xvc3VyZU1vZGUgYXMgWyduZ0kxOG5DbG9zdXJlTW9kZSddIGZvciBjbG9zdXJlLlxuICAvLyBOT1RFOiB3ZSBuZWVkIHRvIGhhdmUgaXQgaW4gSUlGRSBzbyB0aGF0IHRoZSB0cmVlLXNoYWtlciBpcyBoYXBweS5cbiAgKGZ1bmN0aW9uICgpIHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdG9wbGV2ZWwtcHJvcGVydHktYWNjZXNzXG4gICAgZ2xvYmFsWyduZ0kxOG5DbG9zdXJlTW9kZSddID1cbiAgICAgIC8vIFRPRE8oRlctMTI1MCk6IHZhbGlkYXRlIHRoYXQgdGhpcyBhY3R1YWxseSwgeW91IGtub3csIHdvcmtzLlxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXRvcGxldmVsLXByb3BlcnR5LWFjY2Vzc1xuICAgICAgdHlwZW9mIGdvb2cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBnb29nLmdldE1zZyA9PT0gJ2Z1bmN0aW9uJztcbiAgfSkoKTtcbn1cbiJdfQ==