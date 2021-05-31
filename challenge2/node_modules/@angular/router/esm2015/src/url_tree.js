/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { convertToParamMap, PRIMARY_OUTLET } from './shared';
import { equalArraysOrString, forEach, shallowEqual } from './utils/collection';
export function createEmptyUrlTree() {
    return new UrlTree(new UrlSegmentGroup([], {}), {}, null);
}
const pathCompareMap = {
    'exact': equalSegmentGroups,
    'subset': containsSegmentGroup,
};
const paramCompareMap = {
    'exact': equalParams,
    'subset': containsParams,
    'ignored': () => true,
};
export function containsTree(container, containee, options) {
    return pathCompareMap[options.paths](container.root, containee.root, options.matrixParams) &&
        paramCompareMap[options.queryParams](container.queryParams, containee.queryParams) &&
        !(options.fragment === 'exact' && container.fragment !== containee.fragment);
}
function equalParams(container, containee) {
    // TODO: This does not handle array params correctly.
    return shallowEqual(container, containee);
}
function equalSegmentGroups(container, containee, matrixParams) {
    if (!equalPath(container.segments, containee.segments))
        return false;
    if (!matrixParamsMatch(container.segments, containee.segments, matrixParams)) {
        return false;
    }
    if (container.numberOfChildren !== containee.numberOfChildren)
        return false;
    for (const c in containee.children) {
        if (!container.children[c])
            return false;
        if (!equalSegmentGroups(container.children[c], containee.children[c], matrixParams))
            return false;
    }
    return true;
}
function containsParams(container, containee) {
    return Object.keys(containee).length <= Object.keys(container).length &&
        Object.keys(containee).every(key => equalArraysOrString(container[key], containee[key]));
}
function containsSegmentGroup(container, containee, matrixParams) {
    return containsSegmentGroupHelper(container, containee, containee.segments, matrixParams);
}
function containsSegmentGroupHelper(container, containee, containeePaths, matrixParams) {
    if (container.segments.length > containeePaths.length) {
        const current = container.segments.slice(0, containeePaths.length);
        if (!equalPath(current, containeePaths))
            return false;
        if (containee.hasChildren())
            return false;
        if (!matrixParamsMatch(current, containeePaths, matrixParams))
            return false;
        return true;
    }
    else if (container.segments.length === containeePaths.length) {
        if (!equalPath(container.segments, containeePaths))
            return false;
        if (!matrixParamsMatch(container.segments, containeePaths, matrixParams))
            return false;
        for (const c in containee.children) {
            if (!container.children[c])
                return false;
            if (!containsSegmentGroup(container.children[c], containee.children[c], matrixParams)) {
                return false;
            }
        }
        return true;
    }
    else {
        const current = containeePaths.slice(0, container.segments.length);
        const next = containeePaths.slice(container.segments.length);
        if (!equalPath(container.segments, current))
            return false;
        if (!matrixParamsMatch(container.segments, current, matrixParams))
            return false;
        if (!container.children[PRIMARY_OUTLET])
            return false;
        return containsSegmentGroupHelper(container.children[PRIMARY_OUTLET], containee, next, matrixParams);
    }
}
function matrixParamsMatch(containerPaths, containeePaths, options) {
    return containeePaths.every((containeeSegment, i) => {
        return paramCompareMap[options](containerPaths[i].parameters, containeeSegment.parameters);
    });
}
/**
 * @description
 *
 * Represents the parsed URL.
 *
 * Since a router state is a tree, and the URL is nothing but a serialized state, the URL is a
 * serialized tree.
 * UrlTree is a data structure that provides a lot of affordances in dealing with URLs
 *
 * @usageNotes
 * ### Example
 *
 * ```
 * @Component({templateUrl:'template.html'})
 * class MyComponent {
 *   constructor(router: Router) {
 *     const tree: UrlTree =
 *       router.parseUrl('/team/33/(user/victor//support:help)?debug=true#fragment');
 *     const f = tree.fragment; // return 'fragment'
 *     const q = tree.queryParams; // returns {debug: 'true'}
 *     const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
 *     const s: UrlSegment[] = g.segments; // returns 2 segments 'team' and '33'
 *     g.children[PRIMARY_OUTLET].segments; // returns 2 segments 'user' and 'victor'
 *     g.children['support'].segments; // return 1 segment 'help'
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export class UrlTree {
    /** @internal */
    constructor(
    /** The root segment group of the URL tree */
    root, 
    /** The query params of the URL */
    queryParams, 
    /** The fragment of the URL */
    fragment) {
        this.root = root;
        this.queryParams = queryParams;
        this.fragment = fragment;
    }
    get queryParamMap() {
        if (!this._queryParamMap) {
            this._queryParamMap = convertToParamMap(this.queryParams);
        }
        return this._queryParamMap;
    }
    /** @docsNotRequired */
    toString() {
        return DEFAULT_SERIALIZER.serialize(this);
    }
}
/**
 * @description
 *
 * Represents the parsed URL segment group.
 *
 * See `UrlTree` for more information.
 *
 * @publicApi
 */
export class UrlSegmentGroup {
    constructor(
    /** The URL segments of this group. See `UrlSegment` for more information */
    segments, 
    /** The list of children of this group */
    children) {
        this.segments = segments;
        this.children = children;
        /** The parent node in the url tree */
        this.parent = null;
        forEach(children, (v, k) => v.parent = this);
    }
    /** Whether the segment has child segments */
    hasChildren() {
        return this.numberOfChildren > 0;
    }
    /** Number of child segments */
    get numberOfChildren() {
        return Object.keys(this.children).length;
    }
    /** @docsNotRequired */
    toString() {
        return serializePaths(this);
    }
}
/**
 * @description
 *
 * Represents a single URL segment.
 *
 * A UrlSegment is a part of a URL between the two slashes. It contains a path and the matrix
 * parameters associated with the segment.
 *
 * @usageNotes
 * ### Example
 *
 * ```
 * @Component({templateUrl:'template.html'})
 * class MyComponent {
 *   constructor(router: Router) {
 *     const tree: UrlTree = router.parseUrl('/team;id=33');
 *     const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
 *     const s: UrlSegment[] = g.segments;
 *     s[0].path; // returns 'team'
 *     s[0].parameters; // returns {id: 33}
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export class UrlSegment {
    constructor(
    /** The path part of a URL segment */
    path, 
    /** The matrix parameters associated with a segment */
    parameters) {
        this.path = path;
        this.parameters = parameters;
    }
    get parameterMap() {
        if (!this._parameterMap) {
            this._parameterMap = convertToParamMap(this.parameters);
        }
        return this._parameterMap;
    }
    /** @docsNotRequired */
    toString() {
        return serializePath(this);
    }
}
export function equalSegments(as, bs) {
    return equalPath(as, bs) && as.every((a, i) => shallowEqual(a.parameters, bs[i].parameters));
}
export function equalPath(as, bs) {
    if (as.length !== bs.length)
        return false;
    return as.every((a, i) => a.path === bs[i].path);
}
export function mapChildrenIntoArray(segment, fn) {
    let res = [];
    forEach(segment.children, (child, childOutlet) => {
        if (childOutlet === PRIMARY_OUTLET) {
            res = res.concat(fn(child, childOutlet));
        }
    });
    forEach(segment.children, (child, childOutlet) => {
        if (childOutlet !== PRIMARY_OUTLET) {
            res = res.concat(fn(child, childOutlet));
        }
    });
    return res;
}
/**
 * @description
 *
 * Serializes and deserializes a URL string into a URL tree.
 *
 * The url serialization strategy is customizable. You can
 * make all URLs case insensitive by providing a custom UrlSerializer.
 *
 * See `DefaultUrlSerializer` for an example of a URL serializer.
 *
 * @publicApi
 */
export class UrlSerializer {
}
/**
 * @description
 *
 * A default implementation of the `UrlSerializer`.
 *
 * Example URLs:
 *
 * ```
 * /inbox/33(popup:compose)
 * /inbox/33;open=true/messages/44
 * ```
 *
 * DefaultUrlSerializer uses parentheses to serialize secondary segments (e.g., popup:compose), the
 * colon syntax to specify the outlet, and the ';parameter=value' syntax (e.g., open=true) to
 * specify route specific parameters.
 *
 * @publicApi
 */
export class DefaultUrlSerializer {
    /** Parses a url into a `UrlTree` */
    parse(url) {
        const p = new UrlParser(url);
        return new UrlTree(p.parseRootSegment(), p.parseQueryParams(), p.parseFragment());
    }
    /** Converts a `UrlTree` into a url */
    serialize(tree) {
        const segment = `/${serializeSegment(tree.root, true)}`;
        const query = serializeQueryParams(tree.queryParams);
        const fragment = typeof tree.fragment === `string` ? `#${encodeUriFragment(tree.fragment)}` : '';
        return `${segment}${query}${fragment}`;
    }
}
const DEFAULT_SERIALIZER = new DefaultUrlSerializer();
export function serializePaths(segment) {
    return segment.segments.map(p => serializePath(p)).join('/');
}
function serializeSegment(segment, root) {
    if (!segment.hasChildren()) {
        return serializePaths(segment);
    }
    if (root) {
        const primary = segment.children[PRIMARY_OUTLET] ?
            serializeSegment(segment.children[PRIMARY_OUTLET], false) :
            '';
        const children = [];
        forEach(segment.children, (v, k) => {
            if (k !== PRIMARY_OUTLET) {
                children.push(`${k}:${serializeSegment(v, false)}`);
            }
        });
        return children.length > 0 ? `${primary}(${children.join('//')})` : primary;
    }
    else {
        const children = mapChildrenIntoArray(segment, (v, k) => {
            if (k === PRIMARY_OUTLET) {
                return [serializeSegment(segment.children[PRIMARY_OUTLET], false)];
            }
            return [`${k}:${serializeSegment(v, false)}`];
        });
        // use no parenthesis if the only child is a primary outlet route
        if (Object.keys(segment.children).length === 1 && segment.children[PRIMARY_OUTLET] != null) {
            return `${serializePaths(segment)}/${children[0]}`;
        }
        return `${serializePaths(segment)}/(${children.join('//')})`;
    }
}
/**
 * Encodes a URI string with the default encoding. This function will only ever be called from
 * `encodeUriQuery` or `encodeUriSegment` as it's the base set of encodings to be used. We need
 * a custom encoding because encodeURIComponent is too aggressive and encodes stuff that doesn't
 * have to be encoded per https://url.spec.whatwg.org.
 */
