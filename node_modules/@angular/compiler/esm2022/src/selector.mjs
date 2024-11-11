/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
const _SELECTOR_REGEXP = new RegExp('(\\:not\\()|' + // 1: ":not("
    '(([\\.\\#]?)[-\\w]+)|' + // 2: "tag"; 3: "."/"#";
    // "-" should appear first in the regexp below as FF31 parses "[.-\w]" as a range
    // 4: attribute; 5: attribute_string; 6: attribute_value
    '(?:\\[([-.\\w*\\\\$]+)(?:=(["\']?)([^\\]"\']*)\\5)?\\])|' + // "[name]", "[name=value]",
    // "[name="value"]",
    // "[name='value']"
    '(\\))|' + // 7: ")"
    '(\\s*,\\s*)', // 8: ","
'g');
/**
 * A css selector contains an element name,
 * css classes and attribute/value pairs with the purpose
 * of selecting subsets out of them.
 */
export class CssSelector {
    constructor() {
        this.element = null;
        this.classNames = [];
        /**
         * The selectors are encoded in pairs where:
         * - even locations are attribute names
         * - odd locations are attribute values.
         *
         * Example:
         * Selector: `[key1=value1][key2]` would parse to:
         * ```
         * ['key1', 'value1', 'key2', '']
         * ```
         */
        this.attrs = [];
        this.notSelectors = [];
    }
    static parse(selector) {
        const results = [];
        const _addResult = (res, cssSel) => {
            if (cssSel.notSelectors.length > 0 &&
                !cssSel.element &&
                cssSel.classNames.length == 0 &&
                cssSel.attrs.length == 0) {
                cssSel.element = '*';
            }
            res.push(cssSel);
        };
        let cssSelector = new CssSelector();
        let match;
        let current = cssSelector;
        let inNot = false;
        _SELECTOR_REGEXP.lastIndex = 0;
        while ((match = _SELECTOR_REGEXP.exec(selector))) {
            if (match[1 /* SelectorRegexp.NOT */]) {
                if (inNot) {
                    throw new Error('Nesting :not in a selector is not allowed');
                }
                inNot = true;
                current = new CssSelector();
                cssSelector.notSelectors.push(current);
            }
            const tag = match[2 /* SelectorRegexp.TAG */];
            if (tag) {
                const prefix = match[3 /* SelectorRegexp.PREFIX */];
                if (prefix === '#') {
                    // #hash
                    current.addAttribute('id', tag.slice(1));
                }
                else if (prefix === '.') {
                    // Class
                    current.addClassName(tag.slice(1));
                }
                else {
                    // Element
                    current.setElement(tag);
                }
            }
            const attribute = match[4 /* SelectorRegexp.ATTRIBUTE */];
            if (attribute) {
                current.addAttribute(current.unescapeAttribute(attribute), match[6 /* SelectorRegexp.ATTRIBUTE_VALUE */]);
            }
            if (match[7 /* SelectorRegexp.NOT_END */]) {
                inNot = false;
                current = cssSelector;
            }
            if (match[8 /* SelectorRegexp.SEPARATOR */]) {
                if (inNot) {
                    throw new Error('Multiple selectors in :not are not supported');
                }
                _addResult(results, cssSelector);
                cssSelector = current = new CssSelector();
            }
        }
        _addResult(results, cssSelector);
        return results;
    }
    /**
     * Unescape `\$` sequences from the CSS attribute selector.
     *
     * This is needed because `$` can have a special meaning in CSS selectors,
     * but we might want to match an attribute that contains `$`.
     * [MDN web link for more
     * info](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors).
     * @param attr the attribute to unescape.
     * @returns the unescaped string.
     */
    unescapeAttribute(attr) {
        let result = '';
        let escaping = false;
        for (let i = 0; i < attr.length; i++) {
            const char = attr.charAt(i);
            if (char === '\\') {
                escaping = true;
                continue;
            }
            if (char === '$' && !escaping) {
                throw new Error(`Error in attribute selector "${attr}". ` +
                    `Unescaped "$" is not supported. Please escape with "\\$".`);
            }
            escaping = false;
            result += char;
        }
        return result;
    }
    /**
     * Escape `$` sequences from the CSS attribute selector.
     *
     * This is needed because `$` can have a special meaning in CSS selectors,
     * with this method we are escaping `$` with `\$'.
     * [MDN web link for more
     * info](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors).
     * @param attr the attribute to escape.
     * @returns the escaped string.
     */
    escapeAttribute(attr) {
        return attr.replace(/\\/g, '\\\\').replace(/\$/g, '\\$');
    }
    isElementSelector() {
        return (this.hasElementSelector() &&
            this.classNames.length == 0 &&
            this.attrs.length == 0 &&
            this.notSelectors.length === 0);
    }
    hasElementSelector() {
        return !!this.element;
    }
    setElement(element = null) {
        this.element = element;
    }
    getAttrs() {
        const result = [];
        if (this.classNames.length > 0) {
            result.push('class', this.classNames.join(' '));
        }
        return result.concat(this.attrs);
    }
    addAttribute(name, value = '') {
        this.attrs.push(name, (value && value.toLowerCase()) || '');
    }
    addClassName(name) {
        this.classNames.push(name.toLowerCase());
    }
    toString() {
        let res = this.element || '';
        if (this.classNames) {
            this.classNames.forEach((klass) => (res += `.${klass}`));
        }
        if (this.attrs) {
            for (let i = 0; i < this.attrs.length; i += 2) {
                const name = this.escapeAttribute(this.attrs[i]);
                const value = this.attrs[i + 1];
                res += `[${name}${value ? '=' + value : ''}]`;
            }
        }
        this.notSelectors.forEach((notSelector) => (res += `:not(${notSelector})`));
        return res;
    }
}
/**
 * Reads a list of CssSelectors and allows to calculate which ones
 * are contained in a given CssSelector.
 */
