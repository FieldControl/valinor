/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { parallel } from './change-detection';
/**
 * Base class for component harnesses that all component harness authors should extend. This base
 * component harness provides the basic ability to locate element and sub-component harness. It
 * should be inherited when defining user's own harness.
 */
export class ComponentHarness {
    constructor(locatorFactory) {
        this.locatorFactory = locatorFactory;
    }
    /** Gets a `Promise` for the `TestElement` representing the host element of the component. */
    host() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorFactory.rootElement;
        });
    }
    /**
     * Gets a `LocatorFactory` for the document root element. This factory can be used to create
     * locators for elements that a component creates outside of its own root element. (e.g. by
     * appending to document.body).
     */
    documentRootLocatorFactory() {
        return this.locatorFactory.documentRootLocatorFactory();
    }
    /**
     * Creates an asynchronous locator function that can be used to find a `ComponentHarness` instance
     * or element under the host element of this `ComponentHarness`.
     * @param queries A list of queries specifying which harnesses and elements to search for:
     *   - A `string` searches for elements matching the CSS selector specified by the string.
     *   - A `ComponentHarness` constructor searches for `ComponentHarness` instances matching the
     *     given class.
     *   - A `HarnessPredicate` searches for `ComponentHarness` instances matching the given
     *     predicate.
     * @return An asynchronous locator function that searches for and returns a `Promise` for the
     *   first element or harness matching the given search criteria. Matches are ordered first by
     *   order in the DOM, and second by order in the queries list. If no matches are found, the
     *   `Promise` rejects. The type that the `Promise` resolves to is a union of all result types for
     *   each query.
     *
     * e.g. Given the following DOM: `<div id="d1" /><div id="d2" />`, and assuming
     * `DivHarness.hostSelector === 'div'`:
     * - `await ch.locatorFor(DivHarness, 'div')()` gets a `DivHarness` instance for `#d1`
     * - `await ch.locatorFor('div', DivHarness)()` gets a `TestElement` instance for `#d1`
     * - `await ch.locatorFor('span')()` throws because the `Promise` rejects.
     */
    locatorFor(...queries) {
        return this.locatorFactory.locatorFor(...queries);
    }
    /**
     * Creates an asynchronous locator function that can be used to find a `ComponentHarness` instance
     * or element under the host element of this `ComponentHarness`.
     * @param queries A list of queries specifying which harnesses and elements to search for:
     *   - A `string` searches for elements matching the CSS selector specified by the string.
     *   - A `ComponentHarness` constructor searches for `ComponentHarness` instances matching the
     *     given class.
     *   - A `HarnessPredicate` searches for `ComponentHarness` instances matching the given
     *     predicate.
     * @return An asynchronous locator function that searches for and returns a `Promise` for the
     *   first element or harness matching the given search criteria. Matches are ordered first by
     *   order in the DOM, and second by order in the queries list. If no matches are found, the
     *   `Promise` is resolved with `null`. The type that the `Promise` resolves to is a union of all
     *   result types for each query or null.
     *
     * e.g. Given the following DOM: `<div id="d1" /><div id="d2" />`, and assuming
     * `DivHarness.hostSelector === 'div'`:
     * - `await ch.locatorForOptional(DivHarness, 'div')()` gets a `DivHarness` instance for `#d1`
     * - `await ch.locatorForOptional('div', DivHarness)()` gets a `TestElement` instance for `#d1`
     * - `await ch.locatorForOptional('span')()` gets `null`.
     */
    locatorForOptional(...queries) {
        return this.locatorFactory.locatorForOptional(...queries);
    }
    /**
     * Creates an asynchronous locator function that can be used to find `ComponentHarness` instances
     * or elements under the host element of this `ComponentHarness`.
     * @param queries A list of queries specifying which harnesses and elements to search for:
     *   - A `string` searches for elements matching the CSS selector specified by the string.
     *   - A `ComponentHarness` constructor searches for `ComponentHarness` instances matching the
     *     given class.
     *   - A `HarnessPredicate` searches for `ComponentHarness` instances matching the given
     *     predicate.
     * @return An asynchronous locator function that searches for and returns a `Promise` for all
     *   elements and harnesses matching the given search criteria. Matches are ordered first by
     *   order in the DOM, and second by order in the queries list. If an element matches more than
     *   one `ComponentHarness` class, the locator gets an instance of each for the same element. If
     *   an element matches multiple `string` selectors, only one `TestElement` instance is returned
     *   for that element. The type that the `Promise` resolves to is an array where each element is
     *   the union of all result types for each query.
     *
     * e.g. Given the following DOM: `<div id="d1" /><div id="d2" />`, and assuming
     * `DivHarness.hostSelector === 'div'` and `IdIsD1Harness.hostSelector === '#d1'`:
     * - `await ch.locatorForAll(DivHarness, 'div')()` gets `[
     *     DivHarness, // for #d1
     *     TestElement, // for #d1
     *     DivHarness, // for #d2
     *     TestElement // for #d2
     *   ]`
     * - `await ch.locatorForAll('div', '#d1')()` gets `[
     *     TestElement, // for #d1
     *     TestElement // for #d2
     *   ]`
     * - `await ch.locatorForAll(DivHarness, IdIsD1Harness)()` gets `[
     *     DivHarness, // for #d1
     *     IdIsD1Harness, // for #d1
     *     DivHarness // for #d2
     *   ]`
     * - `await ch.locatorForAll('span')()` gets `[]`.
     */
    locatorForAll(...queries) {
        return this.locatorFactory.locatorForAll(...queries);
    }
    /**
     * Flushes change detection and async tasks in the Angular zone.
     * In most cases it should not be necessary to call this manually. However, there may be some edge
     * cases where it is needed to fully flush animation events.
     */
    forceStabilize() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorFactory.forceStabilize();
        });
    }
    /**
     * Waits for all scheduled or running async tasks to complete. This allows harness
     * authors to wait for async tasks outside of the Angular zone.
     */
    waitForTasksOutsideAngular() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorFactory.waitForTasksOutsideAngular();
        });
    }
}
/**
 * Base class for component harnesses that authors should extend if they anticipate that consumers
 * of the harness may want to access other harnesses within the `<ng-content>` of the component.
 */
export class ContentContainerComponentHarness extends ComponentHarness {
    getChildLoader(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getRootHarnessLoader()).getChildLoader(selector);
        });
    }
    getAllChildLoaders(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getRootHarnessLoader()).getAllChildLoaders(selector);
        });
    }
    getHarness(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getRootHarnessLoader()).getHarness(query);
        });
    }
    getAllHarnesses(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getRootHarnessLoader()).getAllHarnesses(query);
        });
    }
    /**
     * Gets the root harness loader from which to start
     * searching for content contained by this harness.
     */
    getRootHarnessLoader() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorFactory.rootHarnessLoader();
        });
    }
}
/**
 * A class used to associate a ComponentHarness class with predicates functions that can be used to
 * filter instances of the class.
 */
