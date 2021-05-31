/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A token used to manipulate and access values stored in `HttpContext`.
 *
 * @publicApi
 */
export class HttpContextToken {
    constructor(defaultValue) {
        this.defaultValue = defaultValue;
    }
}
/**
 * Http context stores arbitrary user defined values and ensures type safety without
 * actually knowing the types. It is backed by a `Map` and guarantees that keys do not clash.
 *
 * This context is mutable and is shared between cloned requests unless explicitly specified.
 *
 * @usageNotes
 *
 * ### Usage Example
 *
 * ```typescript
 * // inside cache.interceptors.ts
 * export const IS_CACHE_ENABLED = new HttpContextToken<boolean>(() => false);
 *
 * export class CacheInterceptor implements HttpInterceptor {
 *
 *   intercept(req: HttpRequest<any>, delegate: HttpHandler): Observable<HttpEvent<any>> {
 *     if (req.context.get(IS_CACHE_ENABLED) === true) {
 *       return ...;
 *     }
 *     return delegate.handle(req);
 *   }
 * }
 *
 * // inside a service
 *
 * this.httpClient.get('/api/weather', {
 *   context: new HttpContext().set(IS_CACHE_ENABLED, true)
 * }).subscribe(...);
 * ```
 *
 * @publicApi
 */