export class SelectorMatcher {
    constructor() {
        this._elementMap = new Map();
        this._elementPartialMap = new Map();
        this._classMap = new Map();
        this._classPartialMap = new Map();
        this._attrValueMap = new Map();
        this._attrValuePartialMap = new Map();
        this._listContexts = [];
    }
    static createNotMatcher(notSelectors) {
        const notMatcher = new SelectorMatcher();
        notMatcher.addSelectables(notSelectors, null);
        return notMatcher;
    }
    addSelectables(cssSelectors, callbackCtxt) {
        let listContext = null;
        if (cssSelectors.length > 1) {
            listContext = new SelectorListContext(cssSelectors);
            this._listContexts.push(listContext);
        }
        for (let i = 0; i < cssSelectors.length; i++) {
            this._addSelectable(cssSelectors[i], callbackCtxt, listContext);
        }
    }
    /**
     * Add an object that can be found later on by calling `match`.
     * @param cssSelector A css selector
     * @param callbackCtxt An opaque object that will be given to the callback of the `match` function
     */
    _addSelectable(cssSelector, callbackCtxt, listContext) {
        let matcher = this;
        const element = cssSelector.element;
        const classNames = cssSelector.classNames;
        const attrs = cssSelector.attrs;
        const selectable = new SelectorContext(cssSelector, callbackCtxt, listContext);
        if (element) {
            const isTerminal = attrs.length === 0 && classNames.length === 0;
            if (isTerminal) {
                this._addTerminal(matcher._elementMap, element, selectable);
            }
            else {
                matcher = this._addPartial(matcher._elementPartialMap, element);
            }
        }
        if (classNames) {
            for (let i = 0; i < classNames.length; i++) {
                const isTerminal = attrs.length === 0 && i === classNames.length - 1;
                const className = classNames[i];
                if (isTerminal) {
                    this._addTerminal(matcher._classMap, className, selectable);
                }
                else {
                    matcher = this._addPartial(matcher._classPartialMap, className);
                }
            }
        }
        if (attrs) {
            for (let i = 0; i < attrs.length; i += 2) {
                const isTerminal = i === attrs.length - 2;
                const name = attrs[i];
                const value = attrs[i + 1];
                if (isTerminal) {
                    const terminalMap = matcher._attrValueMap;
                    let terminalValuesMap = terminalMap.get(name);
                    if (!terminalValuesMap) {
                        terminalValuesMap = new Map();
                        terminalMap.set(name, terminalValuesMap);
                    }
                    this._addTerminal(terminalValuesMap, value, selectable);
                }
                else {
                    const partialMap = matcher._attrValuePartialMap;
                    let partialValuesMap = partialMap.get(name);
                    if (!partialValuesMap) {
                        partialValuesMap = new Map();
                        partialMap.set(name, partialValuesMap);
                    }
                    matcher = this._addPartial(partialValuesMap, value);
                }
            }
        }
    }
    _addTerminal(map, name, selectable) {
        let terminalList = map.get(name);
        if (!terminalList) {
            terminalList = [];
            map.set(name, terminalList);
        }
        terminalList.push(selectable);
    }
    _addPartial(map, name) {
        let matcher = map.get(name);
        if (!matcher) {
            matcher = new SelectorMatcher();
            map.set(name, matcher);
        }
        return matcher;
    }
    /**
     * Find the objects that have been added via `addSelectable`
     * whose css selector is contained in the given css selector.
     * @param cssSelector A css selector
     * @param matchedCallback This callback will be called with the object handed into `addSelectable`
     * @return boolean true if a match was found
     */
    match(cssSelector, matchedCallback) {
        let result = false;
        const element = cssSelector.element;
        const classNames = cssSelector.classNames;
        const attrs = cssSelector.attrs;
        for (let i = 0; i < this._listContexts.length; i++) {
            this._listContexts[i].alreadyMatched = false;
        }
        result = this._matchTerminal(this._elementMap, element, cssSelector, matchedCallback) || result;
        result =
            this._matchPartial(this._elementPartialMap, element, cssSelector, matchedCallback) || result;
        if (classNames) {
            for (let i = 0; i < classNames.length; i++) {
                const className = classNames[i];
                result =
                    this._matchTerminal(this._classMap, className, cssSelector, matchedCallback) || result;
                result =
                    this._matchPartial(this._classPartialMap, className, cssSelector, matchedCallback) ||
                        result;
            }
        }
        if (attrs) {
            for (let i = 0; i < attrs.length; i += 2) {
                const name = attrs[i];
                const value = attrs[i + 1];
                const terminalValuesMap = this._attrValueMap.get(name);
                if (value) {
                    result =
                        this._matchTerminal(terminalValuesMap, '', cssSelector, matchedCallback) || result;
                }
                result =
                    this._matchTerminal(terminalValuesMap, value, cssSelector, matchedCallback) || result;
                const partialValuesMap = this._attrValuePartialMap.get(name);
                if (value) {
                    result = this._matchPartial(partialValuesMap, '', cssSelector, matchedCallback) || result;
                }
                result =
                    this._matchPartial(partialValuesMap, value, cssSelector, matchedCallback) || result;
            }
        }
        return result;
    }
    /** @internal */
    _matchTerminal(map, name, cssSelector, matchedCallback) {
        if (!map || typeof name !== 'string') {
            return false;
        }
        let selectables = map.get(name) || [];
        const starSelectables = map.get('*');
        if (starSelectables) {
            selectables = selectables.concat(starSelectables);
        }
        if (selectables.length === 0) {
            return false;
        }
        let selectable;
        let result = false;
        for (let i = 0; i < selectables.length; i++) {
            selectable = selectables[i];
            result = selectable.finalize(cssSelector, matchedCallback) || result;
        }
        return result;
    }
    /** @internal */
    _matchPartial(map, name, cssSelector, matchedCallback) {
        if (!map || typeof name !== 'string') {
            return false;
        }
        const nestedSelector = map.get(name);
        if (!nestedSelector) {
            return false;
        }
        // TODO(perf): get rid of recursion and measure again
        // TODO(perf): don't pass the whole selector into the recursion,
        // but only the not processed parts
        return nestedSelector.match(cssSelector, matchedCallback);
    }
}
export class SelectorListContext {
    constructor(selectors) {
        this.selectors = selectors;
        this.alreadyMatched = false;
    }
}
// Store context to pass back selector and context when a selector is matched
export class SelectorContext {
    constructor(selector, cbContext, listContext) {
        this.selector = selector;
        this.cbContext = cbContext;
        this.listContext = listContext;
        this.notSelectors = selector.notSelectors;
    }
    finalize(cssSelector, callback) {
        let result = true;
        if (this.notSelectors.length > 0 && (!this.listContext || !this.listContext.alreadyMatched)) {
            const notMatcher = SelectorMatcher.createNotMatcher(this.notSelectors);
            result = !notMatcher.match(cssSelector, null);
        }
        if (result && callback && (!this.listContext || !this.listContext.alreadyMatched)) {
            if (this.listContext) {
                this.listContext.alreadyMatched = true;
            }
            callback(this.selector, this.cbContext);
        }
        return result;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvc2VsZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLE1BQU0sQ0FDakMsY0FBYyxHQUFHLGFBQWE7SUFDNUIsdUJBQXVCLEdBQUcsd0JBQXdCO0lBQ2xELGlGQUFpRjtJQUNqRix3REFBd0Q7SUFDeEQsMERBQTBELEdBQUcsNEJBQTRCO0lBQ3pGLG9CQUFvQjtJQUNwQixtQkFBbUI7SUFDbkIsUUFBUSxHQUFHLFNBQVM7SUFDcEIsYUFBYSxFQUFFLFNBQVM7QUFDMUIsR0FBRyxDQUNKLENBQUM7QUFnQkY7Ozs7R0FJRztBQUNILE1BQU0sT0FBTyxXQUFXO0lBQXhCO1FBQ0UsWUFBTyxHQUFrQixJQUFJLENBQUM7UUFDOUIsZUFBVSxHQUFhLEVBQUUsQ0FBQztRQUMxQjs7Ozs7Ozs7OztXQVVHO1FBQ0gsVUFBSyxHQUFhLEVBQUUsQ0FBQztRQUNyQixpQkFBWSxHQUFrQixFQUFFLENBQUM7SUFnS25DLENBQUM7SUE5SkMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFnQjtRQUMzQixNQUFNLE9BQU8sR0FBa0IsRUFBRSxDQUFDO1FBQ2xDLE1BQU0sVUFBVSxHQUFHLENBQUMsR0FBa0IsRUFBRSxNQUFtQixFQUFFLEVBQUU7WUFDN0QsSUFDRSxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDO2dCQUM5QixDQUFDLE1BQU0sQ0FBQyxPQUFPO2dCQUNmLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUM7Z0JBQzdCLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsRUFDeEIsQ0FBQztnQkFDRCxNQUFNLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztZQUN2QixDQUFDO1lBQ0QsR0FBRyxDQUFDLElBQUks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LEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUNELElBQUksTUFBTSxJQUFJLFFBQVEsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztZQUNsRixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1lBQ3pDLENBQUM7WUFDRCxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuY29uc3QgX1NFTEVDVE9SX1JFR0VYUCA9IG5ldyBSZWdFeHAoXG4gICcoXFxcXDpub3RcXFxcKCl8JyArIC8vIDE6IFwiOm5vdChcIlxuICAgICcoKFtcXFxcLlxcXFwjXT8pWy1cXFxcd10rKXwnICsgLy8gMjogXCJ0YWdcIjsgMzogXCIuXCIvXCIjXCI7XG4gICAgLy8gXCItXCIgc2hvdWxkIGFwcGVhciBmaXJzdCBpbiB0aGUgcmVnZXhwIGJlbG93IGFzIEZGMzEgcGFyc2VzIFwiWy4tXFx3XVwiIGFzIGEgcmFuZ2VcbiAgICAvLyA0OiBhdHRyaWJ1dGU7IDU6IGF0dHJpYnV0ZV9zdHJpbmc7IDY6IGF0dHJpYnV0ZV92YWx1ZVxuICAgICcoPzpcXFxcWyhbLS5cXFxcdypcXFxcXFxcXCRdKykoPzo9KFtcIlxcJ10/KShbXlxcXFxdXCJcXCddKilcXFxcNSk/XFxcXF0pfCcgKyAvLyBcIltuYW1lXVwiLCBcIltuYW1lPXZhbHVlXVwiLFxuICAgIC8vIFwiW25hbWU9XCJ2YWx1ZVwiXVwiLFxuICAgIC8vIFwiW25hbWU9J3ZhbHVlJ11cIlxuICAgICcoXFxcXCkpfCcgKyAvLyA3OiBcIilcIlxuICAgICcoXFxcXHMqLFxcXFxzKiknLCAvLyA4OiBcIixcIlxuICAnZycsXG4pO1xuXG4vKipcbiAqIFRoZXNlIG9mZnNldHMgc2hvdWxkIG1hdGNoIHRoZSBtYXRjaC1ncm91cHMgaW4gYF9TRUxFQ1RPUl9SRUdFWFBgIG9mZnNldHMuXG4gKi9cbmNvbnN0IGVudW0gU2VsZWN0b3JSZWdleHAge1xuICBBTEwgPSAwLCAvLyBUaGUgd2hvbGUgbWF0Y2hcbiAgTk9UID0gMSxcbiAgVEFHID0gMixcbiAgUFJFRklYID0gMyxcbiAgQVRUUklCVVRFID0gNCxcbiAgQVRUUklCVVRFX1NUUklORyA9IDUsXG4gIEFUVFJJQlVURV9WQUxVRSA9IDYsXG4gIE5PVF9FTkQgPSA3LFxuICBTRVBBUkFUT1IgPSA4LFxufVxuLyoqXG4gKiBBIGNzcyBzZWxlY3RvciBjb250YWlucyBhbiBlbGVtZW50IG5hbWUsXG4gKiBjc3MgY2xhc3NlcyBhbmQgYXR0cmlidXRlL3ZhbHVlIHBhaXJzIHdpdGggdGhlIHB1cnBvc2VcbiAqIG9mIHNlbGVjdGluZyBzdWJzZXRzIG91dCBvZiB0aGVtLlxuICovXG5leHBvcnQgY2xhc3MgQ3NzU2VsZWN0b3Ige1xuICBlbGVtZW50OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgY2xhc3NOYW1lczogc3RyaW5nW10gPSBbXTtcbiAgLyoqXG4gICAqIFRoZSBzZWxlY3RvcnMgYXJlIGVuY29kZWQgaW4gcGFpcnMgd2hlcmU6XG4gICAqIC0gZXZlbiBsb2NhdGlvbnMgYXJlIGF0dHJpYnV0ZSBuYW1lc1xuICAgKiAtIG9kZCBsb2NhdGlvbnMgYXJlIGF0dHJpYnV0ZSB2YWx1ZXMuXG4gICAqXG4gICAqIEV4YW1wbGU6XG4gICAqIFNlbGVjdG9yOiBgW2tleTE9dmFsdWUxXVtrZXkyXWAgd291bGQgcGFyc2UgdG86XG4gICAqIGBgYFxuICAgKiBbJ2tleTEnLCAndmFsdWUxJywgJ2tleTInLCAnJ11cbiAgICogYGBgXG4gICAqL1xuICBhdHRyczogc3RyaW5nW10gPSBbXTtcbiAgbm90U2VsZWN0b3JzOiBDc3NTZWxlY3RvcltdID0gW107XG5cbiAgc3RhdGljIHBhcnNlKHNlbGVjdG9yOiBzdHJpbmcpOiBDc3NTZWxlY3RvcltdIHtcbiAgICBjb25zdCByZXN1bHRzOiBDc3NTZWxlY3RvcltdID0gW107XG4gICAgY29uc3QgX2FkZFJlc3VsdCA9IChyZXM6IENzc1NlbGVjdG9yW10sIGNzc1NlbDogQ3NzU2VsZWN0b3IpID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgY3NzU2VsLm5vdFNlbGVjdG9ycy5sZW5ndGggPiAwICYmXG4gICAgICAgICFjc3NTZWwuZWxlbWVudCAmJlxuICAgICAgICBjc3NTZWwuY2xhc3NOYW1lcy5sZW5ndGggPT0gMCAmJlxuICAgICAgICBjc3NTZWwuYXR0cnMubGVuZ3RoID09IDBcbiAgICAgICkge1xuICAgICAgICBjc3NTZWwuZWxlbWVudCA9ICcqJztcbiAgICAgIH1cbiAgICAgIHJlcy5wdXNoKGNzc1NlbCk7XG4gICAgfTtcbiAgICBsZXQgY3NzU2VsZWN0b3IgPSBuZXcgQ3NzU2VsZWN0b3IoKTtcbiAgICBsZXQgbWF0Y2g6IHN0cmluZ1tdIHwgbnVsbDtcbiAgICBsZXQgY3VycmVudCA9IGNzc1NlbGVjdG9yO1xuICAgIGxldCBpbk5vdCA9IGZhbHNlO1xuICAgIF9TRUxFQ1RPUl9SRUdFWFAubGFzdEluZGV4ID0gMDtcbiAgICB3aGlsZSAoKG1hdGNoID0gX1NFTEVDVE9SX1JFR0VYUC5leGVjKHNlbGVjdG9yKSkpIHtcbiAgICAgIGlmIChtYXRjaFtTZWxlY3RvclJlZ2V4cC5OT1RdKSB7XG4gICAgICAgIGlmIChpbk5vdCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTmVzdGluZyA6bm90IGluIGEgc2VsZWN0b3IgaXMgbm90IGFsbG93ZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBpbk5vdCA9IHRydWU7XG4gICAgICAgIGN1cnJlbnQgPSBuZXcgQ3NzU2VsZWN0b3IoKTtcbiAgICAgICAgY3NzU2VsZWN0b3Iubm90U2VsZWN0b3JzLnB1c2goY3VycmVudCk7XG4gICAgICB9XG4gICAgICBjb25zdCB0YWcgPSBtYXRjaFtTZWxlY3RvclJlZ2V4cC5UQUddO1xuICAgICAgaWYgKHRhZykge1xuICAgICAgICBjb25zdCBwcmVmaXggPSBtYXRjaFtTZWxlY3RvclJlZ2V4cC5QUkVGSVhdO1xuICAgICAgICBpZiAocHJlZml4ID09PSAnIycpIHtcbiAgICAgICAgICAvLyAjaGFzaFxuICAgICAgICAgIGN1cnJlbnQuYWRkQXR0cmlidXRlKCdpZCcsIHRhZy5zbGljZSgxKSk7XG4gICAgICAgIH0gZWxzZSBpZiAocHJlZml4ID09PSAnLicpIHtcbiAgICAgICAgICAvLyBDbGFzc1xuICAgICAgICAgIGN1cnJlbnQuYWRkQ2xhc3NOYW1lKHRhZy5zbGljZSgxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gRWxlbWVudFxuICAgICAgICAgIGN1cnJlbnQuc2V0RWxlbWVudCh0YWcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBtYXRjaFtTZWxlY3RvclJlZ2V4cC5BVFRSSUJVVEVdO1xuXG4gICAgICBpZiAoYXR0cmlidXRlKSB7XG4gICAgICAgIGN1cnJlbnQuYWRkQXR0cmlidXRlKFxuICAgICAgICAgIGN1cnJlbnQudW5lc2NhcGVBdHRyaWJ1dGUoYXR0cmlidXRlKSxcbiAgICAgICAgICBtYXRjaFtTZWxlY3RvclJlZ2V4cC5BVFRSSUJVVEVfVkFMVUVdLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKG1hdGNoW1NlbGVjdG9yUmVnZXhwLk5PVF9FTkRdKSB7XG4gICAgICAgIGluTm90ID0gZmFsc2U7XG4gICAgICAgIGN1cnJlbnQgPSBjc3NTZWxlY3RvcjtcbiAgICAgIH1cbiAgICAgIGlmIChtYXRjaFtTZWxlY3RvclJlZ2V4cC5TRVBBUkFUT1JdKSB7XG4gICAgICAgIGlmIChpbk5vdCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTXVsdGlwbGUgc2VsZWN0b3JzIGluIDpub3QgYXJlIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBfYWRkUmVzdWx0KHJlc3VsdHMsIGNzc1NlbGVjdG9yKTtcbiAgICAgICAgY3NzU2VsZWN0b3IgPSBjdXJyZW50ID0gbmV3IENzc1NlbGVjdG9yKCk7XG4gICAgICB9XG4gICAgfVxuICAgIF9hZGRSZXN1bHQocmVzdWx0cywgY3NzU2VsZWN0b3IpO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFVuZXNjYXBlIGBcXCRgIHNlcXVlbmNlcyBmcm9tIHRoZSBDU1MgYXR0cmlidXRlIHNlbGVjdG9yLlxuICAgKlxuICAgKiBUaGlzIGlzIG5lZWRlZCBiZWNhdXNlIGAkYCBjYW4gaGF2ZSBhIHNwZWNpYWwgbWVhbmluZyBpbiBDU1Mgc2VsZWN0b3JzLFxuICAgKiBidXQgd2UgbWlnaHQgd2FudCB0byBtYXRjaCBhbiBhdHRyaWJ1dGUgdGhhdCBjb250YWlucyBgJGAuXG4gICAqIFtNRE4gd2ViIGxpbmsgZm9yIG1vcmVcbiAgICogaW5mb10oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL0F0dHJpYnV0ZV9zZWxlY3RvcnMpLlxuICAgKiBAcGFyYW0gYXR0ciB0aGUgYXR0cmlidXRlIHRvIHVuZXNjYXBlLlxuICAgKiBAcmV0dXJucyB0aGUgdW5lc2NhcGVkIHN0cmluZy5cbiAgICovXG4gIHVuZXNjYXBlQXR0cmlidXRlKGF0dHI6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgbGV0IHJlc3VsdCA9ICcnO1xuICAgIGxldCBlc2NhcGluZyA9IGZhbHNlO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXR0ci5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY2hhciA9IGF0dHIuY2hhckF0KGkpO1xuICAgICAgaWYgKGNoYXIgPT09ICdcXFxcJykge1xuICAgICAgICBlc2NhcGluZyA9IHRydWU7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKGNoYXIgPT09ICckJyAmJiAhZXNjYXBpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBFcnJvciBpbiBhdHRyaWJ1dGUgc2VsZWN0b3IgXCIke2F0dHJ9XCIuIGAgK1xuICAgICAgICAgICAgYFVuZXNjYXBlZCBcIiRcIiBpcyBub3Qgc3VwcG9ydGVkLiBQbGVhc2UgZXNjYXBlIHdpdGggXCJcXFxcJFwiLmAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBlc2NhcGluZyA9IGZhbHNlO1xuICAgICAgcmVzdWx0ICs9IGNoYXI7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogRXNjYXBlIGAkYCBzZXF1ZW5jZXMgZnJvbSB0aGUgQ1NTIGF0dHJpYnV0ZSBzZWxlY3Rvci5cbiAgICpcbiAgICogVGhpcyBpcyBuZWVkZWQgYmVjYXVzZSBgJGAgY2FuIGhhdmUgYSBzcGVjaWFsIG1lYW5pbmcgaW4gQ1NTIHNlbGVjdG9ycyxcbiAgICogd2l0aCB0aGlzIG1ldGhvZCB3ZSBhcmUgZXNjYXBpbmcgYCRgIHdpdGggYFxcJCcuXG4gICAqIFtNRE4gd2ViIGxpbmsgZm9yIG1vcmVcbiAgICogaW5mb10oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL0F0dHJpYnV0ZV9zZWxlY3RvcnMpLlxuICAgKiBAcGFyYW0gYXR0ciB0aGUgYXR0cmlidXRlIHRvIGVzY2FwZS5cbiAgICogQHJldHVybnMgdGhlIGVzY2FwZWQgc3RyaW5nLlxuICAgKi9cbiAgZXNjYXBlQXR0cmlidXRlKGF0dHI6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGF0dHIucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKS5yZXBsYWNlKC9cXCQvZywgJ1xcXFwkJyk7XG4gIH1cblxuICBpc0VsZW1lbnRTZWxlY3RvcigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5oYXNFbGVtZW50U2VsZWN0b3IoKSAmJlxuICAgICAgdGhpcy5jbGFzc05hbWVzLmxlbmd0aCA9PSAwICYmXG4gICAgICB0aGlzLmF0dHJzLmxlbmd0aCA9PSAwICYmXG4gICAgICB0aGlzLm5vdFNlbGVjdG9ycy5sZW5ndGggPT09IDBcbiAgICApO1xuICB9XG5cbiAgaGFzRWxlbWVudFNlbGVjdG9yKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuZWxlbWVudDtcbiAgfVxuXG4gIHNldEVsZW1lbnQoZWxlbWVudDogc3RyaW5nIHwgbnVsbCA9IG51bGwpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICB9XG5cbiAgZ2V0QXR0cnMoKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IHJlc3VsdDogc3RyaW5nW10gPSBbXTtcbiAgICBpZiAodGhpcy5jbGFzc05hbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJlc3VsdC5wdXNoKCdjbGFzcycsIHRoaXMuY2xhc3NOYW1lcy5qb2luKCcgJykpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0LmNvbmNhdCh0aGlzLmF0dHJzKTtcbiAgfVxuXG4gIGFkZEF0dHJpYnV0ZShuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcgPSAnJykge1xuICAgIHRoaXMuYXR0cnMucHVzaChuYW1lLCAodmFsdWUgJiYgdmFsdWUudG9Mb3dlckNhc2UoKSkgfHwgJycpO1xuICB9XG5cbiAgYWRkQ2xhc3NOYW1lKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuY2xhc3NOYW1lcy5wdXNoKG5hbWUudG9Mb3dlckNhc2UoKSk7XG4gIH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIGxldCByZXM6IHN0cmluZyA9IHRoaXMuZWxlbWVudCB8fCAnJztcbiAgICBpZiAodGhpcy5jbGFzc05hbWVzKSB7XG4gICAgICB0aGlzLmNsYXNzTmFtZXMuZm9yRWFjaCgoa2xhc3MpID0+IChyZXMgKz0gYC4ke2tsYXNzfWApKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuYXR0cnMpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5hdHRycy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICBjb25zdCBuYW1lID0gdGhpcy5lc2NhcGVBdHRyaWJ1dGUodGhpcy5hdHRyc1tpXSk7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5hdHRyc1tpICsgMV07XG4gICAgICAgIHJlcyArPSBgWyR7bmFtZX0ke3ZhbHVlID8gJz0nICsgdmFsdWUgOiAnJ31dYDtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5ub3RTZWxlY3RvcnMuZm9yRWFjaCgobm90U2VsZWN0b3IpID0+IChyZXMgKz0gYDpub3QoJHtub3RTZWxlY3Rvcn0pYCkpO1xuICAgIHJldHVybiByZXM7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWFkcyBhIGxpc3Qgb2YgQ3NzU2VsZWN0b3JzIGFuZCBhbGxvd3MgdG8gY2FsY3VsYXRlIHdoaWNoIG9uZXNcbiAqIGFyZSBjb250YWluZWQgaW4gYSBnaXZlbiBDc3NTZWxlY3Rvci5cbiAqL1xuZXhwb3J0IGNsYXNzIFNlbGVjdG9yTWF0Y2hlcjxUID0gYW55PiB7XG4gIHN0YXRpYyBjcmVhdGVOb3RNYXRjaGVyKG5vdFNlbGVjdG9yczogQ3NzU2VsZWN0b3JbXSk6IFNlbGVjdG9yTWF0Y2hlcjxudWxsPiB7XG4gICAgY29uc3Qgbm90TWF0Y2hlciA9IG5ldyBTZWxlY3Rvck1hdGNoZXI8bnVsbD4oKTtcbiAgICBub3RNYXRjaGVyLmFkZFNlbGVjdGFibGVzKG5vdFNlbGVjdG9ycywgbnVsbCk7XG4gICAgcmV0dXJuIG5vdE1hdGNoZXI7XG4gIH1cblxuICBwcml2YXRlIF9lbGVtZW50TWFwID0gbmV3IE1hcDxzdHJpbmcsIFNlbGVjdG9yQ29udGV4dDxUPltdPigpO1xuICBwcml2YXRlIF9lbGVtZW50UGFydGlhbE1hcCA9IG5ldyBNYXA8c3RyaW5nLCBTZWxlY3Rvck1hdGNoZXI8VD4+KCk7XG4gIHByaXZhdGUgX2NsYXNzTWFwID0gbmV3IE1hcDxzdHJpbmcsIFNlbGVjdG9yQ29udGV4dDxUPltdPigpO1xuICBwcml2YXRlIF9jbGFzc1BhcnRpYWxNYXAgPSBuZXcgTWFwPHN0cmluZywgU2VsZWN0b3JNYXRjaGVyPFQ+PigpO1xuICBwcml2YXRlIF9hdHRyVmFsdWVNYXAgPSBuZXcgTWFwPHN0cmluZywgTWFwPHN0cmluZywgU2VsZWN0b3JDb250ZXh0PFQ+W10+PigpO1xuICBwcml2YXRlIF9hdHRyVmFsdWVQYXJ0aWFsTWFwID0gbmV3IE1hcDxzdHJpbmcsIE1hcDxzdHJpbmcsIFNlbGVjdG9yTWF0Y2hlcjxUPj4+KCk7XG4gIHByaXZhdGUgX2xpc3RDb250ZXh0czogU2VsZWN0b3JMaXN0Q29udGV4dFtdID0gW107XG5cbiAgYWRkU2VsZWN0YWJsZXMoY3NzU2VsZWN0b3JzOiBDc3NTZWxlY3RvcltdLCBjYWxsYmFja0N0eHQ/OiBUKSB7XG4gICAgbGV0IGxpc3RDb250ZXh0OiBTZWxlY3Rvckxpc3RDb250ZXh0ID0gbnVsbCE7XG4gICAgaWYgKGNzc1NlbGVjdG9ycy5sZW5ndGggPiAxKSB7XG4gICAgICBsaXN0Q29udGV4dCA9IG5ldyBTZWxlY3Rvckxpc3RDb250ZXh0KGNzc1NlbGVjdG9ycyk7XG4gICAgICB0aGlzLl9saXN0Q29udGV4dHMucHVzaChsaXN0Q29udGV4dCk7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY3NzU2VsZWN0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLl9hZGRTZWxlY3RhYmxlKGNzc1NlbGVjdG9yc1tpXSwgY2FsbGJhY2tDdHh0IGFzIFQsIGxpc3RDb250ZXh0KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkIGFuIG9iamVjdCB0aGF0IGNhbiBiZSBmb3VuZCBsYXRlciBvbiBieSBjYWxsaW5nIGBtYXRjaGAuXG4gICAqIEBwYXJhbSBjc3NTZWxlY3RvciBBIGNzcyBzZWxlY3RvclxuICAgKiBAcGFyYW0gY2FsbGJhY2tDdHh0IEFuIG9wYXF1ZSBvYmplY3QgdGhhdCB3aWxsIGJlIGdpdmVuIHRvIHRoZSBjYWxsYmFjayBvZiB0aGUgYG1hdGNoYCBmdW5jdGlvblxuICAgKi9cbiAgcHJpdmF0ZSBfYWRkU2VsZWN0YWJsZShcbiAgICBjc3NTZWxlY3RvcjogQ3NzU2VsZWN0b3IsXG4gICAgY2FsbGJhY2tDdHh0OiBULFxuICAgIGxpc3RDb250ZXh0OiBTZWxlY3Rvckxpc3RDb250ZXh0LFxuICApIHtcbiAgICBsZXQgbWF0Y2hlcjogU2VsZWN0b3JNYXRjaGVyPFQ+ID0gdGhpcztcbiAgICBjb25zdCBlbGVtZW50ID0gY3NzU2VsZWN0b3IuZWxlbWVudDtcbiAgICBjb25zdCBjbGFzc05hbWVzID0gY3NzU2VsZWN0b3IuY2xhc3NOYW1lcztcbiAgICBjb25zdCBhdHRycyA9IGNzc1NlbGVjdG9yLmF0dHJzO1xuICAgIGNvbnN0IHNlbGVjdGFibGUgPSBuZXcgU2VsZWN0b3JDb250ZXh0KGNzc1NlbGVjdG9yLCBjYWxsYmFja0N0eHQsIGxpc3RDb250ZXh0KTtcblxuICAgIGlmIChlbGVtZW50KSB7XG4gICAgICBjb25zdCBpc1Rlcm1pbmFsID0gYXR0cnMubGVuZ3RoID09PSAwICYmIGNsYXNzTmFtZXMubGVuZ3RoID09PSAwO1xuICAgICAgaWYgKGlzVGVybWluYWwpIHtcbiAgICAgICAgdGhpcy5fYWRkVGVybWluYWwobWF0Y2hlci5fZWxlbWVudE1hcCwgZWxlbWVudCwgc2VsZWN0YWJsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXRjaGVyID0gdGhpcy5fYWRkUGFydGlhbChtYXRjaGVyLl9lbGVtZW50UGFydGlhbE1hcCwgZWxlbWVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNsYXNzTmFtZXMpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2xhc3NOYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBpc1Rlcm1pbmFsID0gYXR0cnMubGVuZ3RoID09PSAwICYmIGkgPT09IGNsYXNzTmFtZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gY2xhc3NOYW1lc1tpXTtcbiAgICAgICAgaWYgKGlzVGVybWluYWwpIHtcbiAgICAgICAgICB0aGlzLl9hZGRUZXJtaW5hbChtYXRjaGVyLl9jbGFzc01hcCwgY2xhc3NOYW1lLCBzZWxlY3RhYmxlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYXRjaGVyID0gdGhpcy5fYWRkUGFydGlhbChtYXRjaGVyLl9jbGFzc1BhcnRpYWxNYXAsIGNsYXNzTmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYXR0cnMpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXR0cnMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgY29uc3QgaXNUZXJtaW5hbCA9IGkgPT09IGF0dHJzLmxlbmd0aCAtIDI7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBhdHRyc1tpXTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBhdHRyc1tpICsgMV07XG4gICAgICAgIGlmIChpc1Rlcm1pbmFsKSB7XG4gICAgICAgICAgY29uc3QgdGVybWluYWxNYXAgPSBtYXRjaGVyLl9hdHRyVmFsdWVNYXA7XG4gICAgICAgICAgbGV0IHRlcm1pbmFsVmFsdWVzTWFwID0gdGVybWluYWxNYXAuZ2V0KG5hbWUpO1xuICAgICAgICAgIGlmICghdGVybWluYWxWYWx1ZXNNYXApIHtcbiAgICAgICAgICAgIHRlcm1pbmFsVmFsdWVzTWFwID0gbmV3IE1hcDxzdHJpbmcsIFNlbGVjdG9yQ29udGV4dDxUPltdPigpO1xuICAgICAgICAgICAgdGVybWluYWxNYXAuc2V0KG5hbWUsIHRlcm1pbmFsVmFsdWVzTWFwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fYWRkVGVybWluYWwodGVybWluYWxWYWx1ZXNNYXAsIHZhbHVlLCBzZWxlY3RhYmxlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBwYXJ0aWFsTWFwID0gbWF0Y2hlci5fYXR0clZhbHVlUGFydGlhbE1hcDtcbiAgICAgICAgICBsZXQgcGFydGlhbFZhbHVlc01hcCA9IHBhcnRpYWxNYXAuZ2V0KG5hbWUpO1xuICAgICAgICAgIGlmICghcGFydGlhbFZhbHVlc01hcCkge1xuICAgICAgICAgICAgcGFydGlhbFZhbHVlc01hcCA9IG5ldyBNYXA8c3RyaW5nLCBTZWxlY3Rvck1hdGNoZXI8VD4+KCk7XG4gICAgICAgICAgICBwYXJ0aWFsTWFwLnNldChuYW1lLCBwYXJ0aWFsVmFsdWVzTWFwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbWF0Y2hlciA9IHRoaXMuX2FkZFBhcnRpYWwocGFydGlhbFZhbHVlc01hcCwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYWRkVGVybWluYWwoXG4gICAgbWFwOiBNYXA8c3RyaW5nLCBTZWxlY3RvckNvbnRleHQ8VD5bXT4sXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHNlbGVjdGFibGU6IFNlbGVjdG9yQ29udGV4dDxUPixcbiAgKSB7XG4gICAgbGV0IHRlcm1pbmFsTGlzdCA9IG1hcC5nZXQobmFtZSk7XG4gICAgaWYgKCF0ZXJtaW5hbExpc3QpIHtcbiAgICAgIHRlcm1pbmFsTGlzdCA9IFtdO1xuICAgICAgbWFwLnNldChuYW1lLCB0ZXJtaW5hbExpc3QpO1xuICAgIH1cbiAgICB0ZXJtaW5hbExpc3QucHVzaChzZWxlY3RhYmxlKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FkZFBhcnRpYWwobWFwOiBNYXA8c3RyaW5nLCBTZWxlY3Rvck1hdGNoZXI8VD4+LCBuYW1lOiBzdHJpbmcpOiBTZWxlY3Rvck1hdGNoZXI8VD4ge1xuICAgIGxldCBtYXRjaGVyID0gbWFwLmdldChuYW1lKTtcbiAgICBpZiAoIW1hdGNoZXIpIHtcbiAgICAgIG1hdGNoZXIgPSBuZXcgU2VsZWN0b3JNYXRjaGVyPFQ+KCk7XG4gICAgICBtYXAuc2V0KG5hbWUsIG1hdGNoZXIpO1xuICAgIH1cbiAgICByZXR1cm4gbWF0Y2hlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIHRoZSBvYmplY3RzIHRoYXQgaGF2ZSBiZWVuIGFkZGVkIHZpYSBgYWRkU2VsZWN0YWJsZWBcbiAgICogd2hvc2UgY3NzIHNlbGVjdG9yIGlzIGNvbnRhaW5lZCBpbiB0aGUgZ2l2ZW4gY3NzIHNlbGVjdG9yLlxuICAgKiBAcGFyYW0gY3NzU2VsZWN0b3IgQSBjc3Mgc2VsZWN0b3JcbiAgICogQHBhcmFtIG1hdGNoZWRDYWxsYmFjayBUaGlzIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlIG9iamVjdCBoYW5kZWQgaW50byBgYWRkU2VsZWN0YWJsZWBcbiAgICogQHJldHVybiBib29sZWFuIHRydWUgaWYgYSBtYXRjaCB3YXMgZm91bmRcbiAgICovXG4gIG1hdGNoKFxuICAgIGNzc1NlbGVjdG9yOiBDc3NTZWxlY3RvcixcbiAgICBtYXRjaGVkQ2FsbGJhY2s6ICgoYzogQ3NzU2VsZWN0b3IsIGE6IFQpID0+IHZvaWQpIHwgbnVsbCxcbiAgKTogYm9vbGVhbiB7XG4gICAgbGV0IHJlc3VsdCA9IGZhbHNlO1xuICAgIGNvbnN0IGVsZW1lbnQgPSBjc3NTZWxlY3Rvci5lbGVtZW50ITtcbiAgICBjb25zdCBjbGFzc05hbWVzID0gY3NzU2VsZWN0b3IuY2xhc3NOYW1lcztcbiAgICBjb25zdCBhdHRycyA9IGNzc1NlbGVjdG9yLmF0dHJzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9saXN0Q29udGV4dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuX2xpc3RDb250ZXh0c1tpXS5hbHJlYWR5TWF0Y2hlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHJlc3VsdCA9IHRoaXMuX21hdGNoVGVybWluYWwodGhpcy5fZWxlbWVudE1hcCwgZWxlbWVudCwgY3NzU2VsZWN0b3IsIG1hdGNoZWRDYWxsYmFjaykgfHwgcmVzdWx0O1xuICAgIHJlc3VsdCA9XG4gICAgICB0aGlzLl9tYXRjaFBhcnRpYWwodGhpcy5fZWxlbWVudFBhcnRpYWxNYXAsIGVsZW1lbnQsIGNzc1NlbGVjdG9yLCBtYXRjaGVkQ2FsbGJhY2spIHx8IHJlc3VsdDtcblxuICAgIGlmIChjbGFzc05hbWVzKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsYXNzTmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gY2xhc3NOYW1lc1tpXTtcbiAgICAgICAgcmVzdWx0ID1cbiAgICAgICAgICB0aGlzLl9tYXRjaFRlcm1pbmFsKHRoaXMuX2NsYXNzTWFwLCBjbGFzc05hbWUsIGNzc1NlbGVjdG9yLCBtYXRjaGVkQ2FsbGJhY2spIHx8IHJlc3VsdDtcbiAgICAgICAgcmVzdWx0ID1cbiAgICAgICAgICB0aGlzLl9tYXRjaFBhcnRpYWwodGhpcy5fY2xhc3NQYXJ0aWFsTWFwLCBjbGFzc05hbWUsIGNzc1NlbGVjdG9yLCBtYXRjaGVkQ2FsbGJhY2spIHx8XG4gICAgICAgICAgcmVzdWx0O1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChhdHRycykge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhdHRycy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICBjb25zdCBuYW1lID0gYXR0cnNbaV07XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYXR0cnNbaSArIDFdO1xuXG4gICAgICAgIGNvbnN0IHRlcm1pbmFsVmFsdWVzTWFwID0gdGhpcy5fYXR0clZhbHVlTWFwLmdldChuYW1lKSE7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgIHJlc3VsdCA9XG4gICAgICAgICAgICB0aGlzLl9tYXRjaFRlcm1pbmFsKHRlcm1pbmFsVmFsdWVzTWFwLCAnJywgY3NzU2VsZWN0b3IsIG1hdGNoZWRDYWxsYmFjaykgfHwgcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9XG4gICAgICAgICAgdGhpcy5fbWF0Y2hUZXJtaW5hbCh0ZXJtaW5hbFZhbHVlc01hcCwgdmFsdWUsIGNzc1NlbGVjdG9yLCBtYXRjaGVkQ2FsbGJhY2spIHx8IHJlc3VsdDtcblxuICAgICAgICBjb25zdCBwYXJ0aWFsVmFsdWVzTWFwID0gdGhpcy5fYXR0clZhbHVlUGFydGlhbE1hcC5nZXQobmFtZSkhO1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICByZXN1bHQgPSB0aGlzLl9tYXRjaFBhcnRpYWwocGFydGlhbFZhbHVlc01hcCwgJycsIGNzc1NlbGVjdG9yLCBtYXRjaGVkQ2FsbGJhY2spIHx8IHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPVxuICAgICAgICAgIHRoaXMuX21hdGNoUGFydGlhbChwYXJ0aWFsVmFsdWVzTWFwLCB2YWx1ZSwgY3NzU2VsZWN0b3IsIG1hdGNoZWRDYWxsYmFjaykgfHwgcmVzdWx0O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbWF0Y2hUZXJtaW5hbChcbiAgICBtYXA6IE1hcDxzdHJpbmcsIFNlbGVjdG9yQ29udGV4dDxUPltdPixcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgY3NzU2VsZWN0b3I6IENzc1NlbGVjdG9yLFxuICAgIG1hdGNoZWRDYWxsYmFjazogKChjOiBDc3NTZWxlY3RvciwgYTogYW55KSA9PiB2b2lkKSB8IG51bGwsXG4gICk6IGJvb2xlYW4ge1xuICAgIGlmICghbWFwIHx8IHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCBzZWxlY3RhYmxlczogU2VsZWN0b3JDb250ZXh0PFQ+W10gPSBtYXAuZ2V0KG5hbWUpIHx8IFtdO1xuICAgIGNvbnN0IHN0YXJTZWxlY3RhYmxlczogU2VsZWN0b3JDb250ZXh0PFQ+W10gPSBtYXAuZ2V0KCcqJykhO1xuICAgIGlmIChzdGFyU2VsZWN0YWJsZXMpIHtcbiAgICAgIHNlbGVjdGFibGVzID0gc2VsZWN0YWJsZXMuY29uY2F0KHN0YXJTZWxlY3RhYmxlcyk7XG4gICAgfVxuICAgIGlmIChzZWxlY3RhYmxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgbGV0IHNlbGVjdGFibGU6IFNlbGVjdG9yQ29udGV4dDxUPjtcbiAgICBsZXQgcmVzdWx0ID0gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3RhYmxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgc2VsZWN0YWJsZSA9IHNlbGVjdGFibGVzW2ldO1xuICAgICAgcmVzdWx0ID0gc2VsZWN0YWJsZS5maW5hbGl6ZShjc3NTZWxlY3RvciwgbWF0Y2hlZENhbGxiYWNrKSB8fCByZXN1bHQ7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tYXRjaFBhcnRpYWwoXG4gICAgbWFwOiBNYXA8c3RyaW5nLCBTZWxlY3Rvck1hdGNoZXI8VD4+LFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBjc3NTZWxlY3RvcjogQ3NzU2VsZWN0b3IsXG4gICAgbWF0Y2hlZENhbGxiYWNrOiAoKGM6IENzc1NlbGVjdG9yLCBhOiBhbnkpID0+IHZvaWQpIHwgbnVsbCxcbiAgKTogYm9vbGVhbiB7XG4gICAgaWYgKCFtYXAgfHwgdHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgbmVzdGVkU2VsZWN0b3IgPSBtYXAuZ2V0KG5hbWUpO1xuICAgIGlmICghbmVzdGVkU2VsZWN0b3IpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gVE9ETyhwZXJmKTogZ2V0IHJpZCBvZiByZWN1cnNpb24gYW5kIG1lYXN1cmUgYWdhaW5cbiAgICAvLyBUT0RPKHBlcmYpOiBkb24ndCBwYXNzIHRoZSB3aG9sZSBzZWxlY3RvciBpbnRvIHRoZSByZWN1cnNpb24sXG4gICAgLy8gYnV0IG9ubHkgdGhlIG5vdCBwcm9jZXNzZWQgcGFydHNcbiAgICByZXR1cm4gbmVzdGVkU2VsZWN0b3IubWF0Y2goY3NzU2VsZWN0b3IsIG1hdGNoZWRDYWxsYmFjayk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNlbGVjdG9yTGlzdENvbnRleHQge1xuICBhbHJlYWR5TWF0Y2hlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzZWxlY3RvcnM6IENzc1NlbGVjdG9yW10pIHt9XG59XG5cbi8vIFN0b3JlIGNvbnRleHQgdG8gcGFzcyBiYWNrIHNlbGVjdG9yIGFuZCBjb250ZXh0IHdoZW4gYSBzZWxlY3RvciBpcyBtYXRjaGVkXG5leHBvcnQgY2xhc3MgU2VsZWN0b3JDb250ZXh0PFQgPSBhbnk+IHtcbiAgbm90U2VsZWN0b3JzOiBDc3NTZWxlY3RvcltdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBzZWxlY3RvcjogQ3NzU2VsZWN0b3IsXG4gICAgcHVibGljIGNiQ29udGV4dDogVCxcbiAgICBwdWJsaWMgbGlzdENvbnRleHQ6IFNlbGVjdG9yTGlzdENvbnRleHQsXG4gICkge1xuICAgIHRoaXMubm90U2VsZWN0b3JzID0gc2VsZWN0b3Iubm90U2VsZWN0b3JzO1xuICB9XG5cbiAgZmluYWxpemUoY3NzU2VsZWN0b3I6IENzc1NlbGVjdG9yLCBjYWxsYmFjazogKChjOiBDc3NTZWxlY3RvciwgYTogVCkgPT4gdm9pZCkgfCBudWxsKTogYm9vbGVhbiB7XG4gICAgbGV0IHJlc3VsdCA9IHRydWU7XG4gICAgaWYgKHRoaXMubm90U2VsZWN0b3JzLmxlbmd0aCA+IDAgJiYgKCF0aGlzLmxpc3RDb250ZXh0IHx8ICF0aGlzLmxpc3RDb250ZXh0LmFscmVhZHlNYXRjaGVkKSkge1xuICAgICAgY29uc3Qgbm90TWF0Y2hlciA9IFNlbGVjdG9yTWF0Y2hlci5jcmVhdGVOb3RNYXRjaGVyKHRoaXMubm90U2VsZWN0b3JzKTtcbiAgICAgIHJlc3VsdCA9ICFub3RNYXRjaGVyLm1hdGNoKGNzc1NlbGVjdG9yLCBudWxsKTtcbiAgICB9XG4gICAgaWYgKHJlc3VsdCAmJiBjYWxsYmFjayAmJiAoIXRoaXMubGlzdENvbnRleHQgfHwgIXRoaXMubGlzdENvbnRleHQuYWxyZWFkeU1hdGNoZWQpKSB7XG4gICAgICBpZiAodGhpcy5saXN0Q29udGV4dCkge1xuICAgICAgICB0aGlzLmxpc3RDb250ZXh0LmFscmVhZHlNYXRjaGVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGNhbGxiYWNrKHRoaXMuc2VsZWN0b3IsIHRoaXMuY2JDb250ZXh0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuIl19