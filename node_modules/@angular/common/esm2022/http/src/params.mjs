/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Provides encoding and decoding of URL parameter and query-string values.
 *
 * Serializes and parses URL parameter keys and values to encode and decode them.
 * If you pass URL query parameters without encoding,
 * the query parameters can be misinterpreted at the receiving end.
 *
 *
 * @publicApi
 */
export class HttpUrlEncodingCodec {
    /**
     * Encodes a key name for a URL parameter or query-string.
     * @param key The key name.
     * @returns The encoded key name.
     */
    encodeKey(key) {
        return standardEncoding(key);
    }
    /**
     * Encodes the value of a URL parameter or query-string.
     * @param value The value.
     * @returns The encoded value.
     */
    encodeValue(value) {
        return standardEncoding(value);
    }
    /**
     * Decodes an encoded URL parameter or query-string key.
     * @param key The encoded key name.
     * @returns The decoded key name.
     */
    decodeKey(key) {
        return decodeURIComponent(key);
    }
    /**
     * Decodes an encoded URL parameter or query-string value.
     * @param value The encoded value.
     * @returns The decoded value.
     */
    decodeValue(value) {
        return decodeURIComponent(value);
    }
}
function paramParser(rawParams, codec) {
    const map = new Map();
    if (rawParams.length > 0) {
        // The `window.location.search` can be used while creating an instance of the `HttpParams` class
        // (e.g. `new HttpParams({ fromString: window.location.search })`). The `window.location.search`
        // may start with the `?` char, so we strip it if it's present.
        const params = rawParams.replace(/^\?/, '').split('&');
        params.forEach((param) => {
            const eqIdx = param.indexOf('=');
            const [key, val] = eqIdx == -1
                ? [codec.decodeKey(param), '']
                : [codec.decodeKey(param.slice(0, eqIdx)), codec.decodeValue(param.slice(eqIdx + 1))];
            const list = map.get(key) || [];
            list.push(val);
            map.set(key, list);
        });
    }
    return map;
}
/**
 * Encode input string with standard encodeURIComponent and then un-encode specific characters.
 */
const STANDARD_ENCODING_REGEX = /%(\d[a-f0-9])/gi;
const STANDARD_ENCODING_REPLACEMENTS = {
    '40': '@',
    '3A': ':',
    '24': '$',
    '2C': ',',
    '3B': ';',
    '3D': '=',
    '3F': '?',
    '2F': '/',
};
function standardEncoding(v) {
    return encodeURIComponent(v).replace(STANDARD_ENCODING_REGEX, (s, t) => STANDARD_ENCODING_REPLACEMENTS[t] ?? s);
}
function valueToString(value) {
    return `${value}`;
}
/**
 * An HTTP request/response body that represents serialized parameters,
 * per the MIME type `application/x-www-form-urlencoded`.
 *
 * This class is immutable; all mutation operations return a new instance.
 *
 * @publicApi
 */