export class HttpContext {
    constructor() {
        this.map = new Map();
    }
    /**
     * Store a value in the context. If a value is already present it will be overwritten.
     *
     * @param token The reference to an instance of `HttpContextToken`.
     * @param value The value to store.
     *
     * @returns A reference to itself for easy chaining.
     */
    set(token, value) {
        this.map.set(token, value);
        return this;
    }
    /**
     * Retrieve the value associated with the given token.
     *
     * @param token The reference to an instance of `HttpContextToken`.
     *
     * @returns The stored value or default if one is defined.
     */
    get(token) {
        if (!this.map.has(token)) {
            this.map.set(token, token.defaultValue());
        }
        return this.map.get(token);
    }
    /**
     * Delete the value associated with the given token.
     *
     * @param token The reference to an instance of `HttpContextToken`.
     *
     * @returns A reference to itself for easy chaining.
     */
    delete(token) {
        this.map.delete(token);
        return this;
    }
    /**
     * @returns a list of tokens currently stored in the context.
     */
    keys() {
        return this.map.keys();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3NyYy9jb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVIOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCLFlBQTRCLFlBQXFCO1FBQXJCLGlCQUFZLEdBQVosWUFBWSxDQUFTO0lBQUcsQ0FBQztDQUN0RDtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWdDRztBQUNILE1BQU0sT0FBTyxXQUFXO0lBQXhCO1FBQ21CLFFBQUcsR0FBRyxJQUFJLEdBQUcsRUFBc0MsQ0FBQztJQStDdkUsQ0FBQztJQTdDQzs7Ozs7OztPQU9HO0lBQ0gsR0FBRyxDQUFJLEtBQTBCLEVBQUUsS0FBUTtRQUN6QyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDM0IsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsR0FBRyxDQUFJLEtBQTBCO1FBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN4QixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7U0FDM0M7UUFDRCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBTSxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxNQUFNLENBQUMsS0FBZ0M7UUFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkIsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxJQUFJO1FBQ0YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3pCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIEEgdG9rZW4gdXNlZCB0byBtYW5pcHVsYXRlIGFuZCBhY2Nlc3MgdmFsdWVzIHN0b3JlZCBpbiBgSHR0cENvbnRleHRgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEh0dHBDb250ZXh0VG9rZW48VD4ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgZGVmYXVsdFZhbHVlOiAoKSA9PiBUKSB7fVxufVxuXG4vKipcbiAqIEh0dHAgY29udGV4dCBzdG9yZXMgYXJiaXRyYXJ5IHVzZXIgZGVmaW5lZCB2YWx1ZXMgYW5kIGVuc3VyZXMgdHlwZSBzYWZldHkgd2l0aG91dFxuICogYWN0dWFsbHkga25vd2luZyB0aGUgdHlwZXMuIEl0IGlzIGJhY2tlZCBieSBhIGBNYXBgIGFuZCBndWFyYW50ZWVzIHRoYXQga2V5cyBkbyBub3QgY2xhc2guXG4gKlxuICogVGhpcyBjb250ZXh0IGlzIG11dGFibGUgYW5kIGlzIHNoYXJlZCBiZXR3ZWVuIGNsb25lZCByZXF1ZXN0cyB1bmxlc3MgZXhwbGljaXRseSBzcGVjaWZpZWQuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgVXNhZ2UgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIC8vIGluc2lkZSBjYWNoZS5pbnRlcmNlcHRvcnMudHNcbiAqIGV4cG9ydCBjb25zdCBJU19DQUNIRV9FTkFCTEVEID0gbmV3IEh0dHBDb250ZXh0VG9rZW48Ym9vbGVhbj4oKCkgPT4gZmFsc2UpO1xuICpcbiAqIGV4cG9ydCBjbGFzcyBDYWNoZUludGVyY2VwdG9yIGltcGxlbWVudHMgSHR0cEludGVyY2VwdG9yIHtcbiAqXG4gKiAgIGludGVyY2VwdChyZXE6IEh0dHBSZXF1ZXN0PGFueT4sIGRlbGVnYXRlOiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAqICAgICBpZiAocmVxLmNvbnRleHQuZ2V0KElTX0NBQ0hFX0VOQUJMRUQpID09PSB0cnVlKSB7XG4gKiAgICAgICByZXR1cm4gLi4uO1xuICogICAgIH1cbiAqICAgICByZXR1cm4gZGVsZWdhdGUuaGFuZGxlKHJlcSk7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiAvLyBpbnNpZGUgYSBzZXJ2aWNlXG4gKlxuICogdGhpcy5odHRwQ2xpZW50LmdldCgnL2FwaS93ZWF0aGVyJywge1xuICogICBjb250ZXh0OiBuZXcgSHR0cENvbnRleHQoKS5zZXQoSVNfQ0FDSEVfRU5BQkxFRCwgdHJ1ZSlcbiAqIH0pLnN1YnNjcmliZSguLi4pO1xuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgSHR0cENvbnRleHQge1xuICBwcml2YXRlIHJlYWRvbmx5IG1hcCA9IG5ldyBNYXA8SHR0cENvbnRleHRUb2tlbjx1bmtub3duPiwgdW5rbm93bj4oKTtcblxuICAvKipcbiAgICogU3RvcmUgYSB2YWx1ZSBpbiB0aGUgY29udGV4dC4gSWYgYSB2YWx1ZSBpcyBhbHJlYWR5IHByZXNlbnQgaXQgd2lsbCBiZSBvdmVyd3JpdHRlbi5cbiAgICpcbiAgICogQHBhcmFtIHRva2VuIFRoZSByZWZlcmVuY2UgdG8gYW4gaW5zdGFuY2Ugb2YgYEh0dHBDb250ZXh0VG9rZW5gLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHN0b3JlLlxuICAgKlxuICAgKiBAcmV0dXJucyBBIHJlZmVyZW5jZSB0byBpdHNlbGYgZm9yIGVhc3kgY2hhaW5pbmcuXG4gICAqL1xuICBzZXQ8VD4odG9rZW46IEh0dHBDb250ZXh0VG9rZW48VD4sIHZhbHVlOiBUKTogSHR0cENvbnRleHQge1xuICAgIHRoaXMubWFwLnNldCh0b2tlbiwgdmFsdWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIHRva2VuLlxuICAgKlxuICAgKiBAcGFyYW0gdG9rZW4gVGhlIHJlZmVyZW5jZSB0byBhbiBpbnN0YW5jZSBvZiBgSHR0cENvbnRleHRUb2tlbmAuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBzdG9yZWQgdmFsdWUgb3IgZGVmYXVsdCBpZiBvbmUgaXMgZGVmaW5lZC5cbiAgICovXG4gIGdldDxUPih0b2tlbjogSHR0cENvbnRleHRUb2tlbjxUPik6IFQge1xuICAgIGlmICghdGhpcy5tYXAuaGFzKHRva2VuKSkge1xuICAgICAgdGhpcy5tYXAuc2V0KHRva2VuLCB0b2tlbi5kZWZhdWx0VmFsdWUoKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm1hcC5nZXQodG9rZW4pIGFzIFQ7XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIHRva2VuLlxuICAgKlxuICAgKiBAcGFyYW0gdG9rZW4gVGhlIHJlZmVyZW5jZSB0byBhbiBpbnN0YW5jZSBvZiBgSHR0cENvbnRleHRUb2tlbmAuXG4gICAqXG4gICAqIEByZXR1cm5zIEEgcmVmZXJlbmNlIHRvIGl0c2VsZiBmb3IgZWFzeSBjaGFpbmluZy5cbiAgICovXG4gIGRlbGV0ZSh0b2tlbjogSHR0cENvbnRleHRUb2tlbjx1bmtub3duPik6IEh0dHBDb250ZXh0IHtcbiAgICB0aGlzLm1hcC5kZWxldGUodG9rZW4pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIGEgbGlzdCBvZiB0b2tlbnMgY3VycmVudGx5IHN0b3JlZCBpbiB0aGUgY29udGV4dC5cbiAgICovXG4gIGtleXMoKTogSXRlcmFibGVJdGVyYXRvcjxIdHRwQ29udGV4dFRva2VuPHVua25vd24+PiB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmtleXMoKTtcbiAgfVxufSJdfQ==