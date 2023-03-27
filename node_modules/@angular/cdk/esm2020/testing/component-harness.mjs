/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
    async host() {
        return this.locatorFactory.rootElement;
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
    async forceStabilize() {
        return this.locatorFactory.forceStabilize();
    }
    /**
     * Waits for all scheduled or running async tasks to complete. This allows harness
     * authors to wait for async tasks outside of the Angular zone.
     */
    async waitForTasksOutsideAngular() {
        return this.locatorFactory.waitForTasksOutsideAngular();
    }
}
/**
 * Base class for component harnesses that authors should extend if they anticipate that consumers
 * of the harness may want to access other harnesses within the `<ng-content>` of the component.
 */
export class ContentContainerComponentHarness extends ComponentHarness {
    async getChildLoader(selector) {
        return (await this.getRootHarnessLoader()).getChildLoader(selector);
    }
    async getAllChildLoaders(selector) {
        return (await this.getRootHarnessLoader()).getAllChildLoaders(selector);
    }
    async getHarness(query) {
        return (await this.getRootHarnessLoader()).getHarness(query);
    }
    async getHarnessOrNull(query) {
        return (await this.getRootHarnessLoader()).getHarnessOrNull(query);
    }
    async getAllHarnesses(query) {
        return (await this.getRootHarnessLoader()).getAllHarnesses(query);
    }
    async hasHarness(query) {
        return (await this.getRootHarnessLoader()).hasHarness(query);
    }
    /**
     * Gets the root harness loader from which to start
     * searching for content contained by this harness.
     */
    async getRootHarnessLoader() {
        return this.locatorFactory.rootHarnessLoader();
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
    static async stringMatches(value, pattern) {
        value = await value;
        if (pattern === null) {
            return value === null;
        }
        else if (value === null) {
            return false;
        }
        return typeof pattern === 'string' ? value === pattern : pattern.test(value);
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
    async filter(harnesses) {
        if (harnesses.length === 0) {
            return [];
        }
        const results = await parallel(() => harnesses.map(h => this.evaluate(h)));
        return harnesses.filter((_, i) => results[i]);
    }
    /**
     * Evaluates whether the given harness satisfies this predicate.
     * @param harness The harness to check
     * @return A promise that resolves to true if the harness satisfies this predicate,
     *   and resolves to false otherwise.
     */
    async evaluate(harness) {
        const results = await parallel(() => this._predicates.map(p => p(harness)));
        return results.reduce((combined, current) => combined && current, true);
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
            this.add(`host matches selector "${selector}"`, async (item) => {
                return (await item.host()).matchesSelector(selector);
            });
        }
    }
}
/** Represent a value as a string for the purpose of logging. */
function _valueAsString(value) {
    if (value === undefined) {
        return 'undefined';
    }
    try {
        // `JSON.stringify` doesn't handle RegExp properly, so we need a custom replacer.
        // Use a character that is unlikely to appear in real strings to denote the start and end of
        // the regex. This allows us to strip out the extra quotes around the value added by
        // `JSON.stringify`. Also do custom escaping on `"` characters to prevent `JSON.stringify`
        // from escaping them as if they were part of a string.
        const stringifiedValue = JSON.stringify(value, (_, v) => v instanceof RegExp
            ? `◬MAT_RE_ESCAPE◬${v.toString().replace(/"/g, '◬MAT_RE_ESCAPE◬')}◬MAT_RE_ESCAPE◬`
            : v);
        // Strip out the extra quotes around regexes and put back the manually escaped `"` characters.
        return stringifiedValue
            .replace(/"◬MAT_RE_ESCAPE◬|◬MAT_RE_ESCAPE◬"/g, '')
            .replace(/◬MAT_RE_ESCAPE◬/g, '"');
    }
    catch {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3Rlc3RpbmcvY29tcG9uZW50LWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBbVE1Qzs7OztHQUlHO0FBQ0gsTUFBTSxPQUFnQixnQkFBZ0I7SUFDcEMsWUFBK0IsY0FBOEI7UUFBOUIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO0lBQUcsQ0FBQztJQUVqRSw2RkFBNkY7SUFDN0YsS0FBSyxDQUFDLElBQUk7UUFDUixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7OztPQUlHO0lBQ08sMEJBQTBCO1FBQ2xDLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0lBQzFELENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FvQkc7SUFDTyxVQUFVLENBQ2xCLEdBQUcsT0FBVTtRQUViLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09Bb0JHO0lBQ08sa0JBQWtCLENBQzFCLEdBQUcsT0FBVTtRQUViLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FtQ0c7SUFDTyxhQUFhLENBQ3JCLEdBQUcsT0FBVTtRQUViLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNPLEtBQUssQ0FBQyxj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O0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSCxTQUFTLHVCQUF1QixDQUFDLFFBQWdCO0lBQy9DLE1BQU0sWUFBWSxHQUFhLEVBQUUsQ0FBQztJQUVsQyw4RkFBOEY7SUFDOUYsNEZBQTRGO0lBQzVGLDJGQUEyRjtJQUMzRix5Q0FBeUM7SUFDekMsa0dBQWtHO0lBQ2xHLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDaEUsTUFBTSxTQUFTLEdBQUcsb0JBQW9CLFlBQVksQ0FBQyxNQUFNLElBQUksQ0FBQztRQUM5RCxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hCLE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDcEUsQ0FBQztBQUVELGtGQUFrRjtBQUNsRixTQUFTLGdCQUFnQixDQUFDLFFBQWdCLEVBQUUsWUFBc0I7SUFDaEUsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLDJCQUEyQixFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUMzRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cGFyYWxsZWx9IGZyb20gJy4vY2hhbmdlLWRldGVjdGlvbic7XG5pbXBvcnQge1Rlc3RFbGVtZW50fSBmcm9tICcuL3Rlc3QtZWxlbWVudCc7XG5cbi8qKiBBbiBhc3luYyBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBwcm9taXNlIHdoZW4gY2FsbGVkLiAqL1xuZXhwb3J0IHR5cGUgQXN5bmNGYWN0b3J5Rm48VD4gPSAoKSA9PiBQcm9taXNlPFQ+O1xuXG4vKiogQW4gYXN5bmMgZnVuY3Rpb24gdGhhdCB0YWtlcyBhbiBpdGVtIGFuZCByZXR1cm5zIGEgYm9vbGVhbiBwcm9taXNlICovXG5leHBvcnQgdHlwZSBBc3luY1ByZWRpY2F0ZTxUPiA9IChpdGVtOiBUKSA9PiBQcm9taXNlPGJvb2xlYW4+O1xuXG4vKiogQW4gYXN5bmMgZnVuY3Rpb24gdGhhdCB0YWtlcyBhbiBpdGVtIGFuZCBhbiBvcHRpb24gdmFsdWUgYW5kIHJldHVybnMgYSBib29sZWFuIHByb21pc2UuICovXG5leHBvcnQgdHlwZSBBc3luY09wdGlvblByZWRpY2F0ZTxULCBPPiA9IChpdGVtOiBULCBvcHRpb246IE8pID0+IFByb21pc2U8Ym9vbGVhbj47XG5cbi8qKlxuICogQSBxdWVyeSBmb3IgYSBgQ29tcG9uZW50SGFybmVzc2AsIHdoaWNoIGlzIGV4cHJlc3NlZCBhcyBlaXRoZXIgYSBgQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yYCBvclxuICogYSBgSGFybmVzc1ByZWRpY2F0ZWAuXG4gKi9cbmV4cG9ydCB0eXBlIEhhcm5lc3NRdWVyeTxUIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcz4gPVxuICB8IENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxUPlxuICB8IEhhcm5lc3NQcmVkaWNhdGU8VD47XG5cbi8qKlxuICogVGhlIHJlc3VsdCB0eXBlIG9idGFpbmVkIHdoZW4gc2VhcmNoaW5nIHVzaW5nIGEgcGFydGljdWxhciBsaXN0IG9mIHF1ZXJpZXMuIFRoaXMgdHlwZSBkZXBlbmRzIG9uXG4gKiB0aGUgcGFydGljdWxhciBpdGVtcyBiZWluZyBxdWVyaWVkLlxuICogLSBJZiBvbmUgb2YgdGhlIHF1ZXJpZXMgaXMgZm9yIGEgYENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxDMT5gLCBpdCBtZWFucyB0aGF0IHRoZSByZXN1bHRcbiAqICAgbWlnaHQgYmUgYSBoYXJuZXNzIG9mIHR5cGUgYEMxYFxuICogLSBJZiBvbmUgb2YgdGhlIHF1ZXJpZXMgaXMgZm9yIGEgYEhhcm5lc3NQcmVkaWNhdGU8QzI+YCwgaXQgbWVhbnMgdGhhdCB0aGUgcmVzdWx0IG1pZ2h0IGJlIGFcbiAqICAgaGFybmVzcyBvZiB0eXBlIGBDMmBcbiAqIC0gSWYgb25lIG9mIHRoZSBxdWVyaWVzIGlzIGZvciBhIGBzdHJpbmdgLCBpdCBtZWFucyB0aGF0IHRoZSByZXN1bHQgbWlnaHQgYmUgYSBgVGVzdEVsZW1lbnRgLlxuICpcbiAqIFNpbmNlIHdlIGRvbid0IGtub3cgZm9yIHN1cmUgd2hpY2ggcXVlcnkgd2lsbCBtYXRjaCwgdGhlIHJlc3VsdCB0eXBlIGlmIHRoZSB1bmlvbiBvZiB0aGUgdHlwZXNcbiAqIGZvciBhbGwgcG9zc2libGUgcmVzdWx0cy5cbiAqXG4gKiBlLmcuXG4gKiBUaGUgdHlwZTpcbiAqIGBMb2NhdG9yRm5SZXN1bHQmbHQ7W1xuICogICBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3ImbHQ7TXlIYXJuZXNzJmd0OyxcbiAqICAgSGFybmVzc1ByZWRpY2F0ZSZsdDtNeU90aGVySGFybmVzcyZndDssXG4gKiAgIHN0cmluZ1xuICogXSZndDtgXG4gKiBpcyBlcXVpdmFsZW50IHRvOlxuICogYE15SGFybmVzcyB8IE15T3RoZXJIYXJuZXNzIHwgVGVzdEVsZW1lbnRgLlxuICovXG5leHBvcnQgdHlwZSBMb2NhdG9yRm5SZXN1bHQ8VCBleHRlbmRzIChIYXJuZXNzUXVlcnk8YW55PiB8IHN0cmluZylbXT4gPSB7XG4gIFtJIGluIGtleW9mIFRdOiBUW0ldIGV4dGVuZHMgbmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gaW5mZXIgQyAvLyBNYXAgYENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxDPmAgdG8gYENgLlxuICAgID8gQ1xuICAgIDogLy8gTWFwIGBIYXJuZXNzUHJlZGljYXRlPEM+YCB0byBgQ2AuXG4gICAgVFtJXSBleHRlbmRzIHtoYXJuZXNzVHlwZTogbmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gaW5mZXIgQ31cbiAgICA/IENcbiAgICA6IC8vIE1hcCBgc3RyaW5nYCB0byBgVGVzdEVsZW1lbnRgLlxuICAgIFRbSV0gZXh0ZW5kcyBzdHJpbmdcbiAgICA/IFRlc3RFbGVtZW50XG4gICAgOiAvLyBNYXAgZXZlcnl0aGluZyBlbHNlIHRvIGBuZXZlcmAgKHNob3VsZCBub3QgaGFwcGVuIGR1ZSB0byB0aGUgdHlwZSBjb25zdHJhaW50IG9uIGBUYCkuXG4gICAgICBuZXZlcjtcbn1bbnVtYmVyXTtcblxuLyoqXG4gKiBJbnRlcmZhY2UgdXNlZCB0byBsb2FkIENvbXBvbmVudEhhcm5lc3Mgb2JqZWN0cy4gVGhpcyBpbnRlcmZhY2UgaXMgdXNlZCBieSB0ZXN0IGF1dGhvcnMgdG9cbiAqIGluc3RhbnRpYXRlIGBDb21wb25lbnRIYXJuZXNzYGVzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEhhcm5lc3NMb2FkZXIge1xuICAvKipcbiAgICogU2VhcmNoZXMgZm9yIGFuIGVsZW1lbnQgd2l0aCB0aGUgZ2l2ZW4gc2VsZWN0b3IgdW5kZXIgdGhlIGN1cnJlbnQgaW5zdGFuY2VzJ3Mgcm9vdCBlbGVtZW50LFxuICAgKiBhbmQgcmV0dXJucyBhIGBIYXJuZXNzTG9hZGVyYCByb290ZWQgYXQgdGhlIG1hdGNoaW5nIGVsZW1lbnQuIElmIG11bHRpcGxlIGVsZW1lbnRzIG1hdGNoIHRoZVxuICAgKiBzZWxlY3RvciwgdGhlIGZpcnN0IGlzIHVzZWQuIElmIG5vIGVsZW1lbnRzIG1hdGNoLCBhbiBlcnJvciBpcyB0aHJvd24uXG4gICAqIEBwYXJhbSBzZWxlY3RvciBUaGUgc2VsZWN0b3IgZm9yIHRoZSByb290IGVsZW1lbnQgb2YgdGhlIG5ldyBgSGFybmVzc0xvYWRlcmBcbiAgICogQHJldHVybiBBIGBIYXJuZXNzTG9hZGVyYCByb290ZWQgYXQgdGhlIGVsZW1lbnQgbWF0Y2hpbmcgdGhlIGdpdmVuIHNlbGVjdG9yLlxuICAgKiBAdGhyb3dzIElmIGEgbWF0Y2hpbmcgZWxlbWVudCBjYW4ndCBiZSBmb3VuZC5cbiAgICovXG4gIGdldENoaWxkTG9hZGVyKHNlbGVjdG9yOiBzdHJpbmcpOiBQcm9taXNlPEhhcm5lc3NMb2FkZXI+O1xuXG4gIC8qKlxuICAgKiBTZWFyY2hlcyBmb3IgYWxsIGVsZW1lbnRzIHdpdGggdGhlIGdpdmVuIHNlbGVjdG9yIHVuZGVyIHRoZSBjdXJyZW50IGluc3RhbmNlcydzIHJvb3QgZWxlbWVudCxcbiAgICogYW5kIHJldHVybnMgYW4gYXJyYXkgb2YgYEhhcm5lc3NMb2FkZXJgcywgb25lIGZvciBlYWNoIG1hdGNoaW5nIGVsZW1lbnQsIHJvb3RlZCBhdCB0aGF0XG4gICAqIGVsZW1lbnQuXG4gICAqIEBwYXJhbSBzZWxlY3RvciBUaGUgc2VsZWN0b3IgZm9yIHRoZSByb290IGVsZW1lbnQgb2YgdGhlIG5ldyBgSGFybmVzc0xvYWRlcmBcbiAgICogQHJldHVybiBBIGxpc3Qgb2YgYEhhcm5lc3NMb2FkZXJgcywgb25lIGZvciBlYWNoIG1hdGNoaW5nIGVsZW1lbnQsIHJvb3RlZCBhdCB0aGF0IGVsZW1lbnQuXG4gICAqL1xuICBnZXRBbGxDaGlsZExvYWRlcnMoc2VsZWN0b3I6IHN0cmluZyk6IFByb21pc2U8SGFybmVzc0xvYWRlcltdPjtcblxuICAvKipcbiAgICogU2VhcmNoZXMgZm9yIGFuIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW4gaGFybmVzcyB0eXBlIHVuZGVyIHRoZVxuICAgKiBgSGFybmVzc0xvYWRlcmAncyByb290IGVsZW1lbnQsIGFuZCByZXR1cm5zIGEgYENvbXBvbmVudEhhcm5lc3NgIGZvciB0aGF0IGluc3RhbmNlLiBJZiBtdWx0aXBsZVxuICAgKiBtYXRjaGluZyBjb21wb25lbnRzIGFyZSBmb3VuZCwgYSBoYXJuZXNzIGZvciB0aGUgZmlyc3Qgb25lIGlzIHJldHVybmVkLiBJZiBubyBtYXRjaGluZ1xuICAgKiBjb21wb25lbnQgaXMgZm91bmQsIGFuIGVycm9yIGlzIHRocm93bi5cbiAgICogQHBhcmFtIHF1ZXJ5IEEgcXVlcnkgZm9yIGEgaGFybmVzcyB0byBjcmVhdGVcbiAgICogQHJldHVybiBBbiBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gaGFybmVzcyB0eXBlXG4gICAqIEB0aHJvd3MgSWYgYSBtYXRjaGluZyBjb21wb25lbnQgaW5zdGFuY2UgY2FuJ3QgYmUgZm91bmQuXG4gICAqL1xuICBnZXRIYXJuZXNzPFQgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzPihxdWVyeTogSGFybmVzc1F1ZXJ5PFQ+KTogUHJvbWlzZTxUPjtcblxuICAvKipcbiAgICogU2VhcmNoZXMgZm9yIGFuIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW4gaGFybmVzcyB0eXBlIHVuZGVyIHRoZVxuICAgKiBgSGFybmVzc0xvYWRlcmAncyByb290IGVsZW1lbnQsIGFuZCByZXR1cm5zIGEgYENvbXBvbmVudEhhcm5lc3NgIGZvciB0aGF0IGluc3RhbmNlLiBJZiBtdWx0aXBsZVxuICAgKiBtYXRjaGluZyBjb21wb25lbnRzIGFyZSBmb3VuZCwgYSBoYXJuZXNzIGZvciB0aGUgZmlyc3Qgb25lIGlzIHJldHVybmVkLiBJZiBubyBtYXRjaGluZ1xuICAgKiBjb21wb25lbnQgaXMgZm91bmQsIG51bGwgaXMgcmV0dXJuZWQuXG4gICAqIEBwYXJhbSBxdWVyeSBBIHF1ZXJ5IGZvciBhIGhhcm5lc3MgdG8gY3JlYXRlXG4gICAqIEByZXR1cm4gQW4gaW5zdGFuY2Ugb2YgdGhlIGdpdmVuIGhhcm5lc3MgdHlwZSAob3IgbnVsbCBpZiBub3QgZm91bmQpLlxuICAgKi9cbiAgZ2V0SGFybmVzc09yTnVsbDxUIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcz4ocXVlcnk6IEhhcm5lc3NRdWVyeTxUPik6IFByb21pc2U8VCB8IG51bGw+O1xuXG4gIC8qKlxuICAgKiBTZWFyY2hlcyBmb3IgYWxsIGluc3RhbmNlcyBvZiB0aGUgY29tcG9uZW50IGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuIGhhcm5lc3MgdHlwZSB1bmRlciB0aGVcbiAgICogYEhhcm5lc3NMb2FkZXJgJ3Mgcm9vdCBlbGVtZW50LCBhbmQgcmV0dXJucyBhIGxpc3QgYENvbXBvbmVudEhhcm5lc3NgIGZvciBlYWNoIGluc3RhbmNlLlxuICAgKiBAcGFyYW0gcXVlcnkgQSBxdWVyeSBmb3IgYSBoYXJuZXNzIHRvIGNyZWF0ZVxuICAgKiBAcmV0dXJuIEEgbGlzdCBpbnN0YW5jZXMgb2YgdGhlIGdpdmVuIGhhcm5lc3MgdHlwZS5cbiAgICovXG4gIGdldEFsbEhhcm5lc3NlczxUIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcz4ocXVlcnk6IEhhcm5lc3NRdWVyeTxUPik6IFByb21pc2U8VFtdPjtcblxuICAvKipcbiAgICogU2VhcmNoZXMgZm9yIGFuIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW4gaGFybmVzcyB0eXBlIHVuZGVyIHRoZVxuICAgKiBgSGFybmVzc0xvYWRlcmAncyByb290IGVsZW1lbnQsIGFuZCByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIGlmIGFueSB3ZXJlIGZvdW5kLlxuICAgKiBAcGFyYW0gcXVlcnkgQSBxdWVyeSBmb3IgYSBoYXJuZXNzIHRvIGNyZWF0ZVxuICAgKiBAcmV0dXJuIEEgYm9vbGVhbiBpbmRpY2F0aW5nIGlmIGFuIGluc3RhbmNlIHdhcyBmb3VuZC5cbiAgICovXG4gIGhhc0hhcm5lc3M8VCBleHRlbmRzIENvbXBvbmVudEhhcm5lc3M+KHF1ZXJ5OiBIYXJuZXNzUXVlcnk8VD4pOiBQcm9taXNlPGJvb2xlYW4+O1xufVxuXG4vKipcbiAqIEludGVyZmFjZSB1c2VkIHRvIGNyZWF0ZSBhc3luY2hyb25vdXMgbG9jYXRvciBmdW5jdGlvbnMgdXNlZCBmaW5kIGVsZW1lbnRzIGFuZCBjb21wb25lbnRcbiAqIGhhcm5lc3Nlcy4gVGhpcyBpbnRlcmZhY2UgaXMgdXNlZCBieSBgQ29tcG9uZW50SGFybmVzc2AgYXV0aG9ycyB0byBjcmVhdGUgbG9jYXRvciBmdW5jdGlvbnMgZm9yXG4gKiB0aGVpciBgQ29tcG9uZW50SGFybmVzc2Agc3ViY2xhc3MuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9jYXRvckZhY3Rvcnkge1xuICAvKiogR2V0cyBhIGxvY2F0b3IgZmFjdG9yeSByb290ZWQgYXQgdGhlIGRvY3VtZW50IHJvb3QuICovXG4gIGRvY3VtZW50Um9vdExvY2F0b3JGYWN0b3J5KCk6IExvY2F0b3JGYWN0b3J5O1xuXG4gIC8qKiBUaGUgcm9vdCBlbGVtZW50IG9mIHRoaXMgYExvY2F0b3JGYWN0b3J5YCBhcyBhIGBUZXN0RWxlbWVudGAuICovXG4gIHJvb3RFbGVtZW50OiBUZXN0RWxlbWVudDtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBhc3luY2hyb25vdXMgbG9jYXRvciBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGZpbmQgYSBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VcbiAgICogb3IgZWxlbWVudCB1bmRlciB0aGUgcm9vdCBlbGVtZW50IG9mIHRoaXMgYExvY2F0b3JGYWN0b3J5YC5cbiAgICogQHBhcmFtIHF1ZXJpZXMgQSBsaXN0IG9mIHF1ZXJpZXMgc3BlY2lmeWluZyB3aGljaCBoYXJuZXNzZXMgYW5kIGVsZW1lbnRzIHRvIHNlYXJjaCBmb3I6XG4gICAqICAgLSBBIGBzdHJpbmdgIHNlYXJjaGVzIGZvciBlbGVtZW50cyBtYXRjaGluZyB0aGUgQ1NTIHNlbGVjdG9yIHNwZWNpZmllZCBieSB0aGUgc3RyaW5nLlxuICAgKiAgIC0gQSBgQ29tcG9uZW50SGFybmVzc2AgY29uc3RydWN0b3Igc2VhcmNoZXMgZm9yIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZXMgbWF0Y2hpbmcgdGhlXG4gICAqICAgICBnaXZlbiBjbGFzcy5cbiAgICogICAtIEEgYEhhcm5lc3NQcmVkaWNhdGVgIHNlYXJjaGVzIGZvciBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzIG1hdGNoaW5nIHRoZSBnaXZlblxuICAgKiAgICAgcHJlZGljYXRlLlxuICAgKiBAcmV0dXJuIEFuIGFzeW5jaHJvbm91cyBsb2NhdG9yIGZ1bmN0aW9uIHRoYXQgc2VhcmNoZXMgZm9yIGFuZCByZXR1cm5zIGEgYFByb21pc2VgIGZvciB0aGVcbiAgICogICBmaXJzdCBlbGVtZW50IG9yIGhhcm5lc3MgbWF0Y2hpbmcgdGhlIGdpdmVuIHNlYXJjaCBjcml0ZXJpYS4gTWF0Y2hlcyBhcmUgb3JkZXJlZCBmaXJzdCBieVxuICAgKiAgIG9yZGVyIGluIHRoZSBET00sIGFuZCBzZWNvbmQgYnkgb3JkZXIgaW4gdGhlIHF1ZXJpZXMgbGlzdC4gSWYgbm8gbWF0Y2hlcyBhcmUgZm91bmQsIHRoZVxuICAgKiAgIGBQcm9taXNlYCByZWplY3RzLiBUaGUgdHlwZSB0aGF0IHRoZSBgUHJvbWlzZWAgcmVzb2x2ZXMgdG8gaXMgYSB1bmlvbiBvZiBhbGwgcmVzdWx0IHR5cGVzIGZvclxuICAgKiAgIGVhY2ggcXVlcnkuXG4gICAqXG4gICAqIGUuZy4gR2l2ZW4gdGhlIGZvbGxvd2luZyBET006IGA8ZGl2IGlkPVwiZDFcIiAvPjxkaXYgaWQ9XCJkMlwiIC8+YCwgYW5kIGFzc3VtaW5nXG4gICAqIGBEaXZIYXJuZXNzLmhvc3RTZWxlY3RvciA9PT0gJ2RpdidgOlxuICAgKiAtIGBhd2FpdCBsZi5sb2NhdG9yRm9yKERpdkhhcm5lc3MsICdkaXYnKSgpYCBnZXRzIGEgYERpdkhhcm5lc3NgIGluc3RhbmNlIGZvciBgI2QxYFxuICAgKiAtIGBhd2FpdCBsZi5sb2NhdG9yRm9yKCdkaXYnLCBEaXZIYXJuZXNzKSgpYCBnZXRzIGEgYFRlc3RFbGVtZW50YCBpbnN0YW5jZSBmb3IgYCNkMWBcbiAgICogLSBgYXdhaXQgbGYubG9jYXRvckZvcignc3BhbicpKClgIHRocm93cyBiZWNhdXNlIHRoZSBgUHJvbWlzZWAgcmVqZWN0cy5cbiAgICovXG4gIGxvY2F0b3JGb3I8VCBleHRlbmRzIChIYXJuZXNzUXVlcnk8YW55PiB8IHN0cmluZylbXT4oXG4gICAgLi4ucXVlcmllczogVFxuICApOiBBc3luY0ZhY3RvcnlGbjxMb2NhdG9yRm5SZXN1bHQ8VD4+O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGFzeW5jaHJvbm91cyBsb2NhdG9yIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmluZCBhIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZVxuICAgKiBvciBlbGVtZW50IHVuZGVyIHRoZSByb290IGVsZW1lbnQgb2YgdGhpcyBgTG9jYXRvckZhY3RvcnlgLlxuICAgKiBAcGFyYW0gcXVlcmllcyBBIGxpc3Qgb2YgcXVlcmllcyBzcGVjaWZ5aW5nIHdoaWNoIGhhcm5lc3NlcyBhbmQgZWxlbWVudHMgdG8gc2VhcmNoIGZvcjpcbiAgICogICAtIEEgYHN0cmluZ2Agc2VhcmNoZXMgZm9yIGVsZW1lbnRzIG1hdGNoaW5nIHRoZSBDU1Mgc2VsZWN0b3Igc3BlY2lmaWVkIGJ5IHRoZSBzdHJpbmcuXG4gICAqICAgLSBBIGBDb21wb25lbnRIYXJuZXNzYCBjb25zdHJ1Y3RvciBzZWFyY2hlcyBmb3IgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlcyBtYXRjaGluZyB0aGVcbiAgICogICAgIGdpdmVuIGNsYXNzLlxuICAgKiAgIC0gQSBgSGFybmVzc1ByZWRpY2F0ZWAgc2VhcmNoZXMgZm9yIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZXMgbWF0Y2hpbmcgdGhlIGdpdmVuXG4gICAqICAgICBwcmVkaWNhdGUuXG4gICAqIEByZXR1cm4gQW4gYXN5bmNocm9ub3VzIGxvY2F0b3IgZnVuY3Rpb24gdGhhdCBzZWFyY2hlcyBmb3IgYW5kIHJldHVybnMgYSBgUHJvbWlzZWAgZm9yIHRoZVxuICAgKiAgIGZpcnN0IGVsZW1lbnQgb3IgaGFybmVzcyBtYXRjaGluZyB0aGUgZ2l2ZW4gc2VhcmNoIGNyaXRlcmlhLiBNYXRjaGVzIGFyZSBvcmRlcmVkIGZpcnN0IGJ5XG4gICAqICAgb3JkZXIgaW4gdGhlIERPTSwgYW5kIHNlY29uZCBieSBvcmRlciBpbiB0aGUgcXVlcmllcyBsaXN0LiBJZiBubyBtYXRjaGVzIGFyZSBmb3VuZCwgdGhlXG4gICAqICAgYFByb21pc2VgIGlzIHJlc29sdmVkIHdpdGggYG51bGxgLiBUaGUgdHlwZSB0aGF0IHRoZSBgUHJvbWlzZWAgcmVzb2x2ZXMgdG8gaXMgYSB1bmlvbiBvZiBhbGxcbiAgICogICByZXN1bHQgdHlwZXMgZm9yIGVhY2ggcXVlcnkgb3IgbnVsbC5cbiAgICpcbiAgICogZS5nLiBHaXZlbiB0aGUgZm9sbG93aW5nIERPTTogYDxkaXYgaWQ9XCJkMVwiIC8+PGRpdiBpZD1cImQyXCIgLz5gLCBhbmQgYXNzdW1pbmdcbiAgICogYERpdkhhcm5lc3MuaG9zdFNlbGVjdG9yID09PSAnZGl2J2A6XG4gICAqIC0gYGF3YWl0IGxmLmxvY2F0b3JGb3JPcHRpb25hbChEaXZIYXJuZXNzLCAnZGl2JykoKWAgZ2V0cyBhIGBEaXZIYXJuZXNzYCBpbnN0YW5jZSBmb3IgYCNkMWBcbiAgICogLSBgYXdhaXQgbGYubG9jYXRvckZvck9wdGlvbmFsKCdkaXYnLCBEaXZIYXJuZXNzKSgpYCBnZXRzIGEgYFRlc3RFbGVtZW50YCBpbnN0YW5jZSBmb3IgYCNkMWBcbiAgICogLSBgYXdhaXQgbGYubG9jYXRvckZvck9wdGlvbmFsKCdzcGFuJykoKWAgZ2V0cyBgbnVsbGAuXG4gICAqL1xuICBsb2NhdG9yRm9yT3B0aW9uYWw8VCBleHRlbmRzIChIYXJuZXNzUXVlcnk8YW55PiB8IHN0cmluZylbXT4oXG4gICAgLi4ucXVlcmllczogVFxuICApOiBBc3luY0ZhY3RvcnlGbjxMb2NhdG9yRm5SZXN1bHQ8VD4gfCBudWxsPjtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBhc3luY2hyb25vdXMgbG9jYXRvciBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGZpbmQgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlc1xuICAgKiBvciBlbGVtZW50cyB1bmRlciB0aGUgcm9vdCBlbGVtZW50IG9mIHRoaXMgYExvY2F0b3JGYWN0b3J5YC5cbiAgICogQHBhcmFtIHF1ZXJpZXMgQSBsaXN0IG9mIHF1ZXJpZXMgc3BlY2lmeWluZyB3aGljaCBoYXJuZXNzZXMgYW5kIGVsZW1lbnRzIHRvIHNlYXJjaCBmb3I6XG4gICAqICAgLSBBIGBzdHJpbmdgIHNlYXJjaGVzIGZvciBlbGVtZW50cyBtYXRjaGluZyB0aGUgQ1NTIHNlbGVjdG9yIHNwZWNpZmllZCBieSB0aGUgc3RyaW5nLlxuICAgKiAgIC0gQSBgQ29tcG9uZW50SGFybmVzc2AgY29uc3RydWN0b3Igc2VhcmNoZXMgZm9yIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZXMgbWF0Y2hpbmcgdGhlXG4gICAqICAgICBnaXZlbiBjbGFzcy5cbiAgICogICAtIEEgYEhhcm5lc3NQcmVkaWNhdGVgIHNlYXJjaGVzIGZvciBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzIG1hdGNoaW5nIHRoZSBnaXZlblxuICAgKiAgICAgcHJlZGljYXRlLlxuICAgKiBAcmV0dXJuIEFuIGFzeW5jaHJvbm91cyBsb2NhdG9yIGZ1bmN0aW9uIHRoYXQgc2VhcmNoZXMgZm9yIGFuZCByZXR1cm5zIGEgYFByb21pc2VgIGZvciBhbGxcbiAgICogICBlbGVtZW50cyBhbmQgaGFybmVzc2VzIG1hdGNoaW5nIHRoZSBnaXZlbiBzZWFyY2ggY3JpdGVyaWEuIE1hdGNoZXMgYXJlIG9yZGVyZWQgZmlyc3QgYnlcbiAgICogICBvcmRlciBpbiB0aGUgRE9NLCBhbmQgc2Vjb25kIGJ5IG9yZGVyIGluIHRoZSBxdWVyaWVzIGxpc3QuIElmIGFuIGVsZW1lbnQgbWF0Y2hlcyBtb3JlIHRoYW5cbiAgICogICBvbmUgYENvbXBvbmVudEhhcm5lc3NgIGNsYXNzLCB0aGUgbG9jYXRvciBnZXRzIGFuIGluc3RhbmNlIG9mIGVhY2ggZm9yIHRoZSBzYW1lIGVsZW1lbnQuIElmXG4gICAqICAgYW4gZWxlbWVudCBtYXRjaGVzIG11bHRpcGxlIGBzdHJpbmdgIHNlbGVjdG9ycywgb25seSBvbmUgYFRlc3RFbGVtZW50YCBpbnN0YW5jZSBpcyByZXR1cm5lZFxuICAgKiAgIGZvciB0aGF0IGVsZW1lbnQuIFRoZSB0eXBlIHRoYXQgdGhlIGBQcm9taXNlYCByZXNvbHZlcyB0byBpcyBhbiBhcnJheSB3aGVyZSBlYWNoIGVsZW1lbnQgaXNcbiAgICogICB0aGUgdW5pb24gb2YgYWxsIHJlc3VsdCB0eXBlcyBmb3IgZWFjaCBxdWVyeS5cbiAgICpcbiAgICogZS5nLiBHaXZlbiB0aGUgZm9sbG93aW5nIERPTTogYDxkaXYgaWQ9XCJkMVwiIC8+PGRpdiBpZD1cImQyXCIgLz5gLCBhbmQgYXNzdW1pbmdcbiAgICogYERpdkhhcm5lc3MuaG9zdFNlbGVjdG9yID09PSAnZGl2J2AgYW5kIGBJZElzRDFIYXJuZXNzLmhvc3RTZWxlY3RvciA9PT0gJyNkMSdgOlxuICAgKiAtIGBhd2FpdCBsZi5sb2NhdG9yRm9yQWxsKERpdkhhcm5lc3MsICdkaXYnKSgpYCBnZXRzIGBbXG4gICAqICAgICBEaXZIYXJuZXNzLCAvLyBmb3IgI2QxXG4gICAqICAgICBUZXN0RWxlbWVudCwgLy8gZm9yICNkMVxuICAgKiAgICAgRGl2SGFybmVzcywgLy8gZm9yICNkMlxuICAgKiAgICAgVGVzdEVsZW1lbnQgLy8gZm9yICNkMlxuICAgKiAgIF1gXG4gICAqIC0gYGF3YWl0IGxmLmxvY2F0b3JGb3JBbGwoJ2RpdicsICcjZDEnKSgpYCBnZXRzIGBbXG4gICAqICAgICBUZXN0RWxlbWVudCwgLy8gZm9yICNkMVxuICAgKiAgICAgVGVzdEVsZW1lbnQgLy8gZm9yICNkMlxuICAgKiAgIF1gXG4gICAqIC0gYGF3YWl0IGxmLmxvY2F0b3JGb3JBbGwoRGl2SGFybmVzcywgSWRJc0QxSGFybmVzcykoKWAgZ2V0cyBgW1xuICAgKiAgICAgRGl2SGFybmVzcywgLy8gZm9yICNkMVxuICAgKiAgICAgSWRJc0QxSGFybmVzcywgLy8gZm9yICNkMVxuICAgKiAgICAgRGl2SGFybmVzcyAvLyBmb3IgI2QyXG4gICAqICAgXWBcbiAgICogLSBgYXdhaXQgbGYubG9jYXRvckZvckFsbCgnc3BhbicpKClgIGdldHMgYFtdYC5cbiAgICovXG4gIGxvY2F0b3JGb3JBbGw8VCBleHRlbmRzIChIYXJuZXNzUXVlcnk8YW55PiB8IHN0cmluZylbXT4oXG4gICAgLi4ucXVlcmllczogVFxuICApOiBBc3luY0ZhY3RvcnlGbjxMb2NhdG9yRm5SZXN1bHQ8VD5bXT47XG5cbiAgLyoqIEByZXR1cm4gQSBgSGFybmVzc0xvYWRlcmAgcm9vdGVkIGF0IHRoZSByb290IGVsZW1lbnQgb2YgdGhpcyBgTG9jYXRvckZhY3RvcnlgLiAqL1xuICByb290SGFybmVzc0xvYWRlcigpOiBQcm9taXNlPEhhcm5lc3NMb2FkZXI+O1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NMb2FkZXJgIGluc3RhbmNlIGZvciBhbiBlbGVtZW50IHVuZGVyIHRoZSByb290IG9mIHRoaXMgYExvY2F0b3JGYWN0b3J5YC5cbiAgICogQHBhcmFtIHNlbGVjdG9yIFRoZSBzZWxlY3RvciBmb3IgdGhlIHJvb3QgZWxlbWVudC5cbiAgICogQHJldHVybiBBIGBIYXJuZXNzTG9hZGVyYCByb290ZWQgYXQgdGhlIGZpcnN0IGVsZW1lbnQgbWF0Y2hpbmcgdGhlIGdpdmVuIHNlbGVjdG9yLlxuICAgKiBAdGhyb3dzIElmIG5vIG1hdGNoaW5nIGVsZW1lbnQgaXMgZm91bmQgZm9yIHRoZSBnaXZlbiBzZWxlY3Rvci5cbiAgICovXG4gIGhhcm5lc3NMb2FkZXJGb3Ioc2VsZWN0b3I6IHN0cmluZyk6IFByb21pc2U8SGFybmVzc0xvYWRlcj47XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc0xvYWRlcmAgaW5zdGFuY2UgZm9yIGFuIGVsZW1lbnQgdW5kZXIgdGhlIHJvb3Qgb2YgdGhpcyBgTG9jYXRvckZhY3RvcnlgXG4gICAqIEBwYXJhbSBzZWxlY3RvciBUaGUgc2VsZWN0b3IgZm9yIHRoZSByb290IGVsZW1lbnQuXG4gICAqIEByZXR1cm4gQSBgSGFybmVzc0xvYWRlcmAgcm9vdGVkIGF0IHRoZSBmaXJzdCBlbGVtZW50IG1hdGNoaW5nIHRoZSBnaXZlbiBzZWxlY3Rvciwgb3IgbnVsbCBpZlxuICAgKiAgICAgbm8gbWF0Y2hpbmcgZWxlbWVudCBpcyBmb3VuZC5cbiAgICovXG4gIGhhcm5lc3NMb2FkZXJGb3JPcHRpb25hbChzZWxlY3Rvcjogc3RyaW5nKTogUHJvbWlzZTxIYXJuZXNzTG9hZGVyIHwgbnVsbD47XG5cbiAgLyoqXG4gICAqIEdldHMgYSBsaXN0IG9mIGBIYXJuZXNzTG9hZGVyYCBpbnN0YW5jZXMsIG9uZSBmb3IgZWFjaCBtYXRjaGluZyBlbGVtZW50LlxuICAgKiBAcGFyYW0gc2VsZWN0b3IgVGhlIHNlbGVjdG9yIGZvciB0aGUgcm9vdCBlbGVtZW50LlxuICAgKiBAcmV0dXJuIEEgbGlzdCBvZiBgSGFybmVzc0xvYWRlcmAsIG9uZSByb290ZWQgYXQgZWFjaCBlbGVtZW50IG1hdGNoaW5nIHRoZSBnaXZlbiBzZWxlY3Rvci5cbiAgICovXG4gIGhhcm5lc3NMb2FkZXJGb3JBbGwoc2VsZWN0b3I6IHN0cmluZyk6IFByb21pc2U8SGFybmVzc0xvYWRlcltdPjtcblxuICAvKipcbiAgICogRmx1c2hlcyBjaGFuZ2UgZGV0ZWN0aW9uIGFuZCBhc3luYyB0YXNrcyBjYXB0dXJlZCBpbiB0aGUgQW5ndWxhciB6b25lLlxuICAgKiBJbiBtb3N0IGNhc2VzIGl0IHNob3VsZCBub3QgYmUgbmVjZXNzYXJ5IHRvIGNhbGwgdGhpcyBtYW51YWxseS4gSG93ZXZlciwgdGhlcmUgbWF5IGJlIHNvbWUgZWRnZVxuICAgKiBjYXNlcyB3aGVyZSBpdCBpcyBuZWVkZWQgdG8gZnVsbHkgZmx1c2ggYW5pbWF0aW9uIGV2ZW50cy5cbiAgICovXG4gIGZvcmNlU3RhYmlsaXplKCk6IFByb21pc2U8dm9pZD47XG5cbiAgLyoqXG4gICAqIFdhaXRzIGZvciBhbGwgc2NoZWR1bGVkIG9yIHJ1bm5pbmcgYXN5bmMgdGFza3MgdG8gY29tcGxldGUuIFRoaXMgYWxsb3dzIGhhcm5lc3NcbiAgICogYXV0aG9ycyB0byB3YWl0IGZvciBhc3luYyB0YXNrcyBvdXRzaWRlIG9mIHRoZSBBbmd1bGFyIHpvbmUuXG4gICAqL1xuICB3YWl0Rm9yVGFza3NPdXRzaWRlQW5ndWxhcigpOiBQcm9taXNlPHZvaWQ+O1xufVxuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGNvbXBvbmVudCBoYXJuZXNzZXMgdGhhdCBhbGwgY29tcG9uZW50IGhhcm5lc3MgYXV0aG9ycyBzaG91bGQgZXh0ZW5kLiBUaGlzIGJhc2VcbiAqIGNvbXBvbmVudCBoYXJuZXNzIHByb3ZpZGVzIHRoZSBiYXNpYyBhYmlsaXR5IHRvIGxvY2F0ZSBlbGVtZW50IGFuZCBzdWItY29tcG9uZW50IGhhcm5lc3MuIEl0XG4gKiBzaG91bGQgYmUgaW5oZXJpdGVkIHdoZW4gZGVmaW5pbmcgdXNlcidzIG93biBoYXJuZXNzLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcG9uZW50SGFybmVzcyB7XG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCByZWFkb25seSBsb2NhdG9yRmFjdG9yeTogTG9jYXRvckZhY3RvcnkpIHt9XG5cbiAgLyoqIEdldHMgYSBgUHJvbWlzZWAgZm9yIHRoZSBgVGVzdEVsZW1lbnRgIHJlcHJlc2VudGluZyB0aGUgaG9zdCBlbGVtZW50IG9mIHRoZSBjb21wb25lbnQuICovXG4gIGFzeW5jIGhvc3QoKTogUHJvbWlzZTxUZXN0RWxlbWVudD4ge1xuICAgIHJldHVybiB0aGlzLmxvY2F0b3JGYWN0b3J5LnJvb3RFbGVtZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgTG9jYXRvckZhY3RvcnlgIGZvciB0aGUgZG9jdW1lbnQgcm9vdCBlbGVtZW50LiBUaGlzIGZhY3RvcnkgY2FuIGJlIHVzZWQgdG8gY3JlYXRlXG4gICAqIGxvY2F0b3JzIGZvciBlbGVtZW50cyB0aGF0IGEgY29tcG9uZW50IGNyZWF0ZXMgb3V0c2lkZSBvZiBpdHMgb3duIHJvb3QgZWxlbWVudC4gKGUuZy4gYnlcbiAgICogYXBwZW5kaW5nIHRvIGRvY3VtZW50LmJvZHkpLlxuICAgKi9cbiAgcHJvdGVjdGVkIGRvY3VtZW50Um9vdExvY2F0b3JGYWN0b3J5KCk6IExvY2F0b3JGYWN0b3J5IHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRmFjdG9yeS5kb2N1bWVudFJvb3RMb2NhdG9yRmFjdG9yeSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gYXN5bmNocm9ub3VzIGxvY2F0b3IgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBmaW5kIGEgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlXG4gICAqIG9yIGVsZW1lbnQgdW5kZXIgdGhlIGhvc3QgZWxlbWVudCBvZiB0aGlzIGBDb21wb25lbnRIYXJuZXNzYC5cbiAgICogQHBhcmFtIHF1ZXJpZXMgQSBsaXN0IG9mIHF1ZXJpZXMgc3BlY2lmeWluZyB3aGljaCBoYXJuZXNzZXMgYW5kIGVsZW1lbnRzIHRvIHNlYXJjaCBmb3I6XG4gICAqICAgLSBBIGBzdHJpbmdgIHNlYXJjaGVzIGZvciBlbGVtZW50cyBtYXRjaGluZyB0aGUgQ1NTIHNlbGVjdG9yIHNwZWNpZmllZCBieSB0aGUgc3RyaW5nLlxuICAgKiAgIC0gQSBgQ29tcG9uZW50SGFybmVzc2AgY29uc3RydWN0b3Igc2VhcmNoZXMgZm9yIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZXMgbWF0Y2hpbmcgdGhlXG4gICAqICAgICBnaXZlbiBjbGFzcy5cbiAgICogICAtIEEgYEhhcm5lc3NQcmVkaWNhdGVgIHNlYXJjaGVzIGZvciBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzIG1hdGNoaW5nIHRoZSBnaXZlblxuICAgKiAgICAgcHJlZGljYXRlLlxuICAgKiBAcmV0dXJuIEFuIGFzeW5jaHJvbm91cyBsb2NhdG9yIGZ1bmN0aW9uIHRoYXQgc2VhcmNoZXMgZm9yIGFuZCByZXR1cm5zIGEgYFByb21pc2VgIGZvciB0aGVcbiAgICogICBmaXJzdCBlbGVtZW50IG9yIGhhcm5lc3MgbWF0Y2hpbmcgdGhlIGdpdmVuIHNlYXJjaCBjcml0ZXJpYS4gTWF0Y2hlcyBhcmUgb3JkZXJlZCBmaXJzdCBieVxuICAgKiAgIG9yZGVyIGluIHRoZSBET00sIGFuZCBzZWNvbmQgYnkgb3JkZXIgaW4gdGhlIHF1ZXJpZXMgbGlzdC4gSWYgbm8gbWF0Y2hlcyBhcmUgZm91bmQsIHRoZVxuICAgKiAgIGBQcm9taXNlYCByZWplY3RzLiBUaGUgdHlwZSB0aGF0IHRoZSBgUHJvbWlzZWAgcmVzb2x2ZXMgdG8gaXMgYSB1bmlvbiBvZiBhbGwgcmVzdWx0IHR5cGVzIGZvclxuICAgKiAgIGVhY2ggcXVlcnkuXG4gICAqXG4gICAqIGUuZy4gR2l2ZW4gdGhlIGZvbGxvd2luZyBET006IGA8ZGl2IGlkPVwiZDFcIiAvPjxkaXYgaWQ9XCJkMlwiIC8+YCwgYW5kIGFzc3VtaW5nXG4gICAqIGBEaXZIYXJuZXNzLmhvc3RTZWxlY3RvciA9PT0gJ2RpdidgOlxuICAgKiAtIGBhd2FpdCBjaC5sb2NhdG9yRm9yKERpdkhhcm5lc3MsICdkaXYnKSgpYCBnZXRzIGEgYERpdkhhcm5lc3NgIGluc3RhbmNlIGZvciBgI2QxYFxuICAgKiAtIGBhd2FpdCBjaC5sb2NhdG9yRm9yKCdkaXYnLCBEaXZIYXJuZXNzKSgpYCBnZXRzIGEgYFRlc3RFbGVtZW50YCBpbnN0YW5jZSBmb3IgYCNkMWBcbiAgICogLSBgYXdhaXQgY2gubG9jYXRvckZvcignc3BhbicpKClgIHRocm93cyBiZWNhdXNlIHRoZSBgUHJvbWlzZWAgcmVqZWN0cy5cbiAgICovXG4gIHByb3RlY3RlZCBsb2NhdG9yRm9yPFQgZXh0ZW5kcyAoSGFybmVzc1F1ZXJ5PGFueT4gfCBzdHJpbmcpW10+KFxuICAgIC4uLnF1ZXJpZXM6IFRcbiAgKTogQXN5bmNGYWN0b3J5Rm48TG9jYXRvckZuUmVzdWx0PFQ+PiB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZhY3RvcnkubG9jYXRvckZvciguLi5xdWVyaWVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGFzeW5jaHJvbm91cyBsb2NhdG9yIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmluZCBhIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZVxuICAgKiBvciBlbGVtZW50IHVuZGVyIHRoZSBob3N0IGVsZW1lbnQgb2YgdGhpcyBgQ29tcG9uZW50SGFybmVzc2AuXG4gICAqIEBwYXJhbSBxdWVyaWVzIEEgbGlzdCBvZiBxdWVyaWVzIHNwZWNpZnlpbmcgd2hpY2ggaGFybmVzc2VzIGFuZCBlbGVtZW50cyB0byBzZWFyY2ggZm9yOlxuICAgKiAgIC0gQSBgc3RyaW5nYCBzZWFyY2hlcyBmb3IgZWxlbWVudHMgbWF0Y2hpbmcgdGhlIENTUyBzZWxlY3RvciBzcGVjaWZpZWQgYnkgdGhlIHN0cmluZy5cbiAgICogICAtIEEgYENvbXBvbmVudEhhcm5lc3NgIGNvbnN0cnVjdG9yIHNlYXJjaGVzIGZvciBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzIG1hdGNoaW5nIHRoZVxuICAgKiAgICAgZ2l2ZW4gY2xhc3MuXG4gICAqICAgLSBBIGBIYXJuZXNzUHJlZGljYXRlYCBzZWFyY2hlcyBmb3IgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlcyBtYXRjaGluZyB0aGUgZ2l2ZW5cbiAgICogICAgIHByZWRpY2F0ZS5cbiAgICogQHJldHVybiBBbiBhc3luY2hyb25vdXMgbG9jYXRvciBmdW5jdGlvbiB0aGF0IHNlYXJjaGVzIGZvciBhbmQgcmV0dXJucyBhIGBQcm9taXNlYCBmb3IgdGhlXG4gICAqICAgZmlyc3QgZWxlbWVudCBvciBoYXJuZXNzIG1hdGNoaW5nIHRoZSBnaXZlbiBzZWFyY2ggY3JpdGVyaWEuIE1hdGNoZXMgYXJlIG9yZGVyZWQgZmlyc3QgYnlcbiAgICogICBvcmRlciBpbiB0aGUgRE9NLCBhbmQgc2Vjb25kIGJ5IG9yZGVyIGluIHRoZSBxdWVyaWVzIGxpc3QuIElmIG5vIG1hdGNoZXMgYXJlIGZvdW5kLCB0aGVcbiAgICogICBgUHJvbWlzZWAgaXMgcmVzb2x2ZWQgd2l0aCBgbnVsbGAuIFRoZSB0eXBlIHRoYXQgdGhlIGBQcm9taXNlYCByZXNvbHZlcyB0byBpcyBhIHVuaW9uIG9mIGFsbFxuICAgKiAgIHJlc3VsdCB0eXBlcyBmb3IgZWFjaCBxdWVyeSBvciBudWxsLlxuICAgKlxuICAgKiBlLmcuIEdpdmVuIHRoZSBmb2xsb3dpbmcgRE9NOiBgPGRpdiBpZD1cImQxXCIgLz48ZGl2IGlkPVwiZDJcIiAvPmAsIGFuZCBhc3N1bWluZ1xuICAgKiBgRGl2SGFybmVzcy5ob3N0U2VsZWN0b3IgPT09ICdkaXYnYDpcbiAgICogLSBgYXdhaXQgY2gubG9jYXRvckZvck9wdGlvbmFsKERpdkhhcm5lc3MsICdkaXYnKSgpYCBnZXRzIGEgYERpdkhhcm5lc3NgIGluc3RhbmNlIGZvciBgI2QxYFxuICAgKiAtIGBhd2FpdCBjaC5sb2NhdG9yRm9yT3B0aW9uYWwoJ2RpdicsIERpdkhhcm5lc3MpKClgIGdldHMgYSBgVGVzdEVsZW1lbnRgIGluc3RhbmNlIGZvciBgI2QxYFxuICAgKiAtIGBhd2FpdCBjaC5sb2NhdG9yRm9yT3B0aW9uYWwoJ3NwYW4nKSgpYCBnZXRzIGBudWxsYC5cbiAgICovXG4gIHByb3RlY3RlZCBsb2NhdG9yRm9yT3B0aW9uYWw8VCBleHRlbmRzIChIYXJuZXNzUXVlcnk8YW55PiB8IHN0cmluZylbXT4oXG4gICAgLi4ucXVlcmllczogVFxuICApOiBBc3luY0ZhY3RvcnlGbjxMb2NhdG9yRm5SZXN1bHQ8VD4gfCBudWxsPiB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZhY3RvcnkubG9jYXRvckZvck9wdGlvbmFsKC4uLnF1ZXJpZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gYXN5bmNocm9ub3VzIGxvY2F0b3IgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBmaW5kIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZXNcbiAgICogb3IgZWxlbWVudHMgdW5kZXIgdGhlIGhvc3QgZWxlbWVudCBvZiB0aGlzIGBDb21wb25lbnRIYXJuZXNzYC5cbiAgICogQHBhcmFtIHF1ZXJpZXMgQSBsaXN0IG9mIHF1ZXJpZXMgc3BlY2lmeWluZyB3aGljaCBoYXJuZXNzZXMgYW5kIGVsZW1lbnRzIHRvIHNlYXJjaCBmb3I6XG4gICAqICAgLSBBIGBzdHJpbmdgIHNlYXJjaGVzIGZvciBlbGVtZW50cyBtYXRjaGluZyB0aGUgQ1NTIHNlbGVjdG9yIHNwZWNpZmllZCBieSB0aGUgc3RyaW5nLlxuICAgKiAgIC0gQSBgQ29tcG9uZW50SGFybmVzc2AgY29uc3RydWN0b3Igc2VhcmNoZXMgZm9yIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZXMgbWF0Y2hpbmcgdGhlXG4gICAqICAgICBnaXZlbiBjbGFzcy5cbiAgICogICAtIEEgYEhhcm5lc3NQcmVkaWNhdGVgIHNlYXJjaGVzIGZvciBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzIG1hdGNoaW5nIHRoZSBnaXZlblxuICAgKiAgICAgcHJlZGljYXRlLlxuICAgKiBAcmV0dXJuIEFuIGFzeW5jaHJvbm91cyBsb2NhdG9yIGZ1bmN0aW9uIHRoYXQgc2VhcmNoZXMgZm9yIGFuZCByZXR1cm5zIGEgYFByb21pc2VgIGZvciBhbGxcbiAgICogICBlbGVtZW50cyBhbmQgaGFybmVzc2VzIG1hdGNoaW5nIHRoZSBnaXZlbiBzZWFyY2ggY3JpdGVyaWEuIE1hdGNoZXMgYXJlIG9yZGVyZWQgZmlyc3QgYnlcbiAgICogICBvcmRlciBpbiB0aGUgRE9NLCBhbmQgc2Vjb25kIGJ5IG9yZGVyIGluIHRoZSBxdWVyaWVzIGxpc3QuIElmIGFuIGVsZW1lbnQgbWF0Y2hlcyBtb3JlIHRoYW5cbiAgICogICBvbmUgYENvbXBvbmVudEhhcm5lc3NgIGNsYXNzLCB0aGUgbG9jYXRvciBnZXRzIGFuIGluc3RhbmNlIG9mIGVhY2ggZm9yIHRoZSBzYW1lIGVsZW1lbnQuIElmXG4gICAqICAgYW4gZWxlbWVudCBtYXRjaGVzIG11bHRpcGxlIGBzdHJpbmdgIHNlbGVjdG9ycywgb25seSBvbmUgYFRlc3RFbGVtZW50YCBpbnN0YW5jZSBpcyByZXR1cm5lZFxuICAgKiAgIGZvciB0aGF0IGVsZW1lbnQuIFRoZSB0eXBlIHRoYXQgdGhlIGBQcm9taXNlYCByZXNvbHZlcyB0byBpcyBhbiBhcnJheSB3aGVyZSBlYWNoIGVsZW1lbnQgaXNcbiAgICogICB0aGUgdW5pb24gb2YgYWxsIHJlc3VsdCB0eXBlcyBmb3IgZWFjaCBxdWVyeS5cbiAgICpcbiAgICogZS5nLiBHaXZlbiB0aGUgZm9sbG93aW5nIERPTTogYDxkaXYgaWQ9XCJkMVwiIC8+PGRpdiBpZD1cImQyXCIgLz5gLCBhbmQgYXNzdW1pbmdcbiAgICogYERpdkhhcm5lc3MuaG9zdFNlbGVjdG9yID09PSAnZGl2J2AgYW5kIGBJZElzRDFIYXJuZXNzLmhvc3RTZWxlY3RvciA9PT0gJyNkMSdgOlxuICAgKiAtIGBhd2FpdCBjaC5sb2NhdG9yRm9yQWxsKERpdkhhcm5lc3MsICdkaXYnKSgpYCBnZXRzIGBbXG4gICAqICAgICBEaXZIYXJuZXNzLCAvLyBmb3IgI2QxXG4gICAqICAgICBUZXN0RWxlbWVudCwgLy8gZm9yICNkMVxuICAgKiAgICAgRGl2SGFybmVzcywgLy8gZm9yICNkMlxuICAgKiAgICAgVGVzdEVsZW1lbnQgLy8gZm9yICNkMlxuICAgKiAgIF1gXG4gICAqIC0gYGF3YWl0IGNoLmxvY2F0b3JGb3JBbGwoJ2RpdicsICcjZDEnKSgpYCBnZXRzIGBbXG4gICAqICAgICBUZXN0RWxlbWVudCwgLy8gZm9yICNkMVxuICAgKiAgICAgVGVzdEVsZW1lbnQgLy8gZm9yICNkMlxuICAgKiAgIF1gXG4gICAqIC0gYGF3YWl0IGNoLmxvY2F0b3JGb3JBbGwoRGl2SGFybmVzcywgSWRJc0QxSGFybmVzcykoKWAgZ2V0cyBgW1xuICAgKiAgICAgRGl2SGFybmVzcywgLy8gZm9yICNkMVxuICAgKiAgICAgSWRJc0QxSGFybmVzcywgLy8gZm9yICNkMVxuICAgKiAgICAgRGl2SGFybmVzcyAvLyBmb3IgI2QyXG4gICAqICAgXWBcbiAgICogLSBgYXdhaXQgY2gubG9jYXRvckZvckFsbCgnc3BhbicpKClgIGdldHMgYFtdYC5cbiAgICovXG4gIHByb3RlY3RlZCBsb2NhdG9yRm9yQWxsPFQgZXh0ZW5kcyAoSGFybmVzc1F1ZXJ5PGFueT4gfCBzdHJpbmcpW10+KFxuICAgIC4uLnF1ZXJpZXM6IFRcbiAgKTogQXN5bmNGYWN0b3J5Rm48TG9jYXRvckZuUmVzdWx0PFQ+W10+IHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRmFjdG9yeS5sb2NhdG9yRm9yQWxsKC4uLnF1ZXJpZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZsdXNoZXMgY2hhbmdlIGRldGVjdGlvbiBhbmQgYXN5bmMgdGFza3MgaW4gdGhlIEFuZ3VsYXIgem9uZS5cbiAgICogSW4gbW9zdCBjYXNlcyBpdCBzaG91bGQgbm90IGJlIG5lY2Vzc2FyeSB0byBjYWxsIHRoaXMgbWFudWFsbHkuIEhvd2V2ZXIsIHRoZXJlIG1heSBiZSBzb21lIGVkZ2VcbiAgICogY2FzZXMgd2hlcmUgaXQgaXMgbmVlZGVkIHRvIGZ1bGx5IGZsdXNoIGFuaW1hdGlvbiBldmVudHMuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgZm9yY2VTdGFiaWxpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZhY3RvcnkuZm9yY2VTdGFiaWxpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXYWl0cyBmb3IgYWxsIHNjaGVkdWxlZCBvciBydW5uaW5nIGFzeW5jIHRhc2tzIHRvIGNvbXBsZXRlLiBUaGlzIGFsbG93cyBoYXJuZXNzXG4gICAqIGF1dGhvcnMgdG8gd2FpdCBmb3IgYXN5bmMgdGFza3Mgb3V0c2lkZSBvZiB0aGUgQW5ndWxhciB6b25lLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHdhaXRGb3JUYXNrc091dHNpZGVBbmd1bGFyKCkge1xuICAgIHJldHVybiB0aGlzLmxvY2F0b3JGYWN0b3J5LndhaXRGb3JUYXNrc091dHNpZGVBbmd1bGFyKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBjb21wb25lbnQgaGFybmVzc2VzIHRoYXQgYXV0aG9ycyBzaG91bGQgZXh0ZW5kIGlmIHRoZXkgYW50aWNpcGF0ZSB0aGF0IGNvbnN1bWVyc1xuICogb2YgdGhlIGhhcm5lc3MgbWF5IHdhbnQgdG8gYWNjZXNzIG90aGVyIGhhcm5lc3NlcyB3aXRoaW4gdGhlIGA8bmctY29udGVudD5gIG9mIHRoZSBjb21wb25lbnQuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb250ZW50Q29udGFpbmVyQ29tcG9uZW50SGFybmVzczxTIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPlxuICBleHRlbmRzIENvbXBvbmVudEhhcm5lc3NcbiAgaW1wbGVtZW50cyBIYXJuZXNzTG9hZGVyXG57XG4gIGFzeW5jIGdldENoaWxkTG9hZGVyKHNlbGVjdG9yOiBTKTogUHJvbWlzZTxIYXJuZXNzTG9hZGVyPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmdldFJvb3RIYXJuZXNzTG9hZGVyKCkpLmdldENoaWxkTG9hZGVyKHNlbGVjdG9yKTtcbiAgfVxuXG4gIGFzeW5jIGdldEFsbENoaWxkTG9hZGVycyhzZWxlY3RvcjogUyk6IFByb21pc2U8SGFybmVzc0xvYWRlcltdPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmdldFJvb3RIYXJuZXNzTG9hZGVyKCkpLmdldEFsbENoaWxkTG9hZGVycyhzZWxlY3Rvcik7XG4gIH1cblxuICBhc3luYyBnZXRIYXJuZXNzPFQgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzPihxdWVyeTogSGFybmVzc1F1ZXJ5PFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmdldFJvb3RIYXJuZXNzTG9hZGVyKCkpLmdldEhhcm5lc3MocXVlcnkpO1xuICB9XG5cbiAgYXN5bmMgZ2V0SGFybmVzc09yTnVsbDxUIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcz4ocXVlcnk6IEhhcm5lc3NRdWVyeTxUPik6IFByb21pc2U8VCB8IG51bGw+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuZ2V0Um9vdEhhcm5lc3NMb2FkZXIoKSkuZ2V0SGFybmVzc09yTnVsbChxdWVyeSk7XG4gIH1cblxuICBhc3luYyBnZXRBbGxIYXJuZXNzZXM8VCBleHRlbmRzIENvbXBvbmVudEhhcm5lc3M+KHF1ZXJ5OiBIYXJuZXNzUXVlcnk8VD4pOiBQcm9taXNlPFRbXT4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5nZXRSb290SGFybmVzc0xvYWRlcigpKS5nZXRBbGxIYXJuZXNzZXMocXVlcnkpO1xuICB9XG5cbiAgYXN5bmMgaGFzSGFybmVzczxUIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcz4ocXVlcnk6IEhhcm5lc3NRdWVyeTxUPik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5nZXRSb290SGFybmVzc0xvYWRlcigpKS5oYXNIYXJuZXNzKHF1ZXJ5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSByb290IGhhcm5lc3MgbG9hZGVyIGZyb20gd2hpY2ggdG8gc3RhcnRcbiAgICogc2VhcmNoaW5nIGZvciBjb250ZW50IGNvbnRhaW5lZCBieSB0aGlzIGhhcm5lc3MuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgZ2V0Um9vdEhhcm5lc3NMb2FkZXIoKTogUHJvbWlzZTxIYXJuZXNzTG9hZGVyPiB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZhY3Rvcnkucm9vdEhhcm5lc3NMb2FkZXIoKTtcbiAgfVxufVxuXG4vKiogQ29uc3RydWN0b3IgZm9yIGEgQ29tcG9uZW50SGFybmVzcyBzdWJjbGFzcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yPFQgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzPiB7XG4gIG5ldyAobG9jYXRvckZhY3Rvcnk6IExvY2F0b3JGYWN0b3J5KTogVDtcblxuICAvKipcbiAgICogYENvbXBvbmVudEhhcm5lc3NgIHN1YmNsYXNzZXMgbXVzdCBzcGVjaWZ5IGEgc3RhdGljIGBob3N0U2VsZWN0b3JgIHByb3BlcnR5IHRoYXQgaXMgdXNlZCB0b1xuICAgKiBmaW5kIHRoZSBob3N0IGVsZW1lbnQgZm9yIHRoZSBjb3JyZXNwb25kaW5nIGNvbXBvbmVudC4gVGhpcyBwcm9wZXJ0eSBzaG91bGQgbWF0Y2ggdGhlIHNlbGVjdG9yXG4gICAqIGZvciB0aGUgQW5ndWxhciBjb21wb25lbnQuXG4gICAqL1xuICBob3N0U2VsZWN0b3I6IHN0cmluZztcbn1cblxuLyoqIEEgc2V0IG9mIGNyaXRlcmlhIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmlsdGVyIGEgbGlzdCBvZiBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBCYXNlSGFybmVzc0ZpbHRlcnMge1xuICAvKiogT25seSBmaW5kIGluc3RhbmNlcyB3aG9zZSBob3N0IGVsZW1lbnQgbWF0Y2hlcyB0aGUgZ2l2ZW4gc2VsZWN0b3IuICovXG4gIHNlbGVjdG9yPzogc3RyaW5nO1xuICAvKiogT25seSBmaW5kIGluc3RhbmNlcyB0aGF0IGFyZSBuZXN0ZWQgdW5kZXIgYW4gZWxlbWVudCB3aXRoIHRoZSBnaXZlbiBzZWxlY3Rvci4gKi9cbiAgYW5jZXN0b3I/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQSBjbGFzcyB1c2VkIHRvIGFzc29jaWF0ZSBhIENvbXBvbmVudEhhcm5lc3MgY2xhc3Mgd2l0aCBwcmVkaWNhdGVzIGZ1bmN0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIHRvXG4gKiBmaWx0ZXIgaW5zdGFuY2VzIG9mIHRoZSBjbGFzcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEhhcm5lc3NQcmVkaWNhdGU8VCBleHRlbmRzIENvbXBvbmVudEhhcm5lc3M+IHtcbiAgcHJpdmF0ZSBfcHJlZGljYXRlczogQXN5bmNQcmVkaWNhdGU8VD5bXSA9IFtdO1xuICBwcml2YXRlIF9kZXNjcmlwdGlvbnM6IHN0cmluZ1tdID0gW107XG4gIHByaXZhdGUgX2FuY2VzdG9yOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGhhcm5lc3NUeXBlOiBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3I8VD4sIG9wdGlvbnM6IEJhc2VIYXJuZXNzRmlsdGVycykge1xuICAgIHRoaXMuX2FkZEJhc2VPcHRpb25zKG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgc3BlY2lmaWVkIG51bGxhYmxlIHN0cmluZyB2YWx1ZSBtYXRjaGVzIHRoZSBnaXZlbiBwYXR0ZXJuLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIG51bGxhYmxlIHN0cmluZyB2YWx1ZSB0byBjaGVjaywgb3IgYSBQcm9taXNlIHJlc29sdmluZyB0byB0aGVcbiAgICogICBudWxsYWJsZSBzdHJpbmcgdmFsdWUuXG4gICAqIEBwYXJhbSBwYXR0ZXJuIFRoZSBwYXR0ZXJuIHRoZSB2YWx1ZSBpcyBleHBlY3RlZCB0byBtYXRjaC4gSWYgYHBhdHRlcm5gIGlzIGEgc3RyaW5nLFxuICAgKiAgIGB2YWx1ZWAgaXMgZXhwZWN0ZWQgdG8gbWF0Y2ggZXhhY3RseS4gSWYgYHBhdHRlcm5gIGlzIGEgcmVnZXgsIGEgcGFydGlhbCBtYXRjaCBpc1xuICAgKiAgIGFsbG93ZWQuIElmIGBwYXR0ZXJuYCBpcyBgbnVsbGAsIHRoZSB2YWx1ZSBpcyBleHBlY3RlZCB0byBiZSBgbnVsbGAuXG4gICAqIEByZXR1cm4gV2hldGhlciB0aGUgdmFsdWUgbWF0Y2hlcyB0aGUgcGF0dGVybi5cbiAgICovXG4gIHN0YXRpYyBhc3luYyBzdHJpbmdNYXRjaGVzKFxuICAgIHZhbHVlOiBzdHJpbmcgfCBudWxsIHwgUHJvbWlzZTxzdHJpbmcgfCBudWxsPixcbiAgICBwYXR0ZXJuOiBzdHJpbmcgfCBSZWdFeHAgfCBudWxsLFxuICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB2YWx1ZSA9IGF3YWl0IHZhbHVlO1xuICAgIGlmIChwYXR0ZXJuID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IG51bGw7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHlwZW9mIHBhdHRlcm4gPT09ICdzdHJpbmcnID8gdmFsdWUgPT09IHBhdHRlcm4gOiBwYXR0ZXJuLnRlc3QodmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBwcmVkaWNhdGUgZnVuY3Rpb24gdG8gYmUgcnVuIGFnYWluc3QgY2FuZGlkYXRlIGhhcm5lc3Nlcy5cbiAgICogQHBhcmFtIGRlc2NyaXB0aW9uIEEgZGVzY3JpcHRpb24gb2YgdGhpcyBwcmVkaWNhdGUgdGhhdCBtYXkgYmUgdXNlZCBpbiBlcnJvciBtZXNzYWdlcy5cbiAgICogQHBhcmFtIHByZWRpY2F0ZSBBbiBhc3luYyBwcmVkaWNhdGUgZnVuY3Rpb24uXG4gICAqIEByZXR1cm4gdGhpcyAoZm9yIG1ldGhvZCBjaGFpbmluZykuXG4gICAqL1xuICBhZGQoZGVzY3JpcHRpb246IHN0cmluZywgcHJlZGljYXRlOiBBc3luY1ByZWRpY2F0ZTxUPikge1xuICAgIHRoaXMuX2Rlc2NyaXB0aW9ucy5wdXNoKGRlc2NyaXB0aW9uKTtcbiAgICB0aGlzLl9wcmVkaWNhdGVzLnB1c2gocHJlZGljYXRlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgcHJlZGljYXRlIGZ1bmN0aW9uIHRoYXQgZGVwZW5kcyBvbiBhbiBvcHRpb24gdmFsdWUgdG8gYmUgcnVuIGFnYWluc3QgY2FuZGlkYXRlXG4gICAqIGhhcm5lc3Nlcy4gSWYgdGhlIG9wdGlvbiB2YWx1ZSBpcyB1bmRlZmluZWQsIHRoZSBwcmVkaWNhdGUgd2lsbCBiZSBpZ25vcmVkLlxuICAgKiBAcGFyYW0gbmFtZSBUaGUgbmFtZSBvZiB0aGUgb3B0aW9uIChtYXkgYmUgdXNlZCBpbiBlcnJvciBtZXNzYWdlcykuXG4gICAqIEBwYXJhbSBvcHRpb24gVGhlIG9wdGlvbiB2YWx1ZS5cbiAgICogQHBhcmFtIHByZWRpY2F0ZSBUaGUgcHJlZGljYXRlIGZ1bmN0aW9uIHRvIHJ1biBpZiB0aGUgb3B0aW9uIHZhbHVlIGlzIG5vdCB1bmRlZmluZWQuXG4gICAqIEByZXR1cm4gdGhpcyAoZm9yIG1ldGhvZCBjaGFpbmluZykuXG4gICAqL1xuICBhZGRPcHRpb248Tz4obmFtZTogc3RyaW5nLCBvcHRpb246IE8gfCB1bmRlZmluZWQsIHByZWRpY2F0ZTogQXN5bmNPcHRpb25QcmVkaWNhdGU8VCwgTz4pIHtcbiAgICBpZiAob3B0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuYWRkKGAke25hbWV9ID0gJHtfdmFsdWVBc1N0cmluZyhvcHRpb24pfWAsIGl0ZW0gPT4gcHJlZGljYXRlKGl0ZW0sIG9wdGlvbikpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBGaWx0ZXJzIGEgbGlzdCBvZiBoYXJuZXNzZXMgb24gdGhpcyBwcmVkaWNhdGUuXG4gICAqIEBwYXJhbSBoYXJuZXNzZXMgVGhlIGxpc3Qgb2YgaGFybmVzc2VzIHRvIGZpbHRlci5cbiAgICogQHJldHVybiBBIGxpc3Qgb2YgaGFybmVzc2VzIHRoYXQgc2F0aXNmeSB0aGlzIHByZWRpY2F0ZS5cbiAgICovXG4gIGFzeW5jIGZpbHRlcihoYXJuZXNzZXM6IFRbXSk6IFByb21pc2U8VFtdPiB7XG4gICAgaWYgKGhhcm5lc3Nlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHBhcmFsbGVsKCgpID0+IGhhcm5lc3Nlcy5tYXAoaCA9PiB0aGlzLmV2YWx1YXRlKGgpKSk7XG4gICAgcmV0dXJuIGhhcm5lc3Nlcy5maWx0ZXIoKF8sIGkpID0+IHJlc3VsdHNbaV0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2YWx1YXRlcyB3aGV0aGVyIHRoZSBnaXZlbiBoYXJuZXNzIHNhdGlzZmllcyB0aGlzIHByZWRpY2F0ZS5cbiAgICogQHBhcmFtIGhhcm5lc3MgVGhlIGhhcm5lc3MgdG8gY2hlY2tcbiAgICogQHJldHVybiBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0cnVlIGlmIHRoZSBoYXJuZXNzIHNhdGlzZmllcyB0aGlzIHByZWRpY2F0ZSxcbiAgICogICBhbmQgcmVzb2x2ZXMgdG8gZmFsc2Ugb3RoZXJ3aXNlLlxuICAgKi9cbiAgYXN5bmMgZXZhbHVhdGUoaGFybmVzczogVCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBwYXJhbGxlbCgoKSA9PiB0aGlzLl9wcmVkaWNhdGVzLm1hcChwID0+IHAoaGFybmVzcykpKTtcbiAgICByZXR1cm4gcmVzdWx0cy5yZWR1Y2UoKGNvbWJpbmVkLCBjdXJyZW50KSA9PiBjb21iaW5lZCAmJiBjdXJyZW50LCB0cnVlKTtcbiAgfVxuXG4gIC8qKiBHZXRzIGEgZGVzY3JpcHRpb24gb2YgdGhpcyBwcmVkaWNhdGUgZm9yIHVzZSBpbiBlcnJvciBtZXNzYWdlcy4gKi9cbiAgZ2V0RGVzY3JpcHRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Rlc2NyaXB0aW9ucy5qb2luKCcsICcpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHNlbGVjdG9yIHVzZWQgdG8gZmluZCBjYW5kaWRhdGUgZWxlbWVudHMuICovXG4gIGdldFNlbGVjdG9yKCkge1xuICAgIC8vIFdlIGRvbid0IGhhdmUgdG8gZ28gdGhyb3VnaCB0aGUgZXh0cmEgdHJvdWJsZSBpZiB0aGVyZSBhcmUgbm8gYW5jZXN0b3JzLlxuICAgIGlmICghdGhpcy5fYW5jZXN0b3IpIHtcbiAgICAgIHJldHVybiAodGhpcy5oYXJuZXNzVHlwZS5ob3N0U2VsZWN0b3IgfHwgJycpLnRyaW0oKTtcbiAgICB9XG5cbiAgICBjb25zdCBbYW5jZXN0b3JzLCBhbmNlc3RvclBsYWNlaG9sZGVyc10gPSBfc3BsaXRBbmRFc2NhcGVTZWxlY3Rvcih0aGlzLl9hbmNlc3Rvcik7XG4gICAgY29uc3QgW3NlbGVjdG9ycywgc2VsZWN0b3JQbGFjZWhvbGRlcnNdID0gX3NwbGl0QW5kRXNjYXBlU2VsZWN0b3IoXG4gICAgICB0aGlzLmhhcm5lc3NUeXBlLmhvc3RTZWxlY3RvciB8fCAnJyxcbiAgICApO1xuICAgIGNvbnN0IHJlc3VsdDogc3RyaW5nW10gPSBbXTtcblxuICAgIC8vIFdlIGhhdmUgdG8gYWRkIHRoZSBhbmNlc3RvciB0byBlYWNoIHBhcnQgb2YgdGhlIGhvc3QgY29tcG91bmQgc2VsZWN0b3IsIG90aGVyd2lzZSB3ZSBjYW4gZ2V0XG4gICAgLy8gaW5jb3JyZWN0IHJlc3VsdHMuIEUuZy4gYC5hbmNlc3RvciAuYSwgLmFuY2VzdG9yIC5iYCB2cyBgLmFuY2VzdG9yIC5hLCAuYmAuXG4gICAgYW5jZXN0b3JzLmZvckVhY2goZXNjYXBlZEFuY2VzdG9yID0+IHtcbiAgICAgIGNvbnN0IGFuY2VzdG9yID0gX3Jlc3RvcmVTZWxlY3Rvcihlc2NhcGVkQW5jZXN0b3IsIGFuY2VzdG9yUGxhY2Vob2xkZXJzKTtcbiAgICAgIHJldHVybiBzZWxlY3RvcnMuZm9yRWFjaChlc2NhcGVkU2VsZWN0b3IgPT5cbiAgICAgICAgcmVzdWx0LnB1c2goYCR7YW5jZXN0b3J9ICR7X3Jlc3RvcmVTZWxlY3Rvcihlc2NhcGVkU2VsZWN0b3IsIHNlbGVjdG9yUGxhY2Vob2xkZXJzKX1gKSxcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0LmpvaW4oJywgJyk7XG4gIH1cblxuICAvKiogQWRkcyBiYXNlIG9wdGlvbnMgY29tbW9uIHRvIGFsbCBoYXJuZXNzIHR5cGVzLiAqL1xuICBwcml2YXRlIF9hZGRCYXNlT3B0aW9ucyhvcHRpb25zOiBCYXNlSGFybmVzc0ZpbHRlcnMpIHtcbiAgICB0aGlzLl9hbmNlc3RvciA9IG9wdGlvbnMuYW5jZXN0b3IgfHwgJyc7XG4gICAgaWYgKHRoaXMuX2FuY2VzdG9yKSB7XG4gICAgICB0aGlzLl9kZXNjcmlwdGlvbnMucHVzaChgaGFzIGFuY2VzdG9yIG1hdGNoaW5nIHNlbGVjdG9yIFwiJHt0aGlzLl9hbmNlc3Rvcn1cImApO1xuICAgIH1cbiAgICBjb25zdCBzZWxlY3RvciA9IG9wdGlvbnMuc2VsZWN0b3I7XG4gICAgaWYgKHNlbGVjdG9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuYWRkKGBob3N0IG1hdGNoZXMgc2VsZWN0b3IgXCIke3NlbGVjdG9yfVwiYCwgYXN5bmMgaXRlbSA9PiB7XG4gICAgICAgIHJldHVybiAoYXdhaXQgaXRlbS5ob3N0KCkpLm1hdGNoZXNTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqIFJlcHJlc2VudCBhIHZhbHVlIGFzIGEgc3RyaW5nIGZvciB0aGUgcHVycG9zZSBvZiBsb2dnaW5nLiAqL1xuZnVuY3Rpb24gX3ZhbHVlQXNTdHJpbmcodmFsdWU6IHVua25vd24pIHtcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gJ3VuZGVmaW5lZCc7XG4gIH1cbiAgdHJ5IHtcbiAgICAvLyBgSlNPTi5zdHJpbmdpZnlgIGRvZXNuJ3QgaGFuZGxlIFJlZ0V4cCBwcm9wZXJseSwgc28gd2UgbmVlZCBhIGN1c3RvbSByZXBsYWNlci5cbiAgICAvLyBVc2UgYSBjaGFyYWN0ZXIgdGhhdCBpcyB1bmxpa2VseSB0byBhcHBlYXIgaW4gcmVhbCBzdHJpbmdzIHRvIGRlbm90ZSB0aGUgc3RhcnQgYW5kIGVuZCBvZlxuICAgIC8vIHRoZSByZWdleC4gVGhpcyBhbGxvd3MgdXMgdG8gc3RyaXAgb3V0IHRoZSBleHRyYSBxdW90ZXMgYXJvdW5kIHRoZSB2YWx1ZSBhZGRlZCBieVxuICAgIC8vIGBKU09OLnN0cmluZ2lmeWAuIEFsc28gZG8gY3VzdG9tIGVzY2FwaW5nIG9uIGBcImAgY2hhcmFjdGVycyB0byBwcmV2ZW50IGBKU09OLnN0cmluZ2lmeWBcbiAgICAvLyBmcm9tIGVzY2FwaW5nIHRoZW0gYXMgaWYgdGhleSB3ZXJlIHBhcnQgb2YgYSBzdHJpbmcuXG4gICAgY29uc3Qgc3RyaW5naWZpZWRWYWx1ZSA9IEpTT04uc3RyaW5naWZ5KHZhbHVlLCAoXywgdikgPT5cbiAgICAgIHYgaW5zdGFuY2VvZiBSZWdFeHBcbiAgICAgICAgPyBg4pesTUFUX1JFX0VTQ0FQReKXrCR7di50b1N0cmluZygpLnJlcGxhY2UoL1wiL2csICfil6xNQVRfUkVfRVNDQVBF4pesJyl94pesTUFUX1JFX0VTQ0FQReKXrGBcbiAgICAgICAgOiB2LFxuICAgICk7XG4gICAgLy8gU3RyaXAgb3V0IHRoZSBleHRyYSBxdW90ZXMgYXJvdW5kIHJlZ2V4ZXMgYW5kIHB1dCBiYWNrIHRoZSBtYW51YWxseSBlc2NhcGVkIGBcImAgY2hhcmFjdGVycy5cbiAgICByZXR1cm4gc3RyaW5naWZpZWRWYWx1ZVxuICAgICAgLnJlcGxhY2UoL1wi4pesTUFUX1JFX0VTQ0FQReKXrHzil6xNQVRfUkVfRVNDQVBF4pesXCIvZywgJycpXG4gICAgICAucmVwbGFjZSgv4pesTUFUX1JFX0VTQ0FQReKXrC9nLCAnXCInKTtcbiAgfSBjYXRjaCB7XG4gICAgLy8gYEpTT04uc3RyaW5naWZ5YCB3aWxsIHRocm93IGlmIHRoZSBvYmplY3QgaXMgY3ljbGljYWwsXG4gICAgLy8gaW4gdGhpcyBjYXNlIHRoZSBiZXN0IHdlIGNhbiBkbyBpcyByZXBvcnQgdGhlIHZhbHVlIGFzIGB7Li4ufWAuXG4gICAgcmV0dXJuICd7Li4ufSc7XG4gIH1cbn1cblxuLyoqXG4gKiBTcGxpdHMgdXAgYSBjb21wb3VuZCBzZWxlY3RvciBpbnRvIGl0cyBwYXJ0cyBhbmQgZXNjYXBlcyBhbnkgcXVvdGVkIGNvbnRlbnQuIFRoZSBxdW90ZWQgY29udGVudFxuICogaGFzIHRvIGJlIGVzY2FwZWQsIGJlY2F1c2UgaXQgY2FuIGNvbnRhaW4gY29tbWFzIHdoaWNoIHdpbGwgdGhyb3cgdGhyb3cgdXMgb2ZmIHdoZW4gdHJ5aW5nIHRvXG4gKiBzcGxpdCBpdC5cbiAqIEBwYXJhbSBzZWxlY3RvciBTZWxlY3RvciB0byBiZSBzcGxpdC5cbiAqIEByZXR1cm5zIFRoZSBlc2NhcGVkIHN0cmluZyB3aGVyZSBhbnkgcXVvdGVkIGNvbnRlbnQgaXMgcmVwbGFjZWQgd2l0aCBhIHBsYWNlaG9sZGVyLiBFLmcuXG4gKiBgW2Zvbz1cImJhclwiXWAgdHVybnMgaW50byBgW2Zvbz1fX2Nka1BsYWNlaG9sZGVyLTBfX11gLiBVc2UgYF9yZXN0b3JlU2VsZWN0b3JgIHRvIHJlc3RvcmVcbiAqIHRoZSBwbGFjZWhvbGRlcnMuXG4gKi9cbmZ1bmN0aW9uIF9zcGxpdEFuZEVzY2FwZVNlbGVjdG9yKHNlbGVjdG9yOiBzdHJpbmcpOiBbcGFydHM6IHN0cmluZ1tdLCBwbGFjZWhvbGRlcnM6IHN0cmluZ1tdXSB7XG4gIGNvbnN0IHBsYWNlaG9sZGVyczogc3RyaW5nW10gPSBbXTtcblxuICAvLyBOb3RlIHRoYXQgdGhlIHJlZ2V4IGRvZXNuJ3QgYWNjb3VudCBmb3IgbmVzdGVkIHF1b3RlcyBzbyBzb21ldGhpbmcgbGlrZSBgXCJhYidjZCdlXCJgIHdpbGwgYmVcbiAgLy8gY29uc2lkZXJlZCBhcyB0d28gYmxvY2tzLiBJdCdzIGEgYml0IG9mIGFuIGVkZ2UgY2FzZSwgYnV0IGlmIHdlIGZpbmQgdGhhdCBpdCdzIGEgcHJvYmxlbSxcbiAgLy8gd2UgY2FuIG1ha2UgaXQgYSBiaXQgc21hcnRlciB1c2luZyBhIGxvb3AuIFVzZSB0aGlzIGZvciBub3cgc2luY2UgaXQncyBtb3JlIHJlYWRhYmxlIGFuZFxuICAvLyBjb21wYWN0LiBNb3JlIGNvbXBsZXRlIGltcGxlbWVudGF0aW9uOlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2Jsb2IvYmQzNGJjOWU4OWYxOGEvcGFja2FnZXMvY29tcGlsZXIvc3JjL3NoYWRvd19jc3MudHMjTDY1NVxuICBjb25zdCByZXN1bHQgPSBzZWxlY3Rvci5yZXBsYWNlKC8oW1wiJ11bXltcIiddKltcIiddKS9nLCAoXywga2VlcCkgPT4ge1xuICAgIGNvbnN0IHJlcGxhY2VCeSA9IGBfX2Nka1BsYWNlaG9sZGVyLSR7cGxhY2Vob2xkZXJzLmxlbmd0aH1fX2A7XG4gICAgcGxhY2Vob2xkZXJzLnB1c2goa2VlcCk7XG4gICAgcmV0dXJuIHJlcGxhY2VCeTtcbiAgfSk7XG5cbiAgcmV0dXJuIFtyZXN1bHQuc3BsaXQoJywnKS5tYXAocGFydCA9PiBwYXJ0LnRyaW0oKSksIHBsYWNlaG9sZGVyc107XG59XG5cbi8qKiBSZXN0b3JlcyBhIHNlbGVjdG9yIHdob3NlIGNvbnRlbnQgd2FzIGVzY2FwZWQgaW4gYF9zcGxpdEFuZEVzY2FwZVNlbGVjdG9yYC4gKi9cbmZ1bmN0aW9uIF9yZXN0b3JlU2VsZWN0b3Ioc2VsZWN0b3I6IHN0cmluZywgcGxhY2Vob2xkZXJzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gIHJldHVybiBzZWxlY3Rvci5yZXBsYWNlKC9fX2Nka1BsYWNlaG9sZGVyLShcXGQrKV9fL2csIChfLCBpbmRleCkgPT4gcGxhY2Vob2xkZXJzWytpbmRleF0pO1xufVxuIl19