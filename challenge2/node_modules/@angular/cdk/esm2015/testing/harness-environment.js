/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { parallel } from './change-detection';
import { ComponentHarness, HarnessPredicate, } from './component-harness';
/**
 * Base harness environment class that can be extended to allow `ComponentHarness`es to be used in
 * different test environments (e.g. testbed, protractor, etc.). This class implements the
 * functionality of both a `HarnessLoader` and `LocatorFactory`. This class is generic on the raw
 * element type, `E`, used by the particular test environment.
 */
export class HarnessEnvironment {
    constructor(rawRootElement) {
        this.rawRootElement = rawRootElement;
        this.rootElement = this.createTestElement(rawRootElement);
    }
    // Implemented as part of the `LocatorFactory` interface.
    documentRootLocatorFactory() {
        return this.createEnvironment(this.getDocumentRoot());
    }
    // Implemented as part of the `LocatorFactory` interface.
    locatorFor(...queries) {
        return () => _assertResultFound(this._getAllHarnessesAndTestElements(queries), _getDescriptionForLocatorForQueries(queries));
    }
    // Implemented as part of the `LocatorFactory` interface.
    locatorForOptional(...queries) {
        return () => __awaiter(this, void 0, void 0, function* () { return (yield this._getAllHarnessesAndTestElements(queries))[0] || null; });
    }
    // Implemented as part of the `LocatorFactory` interface.
    locatorForAll(...queries) {
        return () => this._getAllHarnessesAndTestElements(queries);
    }
    // Implemented as part of the `LocatorFactory` interface.
    rootHarnessLoader() {
        return __awaiter(this, void 0, void 0, function* () {
            return this;
        });
    }
    // Implemented as part of the `LocatorFactory` interface.
    harnessLoaderFor(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.createEnvironment(yield _assertResultFound(this.getAllRawElements(selector), [_getDescriptionForHarnessLoaderQuery(selector)]));
        });
    }
    // Implemented as part of the `LocatorFactory` interface.
    harnessLoaderForOptional(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            const elements = yield this.getAllRawElements(selector);
            return elements[0] ? this.createEnvironment(elements[0]) : null;
        });
    }
    // Implemented as part of the `LocatorFactory` interface.
    harnessLoaderForAll(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            const elements = yield this.getAllRawElements(selector);
            return elements.map(element => this.createEnvironment(element));
        });
    }
    // Implemented as part of the `HarnessLoader` interface.
    getHarness(query) {
        return this.locatorFor(query)();
    }
    // Implemented as part of the `HarnessLoader` interface.
    getAllHarnesses(query) {
        return this.locatorForAll(query)();
    }
    // Implemented as part of the `HarnessLoader` interface.
    getChildLoader(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.createEnvironment(yield _assertResultFound(this.getAllRawElements(selector), [_getDescriptionForHarnessLoaderQuery(selector)]));
        });
    }
    // Implemented as part of the `HarnessLoader` interface.
    getAllChildLoaders(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getAllRawElements(selector)).map(e => this.createEnvironment(e));
        });
    }
    /** Creates a `ComponentHarness` for the given harness type with the given raw host element. */
    createComponentHarness(harnessType, element) {
        return new harnessType(this.createEnvironment(element));
    }
    /**
     * Matches the given raw elements with the given list of element and harness queries to produce a
     * list of matched harnesses and test elements.
     */
    _getAllHarnessesAndTestElements(queries) {
        return __awaiter(this, void 0, void 0, function* () {
            const { allQueries, harnessQueries, elementQueries, harnessTypes } = _parseQueries(queries);
            // Combine all of the queries into one large comma-delimited selector and use it to get all raw
            // elements matching any of the individual queries.
            const rawElements = yield this.getAllRawElements([...elementQueries, ...harnessQueries.map(predicate => predicate.getSelector())].join(','));
            // If every query is searching for the same harness subclass, we know every result corresponds
            // to an instance of that subclass. Likewise, if every query is for a `TestElement`, we know
            // every result corresponds to a `TestElement`. Otherwise we need to verify which result was
            // found by which selector so it can be matched to the appropriate instance.
            const skipSelectorCheck = (elementQueries.length === 0 && harnessTypes.size === 1) ||
                harnessQueries.length === 0;
            const perElementMatches = yield parallel(() => rawElements.map((rawElement) => __awaiter(this, void 0, void 0, function* () {
                const testElement = this.createTestElement(rawElement);
                const allResultsForElement = yield parallel(
                // For each query, get `null` if it doesn't match, or a `TestElement` or
                // `ComponentHarness` as appropriate if it does match. This gives us everything that
                // matches the current raw element, but it may contain duplicate entries (e.g.
                // multiple `TestElement` or multiple `ComponentHarness` of the same type).
                () => allQueries.map(query => this._getQueryResultForElement(query, rawElement, testElement, skipSelectorCheck)));
                return _removeDuplicateQueryResults(allResultsForElement);
            })));
            return [].concat(...perElementMatches);
        });
    }
    /**
     * Check whether the given query matches the given element, if it does return the matched
     * `TestElement` or `ComponentHarness`, if it does not, return null. In cases where the caller
     * knows for sure that the query matches the element's selector, `skipSelectorCheck` can be used
     * to skip verification and optimize performance.
     */
    _getQueryResultForElement(query, rawElement, testElement, skipSelectorCheck = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof query === 'string') {
                return ((skipSelectorCheck || (yield testElement.matchesSelector(query))) ? testElement : null);
            }
            if (skipSelectorCheck || (yield testElement.matchesSelector(query.getSelector()))) {
                const harness = this.createComponentHarness(query.harnessType, rawElement);
                return (yield query.evaluate(harness)) ? harness : null;
            }
            return null;
        });
    }
}
/**
 * Parses a list of queries in the format accepted by the `locatorFor*` methods into an easier to
 * work with format.
 */