function encodeUriString(s) {
    return encodeURIComponent(s)
        .replace(/%40/g, '@')
        .replace(/%3A/gi, ':')
        .replace(/%24/g, '$')
        .replace(/%2C/gi, ',');
}
/**
 * This function should be used to encode both keys and values in a query string key/value. In
 * the following URL, you need to call encodeUriQuery on "k" and "v":
 *
 * http://www.site.org/html;mk=mv?k=v#f
 */
export function encodeUriQuery(s) {
    return encodeUriString(s).replace(/%3B/gi, ';');
}
/**
 * This function should be used to encode a URL fragment. In the following URL, you need to call
 * encodeUriFragment on "f":
 *
 * http://www.site.org/html;mk=mv?k=v#f
 */
export function encodeUriFragment(s) {
    return encodeURI(s);
}
/**
 * This function should be run on any URI segment as well as the key and value in a key/value
 * pair for matrix params. In the following URL, you need to call encodeUriSegment on "html",
 * "mk", and "mv":
 *
 * http://www.site.org/html;mk=mv?k=v#f
 */
export function encodeUriSegment(s) {
    return encodeUriString(s).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/%26/gi, '&');
}
export function decode(s) {
    return decodeURIComponent(s);
}
// Query keys/values should have the "+" replaced first, as "+" in a query string is " ".
// decodeURIComponent function will not decode "+" as a space.
export function decodeQuery(s) {
    return decode(s.replace(/\+/g, '%20'));
}
export function serializePath(path) {
    return `${encodeUriSegment(path.path)}${serializeMatrixParams(path.parameters)}`;
}
function serializeMatrixParams(params) {
    return Object.keys(params)
        .map(key => `;${encodeUriSegment(key)}=${encodeUriSegment(params[key])}`)
        .join('');
}
function serializeQueryParams(params) {
    const strParams = Object.keys(params).map((name) => {
        const value = params[name];
        return Array.isArray(value) ?
            value.map(v => `${encodeUriQuery(name)}=${encodeUriQuery(v)}`).join('&') :
            `${encodeUriQuery(name)}=${encodeUriQuery(value)}`;
    });
    return strParams.length ? `?${strParams.join('&')}` : '';
}
const SEGMENT_RE = /^[^\/()?;=#]+/;
function matchSegments(str) {
    const match = str.match(SEGMENT_RE);
    return match ? match[0] : '';
}
const QUERY_PARAM_RE = /^[^=?&#]+/;
// Return the name of the query param at the start of the string or an empty string
function matchQueryParams(str) {
    const match = str.match(QUERY_PARAM_RE);
    return match ? match[0] : '';
}
const QUERY_PARAM_VALUE_RE = /^[^?&#]+/;
// Return the value of the query param at the start of the string or an empty string
function matchUrlQueryParamValue(str) {
    const match = str.match(QUERY_PARAM_VALUE_RE);
    return match ? match[0] : '';
}
class UrlParser {
    constructor(url) {
        this.url = url;
        this.remaining = url;
    }
    parseRootSegment() {
        this.consumeOptional('/');
        if (this.remaining === '' || this.peekStartsWith('?') || this.peekStartsWith('#')) {
            return new UrlSegmentGroup([], {});
        }
        // The root segment group never has segments
        return new UrlSegmentGroup([], this.parseChildren());
    }
    parseQueryParams() {
        const params = {};
        if (this.consumeOptional('?')) {
            do {
                this.parseQueryParam(params);
            } while (this.consumeOptional('&'));
        }
        return params;
    }
    parseFragment() {
        return this.consumeOptional('#') ? decodeURIComponent(this.remaining) : null;
    }
    parseChildren() {
        if (this.remaining === '') {
            return {};
        }
        this.consumeOptional('/');
        const segments = [];
        if (!this.peekStartsWith('(')) {
            segments.push(this.parseSegment());
        }
        while (this.peekStartsWith('/') && !this.peekStartsWith('//') && !this.peekStartsWith('/(')) {
            this.capture('/');
            segments.push(this.parseSegment());
        }
        let children = {};
        if (this.peekStartsWith('/(')) {
            this.capture('/');
            children = this.parseParens(true);
        }
        let res = {};
        if (this.peekStartsWith('(')) {
            res = this.parseParens(false);
        }
        if (segments.length > 0 || Object.keys(children).length > 0) {
            res[PRIMARY_OUTLET] = new UrlSegmentGroup(segments, children);
        }
        return res;
    }
    // parse a segment with its matrix parameters
    // ie `name;k1=v1;k2`
    parseSegment() {
        const path = matchSegments(this.remaining);
        if (path === '' && this.peekStartsWith(';')) {
            throw new Error(`Empty path url segment cannot have parameters: '${this.remaining}'.`);
        }
        this.capture(path);
        return new UrlSegment(decode(path), this.parseMatrixParams());
    }
    parseMatrixParams() {
        const params = {};
        while (this.consumeOptional(';')) {
            this.parseParam(params);
        }
        return params;
    }
    parseParam(params) {
        const key = matchSegments(this.remaining);
        if (!key) {
            return;
        }
        this.capture(key);
        let value = '';
        if (this.consumeOptional('=')) {
            const valueMatch = matchSegments(this.remaining);
            if (valueMatch) {
                value = valueMatch;
                this.capture(value);
            }
        }
        params[decode(key)] = decode(value);
    }
    // Parse a single query parameter `name[=value]`
    parseQueryParam(params) {
        const key = matchQueryParams(this.remaining);
        if (!key) {
            return;
        }
        this.capture(key);
        let value = '';
        if (this.consumeOptional('=')) {
            const valueMatch = matchUrlQueryParamValue(this.remaining);
            if (valueMatch) {
                value = valueMatch;
                this.capture(value);
            }
        }
        const decodedKey = decodeQuery(key);
        const decodedVal = decodeQuery(value);
        if (params.hasOwnProperty(decodedKey)) {
            // Append to existing values
            let currentVal = params[decodedKey];
            if (!Array.isArray(currentVal)) {
                currentVal = [currentVal];
                params[decodedKey] = currentVal;
            }
            currentVal.push(decodedVal);
        }
        else {
            // Create a new value
            params[decodedKey] = decodedVal;
        }
    }
    // parse `(a/b//outlet_name:c/d)`
    parseParens(allowPrimary) {
        const segments = {};
        this.capture('(');
        while (!this.consumeOptional(')') && this.remaining.length > 0) {
            const path = matchSegments(this.remaining);
            const next = this.remaining[path.length];
            // if is is not one of these characters, then the segment was unescaped
            // or the group was not closed
            if (next !== '/' && next !== ')' && next !== ';') {
                throw new Error(`Cannot parse url '${this.url}'`);
            }
            let outletName = undefined;
            if (path.indexOf(':') > -1) {
                outletName = path.substr(0, path.indexOf(':'));
                this.capture(outletName);
                this.capture(':');
            }
            else if (allowPrimary) {
                outletName = PRIMARY_OUTLET;
            }
            const children = this.parseChildren();
            segments[outletName] = Object.keys(children).length === 1 ? children[PRIMARY_OUTLET] :
                new UrlSegmentGroup([], children);
            this.consumeOptional('//');
        }
        return segments;
    }
    peekStartsWith(str) {
        return this.remaining.startsWith(str);
    }
    // Consumes the prefix when it is present and returns whether it has been consumed
    consumeOptional(str) {
        if (this.peekStartsWith(str)) {
            this.remaining = this.remaining.substring(str.length);
            return true;
        }
        return false;
    }
    capture(str) {
        if (!this.consumeOptional(str)) {
            throw new Error(`Expected "${str}".`);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsX3RyZWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9yb3V0ZXIvc3JjL3VybF90cmVlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxpQkFBaUIsRUFBb0IsY0FBYyxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzdFLE9BQU8sRUFBQyxtQkFBbUIsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFFOUUsTUFBTSxVQUFVLGtCQUFrQjtJQUNoQyxPQUFPLElBQUksT0FBTyxDQUFDLElBQUksZUFBZSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDNUQsQ0FBQztBQXlERCxNQUFNLGNBQWMsR0FBeUQ7SUFDM0UsT0FBTyxFQUFFLGtCQUFrQjtJQUMzQixRQUFRLEVBQUUsb0JBQW9CO0NBQy9CLENBQUM7QUFDRixNQUFNLGVBQWUsR0FBOEM7SUFDakUsT0FBTyxFQUFFLFdBQVc7SUFDcEIsUUFBUSxFQUFFLGNBQWM7SUFDeEIsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUk7Q0FDdEIsQ0FBQztBQUVGLE1BQU0sVUFBVSxZQUFZLENBQ3hCLFNBQWtCLEVBQUUsU0FBa0IsRUFBRSxPQUE2QjtJQUN2RSxPQUFPLGNBQWMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUM7UUFDdEYsZUFBZSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxXQUFXLENBQUM7UUFDbEYsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEtBQUssT0FBTyxJQUFJLFNBQVMsQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFD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LFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixJQUFJLGVBQWUsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDOUYsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM1QjtRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFFTyxjQUFjLENBQUMsR0FBVztRQUNoQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRCxrRkFBa0Y7SUFDMUUsZUFBZSxDQUFDLEdBQVc7UUFDakMsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQzVCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RELE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFTyxPQUFPLENBQUMsR0FBVztRQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM5QixNQUFNLElBQUksS0FBSyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUN2QztJQUNILENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NvbnZlcnRUb1BhcmFtTWFwLCBQYXJhbU1hcCwgUGFyYW1zLCBQUklNQVJZX09VVExFVH0gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHtlcXVhbEFycmF5c09yU3RyaW5nLCBmb3JFYWNoLCBzaGFsbG93RXF1YWx9IGZyb20gJy4vdXRpbHMvY29sbGVjdGlvbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFbXB0eVVybFRyZWUoKSB7XG4gIHJldHVybiBuZXcgVXJsVHJlZShuZXcgVXJsU2VnbWVudEdyb3VwKFtdLCB7fSksIHt9LCBudWxsKTtcbn1cblxuLyoqXG4gKiBBIHNldCBvZiBvcHRpb25zIHdoaWNoIHNwZWNpZnkgaG93IHRvIGRldGVybWluZSBpZiBhIGBVcmxUcmVlYCBpcyBhY3RpdmUsIGdpdmVuIHRoZSBgVXJsVHJlZWBcbiAqIGZvciB0aGUgY3VycmVudCByb3V0ZXIgc3RhdGUuXG4gKlxuICogQHB1YmxpY0FwaVxuICogQHNlZSBSb3V0ZXIuaXNBY3RpdmVcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJc0FjdGl2ZU1hdGNoT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBEZWZpbmVzIHRoZSBzdHJhdGVneSBmb3IgY29tcGFyaW5nIHRoZSBtYXRyaXggcGFyYW1ldGVycyBvZiB0d28gYFVybFRyZWVgcy5cbiAgICpcbiAgICogVGhlIG1hdHJpeCBwYXJhbWV0ZXIgbWF0Y2hpbmcgaXMgZGVwZW5kZW50IG9uIHRoZSBzdHJhdGVneSBmb3IgbWF0Y2hpbmcgdGhlXG4gICAqIHNlZ21lbnRzLiBUaGF0IGlzLCBpZiB0aGUgYHBhdGhzYCBvcHRpb24gaXMgc2V0IHRvIGAnc3Vic2V0J2AsIG9ubHlcbiAgICogdGhlIG1hdHJpeCBwYXJhbWV0ZXJzIG9mIHRoZSBtYXRjaGluZyBzZWdtZW50cyB3aWxsIGJlIGNvbXBhcmVkLlxuICAgKlxuICAgKiAtIGAnZXhhY3QnYDogUmVxdWlyZXMgdGhhdCBtYXRjaGluZyBzZWdtZW50cyBhbHNvIGhhdmUgZXhhY3QgbWF0cml4IHBhcmFtZXRlclxuICAgKiBtYXRjaGVzLlxuICAgKiAtIGAnc3Vic2V0J2A6IFRoZSBtYXRjaGluZyBzZWdtZW50cyBpbiB0aGUgcm91dGVyJ3MgYWN0aXZlIGBVcmxUcmVlYCBtYXkgY29udGFpblxuICAgKiBleHRyYSBtYXRyaXggcGFyYW1ldGVycywgYnV0IHRob3NlIHRoYXQgZXhpc3QgaW4gdGhlIGBVcmxUcmVlYCBpbiBxdWVzdGlvbiBtdXN0IG1hdGNoLlxuICAgKiAtIGAnaWdub3JlZCdgOiBXaGVuIGNvbXBhcmluZyBgVXJsVHJlZWBzLCBtYXRyaXggcGFyYW1zIHdpbGwgYmUgaWdub3JlZC5cbiAgICovXG4gIG1hdHJpeFBhcmFtczogJ2V4YWN0J3wnc3Vic2V0J3wnaWdub3JlZCc7XG4gIC8qKlxuICAgKiBEZWZpbmVzIHRoZSBzdHJhdGVneSBmb3IgY29tcGFyaW5nIHRoZSBxdWVyeSBwYXJhbWV0ZXJzIG9mIHR3byBgVXJsVHJlZWBzLlxuICAgKlxuICAgKiAtIGAnZXhhY3QnYDogdGhlIHF1ZXJ5IHBhcmFtZXRlcnMgbXVzdCBtYXRjaCBleGFjdGx5LlxuICAgKiAtIGAnc3Vic2V0J2A6IHRoZSBhY3RpdmUgYFVybFRyZWVgIG1heSBjb250YWluIGV4dHJhIHBhcmFtZXRlcnMsXG4gICAqIGJ1dCBtdXN0IG1hdGNoIHRoZSBrZXkgYW5kIHZhbHVlIG9mIGFueSB0aGF0IGV4aXN0IGluIHRoZSBgVXJsVHJlZWAgaW4gcXVlc3Rpb24uXG4gICAqIC0gYCdpZ25vcmVkJ2A6IFdoZW4gY29tcGFyaW5nIGBVcmxUcmVlYHMsIHF1ZXJ5IHBhcmFtcyB3aWxsIGJlIGlnbm9yZWQuXG4gICAqL1xuICBxdWVyeVBhcmFtczogJ2V4YWN0J3wnc3Vic2V0J3wnaWdub3JlZCc7XG4gIC8qKlxuICAgKiBEZWZpbmVzIHRoZSBzdHJhdGVneSBmb3IgY29tcGFyaW5nIHRoZSBgVXJsU2VnbWVudGBzIG9mIHRoZSBgVXJsVHJlZWBzLlxuICAgKlxuICAgKiAtIGAnZXhhY3QnYDogYWxsIHNlZ21lbnRzIGluIGVhY2ggYFVybFRyZWVgIG11c3QgbWF0Y2guXG4gICAqIC0gYCdzdWJzZXQnYDogYSBgVXJsVHJlZWAgd2lsbCBiZSBkZXRlcm1pbmVkIHRvIGJlIGFjdGl2ZSBpZiBpdFxuICAgKiBpcyBhIHN1YnRyZWUgb2YgdGhlIGFjdGl2ZSByb3V0ZS4gVGhhdCBpcywgdGhlIGFjdGl2ZSByb3V0ZSBtYXkgY29udGFpbiBleHRyYVxuICAgKiBzZWdtZW50cywgYnV0IG11c3QgYXQgbGVhc3QgaGF2ZSBhbGwgdGhlIHNlZ2VtZW50cyBvZiB0aGUgYFVybFRyZWVgIGluIHF1ZXN0aW9uLlxuICAgKi9cbiAgcGF0aHM6ICdleGFjdCd8J3N1YnNldCc7XG4gIC8qKlxuICAgKiAtICdleGFjdCdgOiBpbmRpY2F0ZXMgdGhhdCB0aGUgYFVybFRyZWVgIGZyYWdtZW50cyBtdXN0IGJlIGVxdWFsLlxuICAgKiAtIGAnaWdub3JlZCdgOiB0aGUgZnJhZ21lbnRzIHdpbGwgbm90IGJlIGNvbXBhcmVkIHdoZW4gZGV0ZXJtaW5pbmcgaWYgYVxuICAgKiBgVXJsVHJlZWAgaXMgYWN0aXZlLlxuICAgKi9cbiAgZnJhZ21lbnQ6ICdleGFjdCd8J2lnbm9yZWQnO1xufVxuXG50eXBlIFBhcmFtTWF0Y2hPcHRpb25zID0gJ2V4YWN0J3wnc3Vic2V0J3wnaWdub3JlZCc7XG5cbnR5cGUgUGF0aENvbXBhcmVGbiA9XG4gICAgKGNvbnRhaW5lcjogVXJsU2VnbWVudEdyb3VwLCBjb250YWluZWU6IFVybFNlZ21lbnRHcm91cCwgbWF0cml4UGFyYW1zOiBQYXJhbU1hdGNoT3B0aW9ucykgPT5cbiAgICAgICAgYm9vbGVhbjtcbnR5cGUgUGFyYW1Db21wYXJlRm4gPSAoY29udGFpbmVyOiBQYXJhbXMsIGNvbnRhaW5lZTogUGFyYW1zKSA9PiBib29sZWFuO1xuXG5jb25zdCBwYXRoQ29tcGFyZU1hcDogUmVjb3JkPElzQWN0aXZlTWF0Y2hPcHRpb25zWydwYXRocyddLCBQYXRoQ29tcGFyZUZuPiA9IHtcbiAgJ2V4YWN0JzogZXF1YWxTZWdtZW50R3JvdXBzLFxuICAnc3Vic2V0JzogY29udGFpbnNTZWdtZW50R3JvdXAsXG59O1xuY29uc3QgcGFyYW1Db21wYXJlTWFwOiBSZWNvcmQ8UGFyYW1NYXRjaE9wdGlvbnMsIFBhcmFtQ29tcGFyZUZuPiA9IHtcbiAgJ2V4YWN0JzogZXF1YWxQYXJhbXMsXG4gICdzdWJzZXQnOiBjb250YWluc1BhcmFtcyxcbiAgJ2lnbm9yZWQnOiAoKSA9PiB0cnVlLFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnRhaW5zVHJlZShcbiAgICBjb250YWluZXI6IFVybFRyZWUsIGNvbnRhaW5lZTogVXJsVHJlZSwgb3B0aW9uczogSXNBY3RpdmVNYXRjaE9wdGlvbnMpOiBib29sZWFuIHtcbiAgcmV0dXJuIHBhdGhDb21wYXJlTWFwW29wdGlvbnMucGF0aHNdKGNvbnRhaW5lci5yb290LCBjb250YWluZWUucm9vdCwgb3B0aW9ucy5tYXRyaXhQYXJhbXMpICYmXG4gICAgICBwYXJhbUNvbXBhcmVNYXBbb3B0aW9ucy5xdWVyeVBhcmFtc10oY29udGFpbmVyLnF1ZXJ5UGFyYW1zLCBjb250YWluZWUucXVlcnlQYXJhbXMpICYmXG4gICAgICAhKG9wdGlvbnMuZnJhZ21lbnQgPT09ICdleGFjdCcgJiYgY29udGFpbmVyLmZyYWdtZW50ICE9PSBjb250YWluZWUuZnJhZ21lbnQpO1xufVxuXG5mdW5jdGlvbiBlcXVhbFBhcmFtcyhjb250YWluZXI6IFBhcmFtcywgY29udGFpbmVlOiBQYXJhbXMpOiBib29sZWFuIHtcbiAgLy8gVE9ETzogVGhpcyBkb2VzIG5vdCBoYW5kbGUgYXJyYXkgcGFyYW1zIGNvcnJlY3RseS5cbiAgcmV0dXJuIHNoYWxsb3dFcXVhbChjb250YWluZXIsIGNvbnRhaW5lZSk7XG59XG5cbmZ1bmN0aW9uIGVxdWFsU2VnbWVudEdyb3VwcyhcbiAgICBjb250YWluZXI6IFVybFNlZ21lbnRHcm91cCwgY29udGFpbmVlOiBVcmxTZWdtZW50R3JvdXAsXG4gICAgbWF0cml4UGFyYW1zOiBQYXJhbU1hdGNoT3B0aW9ucyk6IGJvb2xlYW4ge1xuICBpZiAoIWVxdWFsUGF0aChjb250YWluZXIuc2VnbWVudHMsIGNvbnRhaW5lZS5zZWdtZW50cykpIHJldHVybiBmYWxzZTtcbiAgaWYgKCFtYXRyaXhQYXJhbXNNYXRjaChjb250YWluZXIuc2VnbWVudHMsIGNvbnRhaW5lZS5zZWdtZW50cywgbWF0cml4UGFyYW1zKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoY29udGFpbmVyLm51bWJlck9mQ2hpbGRyZW4gIT09IGNvbnRhaW5lZS5udW1iZXJPZkNoaWxkcmVuKSByZXR1cm4gZmFsc2U7XG4gIGZvciAoY29uc3QgYyBpbiBjb250YWluZWUuY2hpbGRyZW4pIHtcbiAgICBpZiAoIWNvbnRhaW5lci5jaGlsZHJlbltjXSkgcmV0dXJuIGZhbHNlO1xuICAgIGlmICghZXF1YWxTZWdtZW50R3JvdXBzKGNvbnRhaW5lci5jaGlsZHJlbltjXSwgY29udGFpbmVlLmNoaWxkcmVuW2NdLCBtYXRyaXhQYXJhbXMpKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBjb250YWluc1BhcmFtcyhjb250YWluZXI6IFBhcmFtcywgY29udGFpbmVlOiBQYXJhbXMpOiBib29sZWFuIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGNvbnRhaW5lZSkubGVuZ3RoIDw9IE9iamVjdC5rZXlzKGNvbnRhaW5lcikubGVuZ3RoICYmXG4gICAgICBPYmplY3Qua2V5cyhjb250YWluZWUpLmV2ZXJ5KGtleSA9PiBlcXVhbEFycmF5c09yU3RyaW5nKGNvbnRhaW5lcltrZXldLCBjb250YWluZWVba2V5XSkpO1xufVxuXG5mdW5jdGlvbiBjb250YWluc1NlZ21lbnRHcm91cChcbiAgICBjb250YWluZXI6IFVybFNlZ21lbnRHcm91cCwgY29udGFpbmVlOiBVcmxTZWdtZW50R3JvdXAsXG4gICAgbWF0cml4UGFyYW1zOiBQYXJhbU1hdGNoT3B0aW9ucyk6IGJvb2xlYW4ge1xuICByZXR1cm4gY29udGFpbnNTZWdtZW50R3JvdXBIZWxwZXIoY29udGFpbmVyLCBjb250YWluZWUsIGNvbnRhaW5lZS5zZWdtZW50cywgbWF0cml4UGFyYW1zKTtcbn1cblxuZnVuY3Rpb24gY29udGFpbnNTZWdtZW50R3JvdXBIZWxwZXIoXG4gICAgY29udGFpbmVyOiBVcmxTZWdtZW50R3JvdXAsIGNvbnRhaW5lZTogVXJsU2VnbWVudEdyb3VwLCBjb250YWluZWVQYXRoczogVXJsU2VnbWVudFtdLFxuICAgIG1hdHJpeFBhcmFtczogUGFyYW1NYXRjaE9wdGlvbnMpOiBib29sZWFuIHtcbiAgaWYgKGNvbnRhaW5lci5zZWdtZW50cy5sZW5ndGggPiBjb250YWluZWVQYXRocy5sZW5ndGgpIHtcbiAgICBjb25zdCBjdXJyZW50ID0gY29udGFpbmVyLnNlZ21lbnRzLnNsaWNlKDAsIGNvbnRhaW5lZVBhdGhzLmxlbmd0aCk7XG4gICAgaWYgKCFlcXVhbFBhdGgoY3VycmVudCwgY29udGFpbmVlUGF0aHMpKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKGNvbnRhaW5lZS5oYXNDaGlsZHJlbigpKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKCFtYXRyaXhQYXJhbXNNYXRjaChjdXJyZW50LCBjb250YWluZWVQYXRocywgbWF0cml4UGFyYW1zKSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSBpZiAoY29udGFpbmVyLnNlZ21lbnRzLmxlbmd0aCA9PT0gY29udGFpbmVlUGF0aHMubGVuZ3RoKSB7XG4gICAgaWYgKCFlcXVhbFBhdGgoY29udGFpbmVyLnNlZ21lbnRzLCBjb250YWluZWVQYXRocykpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoIW1hdHJpeFBhcmFtc01hdGNoKGNvbnRhaW5lci5zZWdtZW50cywgY29udGFpbmVlUGF0aHMsIG1hdHJpeFBhcmFtcykpIHJldHVybiBmYWxzZTtcbiAgICBmb3IgKGNvbnN0IGMgaW4gY29udGFpbmVlLmNoaWxkcmVuKSB7XG4gICAgICBpZiAoIWNvbnRhaW5lci5jaGlsZHJlbltjXSkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKCFjb250YWluc1NlZ21lbnRHcm91cChjb250YWluZXIuY2hpbGRyZW5bY10sIGNvbnRhaW5lZS5jaGlsZHJlbltjXSwgbWF0cml4UGFyYW1zKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgY3VycmVudCA9IGNvbnRhaW5lZVBhdGhzLnNsaWNlKDAsIGNvbnRhaW5lci5zZWdtZW50cy5sZW5ndGgpO1xuICAgIGNvbnN0IG5leHQgPSBjb250YWluZWVQYXRocy5zbGljZShjb250YWluZXIuc2VnbWVudHMubGVuZ3RoKTtcbiAgICBpZiAoIWVxdWFsUGF0aChjb250YWluZXIuc2VnbWVudHMsIGN1cnJlbnQpKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKCFtYXRyaXhQYXJhbXNNYXRjaChjb250YWluZXIuc2VnbWVudHMsIGN1cnJlbnQsIG1hdHJpeFBhcmFtcykpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoIWNvbnRhaW5lci5jaGlsZHJlbltQUklNQVJZX09VVExFVF0pIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gY29udGFpbnNTZWdtZW50R3JvdXBIZWxwZXIoXG4gICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbltQUklNQVJZX09VVExFVF0sIGNvbnRhaW5lZSwgbmV4dCwgbWF0cml4UGFyYW1zKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtYXRyaXhQYXJhbXNNYXRjaChcbiAgICBjb250YWluZXJQYXRoczogVXJsU2VnbWVudFtdLCBjb250YWluZWVQYXRoczogVXJsU2VnbWVudFtdLCBvcHRpb25zOiBQYXJhbU1hdGNoT3B0aW9ucykge1xuICByZXR1cm4gY29udGFpbmVlUGF0aHMuZXZlcnkoKGNvbnRhaW5lZVNlZ21lbnQsIGkpID0+IHtcbiAgICByZXR1cm4gcGFyYW1Db21wYXJlTWFwW29wdGlvbnNdKGNvbnRhaW5lclBhdGhzW2ldLnBhcmFtZXRlcnMsIGNvbnRhaW5lZVNlZ21lbnQucGFyYW1ldGVycyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFJlcHJlc2VudHMgdGhlIHBhcnNlZCBVUkwuXG4gKlxuICogU2luY2UgYSByb3V0ZXIgc3RhdGUgaXMgYSB0cmVlLCBhbmQgdGhlIFVSTCBpcyBub3RoaW5nIGJ1dCBhIHNlcmlhbGl6ZWQgc3RhdGUsIHRoZSBVUkwgaXMgYVxuICogc2VyaWFsaXplZCB0cmVlLlxuICogVXJsVHJlZSBpcyBhIGRhdGEgc3RydWN0dXJlIHRoYXQgcHJvdmlkZXMgYSBsb3Qgb2YgYWZmb3JkYW5jZXMgaW4gZGVhbGluZyB3aXRoIFVSTHNcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe3RlbXBsYXRlVXJsOid0ZW1wbGF0ZS5odG1sJ30pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIGNvbnN0cnVjdG9yKHJvdXRlcjogUm91dGVyKSB7XG4gKiAgICAgY29uc3QgdHJlZTogVXJsVHJlZSA9XG4gKiAgICAgICByb3V0ZXIucGFyc2VVcmwoJy90ZWFtLzMzLyh1c2VyL3ZpY3Rvci8vc3VwcG9ydDpoZWxwKT9kZWJ1Zz10cnVlI2ZyYWdtZW50Jyk7XG4gKiAgICAgY29uc3QgZiA9IHRyZWUuZnJhZ21lbnQ7IC8vIHJldHVybiAnZnJhZ21lbnQnXG4gKiAgICAgY29uc3QgcSA9IHRyZWUucXVlcnlQYXJhbXM7IC8vIHJldHVybnMge2RlYnVnOiAndHJ1ZSd9XG4gKiAgICAgY29uc3QgZzogVXJsU2VnbWVudEdyb3VwID0gdHJlZS5yb290LmNoaWxkcmVuW1BSSU1BUllfT1VUTEVUXTtcbiAqICAgICBjb25zdCBzOiBVcmxTZWdtZW50W10gPSBnLnNlZ21lbnRzOyAvLyByZXR1cm5zIDIgc2VnbWVudHMgJ3RlYW0nIGFuZCAnMzMnXG4gKiAgICAgZy5jaGlsZHJlbltQUklNQVJZX09VVExFVF0uc2VnbWVudHM7IC8vIHJldHVybnMgMiBzZWdtZW50cyAndXNlcicgYW5kICd2aWN0b3InXG4gKiAgICAgZy5jaGlsZHJlblsnc3VwcG9ydCddLnNlZ21lbnRzOyAvLyByZXR1cm4gMSBzZWdtZW50ICdoZWxwJ1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBVcmxUcmVlIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgX3F1ZXJ5UGFyYW1NYXAhOiBQYXJhbU1hcDtcblxuICAvKiogQGludGVybmFsICovXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqIFRoZSByb290IHNlZ21lbnQgZ3JvdXAgb2YgdGhlIFVSTCB0cmVlICovXG4gICAgICBwdWJsaWMgcm9vdDogVXJsU2VnbWVudEdyb3VwLFxuICAgICAgLyoqIFRoZSBxdWVyeSBwYXJhbXMgb2YgdGhlIFVSTCAqL1xuICAgICAgcHVibGljIHF1ZXJ5UGFyYW1zOiBQYXJhbXMsXG4gICAgICAvKiogVGhlIGZyYWdtZW50IG9mIHRoZSBVUkwgKi9cbiAgICAgIHB1YmxpYyBmcmFnbWVudDogc3RyaW5nfG51bGwpIHt9XG5cbiAgZ2V0IHF1ZXJ5UGFyYW1NYXAoKTogUGFyYW1NYXAge1xuICAgIGlmICghdGhpcy5fcXVlcnlQYXJhbU1hcCkge1xuICAgICAgdGhpcy5fcXVlcnlQYXJhbU1hcCA9IGNvbnZlcnRUb1BhcmFtTWFwKHRoaXMucXVlcnlQYXJhbXMpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcXVlcnlQYXJhbU1hcDtcbiAgfVxuXG4gIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIERFRkFVTFRfU0VSSUFMSVpFUi5zZXJpYWxpemUodGhpcyk7XG4gIH1cbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBSZXByZXNlbnRzIHRoZSBwYXJzZWQgVVJMIHNlZ21lbnQgZ3JvdXAuXG4gKlxuICogU2VlIGBVcmxUcmVlYCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBVcmxTZWdtZW50R3JvdXAge1xuICAvKiogQGludGVybmFsICovXG4gIF9zb3VyY2VTZWdtZW50PzogVXJsU2VnbWVudEdyb3VwO1xuICAvKiogQGludGVybmFsICovXG4gIF9zZWdtZW50SW5kZXhTaGlmdD86IG51bWJlcjtcbiAgLyoqIFRoZSBwYXJlbnQgbm9kZSBpbiB0aGUgdXJsIHRyZWUgKi9cbiAgcGFyZW50OiBVcmxTZWdtZW50R3JvdXB8bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogVGhlIFVSTCBzZWdtZW50cyBvZiB0aGlzIGdyb3VwLiBTZWUgYFVybFNlZ21lbnRgIGZvciBtb3JlIGluZm9ybWF0aW9uICovXG4gICAgICBwdWJsaWMgc2VnbWVudHM6IFVybFNlZ21lbnRbXSxcbiAgICAgIC8qKiBUaGUgbGlzdCBvZiBjaGlsZHJlbiBvZiB0aGlzIGdyb3VwICovXG4gICAgICBwdWJsaWMgY2hpbGRyZW46IHtba2V5OiBzdHJpbmddOiBVcmxTZWdtZW50R3JvdXB9KSB7XG4gICAgZm9yRWFjaChjaGlsZHJlbiwgKHY6IGFueSwgazogYW55KSA9PiB2LnBhcmVudCA9IHRoaXMpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHNlZ21lbnQgaGFzIGNoaWxkIHNlZ21lbnRzICovXG4gIGhhc0NoaWxkcmVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm51bWJlck9mQ2hpbGRyZW4gPiAwO1xuICB9XG5cbiAgLyoqIE51bWJlciBvZiBjaGlsZCBzZWdtZW50cyAqL1xuICBnZXQgbnVtYmVyT2ZDaGlsZHJlbigpOiBudW1iZXIge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmNoaWxkcmVuKS5sZW5ndGg7XG4gIH1cblxuICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBzZXJpYWxpemVQYXRocyh0aGlzKTtcbiAgfVxufVxuXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogUmVwcmVzZW50cyBhIHNpbmdsZSBVUkwgc2VnbWVudC5cbiAqXG4gKiBBIFVybFNlZ21lbnQgaXMgYSBwYXJ0IG9mIGEgVVJMIGJldHdlZW4gdGhlIHR3byBzbGFzaGVzLiBJdCBjb250YWlucyBhIHBhdGggYW5kIHRoZSBtYXRyaXhcbiAqIHBhcmFtZXRlcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBzZWdtZW50LlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKsKgIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe3RlbXBsYXRlVXJsOid0ZW1wbGF0ZS5odG1sJ30pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIGNvbnN0cnVjdG9yKHJvdXRlcjogUm91dGVyKSB7XG4gKiAgICAgY29uc3QgdHJlZTogVXJsVHJlZSA9IHJvdXRlci5wYXJzZVVybCgnL3RlYW07aWQ9MzMnKTtcbiAqICAgICBjb25zdCBnOiBVcmxTZWdtZW50R3JvdXAgPSB0cmVlLnJvb3QuY2hpbGRyZW5bUFJJTUFSWV9PVVRMRVRdO1xuICogICAgIGNvbnN0IHM6IFVybFNlZ21lbnRbXSA9IGcuc2VnbWVudHM7XG4gKiAgICAgc1swXS5wYXRoOyAvLyByZXR1cm5zICd0ZWFtJ1xuICogICAgIHNbMF0ucGFyYW1ldGVyczsgLy8gcmV0dXJucyB7aWQ6IDMzfVxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBVcmxTZWdtZW50IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgX3BhcmFtZXRlck1hcCE6IFBhcmFtTWFwO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqIFRoZSBwYXRoIHBhcnQgb2YgYSBVUkwgc2VnbWVudCAqL1xuICAgICAgcHVibGljIHBhdGg6IHN0cmluZyxcblxuICAgICAgLyoqIFRoZSBtYXRyaXggcGFyYW1ldGVycyBhc3NvY2lhdGVkIHdpdGggYSBzZWdtZW50ICovXG4gICAgICBwdWJsaWMgcGFyYW1ldGVyczoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9KSB7fVxuXG4gIGdldCBwYXJhbWV0ZXJNYXAoKSB7XG4gICAgaWYgKCF0aGlzLl9wYXJhbWV0ZXJNYXApIHtcbiAgICAgIHRoaXMuX3BhcmFtZXRlck1hcCA9IGNvbnZlcnRUb1BhcmFtTWFwKHRoaXMucGFyYW1ldGVycyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9wYXJhbWV0ZXJNYXA7XG4gIH1cblxuICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBzZXJpYWxpemVQYXRoKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbFNlZ21lbnRzKGFzOiBVcmxTZWdtZW50W10sIGJzOiBVcmxTZWdtZW50W10pOiBib29sZWFuIHtcbiAgcmV0dXJuIGVxdWFsUGF0aChhcywgYnMpICYmIGFzLmV2ZXJ5KChhLCBpKSA9PiBzaGFsbG93RXF1YWwoYS5wYXJhbWV0ZXJzLCBic1tpXS5wYXJhbWV0ZXJzKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbFBhdGgoYXM6IFVybFNlZ21lbnRbXSwgYnM6IFVybFNlZ21lbnRbXSk6IGJvb2xlYW4ge1xuICBpZiAoYXMubGVuZ3RoICE9PSBicy5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIGFzLmV2ZXJ5KChhLCBpKSA9PiBhLnBhdGggPT09IGJzW2ldLnBhdGgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFwQ2hpbGRyZW5JbnRvQXJyYXk8VD4oXG4gICAgc2VnbWVudDogVXJsU2VnbWVudEdyb3VwLCBmbjogKHY6IFVybFNlZ21lbnRHcm91cCwgazogc3RyaW5nKSA9PiBUW10pOiBUW10ge1xuICBsZXQgcmVzOiBUW10gPSBbXTtcbiAgZm9yRWFjaChzZWdtZW50LmNoaWxkcmVuLCAoY2hpbGQ6IFVybFNlZ21lbnRHcm91cCwgY2hpbGRPdXRsZXQ6IHN0cmluZykgPT4ge1xuICAgIGlmIChjaGlsZE91dGxldCA9PT0gUFJJTUFSWV9PVVRMRVQpIHtcbiAgICAgIHJlcyA9IHJlcy5jb25jYXQoZm4oY2hpbGQsIGNoaWxkT3V0bGV0KSk7XG4gICAgfVxuICB9KTtcbiAgZm9yRWFjaChzZWdtZW50LmNoaWxkcmVuLCAoY2hpbGQ6IFVybFNlZ21lbnRHcm91cCwgY2hpbGRPdXRsZXQ6IHN0cmluZykgPT4ge1xuICAgIGlmIChjaGlsZE91dGxldCAhPT0gUFJJTUFSWV9PVVRMRVQpIHtcbiAgICAgIHJlcyA9IHJlcy5jb25jYXQoZm4oY2hpbGQsIGNoaWxkT3V0bGV0KSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJlcztcbn1cblxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFNlcmlhbGl6ZXMgYW5kIGRlc2VyaWFsaXplcyBhIFVSTCBzdHJpbmcgaW50byBhIFVSTCB0cmVlLlxuICpcbiAqIFRoZSB1cmwgc2VyaWFsaXphdGlvbiBzdHJhdGVneSBpcyBjdXN0b21pemFibGUuIFlvdSBjYW5cbiAqIG1ha2UgYWxsIFVSTHMgY2FzZSBpbnNlbnNpdGl2ZSBieSBwcm92aWRpbmcgYSBjdXN0b20gVXJsU2VyaWFsaXplci5cbiAqXG4gKiBTZWUgYERlZmF1bHRVcmxTZXJpYWxpemVyYCBmb3IgYW4gZXhhbXBsZSBvZiBhIFVSTCBzZXJpYWxpemVyLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFVybFNlcmlhbGl6ZXIge1xuICAvKiogUGFyc2UgYSB1cmwgaW50byBhIGBVcmxUcmVlYCAqL1xuICBhYnN0cmFjdCBwYXJzZSh1cmw6IHN0cmluZyk6IFVybFRyZWU7XG5cbiAgLyoqIENvbnZlcnRzIGEgYFVybFRyZWVgIGludG8gYSB1cmwgKi9cbiAgYWJzdHJhY3Qgc2VyaWFsaXplKHRyZWU6IFVybFRyZWUpOiBzdHJpbmc7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIG9mIHRoZSBgVXJsU2VyaWFsaXplcmAuXG4gKlxuICogRXhhbXBsZSBVUkxzOlxuICpcbiAqIGBgYFxuICogL2luYm94LzMzKHBvcHVwOmNvbXBvc2UpXG4gKiAvaW5ib3gvMzM7b3Blbj10cnVlL21lc3NhZ2VzLzQ0XG4gKiBgYGBcbiAqXG4gKiBEZWZhdWx0VXJsU2VyaWFsaXplciB1c2VzIHBhcmVudGhlc2VzIHRvIHNlcmlhbGl6ZSBzZWNvbmRhcnkgc2VnbWVudHMgKGUuZy4sIHBvcHVwOmNvbXBvc2UpLCB0aGVcbiAqIGNvbG9uIHN5bnRheCB0byBzcGVjaWZ5IHRoZSBvdXRsZXQsIGFuZCB0aGUgJztwYXJhbWV0ZXI9dmFsdWUnIHN5bnRheCAoZS5nLiwgb3Blbj10cnVlKSB0b1xuICogc3BlY2lmeSByb3V0ZSBzcGVjaWZpYyBwYXJhbWV0ZXJzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIERlZmF1bHRVcmxTZXJpYWxpemVyIGltcGxlbWVudHMgVXJsU2VyaWFsaXplciB7XG4gIC8qKiBQYXJzZXMgYSB1cmwgaW50byBhIGBVcmxUcmVlYCAqL1xuICBwYXJzZSh1cmw6IHN0cmluZyk6IFVybFRyZWUge1xuICAgIGNvbnN0IHAgPSBuZXcgVXJsUGFyc2VyKHVybCk7XG4gICAgcmV0dXJuIG5ldyBVcmxUcmVlKHAucGFyc2VSb290U2VnbWVudCgpLCBwLnBhcnNlUXVlcnlQYXJhbXMoKSwgcC5wYXJzZUZyYWdtZW50KCkpO1xuICB9XG5cbiAgLyoqIENvbnZlcnRzIGEgYFVybFRyZWVgIGludG8gYSB1cmwgKi9cbiAgc2VyaWFsaXplKHRyZWU6IFVybFRyZWUpOiBzdHJpbmcge1xuICAgIGNvbnN0IHNlZ21lbnQgPSBgLyR7c2VyaWFsaXplU2VnbWVudCh0cmVlLnJvb3QsIHRydWUpfWA7XG4gICAgY29uc3QgcXVlcnkgPSBzZXJpYWxpemVRdWVyeVBhcmFtcyh0cmVlLnF1ZXJ5UGFyYW1zKTtcbiAgICBjb25zdCBmcmFnbWVudCA9XG4gICAgICAgIHR5cGVvZiB0cmVlLmZyYWdtZW50ID09PSBgc3RyaW5nYCA/IGAjJHtlbmNvZGVVcmlGcmFnbWVudCh0cmVlLmZyYWdtZW50KX1gIDogJyc7XG5cbiAgICByZXR1cm4gYCR7c2VnbWVudH0ke3F1ZXJ5fSR7ZnJhZ21lbnR9YDtcbiAgfVxufVxuXG5jb25zdCBERUZBVUxUX1NFUklBTElaRVIgPSBuZXcgRGVmYXVsdFVybFNlcmlhbGl6ZXIoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZVBhdGhzKHNlZ21lbnQ6IFVybFNlZ21lbnRHcm91cCk6IHN0cmluZyB7XG4gIHJldHVybiBzZWdtZW50LnNlZ21lbnRzLm1hcChwID0+IHNlcmlhbGl6ZVBhdGgocCkpLmpvaW4oJy8nKTtcbn1cblxuZnVuY3Rpb24gc2VyaWFsaXplU2VnbWVudChzZWdtZW50OiBVcmxTZWdtZW50R3JvdXAsIHJvb3Q6IGJvb2xlYW4pOiBzdHJpbmcge1xuICBpZiAoIXNlZ21lbnQuaGFzQ2hpbGRyZW4oKSkge1xuICAgIHJldHVybiBzZXJpYWxpemVQYXRocyhzZWdtZW50KTtcbiAgfVxuXG4gIGlmIChyb290KSB7XG4gICAgY29uc3QgcHJpbWFyeSA9IHNlZ21lbnQuY2hpbGRyZW5bUFJJTUFSWV9PVVRMRVRdID9cbiAgICAgICAgc2VyaWFsaXplU2VnbWVudChzZWdtZW50LmNoaWxkcmVuW1BSSU1BUllfT1VUTEVUXSwgZmFsc2UpIDpcbiAgICAgICAgJyc7XG4gICAgY29uc3QgY2hpbGRyZW46IHN0cmluZ1tdID0gW107XG5cbiAgICBmb3JFYWNoKHNlZ21lbnQuY2hpbGRyZW4sICh2OiBVcmxTZWdtZW50R3JvdXAsIGs6IHN0cmluZykgPT4ge1xuICAgICAgaWYgKGsgIT09IFBSSU1BUllfT1VUTEVUKSB7XG4gICAgICAgIGNoaWxkcmVuLnB1c2goYCR7a306JHtzZXJpYWxpemVTZWdtZW50KHYsIGZhbHNlKX1gKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBjaGlsZHJlbi5sZW5ndGggPiAwID8gYCR7cHJpbWFyeX0oJHtjaGlsZHJlbi5qb2luKCcvLycpfSlgIDogcHJpbWFyeTtcblxuICB9IGVsc2Uge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gbWFwQ2hpbGRyZW5JbnRvQXJyYXkoc2VnbWVudCwgKHY6IFVybFNlZ21lbnRHcm91cCwgazogc3RyaW5nKSA9PiB7XG4gICAgICBpZiAoayA9PT0gUFJJTUFSWV9PVVRMRVQpIHtcbiAgICAgICAgcmV0dXJuIFtzZXJpYWxpemVTZWdtZW50KHNlZ21lbnQuY2hpbGRyZW5bUFJJTUFSWV9PVVRMRVRdLCBmYWxzZSldO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gW2Ake2t9OiR7c2VyaWFsaXplU2VnbWVudCh2LCBmYWxzZSl9YF07XG4gICAgfSk7XG5cbiAgICAvLyB1c2Ugbm8gcGFyZW50aGVzaXMgaWYgdGhlIG9ubHkgY2hpbGQgaXMgYSBwcmltYXJ5IG91dGxldCByb3V0ZVxuICAgIGlmIChPYmplY3Qua2V5cyhzZWdtZW50LmNoaWxkcmVuKS5sZW5ndGggPT09IDEgJiYgc2VnbWVudC5jaGlsZHJlbltQUklNQVJZX09VVExFVF0gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGAke3NlcmlhbGl6ZVBhdGhzKHNlZ21lbnQpfS8ke2NoaWxkcmVuWzBdfWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGAke3NlcmlhbGl6ZVBhdGhzKHNlZ21lbnQpfS8oJHtjaGlsZHJlbi5qb2luKCcvLycpfSlgO1xuICB9XG59XG5cbi8qKlxuICogRW5jb2RlcyBhIFVSSSBzdHJpbmcgd2l0aCB0aGUgZGVmYXVsdCBlbmNvZGluZy4gVGhpcyBmdW5jdGlvbiB3aWxsIG9ubHkgZXZlciBiZSBjYWxsZWQgZnJvbVxuICogYGVuY29kZVVyaVF1ZXJ5YCBvciBgZW5jb2RlVXJpU2VnbWVudGAgYXMgaXQncyB0aGUgYmFzZSBzZXQgb2YgZW5jb2RpbmdzIHRvIGJlIHVzZWQuIFdlIG5lZWRcbiAqIGEgY3VzdG9tIGVuY29kaW5nIGJlY2F1c2UgZW5jb2RlVVJJQ29tcG9uZW50IGlzIHRvbyBhZ2dyZXNzaXZlIGFuZCBlbmNvZGVzIHN0dWZmIHRoYXQgZG9lc24ndFxuICogaGF2ZSB0byBiZSBlbmNvZGVkIHBlciBodHRwczovL3VybC5zcGVjLndoYXR3Zy5vcmcuXG4gKi9cbmZ1bmN0aW9uIGVuY29kZVVyaVN0cmluZyhzOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHMpXG4gICAgICAucmVwbGFjZSgvJTQwL2csICdAJylcbiAgICAgIC5yZXBsYWNlKC8lM0EvZ2ksICc6JylcbiAgICAgIC5yZXBsYWNlKC8lMjQvZywgJyQnKVxuICAgICAgLnJlcGxhY2UoLyUyQy9naSwgJywnKTtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHNob3VsZCBiZSB1c2VkIHRvIGVuY29kZSBib3RoIGtleXMgYW5kIHZhbHVlcyBpbiBhIHF1ZXJ5IHN0cmluZyBrZXkvdmFsdWUuIEluXG4gKiB0aGUgZm9sbG93aW5nIFVSTCwgeW91IG5lZWQgdG8gY2FsbCBlbmNvZGVVcmlRdWVyeSBvbiBcImtcIiBhbmQgXCJ2XCI6XG4gKlxuICogaHR0cDovL3d3dy5zaXRlLm9yZy9odG1sO21rPW12P2s9diNmXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVVcmlRdWVyeShzOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gZW5jb2RlVXJpU3RyaW5nKHMpLnJlcGxhY2UoLyUzQi9naSwgJzsnKTtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHNob3VsZCBiZSB1c2VkIHRvIGVuY29kZSBhIFVSTCBmcmFnbWVudC4gSW4gdGhlIGZvbGxvd2luZyBVUkwsIHlvdSBuZWVkIHRvIGNhbGxcbiAqIGVuY29kZVVyaUZyYWdtZW50IG9uIFwiZlwiOlxuICpcbiAqIGh0dHA6Ly93d3cuc2l0ZS5vcmcvaHRtbDttaz1tdj9rPXYjZlxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlVXJpRnJhZ21lbnQoczogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGVuY29kZVVSSShzKTtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHNob3VsZCBiZSBydW4gb24gYW55IFVSSSBzZWdtZW50IGFzIHdlbGwgYXMgdGhlIGtleSBhbmQgdmFsdWUgaW4gYSBrZXkvdmFsdWVcbiAqIHBhaXIgZm9yIG1hdHJpeCBwYXJhbXMuIEluIHRoZSBmb2xsb3dpbmcgVVJMLCB5b3UgbmVlZCB0byBjYWxsIGVuY29kZVVyaVNlZ21lbnQgb24gXCJodG1sXCIsXG4gKiBcIm1rXCIsIGFuZCBcIm12XCI6XG4gKlxuICogaHR0cDovL3d3dy5zaXRlLm9yZy9odG1sO21rPW12P2s9diNmXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVVcmlTZWdtZW50KHM6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBlbmNvZGVVcmlTdHJpbmcocykucmVwbGFjZSgvXFwoL2csICclMjgnKS5yZXBsYWNlKC9cXCkvZywgJyUyOScpLnJlcGxhY2UoLyUyNi9naSwgJyYnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZShzOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHMpO1xufVxuXG4vLyBRdWVyeSBrZXlzL3ZhbHVlcyBzaG91bGQgaGF2ZSB0aGUgXCIrXCIgcmVwbGFjZWQgZmlyc3QsIGFzIFwiK1wiIGluIGEgcXVlcnkgc3RyaW5nIGlzIFwiIFwiLlxuLy8gZGVjb2RlVVJJQ29tcG9uZW50IGZ1bmN0aW9uIHdpbGwgbm90IGRlY29kZSBcIitcIiBhcyBhIHNwYWNlLlxuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZVF1ZXJ5KHM6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBkZWNvZGUocy5yZXBsYWNlKC9cXCsvZywgJyUyMCcpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZVBhdGgocGF0aDogVXJsU2VnbWVudCk6IHN0cmluZyB7XG4gIHJldHVybiBgJHtlbmNvZGVVcmlTZWdtZW50KHBhdGgucGF0aCl9JHtzZXJpYWxpemVNYXRyaXhQYXJhbXMocGF0aC5wYXJhbWV0ZXJzKX1gO1xufVxuXG5mdW5jdGlvbiBzZXJpYWxpemVNYXRyaXhQYXJhbXMocGFyYW1zOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSk6IHN0cmluZyB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhwYXJhbXMpXG4gICAgICAubWFwKGtleSA9PiBgOyR7ZW5jb2RlVXJpU2VnbWVudChrZXkpfT0ke2VuY29kZVVyaVNlZ21lbnQocGFyYW1zW2tleV0pfWApXG4gICAgICAuam9pbignJyk7XG59XG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZVF1ZXJ5UGFyYW1zKHBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0pOiBzdHJpbmcge1xuICBjb25zdCBzdHJQYXJhbXM6IHN0cmluZ1tdID0gT2JqZWN0LmtleXMocGFyYW1zKS5tYXAoKG5hbWUpID0+IHtcbiAgICBjb25zdCB2YWx1ZSA9IHBhcmFtc1tuYW1lXTtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWx1ZSkgP1xuICAgICAgICB2YWx1ZS5tYXAodiA9PiBgJHtlbmNvZGVVcmlRdWVyeShuYW1lKX09JHtlbmNvZGVVcmlRdWVyeSh2KX1gKS5qb2luKCcmJykgOlxuICAgICAgICBgJHtlbmNvZGVVcmlRdWVyeShuYW1lKX09JHtlbmNvZGVVcmlRdWVyeSh2YWx1ZSl9YDtcbiAgfSk7XG5cbiAgcmV0dXJuIHN0clBhcmFtcy5sZW5ndGggPyBgPyR7c3RyUGFyYW1zLmpvaW4oJyYnKX1gIDogJyc7XG59XG5cbmNvbnN0IFNFR01FTlRfUkUgPSAvXlteXFwvKCk/Oz0jXSsvO1xuZnVuY3Rpb24gbWF0Y2hTZWdtZW50cyhzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IG1hdGNoID0gc3RyLm1hdGNoKFNFR01FTlRfUkUpO1xuICByZXR1cm4gbWF0Y2ggPyBtYXRjaFswXSA6ICcnO1xufVxuXG5jb25zdCBRVUVSWV9QQVJBTV9SRSA9IC9eW149PyYjXSsvO1xuLy8gUmV0dXJuIHRoZSBuYW1lIG9mIHRoZSBxdWVyeSBwYXJhbSBhdCB0aGUgc3RhcnQgb2YgdGhlIHN0cmluZyBvciBhbiBlbXB0eSBzdHJpbmdcbmZ1bmN0aW9uIG1hdGNoUXVlcnlQYXJhbXMoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBtYXRjaCA9IHN0ci5tYXRjaChRVUVSWV9QQVJBTV9SRSk7XG4gIHJldHVybiBtYXRjaCA/IG1hdGNoWzBdIDogJyc7XG59XG5cbmNvbnN0IFFVRVJZX1BBUkFNX1ZBTFVFX1JFID0gL15bXj8mI10rLztcbi8vIFJldHVybiB0aGUgdmFsdWUgb2YgdGhlIHF1ZXJ5IHBhcmFtIGF0IHRoZSBzdGFydCBvZiB0aGUgc3RyaW5nIG9yIGFuIGVtcHR5IHN0cmluZ1xuZnVuY3Rpb24gbWF0Y2hVcmxRdWVyeVBhcmFtVmFsdWUoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBtYXRjaCA9IHN0ci5tYXRjaChRVUVSWV9QQVJBTV9WQUxVRV9SRSk7XG4gIHJldHVybiBtYXRjaCA/IG1hdGNoWzBdIDogJyc7XG59XG5cbmNsYXNzIFVybFBhcnNlciB7XG4gIHByaXZhdGUgcmVtYWluaW5nOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSB1cmw6IHN0cmluZykge1xuICAgIHRoaXMucmVtYWluaW5nID0gdXJsO1xuICB9XG5cbiAgcGFyc2VSb290U2VnbWVudCgpOiBVcmxTZWdtZW50R3JvdXAge1xuICAgIHRoaXMuY29uc3VtZU9wdGlvbmFsKCcvJyk7XG5cbiAgICBpZiAodGhpcy5yZW1haW5pbmcgPT09ICcnIHx8IHRoaXMucGVla1N0YXJ0c1dpdGgoJz8nKSB8fCB0aGlzLnBlZWtTdGFydHNXaXRoKCcjJykpIHtcbiAgICAgIHJldHVybiBuZXcgVXJsU2VnbWVudEdyb3VwKFtdLCB7fSk7XG4gICAgfVxuXG4gICAgLy8gVGhlIHJvb3Qgc2VnbWVudCBncm91cCBuZXZlciBoYXMgc2VnbWVudHNcbiAgICByZXR1cm4gbmV3IFVybFNlZ21lbnRHcm91cChbXSwgdGhpcy5wYXJzZUNoaWxkcmVuKCkpO1xuICB9XG5cbiAgcGFyc2VRdWVyeVBhcmFtcygpOiBQYXJhbXMge1xuICAgIGNvbnN0IHBhcmFtczogUGFyYW1zID0ge307XG4gICAgaWYgKHRoaXMuY29uc3VtZU9wdGlvbmFsKCc/JykpIHtcbiAgICAgIGRvIHtcbiAgICAgICAgdGhpcy5wYXJzZVF1ZXJ5UGFyYW0ocGFyYW1zKTtcbiAgICAgIH0gd2hpbGUgKHRoaXMuY29uc3VtZU9wdGlvbmFsKCcmJykpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyYW1zO1xuICB9XG5cbiAgcGFyc2VGcmFnbWVudCgpOiBzdHJpbmd8bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3VtZU9wdGlvbmFsKCcjJykgPyBkZWNvZGVVUklDb21wb25lbnQodGhpcy5yZW1haW5pbmcpIDogbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgcGFyc2VDaGlsZHJlbigpOiB7W291dGxldDogc3RyaW5nXTogVXJsU2VnbWVudEdyb3VwfSB7XG4gICAgaWYgKHRoaXMucmVtYWluaW5nID09PSAnJykge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIHRoaXMuY29uc3VtZU9wdGlvbmFsKCcvJyk7XG5cbiAgICBjb25zdCBzZWdtZW50czogVXJsU2VnbWVudFtdID0gW107XG4gICAgaWYgKCF0aGlzLnBlZWtTdGFydHNXaXRoKCcoJykpIHtcbiAgICAgIHNlZ21lbnRzLnB1c2godGhpcy5wYXJzZVNlZ21lbnQoKSk7XG4gICAgfVxuXG4gICAgd2hpbGUgKHRoaXMucGVla1N0YXJ0c1dpdGgoJy8nKSAmJiAhdGhpcy5wZWVrU3RhcnRzV2l0aCgnLy8nKSAmJiAhdGhpcy5wZWVrU3RhcnRzV2l0aCgnLygnKSkge1xuICAgICAgdGhpcy5jYXB0dXJlKCcvJyk7XG4gICAgICBzZWdtZW50cy5wdXNoKHRoaXMucGFyc2VTZWdtZW50KCkpO1xuICAgIH1cblxuICAgIGxldCBjaGlsZHJlbjoge1tvdXRsZXQ6IHN0cmluZ106IFVybFNlZ21lbnRHcm91cH0gPSB7fTtcbiAgICBpZiAodGhpcy5wZWVrU3RhcnRzV2l0aCgnLygnKSkge1xuICAgICAgdGhpcy5jYXB0dXJlKCcvJyk7XG4gICAgICBjaGlsZHJlbiA9IHRoaXMucGFyc2VQYXJlbnModHJ1ZSk7XG4gICAgfVxuXG4gICAgbGV0IHJlczoge1tvdXRsZXQ6IHN0cmluZ106IFVybFNlZ21lbnRHcm91cH0gPSB7fTtcbiAgICBpZiAodGhpcy5wZWVrU3RhcnRzV2l0aCgnKCcpKSB7XG4gICAgICByZXMgPSB0aGlzLnBhcnNlUGFyZW5zKGZhbHNlKTtcbiAgICB9XG5cbiAgICBpZiAoc2VnbWVudHMubGVuZ3RoID4gMCB8fCBPYmplY3Qua2V5cyhjaGlsZHJlbikubGVuZ3RoID4gMCkge1xuICAgICAgcmVzW1BSSU1BUllfT1VUTEVUXSA9IG5ldyBVcmxTZWdtZW50R3JvdXAoc2VnbWVudHMsIGNoaWxkcmVuKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgLy8gcGFyc2UgYSBzZWdtZW50IHdpdGggaXRzIG1hdHJpeCBwYXJhbWV0ZXJzXG4gIC8vIGllIGBuYW1lO2sxPXYxO2syYFxuICBwcml2YXRlIHBhcnNlU2VnbWVudCgpOiBVcmxTZWdtZW50IHtcbiAgICBjb25zdCBwYXRoID0gbWF0Y2hTZWdtZW50cyh0aGlzLnJlbWFpbmluZyk7XG4gICAgaWYgKHBhdGggPT09ICcnICYmIHRoaXMucGVla1N0YXJ0c1dpdGgoJzsnKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFbXB0eSBwYXRoIHVybCBzZWdtZW50IGNhbm5vdCBoYXZlIHBhcmFtZXRlcnM6ICcke3RoaXMucmVtYWluaW5nfScuYCk7XG4gICAgfVxuXG4gICAgdGhpcy5jYXB0dXJlKHBhdGgpO1xuICAgIHJldHVybiBuZXcgVXJsU2VnbWVudChkZWNvZGUocGF0aCksIHRoaXMucGFyc2VNYXRyaXhQYXJhbXMoKSk7XG4gIH1cblxuICBwcml2YXRlIHBhcnNlTWF0cml4UGFyYW1zKCk6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9IHtcbiAgICBjb25zdCBwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgd2hpbGUgKHRoaXMuY29uc3VtZU9wdGlvbmFsKCc7JykpIHtcbiAgICAgIHRoaXMucGFyc2VQYXJhbShwYXJhbXMpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyYW1zO1xuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZVBhcmFtKHBhcmFtczoge1trZXk6IHN0cmluZ106IHN0cmluZ30pOiB2b2lkIHtcbiAgICBjb25zdCBrZXkgPSBtYXRjaFNlZ21lbnRzKHRoaXMucmVtYWluaW5nKTtcbiAgICBpZiAoIWtleSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmNhcHR1cmUoa2V5KTtcbiAgICBsZXQgdmFsdWU6IGFueSA9ICcnO1xuICAgIGlmICh0aGlzLmNvbnN1bWVPcHRpb25hbCgnPScpKSB7XG4gICAgICBjb25zdCB2YWx1ZU1hdGNoID0gbWF0Y2hTZWdtZW50cyh0aGlzLnJlbWFpbmluZyk7XG4gICAgICBpZiAodmFsdWVNYXRjaCkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlTWF0Y2g7XG4gICAgICAgIHRoaXMuY2FwdHVyZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcGFyYW1zW2RlY29kZShrZXkpXSA9IGRlY29kZSh2YWx1ZSk7XG4gIH1cblxuICAvLyBQYXJzZSBhIHNpbmdsZSBxdWVyeSBwYXJhbWV0ZXIgYG5hbWVbPXZhbHVlXWBcbiAgcHJpdmF0ZSBwYXJzZVF1ZXJ5UGFyYW0ocGFyYW1zOiBQYXJhbXMpOiB2b2lkIHtcbiAgICBjb25zdCBrZXkgPSBtYXRjaFF1ZXJ5UGFyYW1zKHRoaXMucmVtYWluaW5nKTtcbiAgICBpZiAoIWtleSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmNhcHR1cmUoa2V5KTtcbiAgICBsZXQgdmFsdWU6IGFueSA9ICcnO1xuICAgIGlmICh0aGlzLmNvbnN1bWVPcHRpb25hbCgnPScpKSB7XG4gICAgICBjb25zdCB2YWx1ZU1hdGNoID0gbWF0Y2hVcmxRdWVyeVBhcmFtVmFsdWUodGhpcy5yZW1haW5pbmcpO1xuICAgICAgaWYgKHZhbHVlTWF0Y2gpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZU1hdGNoO1xuICAgICAgICB0aGlzLmNhcHR1cmUodmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGRlY29kZWRLZXkgPSBkZWNvZGVRdWVyeShrZXkpO1xuICAgIGNvbnN0IGRlY29kZWRWYWwgPSBkZWNvZGVRdWVyeSh2YWx1ZSk7XG5cbiAgICBpZiAocGFyYW1zLmhhc093blByb3BlcnR5KGRlY29kZWRLZXkpKSB7XG4gICAgICAvLyBBcHBlbmQgdG8gZXhpc3RpbmcgdmFsdWVzXG4gICAgICBsZXQgY3VycmVudFZhbCA9IHBhcmFtc1tkZWNvZGVkS2V5XTtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShjdXJyZW50VmFsKSkge1xuICAgICAgICBjdXJyZW50VmFsID0gW2N1cnJlbnRWYWxdO1xuICAgICAgICBwYXJhbXNbZGVjb2RlZEtleV0gPSBjdXJyZW50VmFsO1xuICAgICAgfVxuICAgICAgY3VycmVudFZhbC5wdXNoKGRlY29kZWRWYWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDcmVhdGUgYSBuZXcgdmFsdWVcbiAgICAgIHBhcmFtc1tkZWNvZGVkS2V5XSA9IGRlY29kZWRWYWw7XG4gICAgfVxuICB9XG5cbiAgLy8gcGFyc2UgYChhL2IvL291dGxldF9uYW1lOmMvZClgXG4gIHByaXZhdGUgcGFyc2VQYXJlbnMoYWxsb3dQcmltYXJ5OiBib29sZWFuKToge1tvdXRsZXQ6IHN0cmluZ106IFVybFNlZ21lbnRHcm91cH0ge1xuICAgIGNvbnN0IHNlZ21lbnRzOiB7W2tleTogc3RyaW5nXTogVXJsU2VnbWVudEdyb3VwfSA9IHt9O1xuICAgIHRoaXMuY2FwdHVyZSgnKCcpO1xuXG4gICAgd2hpbGUgKCF0aGlzLmNvbnN1bWVPcHRpb25hbCgnKScpICYmIHRoaXMucmVtYWluaW5nLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHBhdGggPSBtYXRjaFNlZ21lbnRzKHRoaXMucmVtYWluaW5nKTtcblxuICAgICAgY29uc3QgbmV4dCA9IHRoaXMucmVtYWluaW5nW3BhdGgubGVuZ3RoXTtcblxuICAgICAgLy8gaWYgaXMgaXMgbm90IG9uZSBvZiB0aGVzZSBjaGFyYWN0ZXJzLCB0aGVuIHRoZSBzZWdtZW50IHdhcyB1bmVzY2FwZWRcbiAgICAgIC8vIG9yIHRoZSBncm91cCB3YXMgbm90IGNsb3NlZFxuICAgICAgaWYgKG5leHQgIT09ICcvJyAmJiBuZXh0ICE9PSAnKScgJiYgbmV4dCAhPT0gJzsnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHBhcnNlIHVybCAnJHt0aGlzLnVybH0nYCk7XG4gICAgICB9XG5cbiAgICAgIGxldCBvdXRsZXROYW1lOiBzdHJpbmcgPSB1bmRlZmluZWQhO1xuICAgICAgaWYgKHBhdGguaW5kZXhPZignOicpID4gLTEpIHtcbiAgICAgICAgb3V0bGV0TmFtZSA9IHBhdGguc3Vic3RyKDAsIHBhdGguaW5kZXhPZignOicpKTtcbiAgICAgICAgdGhpcy5jYXB0dXJlKG91dGxldE5hbWUpO1xuICAgICAgICB0aGlzLmNhcHR1cmUoJzonKTtcbiAgICAgIH0gZWxzZSBpZiAoYWxsb3dQcmltYXJ5KSB7XG4gICAgICAgIG91dGxldE5hbWUgPSBQUklNQVJZX09VVExFVDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLnBhcnNlQ2hpbGRyZW4oKTtcbiAgICAgIHNlZ21lbnRzW291dGxldE5hbWVdID0gT2JqZWN0LmtleXMoY2hpbGRyZW4pLmxlbmd0aCA9PT0gMSA/IGNoaWxkcmVuW1BSSU1BUllfT1VUTEVUXSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgVXJsU2VnbWVudEdyb3VwKFtdLCBjaGlsZHJlbik7XG4gICAgICB0aGlzLmNvbnN1bWVPcHRpb25hbCgnLy8nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VnbWVudHM7XG4gIH1cblxuICBwcml2YXRlIHBlZWtTdGFydHNXaXRoKHN0cjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucmVtYWluaW5nLnN0YXJ0c1dpdGgoc3RyKTtcbiAgfVxuXG4gIC8vIENvbnN1bWVzIHRoZSBwcmVmaXggd2hlbiBpdCBpcyBwcmVzZW50IGFuZCByZXR1cm5zIHdoZXRoZXIgaXQgaGFzIGJlZW4gY29uc3VtZWRcbiAgcHJpdmF0ZSBjb25zdW1lT3B0aW9uYWwoc3RyOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5wZWVrU3RhcnRzV2l0aChzdHIpKSB7XG4gICAgICB0aGlzLnJlbWFpbmluZyA9IHRoaXMucmVtYWluaW5nLnN1YnN0cmluZyhzdHIubGVuZ3RoKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIGNhcHR1cmUoc3RyOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuY29uc3VtZU9wdGlvbmFsKHN0cikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgXCIke3N0cn1cIi5gKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==