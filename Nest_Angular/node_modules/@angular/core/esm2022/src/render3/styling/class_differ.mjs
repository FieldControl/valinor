/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { assertNotEqual } from '../../util/assert';
/**
 * Returns an index of `classToSearch` in `className` taking token boundaries into account.
 *
 * `classIndexOf('AB A', 'A', 0)` will be 3 (not 0 since `AB!==A`)
 *
 * @param className A string containing classes (whitespace separated)
 * @param classToSearch A class name to locate
 * @param startingIndex Starting location of search
 * @returns an index of the located class (or -1 if not found)
 */
export function classIndexOf(className, classToSearch, startingIndex) {
    ngDevMode && assertNotEqual(classToSearch, '', 'can not look for "" string.');
    let end = className.length;
    while (true) {
        const foundIndex = className.indexOf(classToSearch, startingIndex);
        if (foundIndex === -1)
            return foundIndex;
        if (foundIndex === 0 || className.charCodeAt(foundIndex - 1) <= 32 /* CharCode.SPACE */) {
            // Ensure that it has leading whitespace
            const length = classToSearch.length;
            if (foundIndex + length === end ||
                className.charCodeAt(foundIndex + length) <= 32 /* CharCode.SPACE */) {
                // Ensure that it has trailing whitespace
                return foundIndex;
            }
        }
        // False positive, keep searching from where we left off.
        startingIndex = foundIndex + 1;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3NfZGlmZmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9zdHlsaW5nL2NsYXNzX2RpZmZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFHakQ7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSxVQUFVLFlBQVksQ0FDMUIsU0FBaUIsRUFDakIsYUFBcUIsRUFDckIsYUFBcUI7SUFFckIsU0FBUyxJQUFJLGNBQWMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxFQUFFLDZCQUE2QixDQUFDLENBQUM7SUFDOUUsSUFBSSxHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztJQUMzQixPQUFPLElBQUksRUFBRSxDQUFDO1FBQ1osTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDbkUsSUFBSSxVQUFVLEtBQUssQ0FBQyxDQUFDO1lBQUUsT0FBTyxVQUFVLENBQUM7UUFDekMsSUFBSSxVQUFVLEtBQUssQ0FBQyxJQUFJLFNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQywyQkFBa0IsRUFBRSxDQUFDO1lBQy9FLHdDQUF3QztZQUN4QyxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDO1lBQ3BDLElBQ0UsVUFBVSxHQUFHLE1BQU0sS0FBSyxHQUFHO2dCQUMzQixTQUFTLENBQUMsVUFBVSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsMkJBQWtCLEVBQzNELENBQUM7Z0JBQ0QseUNBQXlDO2dCQUN6QyxPQUFPLFVBQVUsQ0FBQztZQUNwQixDQUFDO1FBQ0gsQ0FBQztRQUNELHlEQUF5RDtRQUN6RCxhQUFhLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQztJQUNqQyxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthc3NlcnROb3RFcXVhbH0gZnJvbSAnLi4vLi4vdXRpbC9hc3NlcnQnO1xuaW1wb3J0IHtDaGFyQ29kZX0gZnJvbSAnLi4vLi4vdXRpbC9jaGFyX2NvZGUnO1xuXG4vKipcbiAqIFJldHVybnMgYW4gaW5kZXggb2YgYGNsYXNzVG9TZWFyY2hgIGluIGBjbGFzc05hbWVgIHRha2luZyB0b2tlbiBib3VuZGFyaWVzIGludG8gYWNjb3VudC5cbiAqXG4gKiBgY2xhc3NJbmRleE9mKCdBQiBBJywgJ0EnLCAwKWAgd2lsbCBiZSAzIChub3QgMCBzaW5jZSBgQUIhPT1BYClcbiAqXG4gKiBAcGFyYW0gY2xhc3NOYW1lIEEgc3RyaW5nIGNvbnRhaW5pbmcgY2xhc3NlcyAod2hpdGVzcGFjZSBzZXBhcmF0ZWQpXG4gKiBAcGFyYW0gY2xhc3NUb1NlYXJjaCBBIGNsYXNzIG5hbWUgdG8gbG9jYXRlXG4gKiBAcGFyYW0gc3RhcnRpbmdJbmRleCBTdGFydGluZyBsb2NhdGlvbiBvZiBzZWFyY2hcbiAqIEByZXR1cm5zIGFuIGluZGV4IG9mIHRoZSBsb2NhdGVkIGNsYXNzIChvciAtMSBpZiBub3QgZm91bmQpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFzc0luZGV4T2YoXG4gIGNsYXNzTmFtZTogc3RyaW5nLFxuICBjbGFzc1RvU2VhcmNoOiBzdHJpbmcsXG4gIHN0YXJ0aW5nSW5kZXg6IG51bWJlcixcbik6IG51bWJlciB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnROb3RFcXVhbChjbGFzc1RvU2VhcmNoLCAnJywgJ2NhbiBub3QgbG9vayBmb3IgXCJcIiBzdHJpbmcuJyk7XG4gIGxldCBlbmQgPSBjbGFzc05hbWUubGVuZ3RoO1xuICB3aGlsZSAodHJ1ZSkge1xuICAgIGNvbnN0IGZvdW5kSW5kZXggPSBjbGFzc05hbWUuaW5kZXhPZihjbGFzc1RvU2VhcmNoLCBzdGFydGluZ0luZGV4KTtcbiAgICBpZiAoZm91bmRJbmRleCA9PT0gLTEpIHJldHVybiBmb3VuZEluZGV4O1xuICAgIGlmIChmb3VuZEluZGV4ID09PSAwIHx8IGNsYXNzTmFtZS5jaGFyQ29kZUF0KGZvdW5kSW5kZXggLSAxKSA8PSBDaGFyQ29kZS5TUEFDRSkge1xuICAgICAgLy8gRW5zdXJlIHRoYXQgaXQgaGFzIGxlYWRpbmcgd2hpdGVzcGFjZVxuICAgICAgY29uc3QgbGVuZ3RoID0gY2xhc3NUb1NlYXJjaC5sZW5ndGg7XG4gICAgICBpZiAoXG4gICAgICAgIGZvdW5kSW5kZXggKyBsZW5ndGggPT09IGVuZCB8fFxuICAgICAgICBjbGFzc05hbWUuY2hhckNvZGVBdChmb3VuZEluZGV4ICsgbGVuZ3RoKSA8PSBDaGFyQ29kZS5TUEFDRVxuICAgICAgKSB7XG4gICAgICAgIC8vIEVuc3VyZSB0aGF0IGl0IGhhcyB0cmFpbGluZyB3aGl0ZXNwYWNlXG4gICAgICAgIHJldHVybiBmb3VuZEluZGV4O1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBGYWxzZSBwb3NpdGl2ZSwga2VlcCBzZWFyY2hpbmcgZnJvbSB3aGVyZSB3ZSBsZWZ0IG9mZi5cbiAgICBzdGFydGluZ0luZGV4ID0gZm91bmRJbmRleCArIDE7XG4gIH1cbn1cbiJdfQ==