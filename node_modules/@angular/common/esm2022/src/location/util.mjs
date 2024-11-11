/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Joins two parts of a URL with a slash if needed.
 *
 * @param start  URL string
 * @param end    URL string
 *
 *
 * @returns The joined URL string.
 */
export function joinWithSlash(start, end) {
    if (start.length == 0) {
        return end;
    }
    if (end.length == 0) {
        return start;
    }
    let slashes = 0;
    if (start.endsWith('/')) {
        slashes++;
    }
    if (end.startsWith('/')) {
        slashes++;
    }
    if (slashes == 2) {
        return start + end.substring(1);
    }
    if (slashes == 1) {
        return start + end;
    }
    return start + '/' + end;
}
/**
 * Removes a trailing slash from a URL string if needed.
 * Looks for the first occurrence of either `#`, `?`, or the end of the
 * line as `/` characters and removes the trailing slash if one exists.
 *
 * @param url URL string.
 *
 * @returns The URL string, modified if needed.
 */
export function stripTrailingSlash(url) {
    const match = url.match(/#|\?|$/);
    const pathEndIdx = (match && match.index) || url.length;
    const droppedSlashIdx = pathEndIdx - (url[pathEndIdx - 1] === '/' ? 1 : 0);
    return url.slice(0, droppedSlashIdx) + url.slice(pathEndIdx);
}
/**
 * Normalizes URL parameters by prepending with `?` if needed.
 *
 * @param  params String of URL parameters.
 *
 * @returns The normalized URL parameters string.
 */
export function normalizeQueryParams(params) {
    return params && params[0] !== '?' ? '?' + params : params;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvbG9jYXRpb24vdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sVUFBVSxhQUFhLENBQUMsS0FBYSxFQUFFLEdBQVc7SUFDdEQsSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3RCLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELElBQUksR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNwQixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFDRCxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFDaEIsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDeEIsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0lBQ0QsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDeEIsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0lBQ0QsSUFBSSxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDakIsT0FBTyxLQUFLLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBQ0QsSUFBSSxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDakIsT0FBTyxLQUFLLEdBQUcsR0FBRyxDQUFDO0lBQ3JCLENBQUM7SUFDRCxPQUFPLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzNCLENBQUM7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxHQUFXO0lBQzVDLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbEMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUM7SUFDeEQsTUFBTSxlQUFlLEdBQUcsVUFBVSxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0UsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxlQUFlLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQy9ELENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsb0JBQW9CLENBQUMsTUFBYztJQUNqRCxPQUFPLE1BQU0sSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDN0QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBKb2lucyB0d28gcGFydHMgb2YgYSBVUkwgd2l0aCBhIHNsYXNoIGlmIG5lZWRlZC5cbiAqXG4gKiBAcGFyYW0gc3RhcnQgIFVSTCBzdHJpbmdcbiAqIEBwYXJhbSBlbmQgICAgVVJMIHN0cmluZ1xuICpcbiAqXG4gKiBAcmV0dXJucyBUaGUgam9pbmVkIFVSTCBzdHJpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBqb2luV2l0aFNsYXNoKHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKHN0YXJ0Lmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuIGVuZDtcbiAgfVxuICBpZiAoZW5kLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuIHN0YXJ0O1xuICB9XG4gIGxldCBzbGFzaGVzID0gMDtcbiAgaWYgKHN0YXJ0LmVuZHNXaXRoKCcvJykpIHtcbiAgICBzbGFzaGVzKys7XG4gIH1cbiAgaWYgKGVuZC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICBzbGFzaGVzKys7XG4gIH1cbiAgaWYgKHNsYXNoZXMgPT0gMikge1xuICAgIHJldHVybiBzdGFydCArIGVuZC5zdWJzdHJpbmcoMSk7XG4gIH1cbiAgaWYgKHNsYXNoZXMgPT0gMSkge1xuICAgIHJldHVybiBzdGFydCArIGVuZDtcbiAgfVxuICByZXR1cm4gc3RhcnQgKyAnLycgKyBlbmQ7XG59XG5cbi8qKlxuICogUmVtb3ZlcyBhIHRyYWlsaW5nIHNsYXNoIGZyb20gYSBVUkwgc3RyaW5nIGlmIG5lZWRlZC5cbiAqIExvb2tzIGZvciB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBlaXRoZXIgYCNgLCBgP2AsIG9yIHRoZSBlbmQgb2YgdGhlXG4gKiBsaW5lIGFzIGAvYCBjaGFyYWN0ZXJzIGFuZCByZW1vdmVzIHRoZSB0cmFpbGluZyBzbGFzaCBpZiBvbmUgZXhpc3RzLlxuICpcbiAqIEBwYXJhbSB1cmwgVVJMIHN0cmluZy5cbiAqXG4gKiBAcmV0dXJucyBUaGUgVVJMIHN0cmluZywgbW9kaWZpZWQgaWYgbmVlZGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBUcmFpbGluZ1NsYXNoKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbWF0Y2ggPSB1cmwubWF0Y2goLyN8XFw/fCQvKTtcbiAgY29uc3QgcGF0aEVuZElkeCA9IChtYXRjaCAmJiBtYXRjaC5pbmRleCkgfHwgdXJsLmxlbmd0aDtcbiAgY29uc3QgZHJvcHBlZFNsYXNoSWR4ID0gcGF0aEVuZElkeCAtICh1cmxbcGF0aEVuZElkeCAtIDFdID09PSAnLycgPyAxIDogMCk7XG4gIHJldHVybiB1cmwuc2xpY2UoMCwgZHJvcHBlZFNsYXNoSWR4KSArIHVybC5zbGljZShwYXRoRW5kSWR4KTtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemVzIFVSTCBwYXJhbWV0ZXJzIGJ5IHByZXBlbmRpbmcgd2l0aCBgP2AgaWYgbmVlZGVkLlxuICpcbiAqIEBwYXJhbSAgcGFyYW1zIFN0cmluZyBvZiBVUkwgcGFyYW1ldGVycy5cbiAqXG4gKiBAcmV0dXJucyBUaGUgbm9ybWFsaXplZCBVUkwgcGFyYW1ldGVycyBzdHJpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVRdWVyeVBhcmFtcyhwYXJhbXM6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBwYXJhbXMgJiYgcGFyYW1zWzBdICE9PSAnPycgPyAnPycgKyBwYXJhbXMgOiBwYXJhbXM7XG59XG4iXX0=