export class HarnessPredicate {
    constructor(harnessType, options) {
        this.harnessType = harnessType;
        this._predicates = [];
        this._descriptions = [];
        this._addBaseOptions(options);
    }
    /**
     * Checks if the specified nullable string value matches the given pattern.
     * @param value The nullable string value to check, or a Promise resolving to the
     *   nullable string value.
     * @param pattern The pattern the value is expected to match. If `pattern` is a string,
     *   `value` is expected to match exactly. If `pattern` is a regex, a partial match is
     *   allowed. If `pattern` is `null`, the value is expected to be `null`.
     * @return Whether the value matches the pattern.
     */
    static stringMatches(value, pattern) {
        return __awaiter(this, void 0, void 0, function* () {
            value = yield value;
            if (pattern === null) {
                return value === null;
            }
            else if (value === null) {
                return false;
            }
            return typeof pattern === 'string' ? value === pattern : pattern.test(value);
        });
    }
    /**
     * Adds a predicate function to be run against candidate harnesses.
     * @param description A description of this predicate that may be used in error messages.
     * @param predicate An async predicate function.
     * @return this (for method chaining).
     */
    add(description, predicate) {
        this._descriptions.push(description);
        this._predicates.push(predicate);
        return this;
    }
    /**
     * Adds a predicate function that depends on an option value to be run against candidate
     * harnesses. If the option value is undefined, the predicate will be ignored.
     * @param name The name of the option (may be used in error messages).
     * @param option The option value.
     * @param predicate The predicate function to run if the option value is not undefined.
     * @return this (for method chaining).
     */
    addOption(name, option, predicate) {
        if (option !== undefined) {
            this.add(`${name} = ${_valueAsString(option)}`, item => predicate(item, option));
        }
        return this;
    }
    /**
     * Filters a list of harnesses on this predicate.
     * @param harnesses The list of harnesses to filter.
     * @return A list of harnesses that satisfy this predicate.
     */
    filter(harnesses) {
        return __awaiter(this, void 0, void 0, function* () {
            if (harnesses.length === 0) {
                return [];
            }
            const results = yield parallel(() => harnesses.map(h => this.evaluate(h)));
            return harnesses.filter((_, i) => results[i]);
        });
    }
    /**
     * Evaluates whether the given harness satisfies this predicate.
     * @param harness The harness to check
     * @return A promise that resolves to true if the harness satisfies this predicate,
     *   and resolves to false otherwise.
     */
    evaluate(harness) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield parallel(() => this._predicates.map(p => p(harness)));
            return results.reduce((combined, current) => combined && current, true);
        });
    }
    /** Gets a description of this predicate for use in error messages. */
    getDescription() {
        return this._descriptions.join(', ');
    }
    /** Gets the selector used to find candidate elements. */
    getSelector() {
        // We don't have to go through the extra trouble if there are no ancestors.
        if (!this._ancestor) {
            return (this.harnessType.hostSelector || '').trim();
        }
        const [ancestors, ancestorPlaceholders] = _splitAndEscapeSelector(this._ancestor);
        const [selectors, selectorPlaceholders] = _splitAndEscapeSelector(this.harnessType.hostSelector || '');
        const result = [];
        // We have to add the ancestor to each part of the host compound selector, otherwise we can get
        // incorrect results. E.g. `.ancestor .a, .ancestor .b` vs `.ancestor .a, .b`.
        ancestors.forEach(escapedAncestor => {
            const ancestor = _restoreSelector(escapedAncestor, ancestorPlaceholders);
            return selectors.forEach(escapedSelector => result.push(`${ancestor} ${_restoreSelector(escapedSelector, selectorPlaceholders)}`));
        });
        return result.join(', ');
    }
    /** Adds base options common to all harness types. */
    _addBaseOptions(options) {
        this._ancestor = options.ancestor || '';
        if (this._ancestor) {
            this._descriptions.push(`has ancestor matching selector "${this._ancestor}"`);
        }
        const selector = options.selector;
        if (selector !== undefined) {
            this.add(`host matches selector "${selector}"`, (item) => __awaiter(this, void 0, void 0, function* () {
                return (yield item.host()).matchesSelector(selector);
            }));
        }
    }
}
/** Represent a value as a string for the purpose of logging. */
function _valueAsString(value) {
    if (value === undefined) {
        return 'undefined';
    }
    // `JSON.stringify` doesn't handle RegExp properly, so we need a custom replacer.
    try {
        return JSON.stringify(value, (_, v) => {
            if (v instanceof RegExp) {
                return `/${v.toString()}/`;
            }
            return typeof v === 'string' ? v.replace('/\//g', '\\/') : v;
        }).replace(/"\/\//g, '\\/').replace(/\/\/"/g, '\\/').replace(/\\\//g, '/');
    }
    catch (_a) {
        // `JSON.stringify` will throw if the object is cyclical,
        // in this case the best we can do is report the value as `{...}`.
        return '{...}';
    }
}
/**
 * Splits up a compound selector into its parts and escapes any quoted content. The quoted content
 * has to be escaped, because it can contain commas which will throw throw us off when trying to
 * split it.
 * @param selector Selector to be split.
 * @returns The escaped string where any quoted content is replaced with a placeholder. E.g.
 * `[foo="bar"]` turns into `[foo=__cdkPlaceholder-0__]`. Use `_restoreSelector` to restore
 * the placeholders.
 */
function _splitAndEscapeSelector(selector) {
    const placeholders = [];
    // Note that the regex doesn't account for nested quotes so something like `"ab'cd'e"` will be
    // considered as two blocks. It's a bit of an edge case, but if we find that it's a problem,
    // we can make it a bit smarter using a loop. Use this for now since it's more readable and
    // compact. More complete implementation:
    // https://github.com/angular/angular/blob/bd34bc9e89f18a/packages/compiler/src/shadow_css.ts#L655
    const result = selector.replace(/(["'][^["']*["'])/g, (_, keep) => {
        const replaceBy = `__cdkPlaceholder-${placeholders.length}__`;
        placeholders.push(keep);
        return replaceBy;
    });
    return [result.split(',').map(part => part.trim()), placeholders];
}
/** Restores a selector whose content was escaped in `_splitAndEscapeSelector`. */
function _restoreSelector(selector, placeholders) {
    return selector.replace(/__cdkPlaceholder-(\d+)__/g, (_, index) => placeholders[+index]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3Rlc3RpbmcvY29tcG9uZW50LWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQTZPNUM7Ozs7R0FJRztBQUNILE1BQU0sT0FBZ0IsZ0JBQWdCO0lBQ3BDLFlBQStCLGNBQThCO1FBQTlCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtJQUFHLENBQUM7SUFFakUsNkZBQTZGO0lBQ3ZGLElBQUk7O1lBQ1IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQztRQUN6QyxDQUFDO0tBQUE7SUFFRDs7OztPQUlHO0lBQ08sMEJBQTBCO1FBQ2xDLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0lBQzFELENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FvQkc7SUFDTyxVQUFVLENBQTJDLEdBQUcsT0FBVTtRQUUxRSxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQW9CRztJQUNPLGtCQUFrQixDQUEyQyxHQUFHLE9BQVU7UUFFbEYsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQW1DRztJQUNPLGFBQWEsQ0FBMkMsR0FBRyxPQUFVO1FBRTdFLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNhLGNBQWM7O1lBQzVC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O1FBQzlELFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEIsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNwRSxDQUFDO0FBRUQsa0ZBQWtGO0FBQ2xGLFNBQVMsZ0JBQWdCLENBQUMsUUFBZ0IsRUFBRSxZQUFzQjtJQUNoRSxPQUFPLFFBQVEsQ0FBQyxPQUFPLENBQUMsMkJBQTJCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQzNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtwYXJhbGxlbH0gZnJvbSAnLi9jaGFuZ2UtZGV0ZWN0aW9uJztcbmltcG9ydCB7VGVzdEVsZW1lbnR9IGZyb20gJy4vdGVzdC1lbGVtZW50JztcblxuLyoqIEFuIGFzeW5jIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHByb21pc2Ugd2hlbiBjYWxsZWQuICovXG5leHBvcnQgdHlwZSBBc3luY0ZhY3RvcnlGbjxUPiA9ICgpID0+IFByb21pc2U8VD47XG5cbi8qKiBBbiBhc3luYyBmdW5jdGlvbiB0aGF0IHRha2VzIGFuIGl0ZW0gYW5kIHJldHVybnMgYSBib29sZWFuIHByb21pc2UgKi9cbmV4cG9ydCB0eXBlIEFzeW5jUHJlZGljYXRlPFQ+ID0gKGl0ZW06IFQpID0+IFByb21pc2U8Ym9vbGVhbj47XG5cbi8qKiBBbiBhc3luYyBmdW5jdGlvbiB0aGF0IHRha2VzIGFuIGl0ZW0gYW5kIGFuIG9wdGlvbiB2YWx1ZSBhbmQgcmV0dXJucyBhIGJvb2xlYW4gcHJvbWlzZS4gKi9cbmV4cG9ydCB0eXBlIEFzeW5jT3B0aW9uUHJlZGljYXRlPFQsIE8+ID0gKGl0ZW06IFQsIG9wdGlvbjogTykgPT4gUHJvbWlzZTxib29sZWFuPjtcblxuLyoqXG4gKiBBIHF1ZXJ5IGZvciBhIGBDb21wb25lbnRIYXJuZXNzYCwgd2hpY2ggaXMgZXhwcmVzc2VkIGFzIGVpdGhlciBhIGBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3JgIG9yXG4gKiBhIGBIYXJuZXNzUHJlZGljYXRlYC5cbiAqL1xuZXhwb3J0IHR5cGUgSGFybmVzc1F1ZXJ5PFQgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzPiA9XG4gICAgQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yPFQ+IHwgSGFybmVzc1ByZWRpY2F0ZTxUPjtcblxuLyoqXG4gKiBUaGUgcmVzdWx0IHR5cGUgb2J0YWluZWQgd2hlbiBzZWFyY2hpbmcgdXNpbmcgYSBwYXJ0aWN1bGFyIGxpc3Qgb2YgcXVlcmllcy4gVGhpcyB0eXBlIGRlcGVuZHMgb25cbiAqIHRoZSBwYXJ0aWN1bGFyIGl0ZW1zIGJlaW5nIHF1ZXJpZWQuXG4gKiAtIElmIG9uZSBvZiB0aGUgcXVlcmllcyBpcyBmb3IgYSBgQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yPEMxPmAsIGl0IG1lYW5zIHRoYXQgdGhlIHJlc3VsdFxuICogICBtaWdodCBiZSBhIGhhcm5lc3Mgb2YgdHlwZSBgQzFgXG4gKiAtIElmIG9uZSBvZiB0aGUgcXVlcmllcyBpcyBmb3IgYSBgSGFybmVzc1ByZWRpY2F0ZTxDMj5gLCBpdCBtZWFucyB0aGF0IHRoZSByZXN1bHQgbWlnaHQgYmUgYVxuICogICBoYXJuZXNzIG9mIHR5cGUgYEMyYFxuICogLSBJZiBvbmUgb2YgdGhlIHF1ZXJpZXMgaXMgZm9yIGEgYHN0cmluZ2AsIGl0IG1lYW5zIHRoYXQgdGhlIHJlc3VsdCBtaWdodCBiZSBhIGBUZXN0RWxlbWVudGAuXG4gKlxuICogU2luY2Ugd2UgZG9uJ3Qga25vdyBmb3Igc3VyZSB3aGljaCBxdWVyeSB3aWxsIG1hdGNoLCB0aGUgcmVzdWx0IHR5cGUgaWYgdGhlIHVuaW9uIG9mIHRoZSB0eXBlc1xuICogZm9yIGFsbCBwb3NzaWJsZSByZXN1bHRzLlxuICpcbiAqIGUuZy5cbiAqIFRoZSB0eXBlOlxuICogYExvY2F0b3JGblJlc3VsdCZsdDtbXG4gKiAgIENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvciZsdDtNeUhhcm5lc3MmZ3Q7LFxuICogICBIYXJuZXNzUHJlZGljYXRlJmx0O015T3RoZXJIYXJuZXNzJmd0OyxcbiAqICAgc3RyaW5nXG4gKiBdJmd0O2BcbiAqIGlzIGVxdWl2YWxlbnQgdG86XG4gKiBgTXlIYXJuZXNzIHwgTXlPdGhlckhhcm5lc3MgfCBUZXN0RWxlbWVudGAuXG4gKi9cbmV4cG9ydCB0eXBlIExvY2F0b3JGblJlc3VsdDxUIGV4dGVuZHMgKEhhcm5lc3NRdWVyeTxhbnk+IHwgc3RyaW5nKVtdPiA9IHtcbiAgW0kgaW4ga2V5b2YgVF06XG4gICAgICAvLyBNYXAgYENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxDPmAgdG8gYENgLlxuICAgICAgVFtJXSBleHRlbmRzIG5ldyAoLi4uYXJnczogYW55W10pID0+IGluZmVyIEMgPyBDIDpcbiAgICAgIC8vIE1hcCBgSGFybmVzc1ByZWRpY2F0ZTxDPmAgdG8gYENgLlxuICAgICAgVFtJXSBleHRlbmRzIHsgaGFybmVzc1R5cGU6IG5ldyAoLi4uYXJnczogYW55W10pID0+IGluZmVyIEMgfSA/IEMgOlxuICAgICAgLy8gTWFwIGBzdHJpbmdgIHRvIGBUZXN0RWxlbWVudGAuXG4gICAgICBUW0ldIGV4dGVuZHMgc3RyaW5nID8gVGVzdEVsZW1lbnQgOlxuICAgICAgLy8gTWFwIGV2ZXJ5dGhpbmcgZWxzZSB0byBgbmV2ZXJgIChzaG91bGQgbm90IGhhcHBlbiBkdWUgdG8gdGhlIHR5cGUgY29uc3RyYWludCBvbiBgVGApLlxuICAgICAgbmV2ZXI7XG59W251bWJlcl07XG5cblxuLyoqXG4gKiBJbnRlcmZhY2UgdXNlZCB0byBsb2FkIENvbXBvbmVudEhhcm5lc3Mgb2JqZWN0cy4gVGhpcyBpbnRlcmZhY2UgaXMgdXNlZCBieSB0ZXN0IGF1dGhvcnMgdG9cbiAqIGluc3RhbnRpYXRlIGBDb21wb25lbnRIYXJuZXNzYGVzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEhhcm5lc3NMb2FkZXIge1xuICAvKipcbiAgICogU2VhcmNoZXMgZm9yIGFuIGVsZW1lbnQgd2l0aCB0aGUgZ2l2ZW4gc2VsZWN0b3IgdW5kZXIgdGhlIGN1cnJlbnQgaW5zdGFuY2VzJ3Mgcm9vdCBlbGVtZW50LFxuICAgKiBhbmQgcmV0dXJucyBhIGBIYXJuZXNzTG9hZGVyYCByb290ZWQgYXQgdGhlIG1hdGNoaW5nIGVsZW1lbnQuIElmIG11bHRpcGxlIGVsZW1lbnRzIG1hdGNoIHRoZVxuICAgKiBzZWxlY3RvciwgdGhlIGZpcnN0IGlzIHVzZWQuIElmIG5vIGVsZW1lbnRzIG1hdGNoLCBhbiBlcnJvciBpcyB0aHJvd24uXG4gICAqIEBwYXJhbSBzZWxlY3RvciBUaGUgc2VsZWN0b3IgZm9yIHRoZSByb290IGVsZW1lbnQgb2YgdGhlIG5ldyBgSGFybmVzc0xvYWRlcmBcbiAgICogQHJldHVybiBBIGBIYXJuZXNzTG9hZGVyYCByb290ZWQgYXQgdGhlIGVsZW1lbnQgbWF0Y2hpbmcgdGhlIGdpdmVuIHNlbGVjdG9yLlxuICAgKiBAdGhyb3dzIElmIGEgbWF0Y2hpbmcgZWxlbWVudCBjYW4ndCBiZSBmb3VuZC5cbiAgICovXG4gIGdldENoaWxkTG9hZGVyKHNlbGVjdG9yOiBzdHJpbmcpOiBQcm9taXNlPEhhcm5lc3NMb2FkZXI+O1xuXG4gIC8qKlxuICAgKiBTZWFyY2hlcyBmb3IgYWxsIGVsZW1lbnRzIHdpdGggdGhlIGdpdmVuIHNlbGVjdG9yIHVuZGVyIHRoZSBjdXJyZW50IGluc3RhbmNlcydzIHJvb3QgZWxlbWVudCxcbiAgICogYW5kIHJldHVybnMgYW4gYXJyYXkgb2YgYEhhcm5lc3NMb2FkZXJgcywgb25lIGZvciBlYWNoIG1hdGNoaW5nIGVsZW1lbnQsIHJvb3RlZCBhdCB0aGF0XG4gICAqIGVsZW1lbnQuXG4gICAqIEBwYXJhbSBzZWxlY3RvciBUaGUgc2VsZWN0b3IgZm9yIHRoZSByb290IGVsZW1lbnQgb2YgdGhlIG5ldyBgSGFybmVzc0xvYWRlcmBcbiAgICogQHJldHVybiBBIGxpc3Qgb2YgYEhhcm5lc3NMb2FkZXJgcywgb25lIGZvciBlYWNoIG1hdGNoaW5nIGVsZW1lbnQsIHJvb3RlZCBhdCB0aGF0IGVsZW1lbnQuXG4gICAqL1xuICBnZXRBbGxDaGlsZExvYWRlcnMoc2VsZWN0b3I6IHN0cmluZyk6IFByb21pc2U8SGFybmVzc0xvYWRlcltdPjtcblxuICAvKipcbiAgICogU2VhcmNoZXMgZm9yIGFuIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW4gaGFybmVzcyB0eXBlIHVuZGVyIHRoZVxuICAgKiBgSGFybmVzc0xvYWRlcmAncyByb290IGVsZW1lbnQsIGFuZCByZXR1cm5zIGEgYENvbXBvbmVudEhhcm5lc3NgIGZvciB0aGF0IGluc3RhbmNlLiBJZiBtdWx0aXBsZVxuICAgKiBtYXRjaGluZyBjb21wb25lbnRzIGFyZSBmb3VuZCwgYSBoYXJuZXNzIGZvciB0aGUgZmlyc3Qgb25lIGlzIHJldHVybmVkLiBJZiBubyBtYXRjaGluZ1xuICAgKiBjb21wb25lbnQgaXMgZm91bmQsIGFuIGVycm9yIGlzIHRocm93bi5cbiAgICogQHBhcmFtIHF1ZXJ5IEEgcXVlcnkgZm9yIGEgaGFybmVzcyB0byBjcmVhdGVcbiAgICogQHJldHVybiBBbiBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gaGFybmVzcyB0eXBlXG4gICAqIEB0aHJvd3MgSWYgYSBtYXRjaGluZyBjb21wb25lbnQgaW5zdGFuY2UgY2FuJ3QgYmUgZm91bmQuXG4gICAqL1xuICBnZXRIYXJuZXNzPFQgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzPihxdWVyeTogSGFybmVzc1F1ZXJ5PFQ+KTogUHJvbWlzZTxUPjtcblxuICAvKipcbiAgICogU2VhcmNoZXMgZm9yIGFsbCBpbnN0YW5jZXMgb2YgdGhlIGNvbXBvbmVudCBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlbiBoYXJuZXNzIHR5cGUgdW5kZXIgdGhlXG4gICAqIGBIYXJuZXNzTG9hZGVyYCdzIHJvb3QgZWxlbWVudCwgYW5kIHJldHVybnMgYSBsaXN0IGBDb21wb25lbnRIYXJuZXNzYCBmb3IgZWFjaCBpbnN0YW5jZS5cbiAgICogQHBhcmFtIHF1ZXJ5IEEgcXVlcnkgZm9yIGEgaGFybmVzcyB0byBjcmVhdGVcbiAgICogQHJldHVybiBBIGxpc3QgaW5zdGFuY2VzIG9mIHRoZSBnaXZlbiBoYXJuZXNzIHR5cGUuXG4gICAqL1xuICBnZXRBbGxIYXJuZXNzZXM8VCBleHRlbmRzIENvbXBvbmVudEhhcm5lc3M+KHF1ZXJ5OiBIYXJuZXNzUXVlcnk8VD4pOiBQcm9taXNlPFRbXT47XG59XG5cbi8qKlxuICogSW50ZXJmYWNlIHVzZWQgdG8gY3JlYXRlIGFzeW5jaHJvbm91cyBsb2NhdG9yIGZ1bmN0aW9ucyB1c2VkIGZpbmQgZWxlbWVudHMgYW5kIGNvbXBvbmVudFxuICogaGFybmVzc2VzLiBUaGlzIGludGVyZmFjZSBpcyB1c2VkIGJ5IGBDb21wb25lbnRIYXJuZXNzYCBhdXRob3JzIHRvIGNyZWF0ZSBsb2NhdG9yIGZ1bmN0aW9ucyBmb3JcbiAqIHRoZWlyIGBDb21wb25lbnRIYXJuZXNzYCBzdWJjbGFzcy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2NhdG9yRmFjdG9yeSB7XG4gIC8qKiBHZXRzIGEgbG9jYXRvciBmYWN0b3J5IHJvb3RlZCBhdCB0aGUgZG9jdW1lbnQgcm9vdC4gKi9cbiAgZG9jdW1lbnRSb290TG9jYXRvckZhY3RvcnkoKTogTG9jYXRvckZhY3Rvcnk7XG5cbiAgLyoqIFRoZSByb290IGVsZW1lbnQgb2YgdGhpcyBgTG9jYXRvckZhY3RvcnlgIGFzIGEgYFRlc3RFbGVtZW50YC4gKi9cbiAgcm9vdEVsZW1lbnQ6IFRlc3RFbGVtZW50O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGFzeW5jaHJvbm91cyBsb2NhdG9yIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmluZCBhIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZVxuICAgKiBvciBlbGVtZW50IHVuZGVyIHRoZSByb290IGVsZW1lbnQgb2YgdGhpcyBgTG9jYXRvckZhY3RvcnlgLlxuICAgKiBAcGFyYW0gcXVlcmllcyBBIGxpc3Qgb2YgcXVlcmllcyBzcGVjaWZ5aW5nIHdoaWNoIGhhcm5lc3NlcyBhbmQgZWxlbWVudHMgdG8gc2VhcmNoIGZvcjpcbiAgICogICAtIEEgYHN0cmluZ2Agc2VhcmNoZXMgZm9yIGVsZW1lbnRzIG1hdGNoaW5nIHRoZSBDU1Mgc2VsZWN0b3Igc3BlY2lmaWVkIGJ5IHRoZSBzdHJpbmcuXG4gICAqICAgLSBBIGBDb21wb25lbnRIYXJuZXNzYCBjb25zdHJ1Y3RvciBzZWFyY2hlcyBmb3IgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlcyBtYXRjaGluZyB0aGVcbiAgICogICAgIGdpdmVuIGNsYXNzLlxuICAgKiAgIC0gQSBgSGFybmVzc1ByZWRpY2F0ZWAgc2VhcmNoZXMgZm9yIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZXMgbWF0Y2hpbmcgdGhlIGdpdmVuXG4gICAqICAgICBwcmVkaWNhdGUuXG4gICAqIEByZXR1cm4gQW4gYXN5bmNocm9ub3VzIGxvY2F0b3IgZnVuY3Rpb24gdGhhdCBzZWFyY2hlcyBmb3IgYW5kIHJldHVybnMgYSBgUHJvbWlzZWAgZm9yIHRoZVxuICAgKiAgIGZpcnN0IGVsZW1lbnQgb3IgaGFybmVzcyBtYXRjaGluZyB0aGUgZ2l2ZW4gc2VhcmNoIGNyaXRlcmlhLiBNYXRjaGVzIGFyZSBvcmRlcmVkIGZpcnN0IGJ5XG4gICAqICAgb3JkZXIgaW4gdGhlIERPTSwgYW5kIHNlY29uZCBieSBvcmRlciBpbiB0aGUgcXVlcmllcyBsaXN0LiBJZiBubyBtYXRjaGVzIGFyZSBmb3VuZCwgdGhlXG4gICAqICAgYFByb21pc2VgIHJlamVjdHMuIFRoZSB0eXBlIHRoYXQgdGhlIGBQcm9taXNlYCByZXNvbHZlcyB0byBpcyBhIHVuaW9uIG9mIGFsbCByZXN1bHQgdHlwZXMgZm9yXG4gICAqICAgZWFjaCBxdWVyeS5cbiAgICpcbiAgICogZS5nLiBHaXZlbiB0aGUgZm9sbG93aW5nIERPTTogYDxkaXYgaWQ9XCJkMVwiIC8+PGRpdiBpZD1cImQyXCIgLz5gLCBhbmQgYXNzdW1pbmdcbiAgICogYERpdkhhcm5lc3MuaG9zdFNlbGVjdG9yID09PSAnZGl2J2A6XG4gICAqIC0gYGF3YWl0IGxmLmxvY2F0b3JGb3IoRGl2SGFybmVzcywgJ2RpdicpKClgIGdldHMgYSBgRGl2SGFybmVzc2AgaW5zdGFuY2UgZm9yIGAjZDFgXG4gICAqIC0gYGF3YWl0IGxmLmxvY2F0b3JGb3IoJ2RpdicsIERpdkhhcm5lc3MpKClgIGdldHMgYSBgVGVzdEVsZW1lbnRgIGluc3RhbmNlIGZvciBgI2QxYFxuICAgKiAtIGBhd2FpdCBsZi5sb2NhdG9yRm9yKCdzcGFuJykoKWAgdGhyb3dzIGJlY2F1c2UgdGhlIGBQcm9taXNlYCByZWplY3RzLlxuICAgKi9cbiAgbG9jYXRvckZvcjxUIGV4dGVuZHMgKEhhcm5lc3NRdWVyeTxhbnk+IHwgc3RyaW5nKVtdPiguLi5xdWVyaWVzOiBUKTpcbiAgICAgIEFzeW5jRmFjdG9yeUZuPExvY2F0b3JGblJlc3VsdDxUPj47XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gYXN5bmNocm9ub3VzIGxvY2F0b3IgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBmaW5kIGEgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlXG4gICAqIG9yIGVsZW1lbnQgdW5kZXIgdGhlIHJvb3QgZWxlbWVudCBvZiB0aGlzIGBMb2NhdG9yRmFjdG9yeWAuXG4gICAqIEBwYXJhbSBxdWVyaWVzIEEgbGlzdCBvZiBxdWVyaWVzIHNwZWNpZnlpbmcgd2hpY2ggaGFybmVzc2VzIGFuZCBlbGVtZW50cyB0byBzZWFyY2ggZm9yOlxuICAgKiAgIC0gQSBgc3RyaW5nYCBzZWFyY2hlcyBmb3IgZWxlbWVudHMgbWF0Y2hpbmcgdGhlIENTUyBzZWxlY3RvciBzcGVjaWZpZWQgYnkgdGhlIHN0cmluZy5cbiAgICogICAtIEEgYENvbXBvbmVudEhhcm5lc3NgIGNvbnN0cnVjdG9yIHNlYXJjaGVzIGZvciBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzIG1hdGNoaW5nIHRoZVxuICAgKiAgICAgZ2l2ZW4gY2xhc3MuXG4gICAqICAgLSBBIGBIYXJuZXNzUHJlZGljYXRlYCBzZWFyY2hlcyBmb3IgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlcyBtYXRjaGluZyB0aGUgZ2l2ZW5cbiAgICogICAgIHByZWRpY2F0ZS5cbiAgICogQHJldHVybiBBbiBhc3luY2hyb25vdXMgbG9jYXRvciBmdW5jdGlvbiB0aGF0IHNlYXJjaGVzIGZvciBhbmQgcmV0dXJucyBhIGBQcm9taXNlYCBmb3IgdGhlXG4gICAqICAgZmlyc3QgZWxlbWVudCBvciBoYXJuZXNzIG1hdGNoaW5nIHRoZSBnaXZlbiBzZWFyY2ggY3JpdGVyaWEuIE1hdGNoZXMgYXJlIG9yZGVyZWQgZmlyc3QgYnlcbiAgICogICBvcmRlciBpbiB0aGUgRE9NLCBhbmQgc2Vjb25kIGJ5IG9yZGVyIGluIHRoZSBxdWVyaWVzIGxpc3QuIElmIG5vIG1hdGNoZXMgYXJlIGZvdW5kLCB0aGVcbiAgICogICBgUHJvbWlzZWAgaXMgcmVzb2x2ZWQgd2l0aCBgbnVsbGAuIFRoZSB0eXBlIHRoYXQgdGhlIGBQcm9taXNlYCByZXNvbHZlcyB0byBpcyBhIHVuaW9uIG9mIGFsbFxuICAgKiAgIHJlc3VsdCB0eXBlcyBmb3IgZWFjaCBxdWVyeSBvciBudWxsLlxuICAgKlxuICAgKiBlLmcuIEdpdmVuIHRoZSBmb2xsb3dpbmcgRE9NOiBgPGRpdiBpZD1cImQxXCIgLz48ZGl2IGlkPVwiZDJcIiAvPmAsIGFuZCBhc3N1bWluZ1xuICAgKiBgRGl2SGFybmVzcy5ob3N0U2VsZWN0b3IgPT09ICdkaXYnYDpcbiAgICogLSBgYXdhaXQgbGYubG9jYXRvckZvck9wdGlvbmFsKERpdkhhcm5lc3MsICdkaXYnKSgpYCBnZXRzIGEgYERpdkhhcm5lc3NgIGluc3RhbmNlIGZvciBgI2QxYFxuICAgKiAtIGBhd2FpdCBsZi5sb2NhdG9yRm9yT3B0aW9uYWwoJ2RpdicsIERpdkhhcm5lc3MpKClgIGdldHMgYSBgVGVzdEVsZW1lbnRgIGluc3RhbmNlIGZvciBgI2QxYFxuICAgKiAtIGBhd2FpdCBsZi5sb2NhdG9yRm9yT3B0aW9uYWwoJ3NwYW4nKSgpYCBnZXRzIGBudWxsYC5cbiAgICovXG4gIGxvY2F0b3JGb3JPcHRpb25hbDxUIGV4dGVuZHMgKEhhcm5lc3NRdWVyeTxhbnk+IHwgc3RyaW5nKVtdPiguLi5xdWVyaWVzOiBUKTpcbiAgICAgIEFzeW5jRmFjdG9yeUZuPExvY2F0b3JGblJlc3VsdDxUPiB8IG51bGw+O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGFzeW5jaHJvbm91cyBsb2NhdG9yIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmluZCBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzXG4gICAqIG9yIGVsZW1lbnRzIHVuZGVyIHRoZSByb290IGVsZW1lbnQgb2YgdGhpcyBgTG9jYXRvckZhY3RvcnlgLlxuICAgKiBAcGFyYW0gcXVlcmllcyBBIGxpc3Qgb2YgcXVlcmllcyBzcGVjaWZ5aW5nIHdoaWNoIGhhcm5lc3NlcyBhbmQgZWxlbWVudHMgdG8gc2VhcmNoIGZvcjpcbiAgICogICAtIEEgYHN0cmluZ2Agc2VhcmNoZXMgZm9yIGVsZW1lbnRzIG1hdGNoaW5nIHRoZSBDU1Mgc2VsZWN0b3Igc3BlY2lmaWVkIGJ5IHRoZSBzdHJpbmcuXG4gICAqICAgLSBBIGBDb21wb25lbnRIYXJuZXNzYCBjb25zdHJ1Y3RvciBzZWFyY2hlcyBmb3IgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlcyBtYXRjaGluZyB0aGVcbiAgICogICAgIGdpdmVuIGNsYXNzLlxuICAgKiAgIC0gQSBgSGFybmVzc1ByZWRpY2F0ZWAgc2VhcmNoZXMgZm9yIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZXMgbWF0Y2hpbmcgdGhlIGdpdmVuXG4gICAqICAgICBwcmVkaWNhdGUuXG4gICAqIEByZXR1cm4gQW4gYXN5bmNocm9ub3VzIGxvY2F0b3IgZnVuY3Rpb24gdGhhdCBzZWFyY2hlcyBmb3IgYW5kIHJldHVybnMgYSBgUHJvbWlzZWAgZm9yIGFsbFxuICAgKiAgIGVsZW1lbnRzIGFuZCBoYXJuZXNzZXMgbWF0Y2hpbmcgdGhlIGdpdmVuIHNlYXJjaCBjcml0ZXJpYS4gTWF0Y2hlcyBhcmUgb3JkZXJlZCBmaXJzdCBieVxuICAgKiAgIG9yZGVyIGluIHRoZSBET00sIGFuZCBzZWNvbmQgYnkgb3JkZXIgaW4gdGhlIHF1ZXJpZXMgbGlzdC4gSWYgYW4gZWxlbWVudCBtYXRjaGVzIG1vcmUgdGhhblxuICAgKiAgIG9uZSBgQ29tcG9uZW50SGFybmVzc2AgY2xhc3MsIHRoZSBsb2NhdG9yIGdldHMgYW4gaW5zdGFuY2Ugb2YgZWFjaCBmb3IgdGhlIHNhbWUgZWxlbWVudC4gSWZcbiAgICogICBhbiBlbGVtZW50IG1hdGNoZXMgbXVsdGlwbGUgYHN0cmluZ2Agc2VsZWN0b3JzLCBvbmx5IG9uZSBgVGVzdEVsZW1lbnRgIGluc3RhbmNlIGlzIHJldHVybmVkXG4gICAqICAgZm9yIHRoYXQgZWxlbWVudC4gVGhlIHR5cGUgdGhhdCB0aGUgYFByb21pc2VgIHJlc29sdmVzIHRvIGlzIGFuIGFycmF5IHdoZXJlIGVhY2ggZWxlbWVudCBpc1xuICAgKiAgIHRoZSB1bmlvbiBvZiBhbGwgcmVzdWx0IHR5cGVzIGZvciBlYWNoIHF1ZXJ5LlxuICAgKlxuICAgKiBlLmcuIEdpdmVuIHRoZSBmb2xsb3dpbmcgRE9NOiBgPGRpdiBpZD1cImQxXCIgLz48ZGl2IGlkPVwiZDJcIiAvPmAsIGFuZCBhc3N1bWluZ1xuICAgKiBgRGl2SGFybmVzcy5ob3N0U2VsZWN0b3IgPT09ICdkaXYnYCBhbmQgYElkSXNEMUhhcm5lc3MuaG9zdFNlbGVjdG9yID09PSAnI2QxJ2A6XG4gICAqIC0gYGF3YWl0IGxmLmxvY2F0b3JGb3JBbGwoRGl2SGFybmVzcywgJ2RpdicpKClgIGdldHMgYFtcbiAgICogICAgIERpdkhhcm5lc3MsIC8vIGZvciAjZDFcbiAgICogICAgIFRlc3RFbGVtZW50LCAvLyBmb3IgI2QxXG4gICAqICAgICBEaXZIYXJuZXNzLCAvLyBmb3IgI2QyXG4gICAqICAgICBUZXN0RWxlbWVudCAvLyBmb3IgI2QyXG4gICAqICAgXWBcbiAgICogLSBgYXdhaXQgbGYubG9jYXRvckZvckFsbCgnZGl2JywgJyNkMScpKClgIGdldHMgYFtcbiAgICogICAgIFRlc3RFbGVtZW50LCAvLyBmb3IgI2QxXG4gICAqICAgICBUZXN0RWxlbWVudCAvLyBmb3IgI2QyXG4gICAqICAgXWBcbiAgICogLSBgYXdhaXQgbGYubG9jYXRvckZvckFsbChEaXZIYXJuZXNzLCBJZElzRDFIYXJuZXNzKSgpYCBnZXRzIGBbXG4gICAqICAgICBEaXZIYXJuZXNzLCAvLyBmb3IgI2QxXG4gICAqICAgICBJZElzRDFIYXJuZXNzLCAvLyBmb3IgI2QxXG4gICAqICAgICBEaXZIYXJuZXNzIC8vIGZvciAjZDJcbiAgICogICBdYFxuICAgKiAtIGBhd2FpdCBsZi5sb2NhdG9yRm9yQWxsKCdzcGFuJykoKWAgZ2V0cyBgW11gLlxuICAgKi9cbiAgbG9jYXRvckZvckFsbDxUIGV4dGVuZHMgKEhhcm5lc3NRdWVyeTxhbnk+IHwgc3RyaW5nKVtdPiguLi5xdWVyaWVzOiBUKTpcbiAgICAgIEFzeW5jRmFjdG9yeUZuPExvY2F0b3JGblJlc3VsdDxUPltdPjtcblxuICAvKiogQHJldHVybiBBIGBIYXJuZXNzTG9hZGVyYCByb290ZWQgYXQgdGhlIHJvb3QgZWxlbWVudCBvZiB0aGlzIGBMb2NhdG9yRmFjdG9yeWAuICovXG4gIHJvb3RIYXJuZXNzTG9hZGVyKCk6IFByb21pc2U8SGFybmVzc0xvYWRlcj47XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc0xvYWRlcmAgaW5zdGFuY2UgZm9yIGFuIGVsZW1lbnQgdW5kZXIgdGhlIHJvb3Qgb2YgdGhpcyBgTG9jYXRvckZhY3RvcnlgLlxuICAgKiBAcGFyYW0gc2VsZWN0b3IgVGhlIHNlbGVjdG9yIGZvciB0aGUgcm9vdCBlbGVtZW50LlxuICAgKiBAcmV0dXJuIEEgYEhhcm5lc3NMb2FkZXJgIHJvb3RlZCBhdCB0aGUgZmlyc3QgZWxlbWVudCBtYXRjaGluZyB0aGUgZ2l2ZW4gc2VsZWN0b3IuXG4gICAqIEB0aHJvd3MgSWYgbm8gbWF0Y2hpbmcgZWxlbWVudCBpcyBmb3VuZCBmb3IgdGhlIGdpdmVuIHNlbGVjdG9yLlxuICAgKi9cbiAgaGFybmVzc0xvYWRlckZvcihzZWxlY3Rvcjogc3RyaW5nKTogUHJvbWlzZTxIYXJuZXNzTG9hZGVyPjtcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzTG9hZGVyYCBpbnN0YW5jZSBmb3IgYW4gZWxlbWVudCB1bmRlciB0aGUgcm9vdCBvZiB0aGlzIGBMb2NhdG9yRmFjdG9yeWBcbiAgICogQHBhcmFtIHNlbGVjdG9yIFRoZSBzZWxlY3RvciBmb3IgdGhlIHJvb3QgZWxlbWVudC5cbiAgICogQHJldHVybiBBIGBIYXJuZXNzTG9hZGVyYCByb290ZWQgYXQgdGhlIGZpcnN0IGVsZW1lbnQgbWF0Y2hpbmcgdGhlIGdpdmVuIHNlbGVjdG9yLCBvciBudWxsIGlmXG4gICAqICAgICBubyBtYXRjaGluZyBlbGVtZW50IGlzIGZvdW5kLlxuICAgKi9cbiAgaGFybmVzc0xvYWRlckZvck9wdGlvbmFsKHNlbGVjdG9yOiBzdHJpbmcpOiBQcm9taXNlPEhhcm5lc3NMb2FkZXIgfCBudWxsPjtcblxuICAvKipcbiAgICogR2V0cyBhIGxpc3Qgb2YgYEhhcm5lc3NMb2FkZXJgIGluc3RhbmNlcywgb25lIGZvciBlYWNoIG1hdGNoaW5nIGVsZW1lbnQuXG4gICAqIEBwYXJhbSBzZWxlY3RvciBUaGUgc2VsZWN0b3IgZm9yIHRoZSByb290IGVsZW1lbnQuXG4gICAqIEByZXR1cm4gQSBsaXN0IG9mIGBIYXJuZXNzTG9hZGVyYCwgb25lIHJvb3RlZCBhdCBlYWNoIGVsZW1lbnQgbWF0Y2hpbmcgdGhlIGdpdmVuIHNlbGVjdG9yLlxuICAgKi9cbiAgaGFybmVzc0xvYWRlckZvckFsbChzZWxlY3Rvcjogc3RyaW5nKTogUHJvbWlzZTxIYXJuZXNzTG9hZGVyW10+O1xuXG4gIC8qKlxuICAgKiBGbHVzaGVzIGNoYW5nZSBkZXRlY3Rpb24gYW5kIGFzeW5jIHRhc2tzIGNhcHR1cmVkIGluIHRoZSBBbmd1bGFyIHpvbmUuXG4gICAqIEluIG1vc3QgY2FzZXMgaXQgc2hvdWxkIG5vdCBiZSBuZWNlc3NhcnkgdG8gY2FsbCB0aGlzIG1hbnVhbGx5LiBIb3dldmVyLCB0aGVyZSBtYXkgYmUgc29tZSBlZGdlXG4gICAqIGNhc2VzIHdoZXJlIGl0IGlzIG5lZWRlZCB0byBmdWxseSBmbHVzaCBhbmltYXRpb24gZXZlbnRzLlxuICAgKi9cbiAgZm9yY2VTdGFiaWxpemUoKTogUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogV2FpdHMgZm9yIGFsbCBzY2hlZHVsZWQgb3IgcnVubmluZyBhc3luYyB0YXNrcyB0byBjb21wbGV0ZS4gVGhpcyBhbGxvd3MgaGFybmVzc1xuICAgKiBhdXRob3JzIHRvIHdhaXQgZm9yIGFzeW5jIHRhc2tzIG91dHNpZGUgb2YgdGhlIEFuZ3VsYXIgem9uZS5cbiAgICovXG4gIHdhaXRGb3JUYXNrc091dHNpZGVBbmd1bGFyKCk6IFByb21pc2U8dm9pZD47XG59XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgY29tcG9uZW50IGhhcm5lc3NlcyB0aGF0IGFsbCBjb21wb25lbnQgaGFybmVzcyBhdXRob3JzIHNob3VsZCBleHRlbmQuIFRoaXMgYmFzZVxuICogY29tcG9uZW50IGhhcm5lc3MgcHJvdmlkZXMgdGhlIGJhc2ljIGFiaWxpdHkgdG8gbG9jYXRlIGVsZW1lbnQgYW5kIHN1Yi1jb21wb25lbnQgaGFybmVzcy4gSXRcbiAqIHNob3VsZCBiZSBpbmhlcml0ZWQgd2hlbiBkZWZpbmluZyB1c2VyJ3Mgb3duIGhhcm5lc3MuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21wb25lbnRIYXJuZXNzIHtcbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIHJlYWRvbmx5IGxvY2F0b3JGYWN0b3J5OiBMb2NhdG9yRmFjdG9yeSkge31cblxuICAvKiogR2V0cyBhIGBQcm9taXNlYCBmb3IgdGhlIGBUZXN0RWxlbWVudGAgcmVwcmVzZW50aW5nIHRoZSBob3N0IGVsZW1lbnQgb2YgdGhlIGNvbXBvbmVudC4gKi9cbiAgYXN5bmMgaG9zdCgpOiBQcm9taXNlPFRlc3RFbGVtZW50PiB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZhY3Rvcnkucm9vdEVsZW1lbnQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIGBMb2NhdG9yRmFjdG9yeWAgZm9yIHRoZSBkb2N1bWVudCByb290IGVsZW1lbnQuIFRoaXMgZmFjdG9yeSBjYW4gYmUgdXNlZCB0byBjcmVhdGVcbiAgICogbG9jYXRvcnMgZm9yIGVsZW1lbnRzIHRoYXQgYSBjb21wb25lbnQgY3JlYXRlcyBvdXRzaWRlIG9mIGl0cyBvd24gcm9vdCBlbGVtZW50LiAoZS5nLiBieVxuICAgKiBhcHBlbmRpbmcgdG8gZG9jdW1lbnQuYm9keSkuXG4gICAqL1xuICBwcm90ZWN0ZWQgZG9jdW1lbnRSb290TG9jYXRvckZhY3RvcnkoKTogTG9jYXRvckZhY3Rvcnkge1xuICAgIHJldHVybiB0aGlzLmxvY2F0b3JGYWN0b3J5LmRvY3VtZW50Um9vdExvY2F0b3JGYWN0b3J5KCk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBhc3luY2hyb25vdXMgbG9jYXRvciBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGZpbmQgYSBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VcbiAgICogb3IgZWxlbWVudCB1bmRlciB0aGUgaG9zdCBlbGVtZW50IG9mIHRoaXMgYENvbXBvbmVudEhhcm5lc3NgLlxuICAgKiBAcGFyYW0gcXVlcmllcyBBIGxpc3Qgb2YgcXVlcmllcyBzcGVjaWZ5aW5nIHdoaWNoIGhhcm5lc3NlcyBhbmQgZWxlbWVudHMgdG8gc2VhcmNoIGZvcjpcbiAgICogICAtIEEgYHN0cmluZ2Agc2VhcmNoZXMgZm9yIGVsZW1lbnRzIG1hdGNoaW5nIHRoZSBDU1Mgc2VsZWN0b3Igc3BlY2lmaWVkIGJ5IHRoZSBzdHJpbmcuXG4gICAqICAgLSBBIGBDb21wb25lbnRIYXJuZXNzYCBjb25zdHJ1Y3RvciBzZWFyY2hlcyBmb3IgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlcyBtYXRjaGluZyB0aGVcbiAgICogICAgIGdpdmVuIGNsYXNzLlxuICAgKiAgIC0gQSBgSGFybmVzc1ByZWRpY2F0ZWAgc2VhcmNoZXMgZm9yIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZXMgbWF0Y2hpbmcgdGhlIGdpdmVuXG4gICAqICAgICBwcmVkaWNhdGUuXG4gICAqIEByZXR1cm4gQW4gYXN5bmNocm9ub3VzIGxvY2F0b3IgZnVuY3Rpb24gdGhhdCBzZWFyY2hlcyBmb3IgYW5kIHJldHVybnMgYSBgUHJvbWlzZWAgZm9yIHRoZVxuICAgKiAgIGZpcnN0IGVsZW1lbnQgb3IgaGFybmVzcyBtYXRjaGluZyB0aGUgZ2l2ZW4gc2VhcmNoIGNyaXRlcmlhLiBNYXRjaGVzIGFyZSBvcmRlcmVkIGZpcnN0IGJ5XG4gICAqICAgb3JkZXIgaW4gdGhlIERPTSwgYW5kIHNlY29uZCBieSBvcmRlciBpbiB0aGUgcXVlcmllcyBsaXN0LiBJZiBubyBtYXRjaGVzIGFyZSBmb3VuZCwgdGhlXG4gICAqICAgYFByb21pc2VgIHJlamVjdHMuIFRoZSB0eXBlIHRoYXQgdGhlIGBQcm9taXNlYCByZXNvbHZlcyB0byBpcyBhIHVuaW9uIG9mIGFsbCByZXN1bHQgdHlwZXMgZm9yXG4gICAqICAgZWFjaCBxdWVyeS5cbiAgICpcbiAgICogZS5nLiBHaXZlbiB0aGUgZm9sbG93aW5nIERPTTogYDxkaXYgaWQ9XCJkMVwiIC8+PGRpdiBpZD1cImQyXCIgLz5gLCBhbmQgYXNzdW1pbmdcbiAgICogYERpdkhhcm5lc3MuaG9zdFNlbGVjdG9yID09PSAnZGl2J2A6XG4gICAqIC0gYGF3YWl0IGNoLmxvY2F0b3JGb3IoRGl2SGFybmVzcywgJ2RpdicpKClgIGdldHMgYSBgRGl2SGFybmVzc2AgaW5zdGFuY2UgZm9yIGAjZDFgXG4gICAqIC0gYGF3YWl0IGNoLmxvY2F0b3JGb3IoJ2RpdicsIERpdkhhcm5lc3MpKClgIGdldHMgYSBgVGVzdEVsZW1lbnRgIGluc3RhbmNlIGZvciBgI2QxYFxuICAgKiAtIGBhd2FpdCBjaC5sb2NhdG9yRm9yKCdzcGFuJykoKWAgdGhyb3dzIGJlY2F1c2UgdGhlIGBQcm9taXNlYCByZWplY3RzLlxuICAgKi9cbiAgcHJvdGVjdGVkIGxvY2F0b3JGb3I8VCBleHRlbmRzIChIYXJuZXNzUXVlcnk8YW55PiB8IHN0cmluZylbXT4oLi4ucXVlcmllczogVCk6XG4gICAgICBBc3luY0ZhY3RvcnlGbjxMb2NhdG9yRm5SZXN1bHQ8VD4+IHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRmFjdG9yeS5sb2NhdG9yRm9yKC4uLnF1ZXJpZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gYXN5bmNocm9ub3VzIGxvY2F0b3IgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBmaW5kIGEgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlXG4gICAqIG9yIGVsZW1lbnQgdW5kZXIgdGhlIGhvc3QgZWxlbWVudCBvZiB0aGlzIGBDb21wb25lbnRIYXJuZXNzYC5cbiAgICogQHBhcmFtIHF1ZXJpZXMgQSBsaXN0IG9mIHF1ZXJpZXMgc3BlY2lmeWluZyB3aGljaCBoYXJuZXNzZXMgYW5kIGVsZW1lbnRzIHRvIHNlYXJjaCBmb3I6XG4gICAqICAgLSBBIGBzdHJpbmdgIHNlYXJjaGVzIGZvciBlbGVtZW50cyBtYXRjaGluZyB0aGUgQ1NTIHNlbGVjdG9yIHNwZWNpZmllZCBieSB0aGUgc3RyaW5nLlxuICAgKiAgIC0gQSBgQ29tcG9uZW50SGFybmVzc2AgY29uc3RydWN0b3Igc2VhcmNoZXMgZm9yIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZXMgbWF0Y2hpbmcgdGhlXG4gICAqICAgICBnaXZlbiBjbGFzcy5cbiAgICogICAtIEEgYEhhcm5lc3NQcmVkaWNhdGVgIHNlYXJjaGVzIGZvciBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzIG1hdGNoaW5nIHRoZSBnaXZlblxuICAgKiAgICAgcHJlZGljYXRlLlxuICAgKiBAcmV0dXJuIEFuIGFzeW5jaHJvbm91cyBsb2NhdG9yIGZ1bmN0aW9uIHRoYXQgc2VhcmNoZXMgZm9yIGFuZCByZXR1cm5zIGEgYFByb21pc2VgIGZvciB0aGVcbiAgICogICBmaXJzdCBlbGVtZW50IG9yIGhhcm5lc3MgbWF0Y2hpbmcgdGhlIGdpdmVuIHNlYXJjaCBjcml0ZXJpYS4gTWF0Y2hlcyBhcmUgb3JkZXJlZCBmaXJzdCBieVxuICAgKiAgIG9yZGVyIGluIHRoZSBET00sIGFuZCBzZWNvbmQgYnkgb3JkZXIgaW4gdGhlIHF1ZXJpZXMgbGlzdC4gSWYgbm8gbWF0Y2hlcyBhcmUgZm91bmQsIHRoZVxuICAgKiAgIGBQcm9taXNlYCBpcyByZXNvbHZlZCB3aXRoIGBudWxsYC4gVGhlIHR5cGUgdGhhdCB0aGUgYFByb21pc2VgIHJlc29sdmVzIHRvIGlzIGEgdW5pb24gb2YgYWxsXG4gICAqICAgcmVzdWx0IHR5cGVzIGZvciBlYWNoIHF1ZXJ5IG9yIG51bGwuXG4gICAqXG4gICAqIGUuZy4gR2l2ZW4gdGhlIGZvbGxvd2luZyBET006IGA8ZGl2IGlkPVwiZDFcIiAvPjxkaXYgaWQ9XCJkMlwiIC8+YCwgYW5kIGFzc3VtaW5nXG4gICAqIGBEaXZIYXJuZXNzLmhvc3RTZWxlY3RvciA9PT0gJ2RpdidgOlxuICAgKiAtIGBhd2FpdCBjaC5sb2NhdG9yRm9yT3B0aW9uYWwoRGl2SGFybmVzcywgJ2RpdicpKClgIGdldHMgYSBgRGl2SGFybmVzc2AgaW5zdGFuY2UgZm9yIGAjZDFgXG4gICAqIC0gYGF3YWl0IGNoLmxvY2F0b3JGb3JPcHRpb25hbCgnZGl2JywgRGl2SGFybmVzcykoKWAgZ2V0cyBhIGBUZXN0RWxlbWVudGAgaW5zdGFuY2UgZm9yIGAjZDFgXG4gICAqIC0gYGF3YWl0IGNoLmxvY2F0b3JGb3JPcHRpb25hbCgnc3BhbicpKClgIGdldHMgYG51bGxgLlxuICAgKi9cbiAgcHJvdGVjdGVkIGxvY2F0b3JGb3JPcHRpb25hbDxUIGV4dGVuZHMgKEhhcm5lc3NRdWVyeTxhbnk+IHwgc3RyaW5nKVtdPiguLi5xdWVyaWVzOiBUKTpcbiAgICAgIEFzeW5jRmFjdG9yeUZuPExvY2F0b3JGblJlc3VsdDxUPiB8IG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRmFjdG9yeS5sb2NhdG9yRm9yT3B0aW9uYWwoLi4ucXVlcmllcyk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBhc3luY2hyb25vdXMgbG9jYXRvciBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGZpbmQgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlc1xuICAgKiBvciBlbGVtZW50cyB1bmRlciB0aGUgaG9zdCBlbGVtZW50IG9mIHRoaXMgYENvbXBvbmVudEhhcm5lc3NgLlxuICAgKiBAcGFyYW0gcXVlcmllcyBBIGxpc3Qgb2YgcXVlcmllcyBzcGVjaWZ5aW5nIHdoaWNoIGhhcm5lc3NlcyBhbmQgZWxlbWVudHMgdG8gc2VhcmNoIGZvcjpcbiAgICogICAtIEEgYHN0cmluZ2Agc2VhcmNoZXMgZm9yIGVsZW1lbnRzIG1hdGNoaW5nIHRoZSBDU1Mgc2VsZWN0b3Igc3BlY2lmaWVkIGJ5IHRoZSBzdHJpbmcuXG4gICAqICAgLSBBIGBDb21wb25lbnRIYXJuZXNzYCBjb25zdHJ1Y3RvciBzZWFyY2hlcyBmb3IgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlcyBtYXRjaGluZyB0aGVcbiAgICogICAgIGdpdmVuIGNsYXNzLlxuICAgKiAgIC0gQSBgSGFybmVzc1ByZWRpY2F0ZWAgc2VhcmNoZXMgZm9yIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZXMgbWF0Y2hpbmcgdGhlIGdpdmVuXG4gICAqICAgICBwcmVkaWNhdGUuXG4gICAqIEByZXR1cm4gQW4gYXN5bmNocm9ub3VzIGxvY2F0b3IgZnVuY3Rpb24gdGhhdCBzZWFyY2hlcyBmb3IgYW5kIHJldHVybnMgYSBgUHJvbWlzZWAgZm9yIGFsbFxuICAgKiAgIGVsZW1lbnRzIGFuZCBoYXJuZXNzZXMgbWF0Y2hpbmcgdGhlIGdpdmVuIHNlYXJjaCBjcml0ZXJpYS4gTWF0Y2hlcyBhcmUgb3JkZXJlZCBmaXJzdCBieVxuICAgKiAgIG9yZGVyIGluIHRoZSBET00sIGFuZCBzZWNvbmQgYnkgb3JkZXIgaW4gdGhlIHF1ZXJpZXMgbGlzdC4gSWYgYW4gZWxlbWVudCBtYXRjaGVzIG1vcmUgdGhhblxuICAgKiAgIG9uZSBgQ29tcG9uZW50SGFybmVzc2AgY2xhc3MsIHRoZSBsb2NhdG9yIGdldHMgYW4gaW5zdGFuY2Ugb2YgZWFjaCBmb3IgdGhlIHNhbWUgZWxlbWVudC4gSWZcbiAgICogICBhbiBlbGVtZW50IG1hdGNoZXMgbXVsdGlwbGUgYHN0cmluZ2Agc2VsZWN0b3JzLCBvbmx5IG9uZSBgVGVzdEVsZW1lbnRgIGluc3RhbmNlIGlzIHJldHVybmVkXG4gICAqICAgZm9yIHRoYXQgZWxlbWVudC4gVGhlIHR5cGUgdGhhdCB0aGUgYFByb21pc2VgIHJlc29sdmVzIHRvIGlzIGFuIGFycmF5IHdoZXJlIGVhY2ggZWxlbWVudCBpc1xuICAgKiAgIHRoZSB1bmlvbiBvZiBhbGwgcmVzdWx0IHR5cGVzIGZvciBlYWNoIHF1ZXJ5LlxuICAgKlxuICAgKiBlLmcuIEdpdmVuIHRoZSBmb2xsb3dpbmcgRE9NOiBgPGRpdiBpZD1cImQxXCIgLz48ZGl2IGlkPVwiZDJcIiAvPmAsIGFuZCBhc3N1bWluZ1xuICAgKiBgRGl2SGFybmVzcy5ob3N0U2VsZWN0b3IgPT09ICdkaXYnYCBhbmQgYElkSXNEMUhhcm5lc3MuaG9zdFNlbGVjdG9yID09PSAnI2QxJ2A6XG4gICAqIC0gYGF3YWl0IGNoLmxvY2F0b3JGb3JBbGwoRGl2SGFybmVzcywgJ2RpdicpKClgIGdldHMgYFtcbiAgICogICAgIERpdkhhcm5lc3MsIC8vIGZvciAjZDFcbiAgICogICAgIFRlc3RFbGVtZW50LCAvLyBmb3IgI2QxXG4gICAqICAgICBEaXZIYXJuZXNzLCAvLyBmb3IgI2QyXG4gICAqICAgICBUZXN0RWxlbWVudCAvLyBmb3IgI2QyXG4gICAqICAgXWBcbiAgICogLSBgYXdhaXQgY2gubG9jYXRvckZvckFsbCgnZGl2JywgJyNkMScpKClgIGdldHMgYFtcbiAgICogICAgIFRlc3RFbGVtZW50LCAvLyBmb3IgI2QxXG4gICAqICAgICBUZXN0RWxlbWVudCAvLyBmb3IgI2QyXG4gICAqICAgXWBcbiAgICogLSBgYXdhaXQgY2gubG9jYXRvckZvckFsbChEaXZIYXJuZXNzLCBJZElzRDFIYXJuZXNzKSgpYCBnZXRzIGBbXG4gICAqICAgICBEaXZIYXJuZXNzLCAvLyBmb3IgI2QxXG4gICAqICAgICBJZElzRDFIYXJuZXNzLCAvLyBmb3IgI2QxXG4gICAqICAgICBEaXZIYXJuZXNzIC8vIGZvciAjZDJcbiAgICogICBdYFxuICAgKiAtIGBhd2FpdCBjaC5sb2NhdG9yRm9yQWxsKCdzcGFuJykoKWAgZ2V0cyBgW11gLlxuICAgKi9cbiAgcHJvdGVjdGVkIGxvY2F0b3JGb3JBbGw8VCBleHRlbmRzIChIYXJuZXNzUXVlcnk8YW55PiB8IHN0cmluZylbXT4oLi4ucXVlcmllczogVCk6XG4gICAgICBBc3luY0ZhY3RvcnlGbjxMb2NhdG9yRm5SZXN1bHQ8VD5bXT4ge1xuICAgIHJldHVybiB0aGlzLmxvY2F0b3JGYWN0b3J5LmxvY2F0b3JGb3JBbGwoLi4ucXVlcmllcyk7XG4gIH1cblxuICAvKipcbiAgICogRmx1c2hlcyBjaGFuZ2UgZGV0ZWN0aW9uIGFuZCBhc3luYyB0YXNrcyBpbiB0aGUgQW5ndWxhciB6b25lLlxuICAgKiBJbiBtb3N0IGNhc2VzIGl0IHNob3VsZCBub3QgYmUgbmVjZXNzYXJ5IHRvIGNhbGwgdGhpcyBtYW51YWxseS4gSG93ZXZlciwgdGhlcmUgbWF5IGJlIHNvbWUgZWRnZVxuICAgKiBjYXNlcyB3aGVyZSBpdCBpcyBuZWVkZWQgdG8gZnVsbHkgZmx1c2ggYW5pbWF0aW9uIGV2ZW50cy5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBmb3JjZVN0YWJpbGl6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRmFjdG9yeS5mb3JjZVN0YWJpbGl6ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdhaXRzIGZvciBhbGwgc2NoZWR1bGVkIG9yIHJ1bm5pbmcgYXN5bmMgdGFza3MgdG8gY29tcGxldGUuIFRoaXMgYWxsb3dzIGhhcm5lc3NcbiAgICogYXV0aG9ycyB0byB3YWl0IGZvciBhc3luYyB0YXNrcyBvdXRzaWRlIG9mIHRoZSBBbmd1bGFyIHpvbmUuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgd2FpdEZvclRhc2tzT3V0c2lkZUFuZ3VsYXIoKSB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZhY3Rvcnkud2FpdEZvclRhc2tzT3V0c2lkZUFuZ3VsYXIoKTtcbiAgfVxufVxuXG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgY29tcG9uZW50IGhhcm5lc3NlcyB0aGF0IGF1dGhvcnMgc2hvdWxkIGV4dGVuZCBpZiB0aGV5IGFudGljaXBhdGUgdGhhdCBjb25zdW1lcnNcbiAqIG9mIHRoZSBoYXJuZXNzIG1heSB3YW50IHRvIGFjY2VzcyBvdGhlciBoYXJuZXNzZXMgd2l0aGluIHRoZSBgPG5nLWNvbnRlbnQ+YCBvZiB0aGUgY29tcG9uZW50LlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29udGVudENvbnRhaW5lckNvbXBvbmVudEhhcm5lc3M8UyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz5cbiAgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzIGltcGxlbWVudHMgSGFybmVzc0xvYWRlciB7XG5cbiAgYXN5bmMgZ2V0Q2hpbGRMb2FkZXIoc2VsZWN0b3I6IFMpOiBQcm9taXNlPEhhcm5lc3NMb2FkZXI+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuZ2V0Um9vdEhhcm5lc3NMb2FkZXIoKSkuZ2V0Q2hpbGRMb2FkZXIoc2VsZWN0b3IpO1xuICB9XG5cbiAgYXN5bmMgZ2V0QWxsQ2hpbGRMb2FkZXJzKHNlbGVjdG9yOiBTKTogUHJvbWlzZTxIYXJuZXNzTG9hZGVyW10+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuZ2V0Um9vdEhhcm5lc3NMb2FkZXIoKSkuZ2V0QWxsQ2hpbGRMb2FkZXJzKHNlbGVjdG9yKTtcbiAgfVxuXG4gIGFzeW5jIGdldEhhcm5lc3M8VCBleHRlbmRzIENvbXBvbmVudEhhcm5lc3M+KHF1ZXJ5OiBIYXJuZXNzUXVlcnk8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuZ2V0Um9vdEhhcm5lc3NMb2FkZXIoKSkuZ2V0SGFybmVzcyhxdWVyeSk7XG4gIH1cblxuICBhc3luYyBnZXRBbGxIYXJuZXNzZXM8VCBleHRlbmRzIENvbXBvbmVudEhhcm5lc3M+KHF1ZXJ5OiBIYXJuZXNzUXVlcnk8VD4pOiBQcm9taXNlPFRbXT4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5nZXRSb290SGFybmVzc0xvYWRlcigpKS5nZXRBbGxIYXJuZXNzZXMocXVlcnkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHJvb3QgaGFybmVzcyBsb2FkZXIgZnJvbSB3aGljaCB0byBzdGFydFxuICAgKiBzZWFyY2hpbmcgZm9yIGNvbnRlbnQgY29udGFpbmVkIGJ5IHRoaXMgaGFybmVzcy5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBnZXRSb290SGFybmVzc0xvYWRlcigpOiBQcm9taXNlPEhhcm5lc3NMb2FkZXI+IHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRmFjdG9yeS5yb290SGFybmVzc0xvYWRlcigpO1xuICB9XG59XG5cbi8qKiBDb25zdHJ1Y3RvciBmb3IgYSBDb21wb25lbnRIYXJuZXNzIHN1YmNsYXNzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3I8VCBleHRlbmRzIENvbXBvbmVudEhhcm5lc3M+IHtcbiAgbmV3KGxvY2F0b3JGYWN0b3J5OiBMb2NhdG9yRmFjdG9yeSk6IFQ7XG5cbiAgLyoqXG4gICAqIGBDb21wb25lbnRIYXJuZXNzYCBzdWJjbGFzc2VzIG11c3Qgc3BlY2lmeSBhIHN0YXRpYyBgaG9zdFNlbGVjdG9yYCBwcm9wZXJ0eSB0aGF0IGlzIHVzZWQgdG9cbiAgICogZmluZCB0aGUgaG9zdCBlbGVtZW50IGZvciB0aGUgY29ycmVzcG9uZGluZyBjb21wb25lbnQuIFRoaXMgcHJvcGVydHkgc2hvdWxkIG1hdGNoIHRoZSBzZWxlY3RvclxuICAgKiBmb3IgdGhlIEFuZ3VsYXIgY29tcG9uZW50LlxuICAgKi9cbiAgaG9zdFNlbGVjdG9yOiBzdHJpbmc7XG59XG5cbi8qKiBBIHNldCBvZiBjcml0ZXJpYSB0aGF0IGNhbiBiZSB1c2VkIHRvIGZpbHRlciBhIGxpc3Qgb2YgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmFzZUhhcm5lc3NGaWx0ZXJzIHtcbiAgLyoqIE9ubHkgZmluZCBpbnN0YW5jZXMgd2hvc2UgaG9zdCBlbGVtZW50IG1hdGNoZXMgdGhlIGdpdmVuIHNlbGVjdG9yLiAqL1xuICBzZWxlY3Rvcj86IHN0cmluZztcbiAgLyoqIE9ubHkgZmluZCBpbnN0YW5jZXMgdGhhdCBhcmUgbmVzdGVkIHVuZGVyIGFuIGVsZW1lbnQgd2l0aCB0aGUgZ2l2ZW4gc2VsZWN0b3IuICovXG4gIGFuY2VzdG9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEEgY2xhc3MgdXNlZCB0byBhc3NvY2lhdGUgYSBDb21wb25lbnRIYXJuZXNzIGNsYXNzIHdpdGggcHJlZGljYXRlcyBmdW5jdGlvbnMgdGhhdCBjYW4gYmUgdXNlZCB0b1xuICogZmlsdGVyIGluc3RhbmNlcyBvZiB0aGUgY2xhc3MuXG4gKi9cbmV4cG9ydCBjbGFzcyBIYXJuZXNzUHJlZGljYXRlPFQgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzPiB7XG4gIHByaXZhdGUgX3ByZWRpY2F0ZXM6IEFzeW5jUHJlZGljYXRlPFQ+W10gPSBbXTtcbiAgcHJpdmF0ZSBfZGVzY3JpcHRpb25zOiBzdHJpbmdbXSA9IFtdO1xuICBwcml2YXRlIF9hbmNlc3Rvcjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBoYXJuZXNzVHlwZTogQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yPFQ+LCBvcHRpb25zOiBCYXNlSGFybmVzc0ZpbHRlcnMpIHtcbiAgICB0aGlzLl9hZGRCYXNlT3B0aW9ucyhvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIHNwZWNpZmllZCBudWxsYWJsZSBzdHJpbmcgdmFsdWUgbWF0Y2hlcyB0aGUgZ2l2ZW4gcGF0dGVybi5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSBudWxsYWJsZSBzdHJpbmcgdmFsdWUgdG8gY2hlY2ssIG9yIGEgUHJvbWlzZSByZXNvbHZpbmcgdG8gdGhlXG4gICAqICAgbnVsbGFibGUgc3RyaW5nIHZhbHVlLlxuICAgKiBAcGFyYW0gcGF0dGVybiBUaGUgcGF0dGVybiB0aGUgdmFsdWUgaXMgZXhwZWN0ZWQgdG8gbWF0Y2guIElmIGBwYXR0ZXJuYCBpcyBhIHN0cmluZyxcbiAgICogICBgdmFsdWVgIGlzIGV4cGVjdGVkIHRvIG1hdGNoIGV4YWN0bHkuIElmIGBwYXR0ZXJuYCBpcyBhIHJlZ2V4LCBhIHBhcnRpYWwgbWF0Y2ggaXNcbiAgICogICBhbGxvd2VkLiBJZiBgcGF0dGVybmAgaXMgYG51bGxgLCB0aGUgdmFsdWUgaXMgZXhwZWN0ZWQgdG8gYmUgYG51bGxgLlxuICAgKiBAcmV0dXJuIFdoZXRoZXIgdGhlIHZhbHVlIG1hdGNoZXMgdGhlIHBhdHRlcm4uXG4gICAqL1xuICBzdGF0aWMgYXN5bmMgc3RyaW5nTWF0Y2hlcyh2YWx1ZTogc3RyaW5nIHwgbnVsbCB8IFByb21pc2U8c3RyaW5nIHwgbnVsbD4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdHRlcm46IHN0cmluZyB8IFJlZ0V4cCB8IG51bGwpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB2YWx1ZSA9IGF3YWl0IHZhbHVlO1xuICAgIGlmIChwYXR0ZXJuID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IG51bGw7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHlwZW9mIHBhdHRlcm4gPT09ICdzdHJpbmcnID8gdmFsdWUgPT09IHBhdHRlcm4gOiBwYXR0ZXJuLnRlc3QodmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBwcmVkaWNhdGUgZnVuY3Rpb24gdG8gYmUgcnVuIGFnYWluc3QgY2FuZGlkYXRlIGhhcm5lc3Nlcy5cbiAgICogQHBhcmFtIGRlc2NyaXB0aW9uIEEgZGVzY3JpcHRpb24gb2YgdGhpcyBwcmVkaWNhdGUgdGhhdCBtYXkgYmUgdXNlZCBpbiBlcnJvciBtZXNzYWdlcy5cbiAgICogQHBhcmFtIHByZWRpY2F0ZSBBbiBhc3luYyBwcmVkaWNhdGUgZnVuY3Rpb24uXG4gICAqIEByZXR1cm4gdGhpcyAoZm9yIG1ldGhvZCBjaGFpbmluZykuXG4gICAqL1xuICBhZGQoZGVzY3JpcHRpb246IHN0cmluZywgcHJlZGljYXRlOiBBc3luY1ByZWRpY2F0ZTxUPikge1xuICAgIHRoaXMuX2Rlc2NyaXB0aW9ucy5wdXNoKGRlc2NyaXB0aW9uKTtcbiAgICB0aGlzLl9wcmVkaWNhdGVzLnB1c2gocHJlZGljYXRlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgcHJlZGljYXRlIGZ1bmN0aW9uIHRoYXQgZGVwZW5kcyBvbiBhbiBvcHRpb24gdmFsdWUgdG8gYmUgcnVuIGFnYWluc3QgY2FuZGlkYXRlXG4gICAqIGhhcm5lc3Nlcy4gSWYgdGhlIG9wdGlvbiB2YWx1ZSBpcyB1bmRlZmluZWQsIHRoZSBwcmVkaWNhdGUgd2lsbCBiZSBpZ25vcmVkLlxuICAgKiBAcGFyYW0gbmFtZSBUaGUgbmFtZSBvZiB0aGUgb3B0aW9uIChtYXkgYmUgdXNlZCBpbiBlcnJvciBtZXNzYWdlcykuXG4gICAqIEBwYXJhbSBvcHRpb24gVGhlIG9wdGlvbiB2YWx1ZS5cbiAgICogQHBhcmFtIHByZWRpY2F0ZSBUaGUgcHJlZGljYXRlIGZ1bmN0aW9uIHRvIHJ1biBpZiB0aGUgb3B0aW9uIHZhbHVlIGlzIG5vdCB1bmRlZmluZWQuXG4gICAqIEByZXR1cm4gdGhpcyAoZm9yIG1ldGhvZCBjaGFpbmluZykuXG4gICAqL1xuICBhZGRPcHRpb248Tz4obmFtZTogc3RyaW5nLCBvcHRpb246IE8gfCB1bmRlZmluZWQsIHByZWRpY2F0ZTogQXN5bmNPcHRpb25QcmVkaWNhdGU8VCwgTz4pIHtcbiAgICBpZiAob3B0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuYWRkKGAke25hbWV9ID0gJHtfdmFsdWVBc1N0cmluZyhvcHRpb24pfWAsIGl0ZW0gPT4gcHJlZGljYXRlKGl0ZW0sIG9wdGlvbikpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBGaWx0ZXJzIGEgbGlzdCBvZiBoYXJuZXNzZXMgb24gdGhpcyBwcmVkaWNhdGUuXG4gICAqIEBwYXJhbSBoYXJuZXNzZXMgVGhlIGxpc3Qgb2YgaGFybmVzc2VzIHRvIGZpbHRlci5cbiAgICogQHJldHVybiBBIGxpc3Qgb2YgaGFybmVzc2VzIHRoYXQgc2F0aXNmeSB0aGlzIHByZWRpY2F0ZS5cbiAgICovXG4gIGFzeW5jIGZpbHRlcihoYXJuZXNzZXM6IFRbXSk6IFByb21pc2U8VFtdPiB7XG4gICAgaWYgKGhhcm5lc3Nlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHBhcmFsbGVsKCgpID0+IGhhcm5lc3Nlcy5tYXAoaCA9PiB0aGlzLmV2YWx1YXRlKGgpKSk7XG4gICAgcmV0dXJuIGhhcm5lc3Nlcy5maWx0ZXIoKF8sIGkpID0+IHJlc3VsdHNbaV0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2YWx1YXRlcyB3aGV0aGVyIHRoZSBnaXZlbiBoYXJuZXNzIHNhdGlzZmllcyB0aGlzIHByZWRpY2F0ZS5cbiAgICogQHBhcmFtIGhhcm5lc3MgVGhlIGhhcm5lc3MgdG8gY2hlY2tcbiAgICogQHJldHVybiBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0cnVlIGlmIHRoZSBoYXJuZXNzIHNhdGlzZmllcyB0aGlzIHByZWRpY2F0ZSxcbiAgICogICBhbmQgcmVzb2x2ZXMgdG8gZmFsc2Ugb3RoZXJ3aXNlLlxuICAgKi9cbiAgYXN5bmMgZXZhbHVhdGUoaGFybmVzczogVCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBwYXJhbGxlbCgoKSA9PiB0aGlzLl9wcmVkaWNhdGVzLm1hcChwID0+IHAoaGFybmVzcykpKTtcbiAgICByZXR1cm4gcmVzdWx0cy5yZWR1Y2UoKGNvbWJpbmVkLCBjdXJyZW50KSA9PiBjb21iaW5lZCAmJiBjdXJyZW50LCB0cnVlKTtcbiAgfVxuXG4gIC8qKiBHZXRzIGEgZGVzY3JpcHRpb24gb2YgdGhpcyBwcmVkaWNhdGUgZm9yIHVzZSBpbiBlcnJvciBtZXNzYWdlcy4gKi9cbiAgZ2V0RGVzY3JpcHRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Rlc2NyaXB0aW9ucy5qb2luKCcsICcpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHNlbGVjdG9yIHVzZWQgdG8gZmluZCBjYW5kaWRhdGUgZWxlbWVudHMuICovXG4gIGdldFNlbGVjdG9yKCkge1xuICAgIC8vIFdlIGRvbid0IGhhdmUgdG8gZ28gdGhyb3VnaCB0aGUgZXh0cmEgdHJvdWJsZSBpZiB0aGVyZSBhcmUgbm8gYW5jZXN0b3JzLlxuICAgIGlmICghdGhpcy5fYW5jZXN0b3IpIHtcbiAgICAgIHJldHVybiAodGhpcy5oYXJuZXNzVHlwZS5ob3N0U2VsZWN0b3IgfHwgJycpLnRyaW0oKTtcbiAgICB9XG5cbiAgICBjb25zdCBbYW5jZXN0b3JzLCBhbmNlc3RvclBsYWNlaG9sZGVyc10gPSBfc3BsaXRBbmRFc2NhcGVTZWxlY3Rvcih0aGlzLl9hbmNlc3Rvcik7XG4gICAgY29uc3QgW3NlbGVjdG9ycywgc2VsZWN0b3JQbGFjZWhvbGRlcnNdID1cbiAgICAgIF9zcGxpdEFuZEVzY2FwZVNlbGVjdG9yKHRoaXMuaGFybmVzc1R5cGUuaG9zdFNlbGVjdG9yIHx8ICcnKTtcbiAgICBjb25zdCByZXN1bHQ6IHN0cmluZ1tdID0gW107XG5cbiAgICAvLyBXZSBoYXZlIHRvIGFkZCB0aGUgYW5jZXN0b3IgdG8gZWFjaCBwYXJ0IG9mIHRoZSBob3N0IGNvbXBvdW5kIHNlbGVjdG9yLCBvdGhlcndpc2Ugd2UgY2FuIGdldFxuICAgIC8vIGluY29ycmVjdCByZXN1bHRzLiBFLmcuIGAuYW5jZXN0b3IgLmEsIC5hbmNlc3RvciAuYmAgdnMgYC5hbmNlc3RvciAuYSwgLmJgLlxuICAgIGFuY2VzdG9ycy5mb3JFYWNoKGVzY2FwZWRBbmNlc3RvciA9PiB7XG4gICAgICBjb25zdCBhbmNlc3RvciA9IF9yZXN0b3JlU2VsZWN0b3IoZXNjYXBlZEFuY2VzdG9yLCBhbmNlc3RvclBsYWNlaG9sZGVycyk7XG4gICAgICByZXR1cm4gc2VsZWN0b3JzLmZvckVhY2goZXNjYXBlZFNlbGVjdG9yID0+XG4gICAgICAgIHJlc3VsdC5wdXNoKGAke2FuY2VzdG9yfSAke19yZXN0b3JlU2VsZWN0b3IoZXNjYXBlZFNlbGVjdG9yLCBzZWxlY3RvclBsYWNlaG9sZGVycyl9YCkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdC5qb2luKCcsICcpO1xuICB9XG5cbiAgLyoqIEFkZHMgYmFzZSBvcHRpb25zIGNvbW1vbiB0byBhbGwgaGFybmVzcyB0eXBlcy4gKi9cbiAgcHJpdmF0ZSBfYWRkQmFzZU9wdGlvbnMob3B0aW9uczogQmFzZUhhcm5lc3NGaWx0ZXJzKSB7XG4gICAgdGhpcy5fYW5jZXN0b3IgPSBvcHRpb25zLmFuY2VzdG9yIHx8ICcnO1xuICAgIGlmICh0aGlzLl9hbmNlc3Rvcikge1xuICAgICAgdGhpcy5fZGVzY3JpcHRpb25zLnB1c2goYGhhcyBhbmNlc3RvciBtYXRjaGluZyBzZWxlY3RvciBcIiR7dGhpcy5fYW5jZXN0b3J9XCJgKTtcbiAgICB9XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBvcHRpb25zLnNlbGVjdG9yO1xuICAgIGlmIChzZWxlY3RvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmFkZChgaG9zdCBtYXRjaGVzIHNlbGVjdG9yIFwiJHtzZWxlY3Rvcn1cImAsIGFzeW5jIGl0ZW0gPT4ge1xuICAgICAgICByZXR1cm4gKGF3YWl0IGl0ZW0uaG9zdCgpKS5tYXRjaGVzU2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbi8qKiBSZXByZXNlbnQgYSB2YWx1ZSBhcyBhIHN0cmluZyBmb3IgdGhlIHB1cnBvc2Ugb2YgbG9nZ2luZy4gKi9cbmZ1bmN0aW9uIF92YWx1ZUFzU3RyaW5nKHZhbHVlOiB1bmtub3duKSB7XG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuICd1bmRlZmluZWQnO1xuICB9XG4gIC8vIGBKU09OLnN0cmluZ2lmeWAgZG9lc24ndCBoYW5kbGUgUmVnRXhwIHByb3Blcmx5LCBzbyB3ZSBuZWVkIGEgY3VzdG9tIHJlcGxhY2VyLlxuICB0cnkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSwgKF8sIHYpID0+IHtcbiAgICAgIGlmICh2IGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICAgIHJldHVybiBgLyR7di50b1N0cmluZygpfS9gO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHlwZW9mIHYgPT09ICdzdHJpbmcnID8gdi5yZXBsYWNlKCcvXFwvL2cnLCAnXFxcXC8nKSA6IHY7XG4gICAgfSkucmVwbGFjZSgvXCJcXC9cXC8vZywgJ1xcXFwvJykucmVwbGFjZSgvXFwvXFwvXCIvZywgJ1xcXFwvJykucmVwbGFjZSgvXFxcXFxcLy9nLCAnLycpO1xuICB9IGNhdGNoIHtcbiAgICAvLyBgSlNPTi5zdHJpbmdpZnlgIHdpbGwgdGhyb3cgaWYgdGhlIG9iamVjdCBpcyBjeWNsaWNhbCxcbiAgICAvLyBpbiB0aGlzIGNhc2UgdGhlIGJlc3Qgd2UgY2FuIGRvIGlzIHJlcG9ydCB0aGUgdmFsdWUgYXMgYHsuLi59YC5cbiAgICByZXR1cm4gJ3suLi59JztcbiAgfVxufVxuXG4vKipcbiAqIFNwbGl0cyB1cCBhIGNvbXBvdW5kIHNlbGVjdG9yIGludG8gaXRzIHBhcnRzIGFuZCBlc2NhcGVzIGFueSBxdW90ZWQgY29udGVudC4gVGhlIHF1b3RlZCBjb250ZW50XG4gKiBoYXMgdG8gYmUgZXNjYXBlZCwgYmVjYXVzZSBpdCBjYW4gY29udGFpbiBjb21tYXMgd2hpY2ggd2lsbCB0aHJvdyB0aHJvdyB1cyBvZmYgd2hlbiB0cnlpbmcgdG9cbiAqIHNwbGl0IGl0LlxuICogQHBhcmFtIHNlbGVjdG9yIFNlbGVjdG9yIHRvIGJlIHNwbGl0LlxuICogQHJldHVybnMgVGhlIGVzY2FwZWQgc3RyaW5nIHdoZXJlIGFueSBxdW90ZWQgY29udGVudCBpcyByZXBsYWNlZCB3aXRoIGEgcGxhY2Vob2xkZXIuIEUuZy5cbiAqIGBbZm9vPVwiYmFyXCJdYCB0dXJucyBpbnRvIGBbZm9vPV9fY2RrUGxhY2Vob2xkZXItMF9fXWAuIFVzZSBgX3Jlc3RvcmVTZWxlY3RvcmAgdG8gcmVzdG9yZVxuICogdGhlIHBsYWNlaG9sZGVycy5cbiAqL1xuZnVuY3Rpb24gX3NwbGl0QW5kRXNjYXBlU2VsZWN0b3Ioc2VsZWN0b3I6IHN0cmluZyk6IFtwYXJ0czogc3RyaW5nW10sIHBsYWNlaG9sZGVyczogc3RyaW5nW11dIHtcbiAgY29uc3QgcGxhY2Vob2xkZXJzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8vIE5vdGUgdGhhdCB0aGUgcmVnZXggZG9lc24ndCBhY2NvdW50IGZvciBuZXN0ZWQgcXVvdGVzIHNvIHNvbWV0aGluZyBsaWtlIGBcImFiJ2NkJ2VcImAgd2lsbCBiZVxuICAvLyBjb25zaWRlcmVkIGFzIHR3byBibG9ja3MuIEl0J3MgYSBiaXQgb2YgYW4gZWRnZSBjYXNlLCBidXQgaWYgd2UgZmluZCB0aGF0IGl0J3MgYSBwcm9ibGVtLFxuICAvLyB3ZSBjYW4gbWFrZSBpdCBhIGJpdCBzbWFydGVyIHVzaW5nIGEgbG9vcC4gVXNlIHRoaXMgZm9yIG5vdyBzaW5jZSBpdCdzIG1vcmUgcmVhZGFibGUgYW5kXG4gIC8vIGNvbXBhY3QuIE1vcmUgY29tcGxldGUgaW1wbGVtZW50YXRpb246XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvYmxvYi9iZDM0YmM5ZTg5ZjE4YS9wYWNrYWdlcy9jb21waWxlci9zcmMvc2hhZG93X2Nzcy50cyNMNjU1XG4gIGNvbnN0IHJlc3VsdCA9IHNlbGVjdG9yLnJlcGxhY2UoLyhbXCInXVteW1wiJ10qW1wiJ10pL2csIChfLCBrZWVwKSA9PiB7XG4gICAgY29uc3QgcmVwbGFjZUJ5ID0gYF9fY2RrUGxhY2Vob2xkZXItJHtwbGFjZWhvbGRlcnMubGVuZ3RofV9fYDtcbiAgICBwbGFjZWhvbGRlcnMucHVzaChrZWVwKTtcbiAgICByZXR1cm4gcmVwbGFjZUJ5O1xuICB9KTtcblxuICByZXR1cm4gW3Jlc3VsdC5zcGxpdCgnLCcpLm1hcChwYXJ0ID0+IHBhcnQudHJpbSgpKSwgcGxhY2Vob2xkZXJzXTtcbn1cblxuLyoqIFJlc3RvcmVzIGEgc2VsZWN0b3Igd2hvc2UgY29udGVudCB3YXMgZXNjYXBlZCBpbiBgX3NwbGl0QW5kRXNjYXBlU2VsZWN0b3JgLiAqL1xuZnVuY3Rpb24gX3Jlc3RvcmVTZWxlY3RvcihzZWxlY3Rvcjogc3RyaW5nLCBwbGFjZWhvbGRlcnM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgcmV0dXJuIHNlbGVjdG9yLnJlcGxhY2UoL19fY2RrUGxhY2Vob2xkZXItKFxcZCspX18vZywgKF8sIGluZGV4KSA9PiBwbGFjZWhvbGRlcnNbK2luZGV4XSk7XG59XG4iXX0=