export class HttpParams {
    constructor(options = {}) {
        this.updates = null;
        this.cloneFrom = null;
        this.encoder = options.encoder || new HttpUrlEncodingCodec();
        if (!!options.fromString) {
            if (!!options.fromObject) {
                throw new Error(`Cannot specify both fromString and fromObject.`);
            }
            this.map = paramParser(options.fromString, this.encoder);
        }
        else if (!!options.fromObject) {
            this.map = new Map();
            Object.keys(options.fromObject).forEach((key) => {
                const value = options.fromObject[key];
                // convert the values to strings
                const values = Array.isArray(value) ? value.map(valueToString) : [valueToString(value)];
                this.map.set(key, values);
            });
        }
        else {
            this.map = null;
        }
    }
    /**
     * Reports whether the body includes one or more values for a given parameter.
     * @param param The parameter name.
     * @returns True if the parameter has one or more values,
     * false if it has no value or is not present.
     */
    has(param) {
        this.init();
        return this.map.has(param);
    }
    /**
     * Retrieves the first value for a parameter.
     * @param param The parameter name.
     * @returns The first value of the given parameter,
     * or `null` if the parameter is not present.
     */
    get(param) {
        this.init();
        const res = this.map.get(param);
        return !!res ? res[0] : null;
    }
    /**
     * Retrieves all values for a  parameter.
     * @param param The parameter name.
     * @returns All values in a string array,
     * or `null` if the parameter not present.
     */
    getAll(param) {
        this.init();
        return this.map.get(param) || null;
    }
    /**
     * Retrieves all the parameters for this body.
     * @returns The parameter names in a string array.
     */
    keys() {
        this.init();
        return Array.from(this.map.keys());
    }
    /**
     * Appends a new value to existing values for a parameter.
     * @param param The parameter name.
     * @param value The new value to add.
     * @return A new body with the appended value.
     */
    append(param, value) {
        return this.clone({ param, value, op: 'a' });
    }
    /**
     * Constructs a new body with appended values for the given parameter name.
     * @param params parameters and values
     * @return A new body with the new value.
     */
    appendAll(params) {
        const updates = [];
        Object.keys(params).forEach((param) => {
            const value = params[param];
            if (Array.isArray(value)) {
                value.forEach((_value) => {
                    updates.push({ param, value: _value, op: 'a' });
                });
            }
            else {
                updates.push({ param, value: value, op: 'a' });
            }
        });
        return this.clone(updates);
    }
    /**
     * Replaces the value for a parameter.
     * @param param The parameter name.
     * @param value The new value.
     * @return A new body with the new value.
     */
    set(param, value) {
        return this.clone({ param, value, op: 's' });
    }
    /**
     * Removes a given value or all values from a parameter.
     * @param param The parameter name.
     * @param value The value to remove, if provided.
     * @return A new body with the given value removed, or with all values
     * removed if no value is specified.
     */
    delete(param, value) {
        return this.clone({ param, value, op: 'd' });
    }
    /**
     * Serializes the body to an encoded string, where key-value pairs (separated by `=`) are
     * separated by `&`s.
     */
    toString() {
        this.init();
        return (this.keys()
            .map((key) => {
            const eKey = this.encoder.encodeKey(key);
            // `a: ['1']` produces `'a=1'`
            // `b: []` produces `''`
            // `c: ['1', '2']` produces `'c=1&c=2'`
            return this.map.get(key)
                .map((value) => eKey + '=' + this.encoder.encodeValue(value))
                .join('&');
        })
            // filter out empty values because `b: []` produces `''`
            // which results in `a=1&&c=1&c=2` instead of `a=1&c=1&c=2` if we don't
            .filter((param) => param !== '')
            .join('&'));
    }
    clone(update) {
        const clone = new HttpParams({ encoder: this.encoder });
        clone.cloneFrom = this.cloneFrom || this;
        clone.updates = (this.updates || []).concat(update);
        return clone;
    }
    init() {
        if (this.map === null) {
            this.map = new Map();
        }
        if (this.cloneFrom !== null) {
            this.cloneFrom.init();
            this.cloneFrom.keys().forEach((key) => this.map.set(key, this.cloneFrom.map.get(key)));
            this.updates.forEach((update) => {
                switch (update.op) {
                    case 'a':
                    case 's':
                        const base = (update.op === 'a' ? this.map.get(update.param) : undefined) || [];
                        base.push(valueToString(update.value));
                        this.map.set(update.param, base);
                        break;
                    case 'd':
                        if (update.value !== undefined) {
                            let base = this.map.get(update.param) || [];
                            const idx = base.indexOf(valueToString(update.value));
                            if (idx !== -1) {
                                base.splice(idx, 1);
                            }
                            if (base.length > 0) {
                                this.map.set(update.param, base);
                            }
                            else {
                                this.map.delete(update.param);
                            }
                        }
                        else {
                            this.map.delete(update.param);
                            break;
                        }
                }
            });
            this.cloneFrom = this.updates = null;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL3BhcmFtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFpQkg7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSxPQUFPLG9CQUFvQjtJQUMvQjs7OztPQUlHO0lBQ0gsU0FBUyxDQUFDLEdBQVc7UUFDbkIsT0FBTyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFdBQVcsQ0FBQyxLQUFhO1FBQ3ZCLE9BQU8sZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxTQUFTLENBQUMsR0FBVztRQUNuQixPQUFPLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsV0FBVyxDQUFDLEtBQWE7UUFDdkIsT0FBTyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDO0NBQ0Y7QUFFRCxTQUFTLFdBQVcsQ0FBQyxTQUFpQixFQUFFLEtBQXlCO0lBQy9ELE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO0lBQ3hDLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUN6QixnR0FBZ0c7UUFDaEcsZ0dBQWdHO1FBQ2hHLCtEQUErRDtRQUMvRCxNQUFNLE1BQU0sR0FBYSxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQWEsRUFBRSxFQUFFO1lBQy9CLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDakMsTUFBTSxD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LElBQUksRUFBRSxDQUFDOzRCQUM3QyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs0QkFDdEQsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQ0FDZixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQzs0QkFDdEIsQ0FBQzs0QkFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0NBQ3BCLElBQUksQ0FBQyxHQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7NEJBQ3BDLENBQUM7aUNBQU0sQ0FBQztnQ0FDTixJQUFJLENBQUMsR0FBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBQ2pDLENBQUM7d0JBQ0gsQ0FBQzs2QkFBTSxDQUFDOzRCQUNOLElBQUksQ0FBQyxHQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFDL0IsTUFBTTt3QkFDUixDQUFDO2dCQUNMLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDdkMsQ0FBQztJQUNILENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBBIGNvZGVjIGZvciBlbmNvZGluZyBhbmQgZGVjb2RpbmcgcGFyYW1ldGVycyBpbiBVUkxzLlxuICpcbiAqIFVzZWQgYnkgYEh0dHBQYXJhbXNgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqKi9cbmV4cG9ydCBpbnRlcmZhY2UgSHR0cFBhcmFtZXRlckNvZGVjIHtcbiAgZW5jb2RlS2V5KGtleTogc3RyaW5nKTogc3RyaW5nO1xuICBlbmNvZGVWYWx1ZSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nO1xuXG4gIGRlY29kZUtleShrZXk6IHN0cmluZyk6IHN0cmluZztcbiAgZGVjb2RlVmFsdWUodmFsdWU6IHN0cmluZyk6IHN0cmluZztcbn1cblxuLyoqXG4gKiBQcm92aWRlcyBlbmNvZGluZyBhbmQgZGVjb2Rpbmcgb2YgVVJMIHBhcmFtZXRlciBhbmQgcXVlcnktc3RyaW5nIHZhbHVlcy5cbiAqXG4gKiBTZXJpYWxpemVzIGFuZCBwYXJzZXMgVVJMIHBhcmFtZXRlciBrZXlzIGFuZCB2YWx1ZXMgdG8gZW5jb2RlIGFuZCBkZWNvZGUgdGhlbS5cbiAqIElmIHlvdSBwYXNzIFVSTCBxdWVyeSBwYXJhbWV0ZXJzIHdpdGhvdXQgZW5jb2RpbmcsXG4gKiB0aGUgcXVlcnkgcGFyYW1ldGVycyBjYW4gYmUgbWlzaW50ZXJwcmV0ZWQgYXQgdGhlIHJlY2VpdmluZyBlbmQuXG4gKlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEh0dHBVcmxFbmNvZGluZ0NvZGVjIGltcGxlbWVudHMgSHR0cFBhcmFtZXRlckNvZGVjIHtcbiAgLyoqXG4gICAqIEVuY29kZXMgYSBrZXkgbmFtZSBmb3IgYSBVUkwgcGFyYW1ldGVyIG9yIHF1ZXJ5LXN0cmluZy5cbiAgICogQHBhcmFtIGtleSBUaGUga2V5IG5hbWUuXG4gICAqIEByZXR1cm5zIFRoZSBlbmNvZGVkIGtleSBuYW1lLlxuICAgKi9cbiAgZW5jb2RlS2V5KGtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gc3RhbmRhcmRFbmNvZGluZyhrZXkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuY29kZXMgdGhlIHZhbHVlIG9mIGEgVVJMIHBhcmFtZXRlciBvciBxdWVyeS1zdHJpbmcuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUuXG4gICAqIEByZXR1cm5zIFRoZSBlbmNvZGVkIHZhbHVlLlxuICAgKi9cbiAgZW5jb2RlVmFsdWUodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHN0YW5kYXJkRW5jb2RpbmcodmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlY29kZXMgYW4gZW5jb2RlZCBVUkwgcGFyYW1ldGVyIG9yIHF1ZXJ5LXN0cmluZyBrZXkuXG4gICAqIEBwYXJhbSBrZXkgVGhlIGVuY29kZWQga2V5IG5hbWUuXG4gICAqIEByZXR1cm5zIFRoZSBkZWNvZGVkIGtleSBuYW1lLlxuICAgKi9cbiAgZGVjb2RlS2V5KGtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGtleSk7XG4gIH1cblxuICAvKipcbiAgICogRGVjb2RlcyBhbiBlbmNvZGVkIFVSTCBwYXJhbWV0ZXIgb3IgcXVlcnktc3RyaW5nIHZhbHVlLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIGVuY29kZWQgdmFsdWUuXG4gICAqIEByZXR1cm5zIFRoZSBkZWNvZGVkIHZhbHVlLlxuICAgKi9cbiAgZGVjb2RlVmFsdWUodmFsdWU6IHN0cmluZykge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHBhcmFtUGFyc2VyKHJhd1BhcmFtczogc3RyaW5nLCBjb2RlYzogSHR0cFBhcmFtZXRlckNvZGVjKTogTWFwPHN0cmluZywgc3RyaW5nW10+IHtcbiAgY29uc3QgbWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPigpO1xuICBpZiAocmF3UGFyYW1zLmxlbmd0aCA+IDApIHtcbiAgICAvLyBUaGUgYHdpbmRvdy5sb2NhdGlvbi5zZWFyY2hgIGNhbiBiZSB1c2VkIHdoaWxlIGNyZWF0aW5nIGFuIGluc3RhbmNlIG9mIHRoZSBgSHR0cFBhcmFtc2AgY2xhc3NcbiAgICAvLyAoZS5nLiBgbmV3IEh0dHBQYXJhbXMoeyBmcm9tU3RyaW5nOiB3aW5kb3cubG9jYXRpb24uc2VhcmNoIH0pYCkuIFRoZSBgd2luZG93LmxvY2F0aW9uLnNlYXJjaGBcbiAgICAvLyBtYXkgc3RhcnQgd2l0aCB0aGUgYD9gIGNoYXIsIHNvIHdlIHN0cmlwIGl0IGlmIGl0J3MgcHJlc2VudC5cbiAgICBjb25zdCBwYXJhbXM6IHN0cmluZ1tdID0gcmF3UGFyYW1zLnJlcGxhY2UoL15cXD8vLCAnJykuc3BsaXQoJyYnKTtcbiAgICBwYXJhbXMuZm9yRWFjaCgocGFyYW06IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgZXFJZHggPSBwYXJhbS5pbmRleE9mKCc9Jyk7XG4gICAgICBjb25zdCBba2V5LCB2YWxdOiBzdHJpbmdbXSA9XG4gICAgICAgIGVxSWR4ID09IC0xXG4gICAgICAgICAgPyBbY29kZWMuZGVjb2RlS2V5KHBhcmFtKSwgJyddXG4gICAgICAgICAgOiBbY29kZWMuZGVjb2RlS2V5KHBhcmFtLnNsaWNlKDAsIGVxSWR4KSksIGNvZGVjLmRlY29kZVZhbHVlKHBhcmFtLnNsaWNlKGVxSWR4ICsgMSkpXTtcbiAgICAgIGNvbnN0IGxpc3QgPSBtYXAuZ2V0KGtleSkgfHwgW107XG4gICAgICBsaXN0LnB1c2godmFsKTtcbiAgICAgIG1hcC5zZXQoa2V5LCBsaXN0KTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gbWFwO1xufVxuXG4vKipcbiAqIEVuY29kZSBpbnB1dCBzdHJpbmcgd2l0aCBzdGFuZGFyZCBlbmNvZGVVUklDb21wb25lbnQgYW5kIHRoZW4gdW4tZW5jb2RlIHNwZWNpZmljIGNoYXJhY3RlcnMuXG4gKi9cbmNvbnN0IFNUQU5EQVJEX0VOQ09ESU5HX1JFR0VYID0gLyUoXFxkW2EtZjAtOV0pL2dpO1xuY29uc3QgU1RBTkRBUkRfRU5DT0RJTkdfUkVQTEFDRU1FTlRTOiB7W3g6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICc0MCc6ICdAJyxcbiAgJzNBJzogJzonLFxuICAnMjQnOiAnJCcsXG4gICcyQyc6ICcsJyxcbiAgJzNCJzogJzsnLFxuICAnM0QnOiAnPScsXG4gICczRic6ICc/JyxcbiAgJzJGJzogJy8nLFxufTtcblxuZnVuY3Rpb24gc3RhbmRhcmRFbmNvZGluZyh2OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHYpLnJlcGxhY2UoXG4gICAgU1RBTkRBUkRfRU5DT0RJTkdfUkVHRVgsXG4gICAgKHMsIHQpID0+IFNUQU5EQVJEX0VOQ09ESU5HX1JFUExBQ0VNRU5UU1t0XSA/PyBzLFxuICApO1xufVxuXG5mdW5jdGlvbiB2YWx1ZVRvU3RyaW5nKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke3ZhbHVlfWA7XG59XG5cbmludGVyZmFjZSBVcGRhdGUge1xuICBwYXJhbTogc3RyaW5nO1xuICB2YWx1ZT86IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW47XG4gIG9wOiAnYScgfCAnZCcgfCAncyc7XG59XG5cbi8qKlxuICogT3B0aW9ucyB1c2VkIHRvIGNvbnN0cnVjdCBhbiBgSHR0cFBhcmFtc2AgaW5zdGFuY2UuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEh0dHBQYXJhbXNPcHRpb25zIHtcbiAgLyoqXG4gICAqIFN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgSFRUUCBwYXJhbWV0ZXJzIGluIFVSTC1xdWVyeS1zdHJpbmcgZm9ybWF0LlxuICAgKiBNdXR1YWxseSBleGNsdXNpdmUgd2l0aCBgZnJvbU9iamVjdGAuXG4gICAqL1xuICBmcm9tU3RyaW5nPzogc3RyaW5nO1xuXG4gIC8qKiBPYmplY3QgbWFwIG9mIHRoZSBIVFRQIHBhcmFtZXRlcnMuIE11dHVhbGx5IGV4Y2x1c2l2ZSB3aXRoIGBmcm9tU3RyaW5nYC4gKi9cbiAgZnJvbU9iamVjdD86IHtcbiAgICBbcGFyYW06IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCBSZWFkb25seUFycmF5PHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4+O1xuICB9O1xuXG4gIC8qKiBFbmNvZGluZyBjb2RlYyB1c2VkIHRvIHBhcnNlIGFuZCBzZXJpYWxpemUgdGhlIHBhcmFtZXRlcnMuICovXG4gIGVuY29kZXI/OiBIdHRwUGFyYW1ldGVyQ29kZWM7XG59XG5cbi8qKlxuICogQW4gSFRUUCByZXF1ZXN0L3Jlc3BvbnNlIGJvZHkgdGhhdCByZXByZXNlbnRzIHNlcmlhbGl6ZWQgcGFyYW1ldGVycyxcbiAqIHBlciB0aGUgTUlNRSB0eXBlIGBhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRgLlxuICpcbiAqIFRoaXMgY2xhc3MgaXMgaW1tdXRhYmxlOyBhbGwgbXV0YXRpb24gb3BlcmF0aW9ucyByZXR1cm4gYSBuZXcgaW5zdGFuY2UuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgSHR0cFBhcmFtcyB7XG4gIHByaXZhdGUgbWFwOiBNYXA8c3RyaW5nLCBzdHJpbmdbXT4gfCBudWxsO1xuICBwcml2YXRlIGVuY29kZXI6IEh0dHBQYXJhbWV0ZXJDb2RlYztcbiAgcHJpdmF0ZSB1cGRhdGVzOiBVcGRhdGVbXSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGNsb25lRnJvbTogSHR0cFBhcmFtcyB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEh0dHBQYXJhbXNPcHRpb25zID0ge30gYXMgSHR0cFBhcmFtc09wdGlvbnMpIHtcbiAgICB0aGlzLmVuY29kZXIgPSBvcHRpb25zLmVuY29kZXIgfHwgbmV3IEh0dHBVcmxFbmNvZGluZ0NvZGVjKCk7XG4gICAgaWYgKCEhb3B0aW9ucy5mcm9tU3RyaW5nKSB7XG4gICAgICBpZiAoISFvcHRpb25zLmZyb21PYmplY3QpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3Qgc3BlY2lmeSBib3RoIGZyb21TdHJpbmcgYW5kIGZyb21PYmplY3QuYCk7XG4gICAgICB9XG4gICAgICB0aGlzLm1hcCA9IHBhcmFtUGFyc2VyKG9wdGlvbnMuZnJvbVN0cmluZywgdGhpcy5lbmNvZGVyKTtcbiAgICB9IGVsc2UgaWYgKCEhb3B0aW9ucy5mcm9tT2JqZWN0KSB7XG4gICAgICB0aGlzLm1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcbiAgICAgIE9iamVjdC5rZXlzKG9wdGlvbnMuZnJvbU9iamVjdCkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gKG9wdGlvbnMuZnJvbU9iamVjdCBhcyBhbnkpW2tleV07XG4gICAgICAgIC8vIGNvbnZlcnQgdGhlIHZhbHVlcyB0byBzdHJpbmdzXG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUubWFwKHZhbHVlVG9TdHJpbmcpIDogW3ZhbHVlVG9TdHJpbmcodmFsdWUpXTtcbiAgICAgICAgdGhpcy5tYXAhLnNldChrZXksIHZhbHVlcyk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5tYXAgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBvcnRzIHdoZXRoZXIgdGhlIGJvZHkgaW5jbHVkZXMgb25lIG9yIG1vcmUgdmFsdWVzIGZvciBhIGdpdmVuIHBhcmFtZXRlci5cbiAgICogQHBhcmFtIHBhcmFtIFRoZSBwYXJhbWV0ZXIgbmFtZS5cbiAgICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgcGFyYW1ldGVyIGhhcyBvbmUgb3IgbW9yZSB2YWx1ZXMsXG4gICAqIGZhbHNlIGlmIGl0IGhhcyBubyB2YWx1ZSBvciBpcyBub3QgcHJlc2VudC5cbiAgICovXG4gIGhhcyhwYXJhbTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgcmV0dXJuIHRoaXMubWFwIS5oYXMocGFyYW0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgZmlyc3QgdmFsdWUgZm9yIGEgcGFyYW1ldGVyLlxuICAgKiBAcGFyYW0gcGFyYW0gVGhlIHBhcmFtZXRlciBuYW1lLlxuICAgKiBAcmV0dXJucyBUaGUgZmlyc3QgdmFsdWUgb2YgdGhlIGdpdmVuIHBhcmFtZXRlcixcbiAgICogb3IgYG51bGxgIGlmIHRoZSBwYXJhbWV0ZXIgaXMgbm90IHByZXNlbnQuXG4gICAqL1xuICBnZXQocGFyYW06IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIGNvbnN0IHJlcyA9IHRoaXMubWFwIS5nZXQocGFyYW0pO1xuICAgIHJldHVybiAhIXJlcyA/IHJlc1swXSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIGFsbCB2YWx1ZXMgZm9yIGEgIHBhcmFtZXRlci5cbiAgICogQHBhcmFtIHBhcmFtIFRoZSBwYXJhbWV0ZXIgbmFtZS5cbiAgICogQHJldHVybnMgQWxsIHZhbHVlcyBpbiBhIHN0cmluZyBhcnJheSxcbiAgICogb3IgYG51bGxgIGlmIHRoZSBwYXJhbWV0ZXIgbm90IHByZXNlbnQuXG4gICAqL1xuICBnZXRBbGwocGFyYW06IHN0cmluZyk6IHN0cmluZ1tdIHwgbnVsbCB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgcmV0dXJuIHRoaXMubWFwIS5nZXQocGFyYW0pIHx8IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIGFsbCB0aGUgcGFyYW1ldGVycyBmb3IgdGhpcyBib2R5LlxuICAgKiBAcmV0dXJucyBUaGUgcGFyYW1ldGVyIG5hbWVzIGluIGEgc3RyaW5nIGFycmF5LlxuICAgKi9cbiAga2V5cygpOiBzdHJpbmdbXSB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5tYXAhLmtleXMoKSk7XG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kcyBhIG5ldyB2YWx1ZSB0byBleGlzdGluZyB2YWx1ZXMgZm9yIGEgcGFyYW1ldGVyLlxuICAgKiBAcGFyYW0gcGFyYW0gVGhlIHBhcmFtZXRlciBuYW1lLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIG5ldyB2YWx1ZSB0byBhZGQuXG4gICAqIEByZXR1cm4gQSBuZXcgYm9keSB3aXRoIHRoZSBhcHBlbmRlZCB2YWx1ZS5cbiAgICovXG4gIGFwcGVuZChwYXJhbTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbik6IEh0dHBQYXJhbXMge1xuICAgIHJldHVybiB0aGlzLmNsb25lKHtwYXJhbSwgdmFsdWUsIG9wOiAnYSd9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGEgbmV3IGJvZHkgd2l0aCBhcHBlbmRlZCB2YWx1ZXMgZm9yIHRoZSBnaXZlbiBwYXJhbWV0ZXIgbmFtZS5cbiAgICogQHBhcmFtIHBhcmFtcyBwYXJhbWV0ZXJzIGFuZCB2YWx1ZXNcbiAgICogQHJldHVybiBBIG5ldyBib2R5IHdpdGggdGhlIG5ldyB2YWx1ZS5cbiAgICovXG4gIGFwcGVuZEFsbChwYXJhbXM6IHtcbiAgICBbcGFyYW06IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCBSZWFkb25seUFycmF5PHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4+O1xuICB9KTogSHR0cFBhcmFtcyB7XG4gICAgY29uc3QgdXBkYXRlczogVXBkYXRlW10gPSBbXTtcbiAgICBPYmplY3Qua2V5cyhwYXJhbXMpLmZvckVhY2goKHBhcmFtKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHBhcmFtc1twYXJhbV07XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUuZm9yRWFjaCgoX3ZhbHVlKSA9PiB7XG4gICAgICAgICAgdXBkYXRlcy5wdXNoKHtwYXJhbSwgdmFsdWU6IF92YWx1ZSwgb3A6ICdhJ30pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVwZGF0ZXMucHVzaCh7cGFyYW0sIHZhbHVlOiB2YWx1ZSBhcyBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuLCBvcDogJ2EnfSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuY2xvbmUodXBkYXRlcyk7XG4gIH1cblxuICAvKipcbiAgICogUmVwbGFjZXMgdGhlIHZhbHVlIGZvciBhIHBhcmFtZXRlci5cbiAgICogQHBhcmFtIHBhcmFtIFRoZSBwYXJhbWV0ZXIgbmFtZS5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSBuZXcgdmFsdWUuXG4gICAqIEByZXR1cm4gQSBuZXcgYm9keSB3aXRoIHRoZSBuZXcgdmFsdWUuXG4gICAqL1xuICBzZXQocGFyYW06IHN0cmluZywgdmFsdWU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4pOiBIdHRwUGFyYW1zIHtcbiAgICByZXR1cm4gdGhpcy5jbG9uZSh7cGFyYW0sIHZhbHVlLCBvcDogJ3MnfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhIGdpdmVuIHZhbHVlIG9yIGFsbCB2YWx1ZXMgZnJvbSBhIHBhcmFtZXRlci5cbiAgICogQHBhcmFtIHBhcmFtIFRoZSBwYXJhbWV0ZXIgbmFtZS5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byByZW1vdmUsIGlmIHByb3ZpZGVkLlxuICAgKiBAcmV0dXJuIEEgbmV3IGJvZHkgd2l0aCB0aGUgZ2l2ZW4gdmFsdWUgcmVtb3ZlZCwgb3Igd2l0aCBhbGwgdmFsdWVzXG4gICAqIHJlbW92ZWQgaWYgbm8gdmFsdWUgaXMgc3BlY2lmaWVkLlxuICAgKi9cbiAgZGVsZXRlKHBhcmFtOiBzdHJpbmcsIHZhbHVlPzogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbik6IEh0dHBQYXJhbXMge1xuICAgIHJldHVybiB0aGlzLmNsb25lKHtwYXJhbSwgdmFsdWUsIG9wOiAnZCd9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXJpYWxpemVzIHRoZSBib2R5IHRvIGFuIGVuY29kZWQgc3RyaW5nLCB3aGVyZSBrZXktdmFsdWUgcGFpcnMgKHNlcGFyYXRlZCBieSBgPWApIGFyZVxuICAgKiBzZXBhcmF0ZWQgYnkgYCZgcy5cbiAgICovXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMua2V5cygpXG4gICAgICAgIC5tYXAoKGtleSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGVLZXkgPSB0aGlzLmVuY29kZXIuZW5jb2RlS2V5KGtleSk7XG4gICAgICAgICAgLy8gYGE6IFsnMSddYCBwcm9kdWNlcyBgJ2E9MSdgXG4gICAgICAgICAgLy8gYGI6IFtdYCBwcm9kdWNlcyBgJydgXG4gICAgICAgICAgLy8gYGM6IFsnMScsICcyJ11gIHByb2R1Y2VzIGAnYz0xJmM9MidgXG4gICAgICAgICAgcmV0dXJuIHRoaXMubWFwIS5nZXQoa2V5KSFcbiAgICAgICAgICAgIC5tYXAoKHZhbHVlKSA9PiBlS2V5ICsgJz0nICsgdGhpcy5lbmNvZGVyLmVuY29kZVZhbHVlKHZhbHVlKSlcbiAgICAgICAgICAgIC5qb2luKCcmJyk7XG4gICAgICAgIH0pXG4gICAgICAgIC8vIGZpbHRlciBvdXQgZW1wdHkgdmFsdWVzIGJlY2F1c2UgYGI6IFtdYCBwcm9kdWNlcyBgJydgXG4gICAgICAgIC8vIHdoaWNoIHJlc3VsdHMgaW4gYGE9MSYmYz0xJmM9MmAgaW5zdGVhZCBvZiBgYT0xJmM9MSZjPTJgIGlmIHdlIGRvbid0XG4gICAgICAgIC5maWx0ZXIoKHBhcmFtKSA9PiBwYXJhbSAhPT0gJycpXG4gICAgICAgIC5qb2luKCcmJylcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBjbG9uZSh1cGRhdGU6IFVwZGF0ZSB8IFVwZGF0ZVtdKTogSHR0cFBhcmFtcyB7XG4gICAgY29uc3QgY2xvbmUgPSBuZXcgSHR0cFBhcmFtcyh7ZW5jb2RlcjogdGhpcy5lbmNvZGVyfSBhcyBIdHRwUGFyYW1zT3B0aW9ucyk7XG4gICAgY2xvbmUuY2xvbmVGcm9tID0gdGhpcy5jbG9uZUZyb20gfHwgdGhpcztcbiAgICBjbG9uZS51cGRhdGVzID0gKHRoaXMudXBkYXRlcyB8fCBbXSkuY29uY2F0KHVwZGF0ZSk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0KCkge1xuICAgIGlmICh0aGlzLm1hcCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5tYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLmNsb25lRnJvbSAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5jbG9uZUZyb20uaW5pdCgpO1xuICAgICAgdGhpcy5jbG9uZUZyb20ua2V5cygpLmZvckVhY2goKGtleSkgPT4gdGhpcy5tYXAhLnNldChrZXksIHRoaXMuY2xvbmVGcm9tIS5tYXAhLmdldChrZXkpISkpO1xuICAgICAgdGhpcy51cGRhdGVzIS5mb3JFYWNoKCh1cGRhdGUpID0+IHtcbiAgICAgICAgc3dpdGNoICh1cGRhdGUub3ApIHtcbiAgICAgICAgICBjYXNlICdhJzpcbiAgICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgICAgIGNvbnN0IGJhc2UgPSAodXBkYXRlLm9wID09PSAnYScgPyB0aGlzLm1hcCEuZ2V0KHVwZGF0ZS5wYXJhbSkgOiB1bmRlZmluZWQpIHx8IFtdO1xuICAgICAgICAgICAgYmFzZS5wdXNoKHZhbHVlVG9TdHJpbmcodXBkYXRlLnZhbHVlISkpO1xuICAgICAgICAgICAgdGhpcy5tYXAhLnNldCh1cGRhdGUucGFyYW0sIGJhc2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICBpZiAodXBkYXRlLnZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgbGV0IGJhc2UgPSB0aGlzLm1hcCEuZ2V0KHVwZGF0ZS5wYXJhbSkgfHwgW107XG4gICAgICAgICAgICAgIGNvbnN0IGlkeCA9IGJhc2UuaW5kZXhPZih2YWx1ZVRvU3RyaW5nKHVwZGF0ZS52YWx1ZSkpO1xuICAgICAgICAgICAgICBpZiAoaWR4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGJhc2Uuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGJhc2UubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubWFwIS5zZXQodXBkYXRlLnBhcmFtLCBiYXNlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcCEuZGVsZXRlKHVwZGF0ZS5wYXJhbSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMubWFwIS5kZWxldGUodXBkYXRlLnBhcmFtKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5jbG9uZUZyb20gPSB0aGlzLnVwZGF0ZXMgPSBudWxsO1xuICAgIH1cbiAgfVxufVxuIl19