function _parseQueries(queries) {
    const allQueries = [];
    const harnessQueries = [];
    const elementQueries = [];
    const harnessTypes = new Set();
    for (const query of queries) {
        if (typeof query === 'string') {
            allQueries.push(query);
            elementQueries.push(query);
        }
        else {
            const predicate = query instanceof HarnessPredicate ? query : new HarnessPredicate(query, {});
            allQueries.push(predicate);
            harnessQueries.push(predicate);
            harnessTypes.add(predicate.harnessType);
        }
    }
    return { allQueries, harnessQueries, elementQueries, harnessTypes };
}
/**
 * Removes duplicate query results for a particular element. (e.g. multiple `TestElement`
 * instances or multiple instances of the same `ComponentHarness` class.
 */
function _removeDuplicateQueryResults(results) {
    return __awaiter(this, void 0, void 0, function* () {
        let testElementMatched = false;
        let matchedHarnessTypes = new Set();
        const dedupedMatches = [];
        for (const result of results) {
            if (!result) {
                continue;
            }
            if (result instanceof ComponentHarness) {
                if (!matchedHarnessTypes.has(result.constructor)) {
                    matchedHarnessTypes.add(result.constructor);
                    dedupedMatches.push(result);
                }
            }
            else if (!testElementMatched) {
                testElementMatched = true;
                dedupedMatches.push(result);
            }
        }
        return dedupedMatches;
    });
}
/** Verifies that there is at least one result in an array. */
function _assertResultFound(results, queryDescriptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = (yield results)[0];
        if (result == undefined) {
            throw Error(`Failed to find element matching one of the following queries:\n` +
                queryDescriptions.map(desc => `(${desc})`).join(',\n'));
        }
        return result;
    });
}
/** Gets a list of description strings from a list of queries. */
function _getDescriptionForLocatorForQueries(queries) {
    return queries.map(query => typeof query === 'string' ?
        _getDescriptionForTestElementQuery(query) : _getDescriptionForComponentHarnessQuery(query));
}
/** Gets a description string for a `ComponentHarness` query. */
function _getDescriptionForComponentHarnessQuery(query) {
    const harnessPredicate = query instanceof HarnessPredicate ? query : new HarnessPredicate(query, {});
    const { name, hostSelector } = harnessPredicate.harnessType;
    const description = `${name} with host element matching selector: "${hostSelector}"`;
    const constraints = harnessPredicate.getDescription();
    return description + (constraints ?
        ` satisfying the constraints: ${harnessPredicate.getDescription()}` : '');
}
/** Gets a description string for a `TestElement` query. */
function _getDescriptionForTestElementQuery(selector) {
    return `TestElement for element matching selector: "${selector}"`;
}
/** Gets a description string for a `HarnessLoader` query. */
function _getDescriptionForHarnessLoaderQuery(selector) {
    return `HarnessLoader for element matching selector: "${selector}"`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFybmVzcy1lbnZpcm9ubWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdGVzdGluZy9oYXJuZXNzLWVudmlyb25tZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDNUMsT0FBTyxFQUVMLGdCQUFnQixFQUdoQixnQkFBZ0IsR0FJakIsTUFBTSxxQkFBcUIsQ0FBQztBQXFCN0I7Ozs7O0dBS0c7QUFDSCxNQUFNLE9BQWdCLGtCQUFrQjtJQUl0QyxZQUFnQyxjQUFpQjtRQUFqQixtQkFBYyxHQUFkLGNBQWMsQ0FBRztRQUMvQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQseURBQXlEO0lBQ3pELDBCQUEwQjtRQUN4QixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQseURBQXlEO0lBQ3pELFVBQVUsQ0FBMkMsR0FBRyxPQUFVO1FBRWhFLE9BQU8sR0FBRyxFQUFFLENBQUMsa0JBQWtCLENBQzNCLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxPQUFPLENBQUMsRUFDN0MsbUNBQW1DLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQseURBQXlEO0lBQ3pELGtCQUFrQixDQUEyQyxHQUFHLE9BQVU7UUFFeEUsT0FBTyxHQUFTLEVBQUUsZ0RBQUMsT0FBQSxDQUFDLE1BQU0sSUFBSSxDQUFDLCtCQUErQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFBLEdBQUEsQ0FBQztJQUN0RixDQUFDO0lBRUQseURBQXlEO0lBQ3pELGFBQWEsQ0FBMkMsR0FBRyxPQUFVO1FB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QUFpRCxRQUFRLEdBQUcsQ0FBQztBQUN0RSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cGFyYWxsZWx9IGZyb20gJy4vY2hhbmdlLWRldGVjdGlvbic7XG5pbXBvcnQge1xuICBBc3luY0ZhY3RvcnlGbixcbiAgQ29tcG9uZW50SGFybmVzcyxcbiAgQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yLFxuICBIYXJuZXNzTG9hZGVyLFxuICBIYXJuZXNzUHJlZGljYXRlLFxuICBIYXJuZXNzUXVlcnksXG4gIExvY2F0b3JGYWN0b3J5LFxuICBMb2NhdG9yRm5SZXN1bHQsXG59IGZyb20gJy4vY29tcG9uZW50LWhhcm5lc3MnO1xuaW1wb3J0IHtUZXN0RWxlbWVudH0gZnJvbSAnLi90ZXN0LWVsZW1lbnQnO1xuXG4vKiogUGFyc2VkIGZvcm0gb2YgdGhlIHF1ZXJpZXMgcGFzc2VkIHRvIHRoZSBgbG9jYXRvckZvcipgIG1ldGhvZHMuICovXG50eXBlIFBhcnNlZFF1ZXJpZXM8VCBleHRlbmRzIENvbXBvbmVudEhhcm5lc3M+ID0ge1xuICAvKiogVGhlIGZ1bGwgbGlzdCBvZiBxdWVyaWVzLCBpbiB0aGVpciBvcmlnaW5hbCBvcmRlci4gKi9cbiAgYWxsUXVlcmllczogKHN0cmluZyB8IEhhcm5lc3NQcmVkaWNhdGU8VD4pW10sXG4gIC8qKlxuICAgKiBBIGZpbHRlcmVkIHZpZXcgb2YgYGFsbFF1ZXJpZXNgIGNvbnRhaW5pbmcgb25seSB0aGUgcXVlcmllcyB0aGF0IGFyZSBsb29raW5nIGZvciBhXG4gICAqIGBDb21wb25lbnRIYXJuZXNzYFxuICAgKi9cbiAgaGFybmVzc1F1ZXJpZXM6IEhhcm5lc3NQcmVkaWNhdGU8VD5bXSxcbiAgLyoqXG4gICAqIEEgZmlsdGVyZWQgdmlldyBvZiBgYWxsUXVlcmllc2AgY29udGFpbmluZyBvbmx5IHRoZSBxdWVyaWVzIHRoYXQgYXJlIGxvb2tpbmcgZm9yIGFcbiAgICogYFRlc3RFbGVtZW50YFxuICAgKi9cbiAgZWxlbWVudFF1ZXJpZXM6IHN0cmluZ1tdLFxuICAvKiogVGhlIHNldCBvZiBhbGwgYENvbXBvbmVudEhhcm5lc3NgIHN1YmNsYXNzZXMgcmVwcmVzZW50ZWQgaW4gdGhlIG9yaWdpbmFsIHF1ZXJ5IGxpc3QuICovXG4gIGhhcm5lc3NUeXBlczogU2V0PENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxUPj4sXG59O1xuXG4vKipcbiAqIEJhc2UgaGFybmVzcyBlbnZpcm9ubWVudCBjbGFzcyB0aGF0IGNhbiBiZSBleHRlbmRlZCB0byBhbGxvdyBgQ29tcG9uZW50SGFybmVzc2BlcyB0byBiZSB1c2VkIGluXG4gKiBkaWZmZXJlbnQgdGVzdCBlbnZpcm9ubWVudHMgKGUuZy4gdGVzdGJlZCwgcHJvdHJhY3RvciwgZXRjLikuIFRoaXMgY2xhc3MgaW1wbGVtZW50cyB0aGVcbiAqIGZ1bmN0aW9uYWxpdHkgb2YgYm90aCBhIGBIYXJuZXNzTG9hZGVyYCBhbmQgYExvY2F0b3JGYWN0b3J5YC4gVGhpcyBjbGFzcyBpcyBnZW5lcmljIG9uIHRoZSByYXdcbiAqIGVsZW1lbnQgdHlwZSwgYEVgLCB1c2VkIGJ5IHRoZSBwYXJ0aWN1bGFyIHRlc3QgZW52aXJvbm1lbnQuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBIYXJuZXNzRW52aXJvbm1lbnQ8RT4gaW1wbGVtZW50cyBIYXJuZXNzTG9hZGVyLCBMb2NhdG9yRmFjdG9yeSB7XG4gIC8vIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgdGhlIGBMb2NhdG9yRmFjdG9yeWAgaW50ZXJmYWNlLlxuICByb290RWxlbWVudDogVGVzdEVsZW1lbnQ7XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHByb3RlY3RlZCByYXdSb290RWxlbWVudDogRSkge1xuICAgIHRoaXMucm9vdEVsZW1lbnQgPSB0aGlzLmNyZWF0ZVRlc3RFbGVtZW50KHJhd1Jvb3RFbGVtZW50KTtcbiAgfVxuXG4gIC8vIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgdGhlIGBMb2NhdG9yRmFjdG9yeWAgaW50ZXJmYWNlLlxuICBkb2N1bWVudFJvb3RMb2NhdG9yRmFjdG9yeSgpOiBMb2NhdG9yRmFjdG9yeSB7XG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlRW52aXJvbm1lbnQodGhpcy5nZXREb2N1bWVudFJvb3QoKSk7XG4gIH1cblxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIHRoZSBgTG9jYXRvckZhY3RvcnlgIGludGVyZmFjZS5cbiAgbG9jYXRvckZvcjxUIGV4dGVuZHMgKEhhcm5lc3NRdWVyeTxhbnk+IHwgc3RyaW5nKVtdPiguLi5xdWVyaWVzOiBUKTpcbiAgICAgIEFzeW5jRmFjdG9yeUZuPExvY2F0b3JGblJlc3VsdDxUPj4ge1xuICAgIHJldHVybiAoKSA9PiBfYXNzZXJ0UmVzdWx0Rm91bmQoXG4gICAgICAgIHRoaXMuX2dldEFsbEhhcm5lc3Nlc0FuZFRlc3RFbGVtZW50cyhxdWVyaWVzKSxcbiAgICAgICAgX2dldERlc2NyaXB0aW9uRm9yTG9jYXRvckZvclF1ZXJpZXMocXVlcmllcykpO1xuICB9XG5cbiAgLy8gSW1wbGVtZW50ZWQgYXMgcGFydCBvZiB0aGUgYExvY2F0b3JGYWN0b3J5YCBpbnRlcmZhY2UuXG4gIGxvY2F0b3JGb3JPcHRpb25hbDxUIGV4dGVuZHMgKEhhcm5lc3NRdWVyeTxhbnk+IHwgc3RyaW5nKVtdPiguLi5xdWVyaWVzOiBUKTpcbiAgICAgIEFzeW5jRmFjdG9yeUZuPExvY2F0b3JGblJlc3VsdDxUPiB8IG51bGw+IHtcbiAgICByZXR1cm4gYXN5bmMgKCkgPT4gKGF3YWl0IHRoaXMuX2dldEFsbEhhcm5lc3Nlc0FuZFRlc3RFbGVtZW50cyhxdWVyaWVzKSlbMF0gfHwgbnVsbDtcbiAgfVxuXG4gIC8vIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgdGhlIGBMb2NhdG9yRmFjdG9yeWAgaW50ZXJmYWNlLlxuICBsb2NhdG9yRm9yQWxsPFQgZXh0ZW5kcyAoSGFybmVzc1F1ZXJ5PGFueT4gfCBzdHJpbmcpW10+KC4uLnF1ZXJpZXM6IFQpOlxuICAgICAgQXN5bmNGYWN0b3J5Rm48TG9jYXRvckZuUmVzdWx0PFQ+W10+IHtcbiAgICByZXR1cm4gKCkgPT4gdGhpcy5fZ2V0QWxsSGFybmVzc2VzQW5kVGVzdEVsZW1lbnRzKHF1ZXJpZXMpO1xuICB9XG5cbiAgLy8gSW1wbGVtZW50ZWQgYXMgcGFydCBvZiB0aGUgYExvY2F0b3JGYWN0b3J5YCBpbnRlcmZhY2UuXG4gIGFzeW5jIHJvb3RIYXJuZXNzTG9hZGVyKCk6IFByb21pc2U8SGFybmVzc0xvYWRlcj4ge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gSW1wbGVtZW50ZWQgYXMgcGFydCBvZiB0aGUgYExvY2F0b3JGYWN0b3J5YCBpbnRlcmZhY2UuXG4gIGFzeW5jIGhhcm5lc3NMb2FkZXJGb3Ioc2VsZWN0b3I6IHN0cmluZyk6IFByb21pc2U8SGFybmVzc0xvYWRlcj4ge1xuICAgIHJldHVybiB0aGlzLmNyZWF0ZUVudmlyb25tZW50KGF3YWl0IF9hc3NlcnRSZXN1bHRGb3VuZCh0aGlzLmdldEFsbFJhd0VsZW1lbnRzKHNlbGVjdG9yKSxcbiAgICAgICAgW19nZXREZXNjcmlwdGlvbkZvckhhcm5lc3NMb2FkZXJRdWVyeShzZWxlY3RvcildKSk7XG4gIH1cblxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIHRoZSBgTG9jYXRvckZhY3RvcnlgIGludGVyZmFjZS5cbiAgYXN5bmMgaGFybmVzc0xvYWRlckZvck9wdGlvbmFsKHNlbGVjdG9yOiBzdHJpbmcpOiBQcm9taXNlPEhhcm5lc3NMb2FkZXIgfCBudWxsPiB7XG4gICAgY29uc3QgZWxlbWVudHMgPSBhd2FpdCB0aGlzLmdldEFsbFJhd0VsZW1lbnRzKHNlbGVjdG9yKTtcbiAgICByZXR1cm4gZWxlbWVudHNbMF0gPyB0aGlzLmNyZWF0ZUVudmlyb25tZW50KGVsZW1lbnRzWzBdKSA6IG51bGw7XG4gIH1cblxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIHRoZSBgTG9jYXRvckZhY3RvcnlgIGludGVyZmFjZS5cbiAgYXN5bmMgaGFybmVzc0xvYWRlckZvckFsbChzZWxlY3Rvcjogc3RyaW5nKTogUHJvbWlzZTxIYXJuZXNzTG9hZGVyW10+IHtcbiAgICBjb25zdCBlbGVtZW50cyA9IGF3YWl0IHRoaXMuZ2V0QWxsUmF3RWxlbWVudHMoc2VsZWN0b3IpO1xuICAgIHJldHVybiBlbGVtZW50cy5tYXAoZWxlbWVudCA9PiB0aGlzLmNyZWF0ZUVudmlyb25tZW50KGVsZW1lbnQpKTtcbiAgfVxuXG4gIC8vIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgdGhlIGBIYXJuZXNzTG9hZGVyYCBpbnRlcmZhY2UuXG4gIGdldEhhcm5lc3M8VCBleHRlbmRzIENvbXBvbmVudEhhcm5lc3M+KHF1ZXJ5OiBIYXJuZXNzUXVlcnk8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRm9yKHF1ZXJ5KSgpO1xuICB9XG5cbiAgLy8gSW1wbGVtZW50ZWQgYXMgcGFydCBvZiB0aGUgYEhhcm5lc3NMb2FkZXJgIGludGVyZmFjZS5cbiAgZ2V0QWxsSGFybmVzc2VzPFQgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzPihxdWVyeTogSGFybmVzc1F1ZXJ5PFQ+KTogUHJvbWlzZTxUW10+IHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRm9yQWxsKHF1ZXJ5KSgpO1xuICB9XG5cbiAgLy8gSW1wbGVtZW50ZWQgYXMgcGFydCBvZiB0aGUgYEhhcm5lc3NMb2FkZXJgIGludGVyZmFjZS5cbiAgYXN5bmMgZ2V0Q2hpbGRMb2FkZXIoc2VsZWN0b3I6IHN0cmluZyk6IFByb21pc2U8SGFybmVzc0xvYWRlcj4ge1xuICAgIHJldHVybiB0aGlzLmNyZWF0ZUVudmlyb25tZW50KGF3YWl0IF9hc3NlcnRSZXN1bHRGb3VuZCh0aGlzLmdldEFsbFJhd0VsZW1lbnRzKHNlbGVjdG9yKSxcbiAgICAgICAgW19nZXREZXNjcmlwdGlvbkZvckhhcm5lc3NMb2FkZXJRdWVyeShzZWxlY3RvcildKSk7XG4gIH1cblxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIHRoZSBgSGFybmVzc0xvYWRlcmAgaW50ZXJmYWNlLlxuICBhc3luYyBnZXRBbGxDaGlsZExvYWRlcnMoc2VsZWN0b3I6IHN0cmluZyk6IFByb21pc2U8SGFybmVzc0xvYWRlcltdPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmdldEFsbFJhd0VsZW1lbnRzKHNlbGVjdG9yKSkubWFwKGUgPT4gdGhpcy5jcmVhdGVFbnZpcm9ubWVudChlKSk7XG4gIH1cblxuICAvKiogQ3JlYXRlcyBhIGBDb21wb25lbnRIYXJuZXNzYCBmb3IgdGhlIGdpdmVuIGhhcm5lc3MgdHlwZSB3aXRoIHRoZSBnaXZlbiByYXcgaG9zdCBlbGVtZW50LiAqL1xuICBwcm90ZWN0ZWQgY3JlYXRlQ29tcG9uZW50SGFybmVzczxUIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcz4oXG4gICAgICBoYXJuZXNzVHlwZTogQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yPFQ+LCBlbGVtZW50OiBFKTogVCB7XG4gICAgcmV0dXJuIG5ldyBoYXJuZXNzVHlwZSh0aGlzLmNyZWF0ZUVudmlyb25tZW50KGVsZW1lbnQpKTtcbiAgfVxuXG4gIC8vIFBhcnQgb2YgTG9jYXRvckZhY3RvcnkgaW50ZXJmYWNlLCBzdWJjbGFzc2VzIHdpbGwgaW1wbGVtZW50LlxuICBhYnN0cmFjdCBmb3JjZVN0YWJpbGl6ZSgpOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8vIFBhcnQgb2YgTG9jYXRvckZhY3RvcnkgaW50ZXJmYWNlLCBzdWJjbGFzc2VzIHdpbGwgaW1wbGVtZW50LlxuICBhYnN0cmFjdCB3YWl0Rm9yVGFza3NPdXRzaWRlQW5ndWxhcigpOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKiBHZXRzIHRoZSByb290IGVsZW1lbnQgZm9yIHRoZSBkb2N1bWVudC4gKi9cbiAgcHJvdGVjdGVkIGFic3RyYWN0IGdldERvY3VtZW50Um9vdCgpOiBFO1xuXG4gIC8qKiBDcmVhdGVzIGEgYFRlc3RFbGVtZW50YCBmcm9tIGEgcmF3IGVsZW1lbnQuICovXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGVUZXN0RWxlbWVudChlbGVtZW50OiBFKTogVGVzdEVsZW1lbnQ7XG5cbiAgLyoqIENyZWF0ZXMgYSBgSGFybmVzc0xvYWRlcmAgcm9vdGVkIGF0IHRoZSBnaXZlbiByYXcgZWxlbWVudC4gKi9cbiAgcHJvdGVjdGVkIGFic3RyYWN0IGNyZWF0ZUVudmlyb25tZW50KGVsZW1lbnQ6IEUpOiBIYXJuZXNzRW52aXJvbm1lbnQ8RT47XG5cbiAgLyoqXG4gICAqIEdldHMgYSBsaXN0IG9mIGFsbCBlbGVtZW50cyBtYXRjaGluZyB0aGUgZ2l2ZW4gc2VsZWN0b3IgdW5kZXIgdGhpcyBlbnZpcm9ubWVudCdzIHJvb3QgZWxlbWVudC5cbiAgICovXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBnZXRBbGxSYXdFbGVtZW50cyhzZWxlY3Rvcjogc3RyaW5nKTogUHJvbWlzZTxFW10+O1xuXG4gIC8qKlxuICAgKiBNYXRjaGVzIHRoZSBnaXZlbiByYXcgZWxlbWVudHMgd2l0aCB0aGUgZ2l2ZW4gbGlzdCBvZiBlbGVtZW50IGFuZCBoYXJuZXNzIHF1ZXJpZXMgdG8gcHJvZHVjZSBhXG4gICAqIGxpc3Qgb2YgbWF0Y2hlZCBoYXJuZXNzZXMgYW5kIHRlc3QgZWxlbWVudHMuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRBbGxIYXJuZXNzZXNBbmRUZXN0RWxlbWVudHM8VCBleHRlbmRzIChIYXJuZXNzUXVlcnk8YW55PiB8IHN0cmluZylbXT4oXG4gICAgICBxdWVyaWVzOiBUKTogUHJvbWlzZTxMb2NhdG9yRm5SZXN1bHQ8VD5bXT4ge1xuICAgIGNvbnN0IHthbGxRdWVyaWVzLCBoYXJuZXNzUXVlcmllcywgZWxlbWVudFF1ZXJpZXMsIGhhcm5lc3NUeXBlc30gPSBfcGFyc2VRdWVyaWVzKHF1ZXJpZXMpO1xuXG4gICAgLy8gQ29tYmluZSBhbGwgb2YgdGhlIHF1ZXJpZXMgaW50byBvbmUgbGFyZ2UgY29tbWEtZGVsaW1pdGVkIHNlbGVjdG9yIGFuZCB1c2UgaXQgdG8gZ2V0IGFsbCByYXdcbiAgICAvLyBlbGVtZW50cyBtYXRjaGluZyBhbnkgb2YgdGhlIGluZGl2aWR1YWwgcXVlcmllcy5cbiAgICBjb25zdCByYXdFbGVtZW50cyA9IGF3YWl0IHRoaXMuZ2V0QWxsUmF3RWxlbWVudHMoXG4gICAgICAgIFsuLi5lbGVtZW50UXVlcmllcywgLi4uaGFybmVzc1F1ZXJpZXMubWFwKHByZWRpY2F0ZSA9PiBwcmVkaWNhdGUuZ2V0U2VsZWN0b3IoKSldLmpvaW4oJywnKSk7XG5cbiAgICAvLyBJZiBldmVyeSBxdWVyeSBpcyBzZWFyY2hpbmcgZm9yIHRoZSBzYW1lIGhhcm5lc3Mgc3ViY2xhc3MsIHdlIGtub3cgZXZlcnkgcmVzdWx0IGNvcnJlc3BvbmRzXG4gICAgLy8gdG8gYW4gaW5zdGFuY2Ugb2YgdGhhdCBzdWJjbGFzcy4gTGlrZXdpc2UsIGlmIGV2ZXJ5IHF1ZXJ5IGlzIGZvciBhIGBUZXN0RWxlbWVudGAsIHdlIGtub3dcbiAgICAvLyBldmVyeSByZXN1bHQgY29ycmVzcG9uZHMgdG8gYSBgVGVzdEVsZW1lbnRgLiBPdGhlcndpc2Ugd2UgbmVlZCB0byB2ZXJpZnkgd2hpY2ggcmVzdWx0IHdhc1xuICAgIC8vIGZvdW5kIGJ5IHdoaWNoIHNlbGVjdG9yIHNvIGl0IGNhbiBiZSBtYXRjaGVkIHRvIHRoZSBhcHByb3ByaWF0ZSBpbnN0YW5jZS5cbiAgICBjb25zdCBza2lwU2VsZWN0b3JDaGVjayA9IChlbGVtZW50UXVlcmllcy5sZW5ndGggPT09IDAgJiYgaGFybmVzc1R5cGVzLnNpemUgPT09IDEpIHx8XG4gICAgICAgIGhhcm5lc3NRdWVyaWVzLmxlbmd0aCA9PT0gMDtcblxuICAgIGNvbnN0IHBlckVsZW1lbnRNYXRjaGVzID0gYXdhaXQgcGFyYWxsZWwoKCkgPT4gcmF3RWxlbWVudHMubWFwKGFzeW5jIHJhd0VsZW1lbnQgPT4ge1xuICAgICAgY29uc3QgdGVzdEVsZW1lbnQgPSB0aGlzLmNyZWF0ZVRlc3RFbGVtZW50KHJhd0VsZW1lbnQpO1xuICAgICAgY29uc3QgYWxsUmVzdWx0c0ZvckVsZW1lbnQgPSBhd2FpdCBwYXJhbGxlbChcbiAgICAgICAgICAvLyBGb3IgZWFjaCBxdWVyeSwgZ2V0IGBudWxsYCBpZiBpdCBkb2Vzbid0IG1hdGNoLCBvciBhIGBUZXN0RWxlbWVudGAgb3JcbiAgICAgICAgICAvLyBgQ29tcG9uZW50SGFybmVzc2AgYXMgYXBwcm9wcmlhdGUgaWYgaXQgZG9lcyBtYXRjaC4gVGhpcyBnaXZlcyB1cyBldmVyeXRoaW5nIHRoYXRcbiAgICAgICAgICAvLyBtYXRjaGVzIHRoZSBjdXJyZW50IHJhdyBlbGVtZW50LCBidXQgaXQgbWF5IGNvbnRhaW4gZHVwbGljYXRlIGVudHJpZXMgKGUuZy5cbiAgICAgICAgICAvLyBtdWx0aXBsZSBgVGVzdEVsZW1lbnRgIG9yIG11bHRpcGxlIGBDb21wb25lbnRIYXJuZXNzYCBvZiB0aGUgc2FtZSB0eXBlKS5cbiAgICAgICAgICAoKSA9PiBhbGxRdWVyaWVzLm1hcChxdWVyeSA9PiB0aGlzLl9nZXRRdWVyeVJlc3VsdEZvckVsZW1lbnQoXG4gICAgICAgICAgICAgIHF1ZXJ5LCByYXdFbGVtZW50LCB0ZXN0RWxlbWVudCwgc2tpcFNlbGVjdG9yQ2hlY2spKSk7XG4gICAgICByZXR1cm4gX3JlbW92ZUR1cGxpY2F0ZVF1ZXJ5UmVzdWx0cyhhbGxSZXN1bHRzRm9yRWxlbWVudCk7XG4gICAgfSkpO1xuICAgIHJldHVybiAoW10gYXMgYW55KS5jb25jYXQoLi4ucGVyRWxlbWVudE1hdGNoZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlIGdpdmVuIHF1ZXJ5IG1hdGNoZXMgdGhlIGdpdmVuIGVsZW1lbnQsIGlmIGl0IGRvZXMgcmV0dXJuIHRoZSBtYXRjaGVkXG4gICAqIGBUZXN0RWxlbWVudGAgb3IgYENvbXBvbmVudEhhcm5lc3NgLCBpZiBpdCBkb2VzIG5vdCwgcmV0dXJuIG51bGwuIEluIGNhc2VzIHdoZXJlIHRoZSBjYWxsZXJcbiAgICoga25vd3MgZm9yIHN1cmUgdGhhdCB0aGUgcXVlcnkgbWF0Y2hlcyB0aGUgZWxlbWVudCdzIHNlbGVjdG9yLCBgc2tpcFNlbGVjdG9yQ2hlY2tgIGNhbiBiZSB1c2VkXG4gICAqIHRvIHNraXAgdmVyaWZpY2F0aW9uIGFuZCBvcHRpbWl6ZSBwZXJmb3JtYW5jZS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX2dldFF1ZXJ5UmVzdWx0Rm9yRWxlbWVudDxUIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcz4oXG4gICAgICBxdWVyeTogc3RyaW5nIHwgSGFybmVzc1ByZWRpY2F0ZTxUPiwgcmF3RWxlbWVudDogRSwgdGVzdEVsZW1lbnQ6IFRlc3RFbGVtZW50LFxuICAgICAgc2tpcFNlbGVjdG9yQ2hlY2s6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8VCB8IFRlc3RFbGVtZW50IHwgbnVsbD4ge1xuICAgIGlmICh0eXBlb2YgcXVlcnkgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gKChza2lwU2VsZWN0b3JDaGVjayB8fCBhd2FpdCB0ZXN0RWxlbWVudC5tYXRjaGVzU2VsZWN0b3IocXVlcnkpKSA/IHRlc3RFbGVtZW50IDogbnVsbCk7XG4gICAgfVxuICAgIGlmIChza2lwU2VsZWN0b3JDaGVjayB8fCBhd2FpdCB0ZXN0RWxlbWVudC5tYXRjaGVzU2VsZWN0b3IocXVlcnkuZ2V0U2VsZWN0b3IoKSkpIHtcbiAgICAgIGNvbnN0IGhhcm5lc3MgPSB0aGlzLmNyZWF0ZUNvbXBvbmVudEhhcm5lc3MocXVlcnkuaGFybmVzc1R5cGUsIHJhd0VsZW1lbnQpO1xuICAgICAgcmV0dXJuIChhd2FpdCBxdWVyeS5ldmFsdWF0ZShoYXJuZXNzKSkgPyBoYXJuZXNzIDogbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzZXMgYSBsaXN0IG9mIHF1ZXJpZXMgaW4gdGhlIGZvcm1hdCBhY2NlcHRlZCBieSB0aGUgYGxvY2F0b3JGb3IqYCBtZXRob2RzIGludG8gYW4gZWFzaWVyIHRvXG4gKiB3b3JrIHdpdGggZm9ybWF0LlxuICovXG5mdW5jdGlvbiBfcGFyc2VRdWVyaWVzPFQgZXh0ZW5kcyAoSGFybmVzc1F1ZXJ5PGFueT4gfCBzdHJpbmcpW10+KHF1ZXJpZXM6IFQpOlxuICAgIFBhcnNlZFF1ZXJpZXM8TG9jYXRvckZuUmVzdWx0PFQ+ICYgQ29tcG9uZW50SGFybmVzcz4ge1xuICBjb25zdCBhbGxRdWVyaWVzID0gW107XG4gIGNvbnN0IGhhcm5lc3NRdWVyaWVzID0gW107XG4gIGNvbnN0IGVsZW1lbnRRdWVyaWVzID0gW107XG4gIGNvbnN0IGhhcm5lc3NUeXBlcyA9XG4gICAgICBuZXcgU2V0PENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxMb2NhdG9yRm5SZXN1bHQ8VD4gJiBDb21wb25lbnRIYXJuZXNzPj4oKTtcblxuICBmb3IgKGNvbnN0IHF1ZXJ5IG9mIHF1ZXJpZXMpIHtcbiAgICBpZiAodHlwZW9mIHF1ZXJ5ID09PSAnc3RyaW5nJykge1xuICAgICAgYWxsUXVlcmllcy5wdXNoKHF1ZXJ5KTtcbiAgICAgIGVsZW1lbnRRdWVyaWVzLnB1c2gocXVlcnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwcmVkaWNhdGUgPSBxdWVyeSBpbnN0YW5jZW9mIEhhcm5lc3NQcmVkaWNhdGUgPyBxdWVyeSA6IG5ldyBIYXJuZXNzUHJlZGljYXRlKHF1ZXJ5LCB7fSk7XG4gICAgICBhbGxRdWVyaWVzLnB1c2gocHJlZGljYXRlKTtcbiAgICAgIGhhcm5lc3NRdWVyaWVzLnB1c2gocHJlZGljYXRlKTtcbiAgICAgIGhhcm5lc3NUeXBlcy5hZGQocHJlZGljYXRlLmhhcm5lc3NUeXBlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge2FsbFF1ZXJpZXMsIGhhcm5lc3NRdWVyaWVzLCBlbGVtZW50UXVlcmllcywgaGFybmVzc1R5cGVzfTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGR1cGxpY2F0ZSBxdWVyeSByZXN1bHRzIGZvciBhIHBhcnRpY3VsYXIgZWxlbWVudC4gKGUuZy4gbXVsdGlwbGUgYFRlc3RFbGVtZW50YFxuICogaW5zdGFuY2VzIG9yIG11bHRpcGxlIGluc3RhbmNlcyBvZiB0aGUgc2FtZSBgQ29tcG9uZW50SGFybmVzc2AgY2xhc3MuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIF9yZW1vdmVEdXBsaWNhdGVRdWVyeVJlc3VsdHM8VCBleHRlbmRzIChDb21wb25lbnRIYXJuZXNzIHwgVGVzdEVsZW1lbnQgfCBudWxsKVtdPihcbiAgICByZXN1bHRzOiBUKTogUHJvbWlzZTxUPiB7XG4gIGxldCB0ZXN0RWxlbWVudE1hdGNoZWQgPSBmYWxzZTtcbiAgbGV0IG1hdGNoZWRIYXJuZXNzVHlwZXMgPSBuZXcgU2V0KCk7XG4gIGNvbnN0IGRlZHVwZWRNYXRjaGVzID0gW107XG4gIGZvciAoY29uc3QgcmVzdWx0IG9mIHJlc3VsdHMpIHtcbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBDb21wb25lbnRIYXJuZXNzKSB7XG4gICAgICBpZiAoIW1hdGNoZWRIYXJuZXNzVHlwZXMuaGFzKHJlc3VsdC5jb25zdHJ1Y3RvcikpIHtcbiAgICAgICAgbWF0Y2hlZEhhcm5lc3NUeXBlcy5hZGQocmVzdWx0LmNvbnN0cnVjdG9yKTtcbiAgICAgICAgZGVkdXBlZE1hdGNoZXMucHVzaChyZXN1bHQpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXRlc3RFbGVtZW50TWF0Y2hlZCkge1xuICAgICAgdGVzdEVsZW1lbnRNYXRjaGVkID0gdHJ1ZTtcbiAgICAgIGRlZHVwZWRNYXRjaGVzLnB1c2gocmVzdWx0KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlZHVwZWRNYXRjaGVzIGFzIFQ7XG59XG5cbi8qKiBWZXJpZmllcyB0aGF0IHRoZXJlIGlzIGF0IGxlYXN0IG9uZSByZXN1bHQgaW4gYW4gYXJyYXkuICovXG5hc3luYyBmdW5jdGlvbiBfYXNzZXJ0UmVzdWx0Rm91bmQ8VD4ocmVzdWx0czogUHJvbWlzZTxUW10+LCBxdWVyeURlc2NyaXB0aW9uczogc3RyaW5nW10pOlxuICAgIFByb21pc2U8VD4ge1xuICBjb25zdCByZXN1bHQgPSAoYXdhaXQgcmVzdWx0cylbMF07XG4gIGlmIChyZXN1bHQgPT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgRXJyb3IoYEZhaWxlZCB0byBmaW5kIGVsZW1lbnQgbWF0Y2hpbmcgb25lIG9mIHRoZSBmb2xsb3dpbmcgcXVlcmllczpcXG5gICtcbiAgICAgICAgcXVlcnlEZXNjcmlwdGlvbnMubWFwKGRlc2MgPT4gYCgke2Rlc2N9KWApLmpvaW4oJyxcXG4nKSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqIEdldHMgYSBsaXN0IG9mIGRlc2NyaXB0aW9uIHN0cmluZ3MgZnJvbSBhIGxpc3Qgb2YgcXVlcmllcy4gKi9cbmZ1bmN0aW9uIF9nZXREZXNjcmlwdGlvbkZvckxvY2F0b3JGb3JRdWVyaWVzKHF1ZXJpZXM6IChzdHJpbmcgfCBIYXJuZXNzUXVlcnk8YW55PilbXSkge1xuICByZXR1cm4gcXVlcmllcy5tYXAocXVlcnkgPT4gdHlwZW9mIHF1ZXJ5ID09PSAnc3RyaW5nJyA/XG4gICAgICBfZ2V0RGVzY3JpcHRpb25Gb3JUZXN0RWxlbWVudFF1ZXJ5KHF1ZXJ5KSA6IF9nZXREZXNjcmlwdGlvbkZvckNvbXBvbmVudEhhcm5lc3NRdWVyeShxdWVyeSkpO1xufVxuXG4vKiogR2V0cyBhIGRlc2NyaXB0aW9uIHN0cmluZyBmb3IgYSBgQ29tcG9uZW50SGFybmVzc2AgcXVlcnkuICovXG5mdW5jdGlvbiBfZ2V0RGVzY3JpcHRpb25Gb3JDb21wb25lbnRIYXJuZXNzUXVlcnkocXVlcnk6IEhhcm5lc3NRdWVyeTxhbnk+KSB7XG4gIGNvbnN0IGhhcm5lc3NQcmVkaWNhdGUgPVxuICAgICAgcXVlcnkgaW5zdGFuY2VvZiBIYXJuZXNzUHJlZGljYXRlID8gcXVlcnkgOiBuZXcgSGFybmVzc1ByZWRpY2F0ZShxdWVyeSwge30pO1xuICBjb25zdCB7bmFtZSwgaG9zdFNlbGVjdG9yfSA9IGhhcm5lc3NQcmVkaWNhdGUuaGFybmVzc1R5cGU7XG4gIGNvbnN0IGRlc2NyaXB0aW9uID0gYCR7bmFtZX0gd2l0aCBob3N0IGVsZW1lbnQgbWF0Y2hpbmcgc2VsZWN0b3I6IFwiJHtob3N0U2VsZWN0b3J9XCJgO1xuICBjb25zdCBjb25zdHJhaW50cyA9IGhhcm5lc3NQcmVkaWNhdGUuZ2V0RGVzY3JpcHRpb24oKTtcbiAgcmV0dXJuIGRlc2NyaXB0aW9uICsgKGNvbnN0cmFpbnRzID9cbiAgICAgIGAgc2F0aXNmeWluZyB0aGUgY29uc3RyYWludHM6ICR7aGFybmVzc1ByZWRpY2F0ZS5nZXREZXNjcmlwdGlvbigpfWAgOiAnJyk7XG59XG5cbi8qKiBHZXRzIGEgZGVzY3JpcHRpb24gc3RyaW5nIGZvciBhIGBUZXN0RWxlbWVudGAgcXVlcnkuICovXG5mdW5jdGlvbiBfZ2V0RGVzY3JpcHRpb25Gb3JUZXN0RWxlbWVudFF1ZXJ5KHNlbGVjdG9yOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGBUZXN0RWxlbWVudCBmb3IgZWxlbWVudCBtYXRjaGluZyBzZWxlY3RvcjogXCIke3NlbGVjdG9yfVwiYDtcbn1cblxuLyoqIEdldHMgYSBkZXNjcmlwdGlvbiBzdHJpbmcgZm9yIGEgYEhhcm5lc3NMb2FkZXJgIHF1ZXJ5LiAqL1xuZnVuY3Rpb24gX2dldERlc2NyaXB0aW9uRm9ySGFybmVzc0xvYWRlclF1ZXJ5KHNlbGVjdG9yOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGBIYXJuZXNzTG9hZGVyIGZvciBlbGVtZW50IG1hdGNoaW5nIHNlbGVjdG9yOiBcIiR7c2VsZWN0b3J9XCJgO1xufVxuIl19