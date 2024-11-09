/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * The following set contains all keywords that can be used in the animation css shorthand
 * property and is used during the scoping of keyframes to make sure such keywords
 * are not modified.
 */
const animationKeywords = new Set([
    // global values
    'inherit', 'initial', 'revert', 'unset',
    // animation-direction
    'alternate', 'alternate-reverse', 'normal', 'reverse',
    // animation-fill-mode
    'backwards', 'both', 'forwards', 'none',
    // animation-play-state
    'paused', 'running',
    // animation-timing-function
    'ease', 'ease-in', 'ease-in-out', 'ease-out', 'linear', 'step-start', 'step-end',
    // `steps()` function
    'end', 'jump-both', 'jump-end', 'jump-none', 'jump-start', 'start'
]);
/**
 * The following array contains all of the CSS at-rule identifiers which are scoped.
 */
const scopedAtRuleIdentifiers = ['@media', '@supports', '@document', '@layer', '@container', '@scope', '@starting-style'];
/**
 * The following class has its origin from a port of shadowCSS from webcomponents.js to TypeScript.
 * It has since diverge in many ways to tailor Angular's needs.
 *
 * Source:
 * https://github.com/webcomponents/webcomponentsjs/blob/4efecd7e0e/src/ShadowCSS/ShadowCSS.js
 *
 * The original file level comment is reproduced below
 */
/*
  This is a limited shim for ShadowDOM css styling.
  https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#styles

  The intention here is to support only the styling features which can be
  relatively simply implemented. The goal is to allow users to avoid the
  most obvious pitfalls and do so without compromising performance significantly.
  For ShadowDOM styling that's not covered here, a set of best practices
  can be provided that should allow users to accomplish more complex styling.

  The following is a list of specific ShadowDOM styling features and a brief
  discussion of the approach used to shim.

  Shimmed features:

  * :host, :host-context: ShadowDOM allows styling of the shadowRoot's host
  element using the :host rule. To shim this feature, the :host styles are
  reformatted and prefixed with a given scope name and promoted to a
  document level stylesheet.
  For example, given a scope name of .foo, a rule like this:

    :host {
        background: red;
      }
    }

  becomes:

    .foo {
      background: red;
    }

  * encapsulation: Styles defined within ShadowDOM, apply only to
  dom inside the ShadowDOM.
  The selectors are scoped by adding an attribute selector suffix to each
  simple selector that contains the host element tag name. Each element
  in the element's ShadowDOM template is also given the scope attribute.
  Thus, these rules match only elements that have the scope attribute.
  For example, given a scope name of x-foo, a rule like this:

    div {
      font-weight: bold;
    }

  becomes:

    div[x-foo] {
      font-weight: bold;
    }

  Note that elements that are dynamically added to a scope must have the scope
  selector added to them manually.

  * upper/lower bound encapsulation: Styles which are defined outside a
  shadowRoot should not cross the ShadowDOM boundary and should not apply
  inside a shadowRoot.

  This styling behavior is not emulated. Some possible ways to do this that
  were rejected due to complexity and/or performance concerns include: (1) reset
  every possible property for every possible selector for a given scope name;
  (2) re-implement css in javascript.

  As an alternative, users should make sure to use selectors
  specific to the scope in which they are working.

  * ::distributed: This behavior is not emulated. It's often not necessary
  to style the contents of a specific insertion point and instead, descendants
  of the host element can be styled selectively. Users can also create an
  extra node around an insertion point and style that node's contents
  via descendent selectors. For example, with a shadowRoot like this:

    <style>
      ::content(div) {
        background: red;
      }
    </style>
    <content></content>

  could become:

    <style>
      / *@polyfill .content-container div * /
      ::content(div) {
        background: red;
      }
    </style>
    <div class="content-container">
      <content></content>
    </div>

  Note the use of @polyfill in the comment above a ShadowDOM specific style
  declaration. This is a directive to the styling shim to use the selector
  in comments in lieu of the next selector when running under polyfill.
*/
export class ShadowCss {
    constructor() {
        /**
         * Regular expression used to extrapolate the possible keyframes from an
         * animation declaration (with possibly multiple animation definitions)
         *
         * The regular expression can be divided in three parts
         *  - (^|\s+)
         *    simply captures how many (if any) leading whitespaces are present
         *  - (?:(?:(['"])((?:\\\\|\\\2|(?!\2).)+)\2)|(-?[A-Za-z][\w\-]*))
         *    captures two different possible keyframes, ones which are quoted or ones which are valid css
         * idents (custom properties excluded)
         *  - (?=[,\s;]|$)
         *    simply matches the end of the possible keyframe, valid endings are: a comma, a space, a
         * semicolon or the end of the string
         */
        this._animationDeclarationKeyframesRe = /(^|\s+)(?:(?:(['"])((?:\\\\|\\\2|(?!\2).)+)\2)|(-?[A-Za-z][\w\-]*))(?=[,\s]|$)/g;
    }
    /*
     * Shim some cssText with the given selector. Returns cssText that can be included in the document
     *
     * The selector is the attribute added to all elements inside the host,
     * The hostSelector is the attribute added to the host itself.
     */
    shimCssText(cssText, selector, hostSelector = '') {
        // **NOTE**: Do not strip comments as this will cause component sourcemaps to break
        // due to shift in lines.
        // Collect comments and replace them with a placeholder, this is done to avoid complicating
        // the rule parsing RegExp and keep it safer.
        const comments = [];
        cssText = cssText.replace(_commentRe, (m) => {
            if (m.match(_commentWithHashRe)) {
                comments.push(m);
            }
            else {
                // Replace non hash comments with empty lines.
                // This is done so that we do not leak any senstive data in comments.
                const newLinesMatches = m.match(_newLinesRe);
                comments.push((newLinesMatches?.join('') ?? '') + '\n');
            }
            return COMMENT_PLACEHOLDER;
        });
        cssText = this._insertDirectives(cssText);
        const scopedCssText = this._scopeCssText(cssText, selector, hostSelector);
        // Add back comments at the original position.
        let commentIdx = 0;
        return scopedCssText.replace(_commentWithHashPlaceHolderRe, () => comments[commentIdx++]);
    }
    _insertDirectives(cssText) {
        cssText = this._insertPolyfillDirectivesInCssText(cssText);
        return this._insertPolyfillRulesInCssText(cssText);
    }
    /**
     * Process styles to add scope to keyframes.
     *
     * Modify both the names of the keyframes defined in the component styles and also the css
     * animation rules using them.
     *
     * Animation rules using keyframes defined elsewhere are not modified to allow for globally
     * defined keyframes.
     *
     * For example, we convert this css:
     *
     * ```
     * .box {
     *   animation: box-animation 1s forwards;
     * }
     *
     * @keyframes box-animation {
     *   to {
     *     background-color: green;
     *   }
     * }
     * ```
     *
     * to this:
     *
     * ```
     * .box {
     *   animation: scopeName_box-animation 1s forwards;
     * }
     *
     * @keyframes scopeName_box-animation {
     *   to {
     *     background-color: green;
     *   }
     * }
     * ```
     *
     * @param cssText the component's css text that needs to be scoped.
     * @param scopeSelector the component's scope selector.
     *
     * @returns the scoped css text.
     */
    _scopeKeyframesRelatedCss(cssText, scopeSelector) {
        const unscopedKeyframesSet = new Set();
        const scopedKeyframesCssText = processRules(cssText, rule => this._scopeLocalKeyframeDeclarations(rule, scopeSelector, unscopedKeyframesSet));
        return processRules(scopedKeyframesCssText, rule => this._scopeAnimationRule(rule, scopeSelector, unscopedKeyframesSet));
    }
    /**
     * Scopes local keyframes names, returning the updated css rule and it also
     * adds the original keyframe name to a provided set to collect all keyframes names
     * so that it can later be used to scope the animation rules.
     *
     * For example, it takes a rule such as:
     *
     * ```
     * @keyframes box-animation {
     *   to {
     *     background-color: green;
     *   }
     * }
     * ```
     *
     * and returns:
     *
     * ```
     * @keyframes scopeName_box-animation {
     *   to {
     *     background-color: green;
     *   }
     * }
     * ```
     * and as a side effect it adds "box-animation" to the `unscopedKeyframesSet` set
     *
     * @param cssRule the css rule to process.
     * @param scopeSelector the component's scope selector.
     * @param unscopedKeyframesSet the set of unscoped keyframes names (which can be
     * modified as a side effect)
     *
     * @returns the css rule modified with the scoped keyframes name.
     */
    _scopeLocalKeyframeDeclarations(rule, scopeSelector, unscopedKeyframesSet) {
        return {
            ...rule,
            selector: rule.selector.replace(/(^@(?:-webkit-)?keyframes(?:\s+))(['"]?)(.+)\2(\s*)$/, (_, start, quote, keyframeName, endSpaces) => {
                unscopedKeyframesSet.add(unescapeQuotes(keyframeName, quote));
                return `${start}${quote}${scopeSelector}_${keyframeName}${quote}${endSpaces}`;
            }),
        };
    }
    /**
     * Function used to scope a keyframes name (obtained from an animation declaration)
     * using an existing set of unscopedKeyframes names to discern if the scoping needs to be
     * performed (keyframes names of keyframes not defined in the component's css need not to be
     * scoped).
     *
     * @param keyframe the keyframes name to check.
     * @param scopeSelector the component's scope selector.
     * @param unscopedKeyframesSet the set of unscoped keyframes names.
     *
     * @returns the scoped name of the keyframe, or the original name is the name need not to be
     * scoped.
     */
    _scopeAnimationKeyframe(keyframe, scopeSelector, unscopedKeyframesSet) {
        return keyframe.replace(/^(\s*)(['"]?)(.+?)\2(\s*)$/, (_, spaces1, quote, name, spaces2) => {
            name = `${unscopedKeyframesSet.has(unescapeQuotes(name, quote)) ? scopeSelector + '_' : ''}${name}`;
            return `${spaces1}${quote}${name}${quote}${spaces2}`;
        });
    }
    /**
     * Scope an animation rule so that the keyframes mentioned in such rule
     * are scoped if defined in the component's css and left untouched otherwise.
     *
     * It can scope values of both the 'animation' and 'animation-name' properties.
     *
     * @param rule css rule to scope.
     * @param scopeSelector the component's scope selector.
     * @param unscopedKeyframesSet the set of unscoped keyframes names.
     *
     * @returns the updated css rule.
     **/
    _scopeAnimationRule(rule, scopeSelector, unscopedKeyframesSet) {
        let content = rule.content.replace(/((?:^|\s+|;)(?:-webkit-)?animation(?:\s*):(?:\s*))([^;]+)/g, (_, start, animationDeclarations) => start +
            animationDeclarations.replace(this._animationDeclarationKeyframesRe, (original, leadingSpaces, quote = '', quotedName, nonQuotedName) => {
                if (quotedName) {
                    return `${leadingSpaces}${this._scopeAnimationKeyframe(`${quote}${quotedName}${quote}`, scopeSelector, unscopedKeyframesSet)}`;
                }
                else {
                    return animationKeywords.has(nonQuotedName) ?
                        original :
                        `${leadingSpaces}${this._scopeAnimationKeyframe(nonQuotedName, scopeSelector, unscopedKeyframesSet)}`;
                }
            }));
        content = content.replace(/((?:^|\s+|;)(?:-webkit-)?animation-name(?:\s*):(?:\s*))([^;]+)/g, (_match, start, commaSeparatedKeyframes) => `${start}${commaSeparatedKeyframes.split(',')
            .map((keyframe) => this._scopeAnimationKeyframe(keyframe, scopeSelector, unscopedKeyframesSet))
            .join(',')}`);
        return { ...rule, content };
    }
    /*
     * Process styles to convert native ShadowDOM rules that will trip
     * up the css parser; we rely on decorating the stylesheet with inert rules.
     *
     * For example, we convert this rule:
     *
     * polyfill-next-selector { content: ':host menu-item'; }
     * ::content menu-item {
     *
     * to this:
     *
     * scopeName menu-item {
     *
     **/
    _insertPolyfillDirectivesInCssText(cssText) {
        return cssText.replace(_cssContentNextSelectorRe, function (...m) {
            return m[2] + '{';
        });
    }
    /*
     * Process styles to add rules which will only apply under the polyfill
     *
     * For example, we convert this rule:
     *
     * polyfill-rule {
     *   content: ':host menu-item';
     * ...
     * }
     *
     * to this:
     *
     * scopeName menu-item {...}
     *
     **/
    _insertPolyfillRulesInCssText(cssText) {
        return cssText.replace(_cssContentRuleRe, (...m) => {
            const rule = m[0].replace(m[1], '').replace(m[2], '');
            return m[4] + rule;
        });
    }
    /* Ensure styles are scoped. Pseudo-scoping takes a rule like:
     *
     *  .foo {... }
     *
     *  and converts this to
     *
     *  scopeName .foo { ... }
     */
    _scopeCssText(cssText, scopeSelector, hostSelector) {
        const unscopedRules = this._extractUnscopedRulesFromCssText(cssText);
        // replace :host and :host-context -shadowcsshost and -shadowcsshost respectively
        cssText = this._insertPolyfillHostInCssText(cssText);
        cssText = this._convertColonHost(cssText);
        cssText = this._convertColonHostContext(cssText);
        cssText = this._convertShadowDOMSelectors(cssText);
        if (scopeSelector) {
            cssText = this._scopeKeyframesRelatedCss(cssText, scopeSelector);
            cssText = this._scopeSelectors(cssText, scopeSelector, hostSelector);
        }
        cssText = cssText + '\n' + unscopedRules;
        return cssText.trim();
    }
    /*
     * Process styles to add rules which will only apply under the polyfill
     * and do not process via CSSOM. (CSSOM is destructive to rules on rare
     * occasions, e.g. -webkit-calc on Safari.)
     * For example, we convert this rule:
     *
     * @polyfill-unscoped-rule {
     *   content: 'menu-item';
     * ... }
     *
     * to this:
     *
     * menu-item {...}
     *
     **/
    _extractUnscopedRulesFromCssText(cssText) {
        let r = '';
        let m;
        _cssContentUnscopedRuleRe.lastIndex = 0;
        while ((m = _cssContentUnscopedRuleRe.exec(cssText)) !== null) {
            const rule = m[0].replace(m[2], '').replace(m[1], m[4]);
            r += rule + '\n\n';
        }
        return r;
    }
    /*
     * convert a rule like :host(.foo) > .bar { }
     *
     * to
     *
     * .foo<scopeName> > .bar
     */
    _convertColonHost(cssText) {
        return cssText.replace(_cssColonHostRe, (_, hostSelectors, otherSelectors) => {
            if (hostSelectors) {
                const convertedSelectors = [];
                const hostSelectorArray = hostSelectors.split(',').map((p) => p.trim());
                for (const hostSelector of hostSelectorArray) {
                    if (!hostSelector)
                        break;
                    const convertedSelector = _polyfillHostNoCombinator + hostSelector.replace(_polyfillHost, '') + otherSelectors;
                    convertedSelectors.push(convertedSelector);
                }
                return convertedSelectors.join(',');
            }
            else {
                return _polyfillHostNoCombinator + otherSelectors;
            }
        });
    }
    /*
     * convert a rule like :host-context(.foo) > .bar { }
     *
     * to
     *
     * .foo<scopeName> > .bar, .foo <scopeName> > .bar { }
     *
     * and
     *
     * :host-context(.foo:host) .bar { ... }
     *
     * to
     *
     * .foo<scopeName> .bar { ... }
     */
    _convertColonHostContext(cssText) {
        return cssText.replace(_cssColonHostContextReGlobal, (selectorText) => {
            // We have captured a selector that contains a `:host-context` rule.
            // For backward compatibility `:host-context` may contain a comma separated list of selectors.
            // Each context selector group will contain a list of host-context selectors that must match
            // an ancestor of the host.
            // (Normally `contextSelectorGroups` will only contain a single array of context selectors.)
            const contextSelectorGroups = [[]];
            // There may be more than `:host-context` in this selector so `selectorText` could look like:
            // `:host-context(.one):host-context(.two)`.
            // Execute `_cssColonHostContextRe` over and over until we have extracted all the
            // `:host-context` selectors from this selector.
            let match;
            while ((match = _cssColonHostContextRe.exec(selectorText))) {
                // `match` = [':host-context(<selectors>)<rest>', <selectors>, <rest>]
                // The `<selectors>` could actually be a comma separated list: `:host-context(.one, .two)`.
                const newContextSelectors = (match[1] ?? '').trim().split(',').map((m) => m.trim()).filter((m) => m !== '');
                // We must duplicate the current selector group for each of these new selectors.
                // For example if the current groups are:
                // ```
                // [
                //   ['a', 'b', 'c'],
                //   ['x', 'y', 'z'],
                // ]
                // ```
                // And we have a new set of comma separated selectors: `:host-context(m,n)` then the new
                // groups are:
                // ```
                // [
                //   ['a', 'b', 'c', 'm'],
                //   ['x', 'y', 'z', 'm'],
                //   ['a', 'b', 'c', 'n'],
                //   ['x', 'y', 'z', 'n'],
                // ]
                // ```
                const contextSelectorGroupsLength = contextSelectorGroups.length;
                repeatGroups(contextSelectorGroups, newContextSelectors.length);
                for (let i = 0; i < newContextSelectors.length; i++) {
                    for (let j = 0; j < contextSelectorGroupsLength; j++) {
                        contextSelectorGroups[j + i * contextSelectorGroupsLength].push(newContextSelectors[i]);
                    }
                }
                // Update the `selectorText` and see repeat to see if there are more `:host-context`s.
                selectorText = match[2];
            }
            // The context selectors now must be combined with each other to capture all the possible
            // selectors that `:host-context` can match. See `combineHostContextSelectors()` for more
            // info about how this is done.
            return contextSelectorGroups
                .map((contextSelectors) => combineHostContextSelectors(contextSelectors, selectorText))
                .join(', ');
        });
    }
    /*
     * Convert combinators like ::shadow and pseudo-elements like ::content
     * by replacing with space.
     */
    _convertShadowDOMSelectors(cssText) {
        return _shadowDOMSelectorsRe.reduce((result, pattern) => result.replace(pattern, ' '), cssText);
    }
    // change a selector like 'div' to 'name div'
    _scopeSelectors(cssText, scopeSelector, hostSelector) {
        return processRules(cssText, (rule) => {
            let selector = rule.selector;
            let content = rule.content;
            if (rule.selector[0] !== '@') {
                selector = this._scopeSelector(rule.selector, scopeSelector, hostSelector);
            }
            else if (scopedAtRuleIdentifiers.some(atRule => rule.selector.startsWith(atRule))) {
                content = this._scopeSelectors(rule.content, scopeSelector, hostSelector);
            }
            else if (rule.selector.startsWith('@font-face') || rule.selector.startsWith('@page')) {
                content = this._stripScopingSelectors(rule.content);
            }
            return new CssRule(selector, content);
        });
    }
    /**
     * Handle a css text that is within a rule that should not contain scope selectors by simply
     * removing them! An example of such a rule is `@font-face`.
     *
     * `@font-face` rules cannot contain nested selectors. Nor can they be nested under a selector.
     * Normally this would be a syntax error by the author of the styles. But in some rare cases, such
     * as importing styles from a library, and applying `:host ::ng-deep` to the imported styles, we
     * can end up with broken css if the imported styles happen to contain @font-face rules.
     *
     * For example:
     *
     * ```
     * :host ::ng-deep {
     *   import 'some/lib/containing/font-face';
     * }
     *
     * Similar logic applies to `@page` rules which can contain a particular set of properties,
     * as well as some specific at-rules. Since they can't be encapsulated, we have to strip
     * any scoping selectors from them. For more information: https://www.w3.org/TR/css-page-3
     * ```
     */
    _stripScopingSelectors(cssText) {
        return processRules(cssText, (rule) => {
            const selector = rule.selector.replace(_shadowDeepSelectors, ' ')
                .replace(_polyfillHostNoCombinatorRe, ' ');
            return new CssRule(selector, rule.content);
        });
    }
    _scopeSelector(selector, scopeSelector, hostSelector) {
        return selector.split(',')
            .map((part) => part.trim().split(_shadowDeepSelectors))
            .map((deepParts) => {
            const [shallowPart, ...otherParts] = deepParts;
            const applyScope = (shallowPart) => {
                if (this._selectorNeedsScoping(shallowPart, scopeSelector)) {
                    return this._applySelectorScope(shallowPart, scopeSelector, hostSelector);
                }
                else {
                    return shallowPart;
                }
            };
            return [applyScope(shallowPart), ...otherParts].join(' ');
        })
            .join(', ');
    }
    _selectorNeedsScoping(selector, scopeSelector) {
        const re = this._makeScopeMatcher(scopeSelector);
        return !re.test(selector);
    }
    _makeScopeMatcher(scopeSelector) {
        const lre = /\[/g;
        const rre = /\]/g;
        scopeSelector = scopeSelector.replace(lre, '\\[').replace(rre, '\\]');
        return new RegExp('^(' + scopeSelector + ')' + _selectorReSuffix, 'm');
    }
    // scope via name and [is=name]
    _applySimpleSelectorScope(selector, scopeSelector, hostSelector) {
        // In Android browser, the lastIndex is not reset when the regex is used in String.replace()
        _polyfillHostRe.lastIndex = 0;
        if (_polyfillHostRe.test(selector)) {
            const replaceBy = `[${hostSelector}]`;
            return selector
                .replace(_polyfillHostNoCombinatorRe, (hnc, selector) => {
                return selector.replace(/([^:]*)(:*)(.*)/, (_, before, colon, after) => {
                    return before + replaceBy + colon + after;
                });
            })
                .replace(_polyfillHostRe, replaceBy + ' ');
        }
        return scopeSelector + ' ' + selector;
    }
    // return a selector with [name] suffix on each simple selector
    // e.g. .foo.bar > .zot becomes .foo[name].bar[name] > .zot[name]  /** @internal */
    _applySelectorScope(selector, scopeSelector, hostSelector) {
        const isRe = /\[is=([^\]]*)\]/g;
        scopeSelector = scopeSelector.replace(isRe, (_, ...parts) => parts[0]);
        const attrName = '[' + scopeSelector + ']';
        const _scopeSelectorPart = (p) => {
            let scopedP = p.trim();
            if (!scopedP) {
                return '';
            }
            if (p.indexOf(_polyfillHostNoCombinator) > -1) {
                scopedP = this._applySimpleSelectorScope(p, scopeSelector, hostSelector);
            }
            else {
                // remove :host since it should be unnecessary
                const t = p.replace(_polyfillHostRe, '');
                if (t.length > 0) {
                    const matches = t.match(/([^:]*)(:*)(.*)/);
                    if (matches) {
                        scopedP = matches[1] + attrName + matches[2] + matches[3];
                    }
                }
            }
            return scopedP;
        };
        const safeContent = new SafeSelector(selector);
        selector = safeContent.content();
        let scopedSelector = '';
        let startIndex = 0;
        let res;
        const sep = /( |>|\+|~(?!=))\s*/g;
        // If a selector appears before :host it should not be shimmed as it
        // matches on ancestor elements and not on elements in the host's shadow
        // `:host-context(div)` is transformed to
        // `-shadowcsshost-no-combinatordiv, div -shadowcsshost-no-combinator`
        // the `div` is not part of the component in the 2nd selectors and should not be scoped.
        // Historically `component-tag:host` was matching the component so we also want to preserve
        // this behavior to avoid breaking legacy apps (it should not match).
        // The behavior should be:
        // - `tag:host` -> `tag[h]` (this is to avoid breaking legacy apps, should not match anything)
        // - `tag :host` -> `tag [h]` (`tag` is not scoped because it's considered part of a
        //   `:host-context(tag)`)
        const hasHost = selector.indexOf(_polyfillHostNoCombinator) > -1;
        // Only scope parts after the first `-shadowcsshost-no-combinator` when it is present
        let shouldScope = !hasHost;
        while ((res = sep.exec(selector)) !== null) {
            const separator = res[1];
            const part = selector.slice(startIndex, res.index).trim();
            // A space following an escaped hex value and followed by another hex character
            // (ie: ".\fc ber" for ".über") is not a separator between 2 selectors
            // also keep in mind that backslashes are replaced by a placeholder by SafeSelector
            // These escaped selectors happen for example when esbuild runs with optimization.minify.
            if (part.match(/__esc-ph-(\d+)__/) && selector[res.index + 1]?.match(/[a-fA-F\d]/)) {
                continue;
            }
            shouldScope = shouldScope || part.indexOf(_polyfillHostNoCombinator) > -1;
            const scopedPart = shouldScope ? _scopeSelectorPart(part) : part;
            scopedSelector += `${scopedPart} ${separator} `;
            startIndex = sep.lastIndex;
        }
        const part = selector.substring(startIndex);
        shouldScope = shouldScope || part.indexOf(_polyfillHostNoCombinator) > -1;
        scopedSelector += shouldScope ? _scopeSelectorPart(part) : part;
        // replace the placeholders with their original values
        return safeContent.restore(scopedSelector);
    }
    _insertPolyfillHostInCssText(selector) {
        return selector.replace(_colonHostContextRe, _polyfillHostContext)
            .replace(_colonHostRe, _polyfillHost);
    }
}
class SafeSelector {
    constructor(selector) {
        this.placeholders = [];
        this.index = 0;
        // Replaces attribute selectors with placeholders.
        // The WS in [attr="va lue"] would otherwise be interpreted as a selector separator.
        selector = this._escapeRegexMatches(selector, /(\[[^\]]*\])/g);
        // CSS allows for certain special characters to be used in selectors if they're escaped.
        // E.g. `.foo:blue` won't match a class called `foo:blue`, because the colon denotes a
        // pseudo-class, but writing `.foo\:blue` will match, because the colon was escaped.
        // Replace all escape sequences (`\` followed by a character) with a placeholder so
        // that our handling of pseudo-selectors doesn't mess with them.
        // Escaped characters have a specific placeholder so they can be detected separately.
        selector = selector.replace(/(\\.)/g, (_, keep) => {
            const replaceBy = `__esc-ph-${this.index}__`;
            this.placeholders.push(keep);
            this.index++;
            return replaceBy;
        });
        // Replaces the expression in `:nth-child(2n + 1)` with a placeholder.
        // WS and "+" would otherwise be interpreted as selector separators.
        this._content = selector.replace(/(:nth-[-\w]+)(\([^)]+\))/g, (_, pseudo, exp) => {
            const replaceBy = `__ph-${this.index}__`;
            this.placeholders.push(exp);
            this.index++;
            return pseudo + replaceBy;
        });
    }
    restore(content) {
        return content.replace(/__(?:ph|esc-ph)-(\d+)__/g, (_ph, index) => this.placeholders[+index]);
    }
    content() {
        return this._content;
    }
    /**
     * Replaces all of the substrings that match a regex within a
     * special string (e.g. `__ph-0__`, `__ph-1__`, etc).
     */
    _escapeRegexMatches(content, pattern) {
        return content.replace(pattern, (_, keep) => {
            const replaceBy = `__ph-${this.index}__`;
            this.placeholders.push(keep);
            this.index++;
            return replaceBy;
        });
    }
}
const _cssContentNextSelectorRe = /polyfill-next-selector[^}]*content:[\s]*?(['"])(.*?)\1[;\s]*}([^{]*?){/gim;
const _cssContentRuleRe = /(polyfill-rule)[^}]*(content:[\s]*(['"])(.*?)\3)[;\s]*[^}]*}/gim;
const _cssContentUnscopedRuleRe = /(polyfill-unscoped-rule)[^}]*(content:[\s]*(['"])(.*?)\3)[;\s]*[^}]*}/gim;
const _polyfillHost = '-shadowcsshost';
// note: :host-context pre-processed to -shadowcsshostcontext.
const _polyfillHostContext = '-shadowcsscontext';
const _parenSuffix = '(?:\\((' +
    '(?:\\([^)(]*\\)|[^)(]*)+?' +
    ')\\))?([^,{]*)';
const _cssColonHostRe = new RegExp(_polyfillHost + _parenSuffix, 'gim');
const _cssColonHostContextReGlobal = new RegExp(_polyfillHostContext + _parenSuffix, 'gim');
const _cssColonHostContextRe = new RegExp(_polyfillHostContext + _parenSuffix, 'im');
const _polyfillHostNoCombinator = _polyfillHost + '-no-combinator';
const _polyfillHostNoCombinatorRe = /-shadowcsshost-no-combinator([^\s]*)/;
const _shadowDOMSelectorsRe = [
    /::shadow/g,
    /::content/g,
    // Deprecated selectors
    /\/shadow-deep\//g,
    /\/shadow\//g,
];
// The deep combinator is deprecated in the CSS spec
// Support for `>>>`, `deep`, `::ng-deep` is then also deprecated and will be removed in the future.
// see https://github.com/angular/angular/pull/17677
const _shadowDeepSelectors = /(?:>>>)|(?:\/deep\/)|(?:::ng-deep)/g;
const _selectorReSuffix = '([>\\s~+[.,{:][\\s\\S]*)?$';
const _polyfillHostRe = /-shadowcsshost/gim;
const _colonHostRe = /:host/gim;
const _colonHostContextRe = /:host-context/gim;
const _newLinesRe = /\r?\n/g;
const _commentRe = /\/\*[\s\S]*?\*\//g;
const _commentWithHashRe = /\/\*\s*#\s*source(Mapping)?URL=/g;
const COMMENT_PLACEHOLDER = '%COMMENT%';
const _commentWithHashPlaceHolderRe = new RegExp(COMMENT_PLACEHOLDER, 'g');
const BLOCK_PLACEHOLDER = '%BLOCK%';
const _ruleRe = new RegExp(`(\\s*(?:${COMMENT_PLACEHOLDER}\\s*)*)([^;\\{\\}]+?)(\\s*)((?:{%BLOCK%}?\\s*;?)|(?:\\s*;))`, 'g');
const CONTENT_PAIRS = new Map([['{', '}']]);
const COMMA_IN_PLACEHOLDER = '%COMMA_IN_PLACEHOLDER%';
const SEMI_IN_PLACEHOLDER = '%SEMI_IN_PLACEHOLDER%';
const COLON_IN_PLACEHOLDER = '%COLON_IN_PLACEHOLDER%';
const _cssCommaInPlaceholderReGlobal = new RegExp(COMMA_IN_PLACEHOLDER, 'g');
const _cssSemiInPlaceholderReGlobal = new RegExp(SEMI_IN_PLACEHOLDER, 'g');
const _cssColonInPlaceholderReGlobal = new RegExp(COLON_IN_PLACEHOLDER, 'g');
export class CssRule {
    constructor(selector, content) {
        this.selector = selector;
        this.content = content;
    }
}
export function processRules(input, ruleCallback) {
    const escaped = escapeInStrings(input);
    const inputWithEscapedBlocks = escapeBlocks(escaped, CONTENT_PAIRS, BLOCK_PLACEHOLDER);
    let nextBlockIndex = 0;
    const escapedResult = inputWithEscapedBlocks.escapedString.replace(_ruleRe, (...m) => {
        const selector = m[2];
        let content = '';
        let suffix = m[4];
        let contentPrefix = '';
        if (suffix && suffix.startsWith('{' + BLOCK_PLACEHOLDER)) {
            content = inputWithEscapedBlocks.blocks[nextBlockIndex++];
            suffix = suffix.substring(BLOCK_PLACEHOLDER.length + 1);
            contentPrefix = '{';
        }
        const rule = ruleCallback(new CssRule(selector, content));
        return `${m[1]}${rule.selector}${m[3]}${contentPrefix}${rule.content}${suffix}`;
    });
    return unescapeInStrings(escapedResult);
}
class StringWithEscapedBlocks {
    constructor(escapedString, blocks) {
        this.escapedString = escapedString;
        this.blocks = blocks;
    }
}
function escapeBlocks(input, charPairs, placeholder) {
    const resultParts = [];
    const escapedBlocks = [];
    let openCharCount = 0;
    let nonBlockStartIndex = 0;
    let blockStartIndex = -1;
    let openChar;
    let closeChar;
    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        if (char === '\\') {
            i++;
        }
        else if (char === closeChar) {
            openCharCount--;
            if (openCharCount === 0) {
                escapedBlocks.push(input.substring(blockStartIndex, i));
                resultParts.push(placeholder);
                nonBlockStartIndex = i;
                blockStartIndex = -1;
                openChar = closeChar = undefined;
            }
        }
        else if (char === openChar) {
            openCharCount++;
        }
        else if (openCharCount === 0 && charPairs.has(char)) {
            openChar = char;
            closeChar = charPairs.get(char);
            openCharCount = 1;
            blockStartIndex = i + 1;
            resultParts.push(input.substring(nonBlockStartIndex, blockStartIndex));
        }
    }
    if (blockStartIndex !== -1) {
        escapedBlocks.push(input.substring(blockStartIndex));
        resultParts.push(placeholder);
    }
    else {
        resultParts.push(input.substring(nonBlockStartIndex));
    }
    return new StringWithEscapedBlocks(resultParts.join(''), escapedBlocks);
}
/**
 * Object containing as keys characters that should be substituted by placeholders
 * when found in strings during the css text parsing, and as values the respective
 * placeholders
 */
const ESCAPE_IN_STRING_MAP = {
    ';': SEMI_IN_PLACEHOLDER,
    ',': COMMA_IN_PLACEHOLDER,
    ':': COLON_IN_PLACEHOLDER
};
/**
 * Parse the provided css text and inside strings (meaning, inside pairs of unescaped single or
 * double quotes) replace specific characters with their respective placeholders as indicated
 * by the `ESCAPE_IN_STRING_MAP` map.
 *
 * For example convert the text
 *  `animation: "my-anim:at\"ion" 1s;`
 * to
 *  `animation: "my-anim%COLON_IN_PLACEHOLDER%at\"ion" 1s;`
 *
 * This is necessary in order to remove the meaning of some characters when found inside strings
 * (for example `;` indicates the end of a css declaration, `,` the sequence of values and `:` the
 * division between property and value during a declaration, none of these meanings apply when such
 * characters are within strings and so in order to prevent parsing issues they need to be replaced
 * with placeholder text for the duration of the css manipulation process).
 *
 * @param input the original css text.
 *
 * @returns the css text with specific characters in strings replaced by placeholders.
 **/
function escapeInStrings(input) {
    let result = input;
    let currentQuoteChar = null;
    for (let i = 0; i < result.length; i++) {
        const char = result[i];
        if (char === '\\') {
            i++;
        }
        else {
            if (currentQuoteChar !== null) {
                // index i is inside a quoted sub-string
                if (char === currentQuoteChar) {
                    currentQuoteChar = null;
                }
                else {
                    const placeholder = ESCAPE_IN_STRING_MAP[char];
                    if (placeholder) {
                        result = `${result.substr(0, i)}${placeholder}${result.substr(i + 1)}`;
                        i += placeholder.length - 1;
                    }
                }
            }
            else if (char === '\'' || char === '"') {
                currentQuoteChar = char;
            }
        }
    }
    return result;
}
/**
 * Replace in a string all occurrences of keys in the `ESCAPE_IN_STRING_MAP` map with their
 * original representation, this is simply used to revert the changes applied by the
 * escapeInStrings function.
 *
 * For example it reverts the text:
 *  `animation: "my-anim%COLON_IN_PLACEHOLDER%at\"ion" 1s;`
 * to it's original form of:
 *  `animation: "my-anim:at\"ion" 1s;`
 *
 * Note: For the sake of simplicity this function does not check that the placeholders are
 * actually inside strings as it would anyway be extremely unlikely to find them outside of strings.
 *
 * @param input the css text containing the placeholders.
 *
 * @returns the css text without the placeholders.
 */
function unescapeInStrings(input) {
    let result = input.replace(_cssCommaInPlaceholderReGlobal, ',');
    result = result.replace(_cssSemiInPlaceholderReGlobal, ';');
    result = result.replace(_cssColonInPlaceholderReGlobal, ':');
    return result;
}
/**
 * Unescape all quotes present in a string, but only if the string was actually already
 * quoted.
 *
 * This generates a "canonical" representation of strings which can be used to match strings
 * which would otherwise only differ because of differently escaped quotes.
 *
 * For example it converts the string (assumed to be quoted):
 *  `this \\"is\\" a \\'\\\\'test`
 * to:
 *  `this "is" a '\\\\'test`
 * (note that the latter backslashes are not removed as they are not actually escaping the single
 * quote)
 *
 *
 * @param input the string possibly containing escaped quotes.
 * @param isQuoted boolean indicating whether the string was quoted inside a bigger string (if not
 * then it means that it doesn't represent an inner string and thus no unescaping is required)
 *
 * @returns the string in the "canonical" representation without escaped quotes.
 */
function unescapeQuotes(str, isQuoted) {
    return !isQuoted ? str : str.replace(/((?:^|[^\\])(?:\\\\)*)\\(?=['"])/g, '$1');
}
/**
 * Combine the `contextSelectors` with the `hostMarker` and the `otherSelectors`
 * to create a selector that matches the same as `:host-context()`.
 *
 * Given a single context selector `A` we need to output selectors that match on the host and as an
 * ancestor of the host:
 *
 * ```
 * A <hostMarker>, A<hostMarker> {}
 * ```
 *
 * When there is more than one context selector we also have to create combinations of those
 * selectors with each other. For example if there are `A` and `B` selectors the output is:
 *
 * ```
 * AB<hostMarker>, AB <hostMarker>, A B<hostMarker>,
 * B A<hostMarker>, A B <hostMarker>, B A <hostMarker> {}
 * ```
 *
 * And so on...
 *
 * @param contextSelectors an array of context selectors that will be combined.
 * @param otherSelectors the rest of the selectors that are not context selectors.
 */
function combineHostContextSelectors(contextSelectors, otherSelectors) {
    const hostMarker = _polyfillHostNoCombinator;
    _polyfillHostRe.lastIndex = 0; // reset the regex to ensure we get an accurate test
    const otherSelectorsHasHost = _polyfillHostRe.test(otherSelectors);
    // If there are no context selectors then just output a host marker
    if (contextSelectors.length === 0) {
        return hostMarker + otherSelectors;
    }
    const combined = [contextSelectors.pop() || ''];
    while (contextSelectors.length > 0) {
        const length = combined.length;
        const contextSelector = contextSelectors.pop();
        for (let i = 0; i < length; i++) {
            const previousSelectors = combined[i];
            // Add the new selector as a descendant of the previous selectors
            combined[length * 2 + i] = previousSelectors + ' ' + contextSelector;
            // Add the new selector as an ancestor of the previous selectors
            combined[length + i] = contextSelector + ' ' + previousSelectors;
            // Add the new selector to act on the same element as the previous selectors
            combined[i] = contextSelector + previousSelectors;
        }
    }
    // Finally connect the selector to the `hostMarker`s: either acting directly on the host
    // (A<hostMarker>) or as an ancestor (A <hostMarker>).
    return combined
        .map(s => otherSelectorsHasHost ?
        `${s}${otherSelectors}` :
        `${s}${hostMarker}${otherSelectors}, ${s} ${hostMarker}${otherSelectors}`)
        .join(',');
}
/**
 * Mutate the given `groups` array so that there are `multiples` clones of the original array
 * stored.
 *
 * For example `repeatGroups([a, b], 3)` will result in `[a, b, a, b, a, b]` - but importantly the
 * newly added groups will be clones of the original.
 *
 * @param groups An array of groups of strings that will be repeated. This array is mutated
 *     in-place.
 * @param multiples The number of times the current groups should appear.
 */
export function repeatGroups(groups, multiples) {
    const length = groups.length;
    for (let i = 1; i < multiples; i++) {
        for (let j = 0; j < length; j++) {
            groups[j + (i * length)] = groups[j].slice(0);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhZG93X2Nzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9zaGFkb3dfY3NzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVIOzs7O0dBSUc7QUFDSCxNQUFNLGlCQUFpQixHQUFHLElBQUksR0FBRyxDQUFDO0lBQ2hDLGdCQUFnQjtJQUNoQixTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxPQUFPO0lBQ3ZDLHNCQUFzQjtJQUN0QixXQUFXLEVBQUUsbUJBQW1CLEVBQUUsUUFBUSxFQUFFLFNBQVM7SUFDckQsc0JBQXNCO0lBQ3RCLFdBQVcsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU07SUFDdkMsdUJBQXVCO0lBQ3ZCLFFBQVEsRUFBRSxTQUFTO0lBQ25CLDRCQUE0QjtJQUM1QixNQUFNLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxVQUFVO0lBQ2hGLHFCQUFxQjtJQUNyQixLQUFLLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLE9BQU87Q0FDbkUsQ0FBQyxDQUFDO0FBRUg7O0dBRUc7QUFDSCxNQUFNLHVCQUF1QixHQUN6QixDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixDQUFDLENBQUM7QUFFOUY7Ozs7Ozs7O0dBUUc7QUFFSDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBNkZFO0FBQ0YsTUFBTSxPQUFPLFNBQVM7SUFBdEI7UUErSkU7Ozs7Ozs7Ozs7Ozs7V0FhRztRQUNLLHFDQUFnQyxHQUNwQyxpRkFBaUYsQ0FBQztJQTRh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O0lBQ2hFLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDN0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ25DLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNoQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoRCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBUaGUgZm9sbG93aW5nIHNldCBjb250YWlucyBhbGwga2V5d29yZHMgdGhhdCBjYW4gYmUgdXNlZCBpbiB0aGUgYW5pbWF0aW9uIGNzcyBzaG9ydGhhbmRcbiAqIHByb3BlcnR5IGFuZCBpcyB1c2VkIGR1cmluZyB0aGUgc2NvcGluZyBvZiBrZXlmcmFtZXMgdG8gbWFrZSBzdXJlIHN1Y2gga2V5d29yZHNcbiAqIGFyZSBub3QgbW9kaWZpZWQuXG4gKi9cbmNvbnN0IGFuaW1hdGlvbktleXdvcmRzID0gbmV3IFNldChbXG4gIC8vIGdsb2JhbCB2YWx1ZXNcbiAgJ2luaGVyaXQnLCAnaW5pdGlhbCcsICdyZXZlcnQnLCAndW5zZXQnLFxuICAvLyBhbmltYXRpb24tZGlyZWN0aW9uXG4gICdhbHRlcm5hdGUnLCAnYWx0ZXJuYXRlLXJldmVyc2UnLCAnbm9ybWFsJywgJ3JldmVyc2UnLFxuICAvLyBhbmltYXRpb24tZmlsbC1tb2RlXG4gICdiYWNrd2FyZHMnLCAnYm90aCcsICdmb3J3YXJkcycsICdub25lJyxcbiAgLy8gYW5pbWF0aW9uLXBsYXktc3RhdGVcbiAgJ3BhdXNlZCcsICdydW5uaW5nJyxcbiAgLy8gYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvblxuICAnZWFzZScsICdlYXNlLWluJywgJ2Vhc2UtaW4tb3V0JywgJ2Vhc2Utb3V0JywgJ2xpbmVhcicsICdzdGVwLXN0YXJ0JywgJ3N0ZXAtZW5kJyxcbiAgLy8gYHN0ZXBzKClgIGZ1bmN0aW9uXG4gICdlbmQnLCAnanVtcC1ib3RoJywgJ2p1bXAtZW5kJywgJ2p1bXAtbm9uZScsICdqdW1wLXN0YXJ0JywgJ3N0YXJ0J1xuXSk7XG5cbi8qKlxuICogVGhlIGZvbGxvd2luZyBhcnJheSBjb250YWlucyBhbGwgb2YgdGhlIENTUyBhdC1ydWxlIGlkZW50aWZpZXJzIHdoaWNoIGFyZSBzY29wZWQuXG4gKi9cbmNvbnN0IHNjb3BlZEF0UnVsZUlkZW50aWZpZXJzID1cbiAgICBbJ0BtZWRpYScsICdAc3VwcG9ydHMnLCAnQGRvY3VtZW50JywgJ0BsYXllcicsICdAY29udGFpbmVyJywgJ0BzY29wZScsICdAc3RhcnRpbmctc3R5bGUnXTtcblxuLyoqXG4gKiBUaGUgZm9sbG93aW5nIGNsYXNzIGhhcyBpdHMgb3JpZ2luIGZyb20gYSBwb3J0IG9mIHNoYWRvd0NTUyBmcm9tIHdlYmNvbXBvbmVudHMuanMgdG8gVHlwZVNjcmlwdC5cbiAqIEl0IGhhcyBzaW5jZSBkaXZlcmdlIGluIG1hbnkgd2F5cyB0byB0YWlsb3IgQW5ndWxhcidzIG5lZWRzLlxuICpcbiAqIFNvdXJjZTpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJjb21wb25lbnRzL3dlYmNvbXBvbmVudHNqcy9ibG9iLzRlZmVjZDdlMGUvc3JjL1NoYWRvd0NTUy9TaGFkb3dDU1MuanNcbiAqXG4gKiBUaGUgb3JpZ2luYWwgZmlsZSBsZXZlbCBjb21tZW50IGlzIHJlcHJvZHVjZWQgYmVsb3dcbiAqL1xuXG4vKlxuICBUaGlzIGlzIGEgbGltaXRlZCBzaGltIGZvciBTaGFkb3dET00gY3NzIHN0eWxpbmcuXG4gIGh0dHBzOi8vZHZjcy53My5vcmcvaGcvd2ViY29tcG9uZW50cy9yYXctZmlsZS90aXAvc3BlYy9zaGFkb3cvaW5kZXguaHRtbCNzdHlsZXNcblxuICBUaGUgaW50ZW50aW9uIGhlcmUgaXMgdG8gc3VwcG9ydCBvbmx5IHRoZSBzdHlsaW5nIGZlYXR1cmVzIHdoaWNoIGNhbiBiZVxuICByZWxhdGl2ZWx5IHNpbXBseSBpbXBsZW1lbnRlZC4gVGhlIGdvYWwgaXMgdG8gYWxsb3cgdXNlcnMgdG8gYXZvaWQgdGhlXG4gIG1vc3Qgb2J2aW91cyBwaXRmYWxscyBhbmQgZG8gc28gd2l0aG91dCBjb21wcm9taXNpbmcgcGVyZm9ybWFuY2Ugc2lnbmlmaWNhbnRseS5cbiAgRm9yIFNoYWRvd0RPTSBzdHlsaW5nIHRoYXQncyBub3QgY292ZXJlZCBoZXJlLCBhIHNldCBvZiBiZXN0IHByYWN0aWNlc1xuICBjYW4gYmUgcHJvdmlkZWQgdGhhdCBzaG91bGQgYWxsb3cgdXNlcnMgdG8gYWNjb21wbGlzaCBtb3JlIGNvbXBsZXggc3R5bGluZy5cblxuICBUaGUgZm9sbG93aW5nIGlzIGEgbGlzdCBvZiBzcGVjaWZpYyBTaGFkb3dET00gc3R5bGluZyBmZWF0dXJlcyBhbmQgYSBicmllZlxuICBkaXNjdXNzaW9uIG9mIHRoZSBhcHByb2FjaCB1c2VkIHRvIHNoaW0uXG5cbiAgU2hpbW1lZCBmZWF0dXJlczpcblxuICAqIDpob3N0LCA6aG9zdC1jb250ZXh0OiBTaGFkb3dET00gYWxsb3dzIHN0eWxpbmcgb2YgdGhlIHNoYWRvd1Jvb3QncyBob3N0XG4gIGVsZW1lbnQgdXNpbmcgdGhlIDpob3N0IHJ1bGUuIFRvIHNoaW0gdGhpcyBmZWF0dXJlLCB0aGUgOmhvc3Qgc3R5bGVzIGFyZVxuICByZWZvcm1hdHRlZCBhbmQgcHJlZml4ZWQgd2l0aCBhIGdpdmVuIHNjb3BlIG5hbWUgYW5kIHByb21vdGVkIHRvIGFcbiAgZG9jdW1lbnQgbGV2ZWwgc3R5bGVzaGVldC5cbiAgRm9yIGV4YW1wbGUsIGdpdmVuIGEgc2NvcGUgbmFtZSBvZiAuZm9vLCBhIHJ1bGUgbGlrZSB0aGlzOlxuXG4gICAgOmhvc3Qge1xuICAgICAgICBiYWNrZ3JvdW5kOiByZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gIGJlY29tZXM6XG5cbiAgICAuZm9vIHtcbiAgICAgIGJhY2tncm91bmQ6IHJlZDtcbiAgICB9XG5cbiAgKiBlbmNhcHN1bGF0aW9uOiBTdHlsZXMgZGVmaW5lZCB3aXRoaW4gU2hhZG93RE9NLCBhcHBseSBvbmx5IHRvXG4gIGRvbSBpbnNpZGUgdGhlIFNoYWRvd0RPTS5cbiAgVGhlIHNlbGVjdG9ycyBhcmUgc2NvcGVkIGJ5IGFkZGluZyBhbiBhdHRyaWJ1dGUgc2VsZWN0b3Igc3VmZml4IHRvIGVhY2hcbiAgc2ltcGxlIHNlbGVjdG9yIHRoYXQgY29udGFpbnMgdGhlIGhvc3QgZWxlbWVudCB0YWcgbmFtZS4gRWFjaCBlbGVtZW50XG4gIGluIHRoZSBlbGVtZW50J3MgU2hhZG93RE9NIHRlbXBsYXRlIGlzIGFsc28gZ2l2ZW4gdGhlIHNjb3BlIGF0dHJpYnV0ZS5cbiAgVGh1cywgdGhlc2UgcnVsZXMgbWF0Y2ggb25seSBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHNjb3BlIGF0dHJpYnV0ZS5cbiAgRm9yIGV4YW1wbGUsIGdpdmVuIGEgc2NvcGUgbmFtZSBvZiB4LWZvbywgYSBydWxlIGxpa2UgdGhpczpcblxuICAgIGRpdiB7XG4gICAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICB9XG5cbiAgYmVjb21lczpcblxuICAgIGRpdlt4LWZvb10ge1xuICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgfVxuXG4gIE5vdGUgdGhhdCBlbGVtZW50cyB0aGF0IGFyZSBkeW5hbWljYWxseSBhZGRlZCB0byBhIHNjb3BlIG11c3QgaGF2ZSB0aGUgc2NvcGVcbiAgc2VsZWN0b3IgYWRkZWQgdG8gdGhlbSBtYW51YWxseS5cblxuICAqIHVwcGVyL2xvd2VyIGJvdW5kIGVuY2Fwc3VsYXRpb246IFN0eWxlcyB3aGljaCBhcmUgZGVmaW5lZCBvdXRzaWRlIGFcbiAgc2hhZG93Um9vdCBzaG91bGQgbm90IGNyb3NzIHRoZSBTaGFkb3dET00gYm91bmRhcnkgYW5kIHNob3VsZCBub3QgYXBwbHlcbiAgaW5zaWRlIGEgc2hhZG93Um9vdC5cblxuICBUaGlzIHN0eWxpbmcgYmVoYXZpb3IgaXMgbm90IGVtdWxhdGVkLiBTb21lIHBvc3NpYmxlIHdheXMgdG8gZG8gdGhpcyB0aGF0XG4gIHdlcmUgcmVqZWN0ZWQgZHVlIHRvIGNvbXBsZXhpdHkgYW5kL29yIHBlcmZvcm1hbmNlIGNvbmNlcm5zIGluY2x1ZGU6ICgxKSByZXNldFxuICBldmVyeSBwb3NzaWJsZSBwcm9wZXJ0eSBmb3IgZXZlcnkgcG9zc2libGUgc2VsZWN0b3IgZm9yIGEgZ2l2ZW4gc2NvcGUgbmFtZTtcbiAgKDIpIHJlLWltcGxlbWVudCBjc3MgaW4gamF2YXNjcmlwdC5cblxuICBBcyBhbiBhbHRlcm5hdGl2ZSwgdXNlcnMgc2hvdWxkIG1ha2Ugc3VyZSB0byB1c2Ugc2VsZWN0b3JzXG4gIHNwZWNpZmljIHRvIHRoZSBzY29wZSBpbiB3aGljaCB0aGV5IGFyZSB3b3JraW5nLlxuXG4gICogOjpkaXN0cmlidXRlZDogVGhpcyBiZWhhdmlvciBpcyBub3QgZW11bGF0ZWQuIEl0J3Mgb2Z0ZW4gbm90IG5lY2Vzc2FyeVxuICB0byBzdHlsZSB0aGUgY29udGVudHMgb2YgYSBzcGVjaWZpYyBpbnNlcnRpb24gcG9pbnQgYW5kIGluc3RlYWQsIGRlc2NlbmRhbnRzXG4gIG9mIHRoZSBob3N0IGVsZW1lbnQgY2FuIGJlIHN0eWxlZCBzZWxlY3RpdmVseS4gVXNlcnMgY2FuIGFsc28gY3JlYXRlIGFuXG4gIGV4dHJhIG5vZGUgYXJvdW5kIGFuIGluc2VydGlvbiBwb2ludCBhbmQgc3R5bGUgdGhhdCBub2RlJ3MgY29udGVudHNcbiAgdmlhIGRlc2NlbmRlbnQgc2VsZWN0b3JzLiBGb3IgZXhhbXBsZSwgd2l0aCBhIHNoYWRvd1Jvb3QgbGlrZSB0aGlzOlxuXG4gICAgPHN0eWxlPlxuICAgICAgOjpjb250ZW50KGRpdikge1xuICAgICAgICBiYWNrZ3JvdW5kOiByZWQ7XG4gICAgICB9XG4gICAgPC9zdHlsZT5cbiAgICA8Y29udGVudD48L2NvbnRlbnQ+XG5cbiAgY291bGQgYmVjb21lOlxuXG4gICAgPHN0eWxlPlxuICAgICAgLyAqQHBvbHlmaWxsIC5jb250ZW50LWNvbnRhaW5lciBkaXYgKiAvXG4gICAgICA6OmNvbnRlbnQoZGl2KSB7XG4gICAgICAgIGJhY2tncm91bmQ6IHJlZDtcbiAgICAgIH1cbiAgICA8L3N0eWxlPlxuICAgIDxkaXYgY2xhc3M9XCJjb250ZW50LWNvbnRhaW5lclwiPlxuICAgICAgPGNvbnRlbnQ+PC9jb250ZW50PlxuICAgIDwvZGl2PlxuXG4gIE5vdGUgdGhlIHVzZSBvZiBAcG9seWZpbGwgaW4gdGhlIGNvbW1lbnQgYWJvdmUgYSBTaGFkb3dET00gc3BlY2lmaWMgc3R5bGVcbiAgZGVjbGFyYXRpb24uIFRoaXMgaXMgYSBkaXJlY3RpdmUgdG8gdGhlIHN0eWxpbmcgc2hpbSB0byB1c2UgdGhlIHNlbGVjdG9yXG4gIGluIGNvbW1lbnRzIGluIGxpZXUgb2YgdGhlIG5leHQgc2VsZWN0b3Igd2hlbiBydW5uaW5nIHVuZGVyIHBvbHlmaWxsLlxuKi9cbmV4cG9ydCBjbGFzcyBTaGFkb3dDc3Mge1xuICAvKlxuICAgKiBTaGltIHNvbWUgY3NzVGV4dCB3aXRoIHRoZSBnaXZlbiBzZWxlY3Rvci4gUmV0dXJucyBjc3NUZXh0IHRoYXQgY2FuIGJlIGluY2x1ZGVkIGluIHRoZSBkb2N1bWVudFxuICAgKlxuICAgKiBUaGUgc2VsZWN0b3IgaXMgdGhlIGF0dHJpYnV0ZSBhZGRlZCB0byBhbGwgZWxlbWVudHMgaW5zaWRlIHRoZSBob3N0LFxuICAgKiBUaGUgaG9zdFNlbGVjdG9yIGlzIHRoZSBhdHRyaWJ1dGUgYWRkZWQgdG8gdGhlIGhvc3QgaXRzZWxmLlxuICAgKi9cbiAgc2hpbUNzc1RleHQoY3NzVGV4dDogc3RyaW5nLCBzZWxlY3Rvcjogc3RyaW5nLCBob3N0U2VsZWN0b3I6IHN0cmluZyA9ICcnKTogc3RyaW5nIHtcbiAgICAvLyAqKk5PVEUqKjogRG8gbm90IHN0cmlwIGNvbW1lbnRzIGFzIHRoaXMgd2lsbCBjYXVzZSBjb21wb25lbnQgc291cmNlbWFwcyB0byBicmVha1xuICAgIC8vIGR1ZSB0byBzaGlmdCBpbiBsaW5lcy5cblxuICAgIC8vIENvbGxlY3QgY29tbWVudHMgYW5kIHJlcGxhY2UgdGhlbSB3aXRoIGEgcGxhY2Vob2xkZXIsIHRoaXMgaXMgZG9uZSB0byBhdm9pZCBjb21wbGljYXRpbmdcbiAgICAvLyB0aGUgcnVsZSBwYXJzaW5nIFJlZ0V4cCBhbmQga2VlcCBpdCBzYWZlci5cbiAgICBjb25zdCBjb21tZW50czogc3RyaW5nW10gPSBbXTtcbiAgICBjc3NUZXh0ID0gY3NzVGV4dC5yZXBsYWNlKF9jb21tZW50UmUsIChtKSA9PiB7XG4gICAgICBpZiAobS5tYXRjaChfY29tbWVudFdpdGhIYXNoUmUpKSB7XG4gICAgICAgIGNvbW1lbnRzLnB1c2gobSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBSZXBsYWNlIG5vbiBoYXNoIGNvbW1lbnRzIHdpdGggZW1wdHkgbGluZXMuXG4gICAgICAgIC8vIFRoaXMgaXMgZG9uZSBzbyB0aGF0IHdlIGRvIG5vdCBsZWFrIGFueSBzZW5zdGl2ZSBkYXRhIGluIGNvbW1lbnRzLlxuICAgICAgICBjb25zdCBuZXdMaW5lc01hdGNoZXMgPSBtLm1hdGNoKF9uZXdMaW5lc1JlKTtcbiAgICAgICAgY29tbWVudHMucHVzaCgobmV3TGluZXNNYXRjaGVzPy5qb2luKCcnKSA/PyAnJykgKyAnXFxuJyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDT01NRU5UX1BMQUNFSE9MREVSO1xuICAgIH0pO1xuXG4gICAgY3NzVGV4dCA9IHRoaXMuX2luc2VydERpcmVjdGl2ZXMoY3NzVGV4dCk7XG4gICAgY29uc3Qgc2NvcGVkQ3NzVGV4dCA9IHRoaXMuX3Njb3BlQ3NzVGV4dChjc3NUZXh0LCBzZWxlY3RvciwgaG9zdFNlbGVjdG9yKTtcbiAgICAvLyBBZGQgYmFjayBjb21tZW50cyBhdCB0aGUgb3JpZ2luYWwgcG9zaXRpb24uXG4gICAgbGV0IGNvbW1lbnRJZHggPSAwO1xuICAgIHJldHVybiBzY29wZWRDc3NUZXh0LnJlcGxhY2UoX2NvbW1lbnRXaXRoSGFzaFBsYWNlSG9sZGVyUmUsICgpID0+IGNvbW1lbnRzW2NvbW1lbnRJZHgrK10pO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5zZXJ0RGlyZWN0aXZlcyhjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNzc1RleHQgPSB0aGlzLl9pbnNlcnRQb2x5ZmlsbERpcmVjdGl2ZXNJbkNzc1RleHQoY3NzVGV4dCk7XG4gICAgcmV0dXJuIHRoaXMuX2luc2VydFBvbHlmaWxsUnVsZXNJbkNzc1RleHQoY3NzVGV4dCk7XG4gIH1cblxuICAvKipcbiAgICogUHJvY2VzcyBzdHlsZXMgdG8gYWRkIHNjb3BlIHRvIGtleWZyYW1lcy5cbiAgICpcbiAgICogTW9kaWZ5IGJvdGggdGhlIG5hbWVzIG9mIHRoZSBrZXlmcmFtZXMgZGVmaW5lZCBpbiB0aGUgY29tcG9uZW50IHN0eWxlcyBhbmQgYWxzbyB0aGUgY3NzXG4gICAqIGFuaW1hdGlvbiBydWxlcyB1c2luZyB0aGVtLlxuICAgKlxuICAgKiBBbmltYXRpb24gcnVsZXMgdXNpbmcga2V5ZnJhbWVzIGRlZmluZWQgZWxzZXdoZXJlIGFyZSBub3QgbW9kaWZpZWQgdG8gYWxsb3cgZm9yIGdsb2JhbGx5XG4gICAqIGRlZmluZWQga2V5ZnJhbWVzLlxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSwgd2UgY29udmVydCB0aGlzIGNzczpcbiAgICpcbiAgICogYGBgXG4gICAqIC5ib3gge1xuICAgKiAgIGFuaW1hdGlvbjogYm94LWFuaW1hdGlvbiAxcyBmb3J3YXJkcztcbiAgICogfVxuICAgKlxuICAgKiBAa2V5ZnJhbWVzIGJveC1hbmltYXRpb24ge1xuICAgKiAgIHRvIHtcbiAgICogICAgIGJhY2tncm91bmQtY29sb3I6IGdyZWVuO1xuICAgKiAgIH1cbiAgICogfVxuICAgKiBgYGBcbiAgICpcbiAgICogdG8gdGhpczpcbiAgICpcbiAgICogYGBgXG4gICAqIC5ib3gge1xuICAgKiAgIGFuaW1hdGlvbjogc2NvcGVOYW1lX2JveC1hbmltYXRpb24gMXMgZm9yd2FyZHM7XG4gICAqIH1cbiAgICpcbiAgICogQGtleWZyYW1lcyBzY29wZU5hbWVfYm94LWFuaW1hdGlvbiB7XG4gICAqICAgdG8ge1xuICAgKiAgICAgYmFja2dyb3VuZC1jb2xvcjogZ3JlZW47XG4gICAqICAgfVxuICAgKiB9XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0gY3NzVGV4dCB0aGUgY29tcG9uZW50J3MgY3NzIHRleHQgdGhhdCBuZWVkcyB0byBiZSBzY29wZWQuXG4gICAqIEBwYXJhbSBzY29wZVNlbGVjdG9yIHRoZSBjb21wb25lbnQncyBzY29wZSBzZWxlY3Rvci5cbiAgICpcbiAgICogQHJldHVybnMgdGhlIHNjb3BlZCBjc3MgdGV4dC5cbiAgICovXG4gIHByaXZhdGUgX3Njb3BlS2V5ZnJhbWVzUmVsYXRlZENzcyhjc3NUZXh0OiBzdHJpbmcsIHNjb3BlU2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgdW5zY29wZWRLZXlmcmFtZXNTZXQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBjb25zdCBzY29wZWRLZXlmcmFtZXNDc3NUZXh0ID0gcHJvY2Vzc1J1bGVzKFxuICAgICAgICBjc3NUZXh0LFxuICAgICAgICBydWxlID0+IHRoaXMuX3Njb3BlTG9jYWxLZXlmcmFtZURlY2xhcmF0aW9ucyhydWxlLCBzY29wZVNlbGVjdG9yLCB1bnNjb3BlZEtleWZyYW1lc1NldCkpO1xuICAgIHJldHVybiBwcm9jZXNzUnVsZXMoXG4gICAgICAgIHNjb3BlZEtleWZyYW1lc0Nzc1RleHQsXG4gICAgICAgIHJ1bGUgPT4gdGhpcy5fc2NvcGVBbmltYXRpb25SdWxlKHJ1bGUsIHNjb3BlU2VsZWN0b3IsIHVuc2NvcGVkS2V5ZnJhbWVzU2V0KSk7XG4gIH1cblxuICAvKipcbiAgICogU2NvcGVzIGxvY2FsIGtleWZyYW1lcyBuYW1lcywgcmV0dXJuaW5nIHRoZSB1cGRhdGVkIGNzcyBydWxlIGFuZCBpdCBhbHNvXG4gICAqIGFkZHMgdGhlIG9yaWdpbmFsIGtleWZyYW1lIG5hbWUgdG8gYSBwcm92aWRlZCBzZXQgdG8gY29sbGVjdCBhbGwga2V5ZnJhbWVzIG5hbWVzXG4gICAqIHNvIHRoYXQgaXQgY2FuIGxhdGVyIGJlIHVzZWQgdG8gc2NvcGUgdGhlIGFuaW1hdGlvbiBydWxlcy5cbiAgICpcbiAgICogRm9yIGV4YW1wbGUsIGl0IHRha2VzIGEgcnVsZSBzdWNoIGFzOlxuICAgKlxuICAgKiBgYGBcbiAgICogQGtleWZyYW1lcyBib3gtYW5pbWF0aW9uIHtcbiAgICogICB0byB7XG4gICAqICAgICBiYWNrZ3JvdW5kLWNvbG9yOiBncmVlbjtcbiAgICogICB9XG4gICAqIH1cbiAgICogYGBgXG4gICAqXG4gICAqIGFuZCByZXR1cm5zOlxuICAgKlxuICAgKiBgYGBcbiAgICogQGtleWZyYW1lcyBzY29wZU5hbWVfYm94LWFuaW1hdGlvbiB7XG4gICAqICAgdG8ge1xuICAgKiAgICAgYmFja2dyb3VuZC1jb2xvcjogZ3JlZW47XG4gICAqICAgfVxuICAgKiB9XG4gICAqIGBgYFxuICAgKiBhbmQgYXMgYSBzaWRlIGVmZmVjdCBpdCBhZGRzIFwiYm94LWFuaW1hdGlvblwiIHRvIHRoZSBgdW5zY29wZWRLZXlmcmFtZXNTZXRgIHNldFxuICAgKlxuICAgKiBAcGFyYW0gY3NzUnVsZSB0aGUgY3NzIHJ1bGUgdG8gcHJvY2Vzcy5cbiAgICogQHBhcmFtIHNjb3BlU2VsZWN0b3IgdGhlIGNvbXBvbmVudCdzIHNjb3BlIHNlbGVjdG9yLlxuICAgKiBAcGFyYW0gdW5zY29wZWRLZXlmcmFtZXNTZXQgdGhlIHNldCBvZiB1bnNjb3BlZCBrZXlmcmFtZXMgbmFtZXMgKHdoaWNoIGNhbiBiZVxuICAgKiBtb2RpZmllZCBhcyBhIHNpZGUgZWZmZWN0KVxuICAgKlxuICAgKiBAcmV0dXJucyB0aGUgY3NzIHJ1bGUgbW9kaWZpZWQgd2l0aCB0aGUgc2NvcGVkIGtleWZyYW1lcyBuYW1lLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2NvcGVMb2NhbEtleWZyYW1lRGVjbGFyYXRpb25zKFxuICAgICAgcnVsZTogQ3NzUnVsZSwgc2NvcGVTZWxlY3Rvcjogc3RyaW5nLCB1bnNjb3BlZEtleWZyYW1lc1NldDogU2V0PHN0cmluZz4pOiBDc3NSdWxlIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4ucnVsZSxcbiAgICAgIHNlbGVjdG9yOiBydWxlLnNlbGVjdG9yLnJlcGxhY2UoXG4gICAgICAgICAgLyheQCg/Oi13ZWJraXQtKT9rZXlmcmFtZXMoPzpcXHMrKSkoWydcIl0/KSguKylcXDIoXFxzKikkLyxcbiAgICAgICAgICAoXywgc3RhcnQsIHF1b3RlLCBrZXlmcmFtZU5hbWUsIGVuZFNwYWNlcykgPT4ge1xuICAgICAgICAgICAgdW5zY29wZWRLZXlmcmFtZXNTZXQuYWRkKHVuZXNjYXBlUXVvdGVzKGtleWZyYW1lTmFtZSwgcXVvdGUpKTtcbiAgICAgICAgICAgIHJldHVybiBgJHtzdGFydH0ke3F1b3RlfSR7c2NvcGVTZWxlY3Rvcn1fJHtrZXlmcmFtZU5hbWV9JHtxdW90ZX0ke2VuZFNwYWNlc31gO1xuICAgICAgICAgIH0pLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogRnVuY3Rpb24gdXNlZCB0byBzY29wZSBhIGtleWZyYW1lcyBuYW1lIChvYnRhaW5lZCBmcm9tIGFuIGFuaW1hdGlvbiBkZWNsYXJhdGlvbilcbiAgICogdXNpbmcgYW4gZXhpc3Rpbmcgc2V0IG9mIHVuc2NvcGVkS2V5ZnJhbWVzIG5hbWVzIHRvIGRpc2Nlcm4gaWYgdGhlIHNjb3BpbmcgbmVlZHMgdG8gYmVcbiAgICogcGVyZm9ybWVkIChrZXlmcmFtZXMgbmFtZXMgb2Yga2V5ZnJhbWVzIG5vdCBkZWZpbmVkIGluIHRoZSBjb21wb25lbnQncyBjc3MgbmVlZCBub3QgdG8gYmVcbiAgICogc2NvcGVkKS5cbiAgICpcbiAgICogQHBhcmFtIGtleWZyYW1lIHRoZSBrZXlmcmFtZXMgbmFtZSB0byBjaGVjay5cbiAgICogQHBhcmFtIHNjb3BlU2VsZWN0b3IgdGhlIGNvbXBvbmVudCdzIHNjb3BlIHNlbGVjdG9yLlxuICAgKiBAcGFyYW0gdW5zY29wZWRLZXlmcmFtZXNTZXQgdGhlIHNldCBvZiB1bnNjb3BlZCBrZXlmcmFtZXMgbmFtZXMuXG4gICAqXG4gICAqIEByZXR1cm5zIHRoZSBzY29wZWQgbmFtZSBvZiB0aGUga2V5ZnJhbWUsIG9yIHRoZSBvcmlnaW5hbCBuYW1lIGlzIHRoZSBuYW1lIG5lZWQgbm90IHRvIGJlXG4gICAqIHNjb3BlZC5cbiAgICovXG4gIHByaXZhdGUgX3Njb3BlQW5pbWF0aW9uS2V5ZnJhbWUoXG4gICAgICBrZXlmcmFtZTogc3RyaW5nLCBzY29wZVNlbGVjdG9yOiBzdHJpbmcsIHVuc2NvcGVkS2V5ZnJhbWVzU2V0OiBSZWFkb25seVNldDxzdHJpbmc+KTogc3RyaW5nIHtcbiAgICByZXR1cm4ga2V5ZnJhbWUucmVwbGFjZSgvXihcXHMqKShbJ1wiXT8pKC4rPylcXDIoXFxzKikkLywgKF8sIHNwYWNlczEsIHF1b3RlLCBuYW1lLCBzcGFjZXMyKSA9PiB7XG4gICAgICBuYW1lID0gYCR7dW5zY29wZWRLZXlmcmFtZXNTZXQuaGFzKHVuZXNjYXBlUXVvdGVzKG5hbWUsIHF1b3RlKSkgPyBzY29wZVNlbGVjdG9yICsgJ18nIDogJyd9JHtcbiAgICAgICAgICBuYW1lfWA7XG4gICAgICByZXR1cm4gYCR7c3BhY2VzMX0ke3F1b3RlfSR7bmFtZX0ke3F1b3RlfSR7c3BhY2VzMn1gO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ3VsYXIgZXhwcmVzc2lvbiB1c2VkIHRvIGV4dHJhcG9sYXRlIHRoZSBwb3NzaWJsZSBrZXlmcmFtZXMgZnJvbSBhblxuICAgKiBhbmltYXRpb24gZGVjbGFyYXRpb24gKHdpdGggcG9zc2libHkgbXVsdGlwbGUgYW5pbWF0aW9uIGRlZmluaXRpb25zKVxuICAgKlxuICAgKiBUaGUgcmVndWxhciBleHByZXNzaW9uIGNhbiBiZSBkaXZpZGVkIGluIHRocmVlIHBhcnRzXG4gICAqICAtIChefFxccyspXG4gICAqICAgIHNpbXBseSBjYXB0dXJlcyBob3cgbWFueSAoaWYgYW55KSBsZWFkaW5nIHdoaXRlc3BhY2VzIGFyZSBwcmVzZW50XG4gICAqICAtICg/Oig/OihbJ1wiXSkoKD86XFxcXFxcXFx8XFxcXFxcMnwoPyFcXDIpLikrKVxcMil8KC0/W0EtWmEtel1bXFx3XFwtXSopKVxuICAgKiAgICBjYXB0dXJlcyB0d28gZGlmZmVyZW50IHBvc3NpYmxlIGtleWZyYW1lcywgb25lcyB3aGljaCBhcmUgcXVvdGVkIG9yIG9uZXMgd2hpY2ggYXJlIHZhbGlkIGNzc1xuICAgKiBpZGVudHMgKGN1c3RvbSBwcm9wZXJ0aWVzIGV4Y2x1ZGVkKVxuICAgKiAgLSAoPz1bLFxccztdfCQpXG4gICAqICAgIHNpbXBseSBtYXRjaGVzIHRoZSBlbmQgb2YgdGhlIHBvc3NpYmxlIGtleWZyYW1lLCB2YWxpZCBlbmRpbmdzIGFyZTogYSBjb21tYSwgYSBzcGFjZSwgYVxuICAgKiBzZW1pY29sb24gb3IgdGhlIGVuZCBvZiB0aGUgc3RyaW5nXG4gICAqL1xuICBwcml2YXRlIF9hbmltYXRpb25EZWNsYXJhdGlvbktleWZyYW1lc1JlID1cbiAgICAgIC8oXnxcXHMrKSg/Oig/OihbJ1wiXSkoKD86XFxcXFxcXFx8XFxcXFxcMnwoPyFcXDIpLikrKVxcMil8KC0/W0EtWmEtel1bXFx3XFwtXSopKSg/PVssXFxzXXwkKS9nO1xuXG4gIC8qKlxuICAgKiBTY29wZSBhbiBhbmltYXRpb24gcnVsZSBzbyB0aGF0IHRoZSBrZXlmcmFtZXMgbWVudGlvbmVkIGluIHN1Y2ggcnVsZVxuICAgKiBhcmUgc2NvcGVkIGlmIGRlZmluZWQgaW4gdGhlIGNvbXBvbmVudCdzIGNzcyBhbmQgbGVmdCB1bnRvdWNoZWQgb3RoZXJ3aXNlLlxuICAgKlxuICAgKiBJdCBjYW4gc2NvcGUgdmFsdWVzIG9mIGJvdGggdGhlICdhbmltYXRpb24nIGFuZCAnYW5pbWF0aW9uLW5hbWUnIHByb3BlcnRpZXMuXG4gICAqXG4gICAqIEBwYXJhbSBydWxlIGNzcyBydWxlIHRvIHNjb3BlLlxuICAgKiBAcGFyYW0gc2NvcGVTZWxlY3RvciB0aGUgY29tcG9uZW50J3Mgc2NvcGUgc2VsZWN0b3IuXG4gICAqIEBwYXJhbSB1bnNjb3BlZEtleWZyYW1lc1NldCB0aGUgc2V0IG9mIHVuc2NvcGVkIGtleWZyYW1lcyBuYW1lcy5cbiAgICpcbiAgICogQHJldHVybnMgdGhlIHVwZGF0ZWQgY3NzIHJ1bGUuXG4gICAqKi9cbiAgcHJpdmF0ZSBfc2NvcGVBbmltYXRpb25SdWxlKFxuICAgICAgcnVsZTogQ3NzUnVsZSwgc2NvcGVTZWxlY3Rvcjogc3RyaW5nLCB1bnNjb3BlZEtleWZyYW1lc1NldDogUmVhZG9ubHlTZXQ8c3RyaW5nPik6IENzc1J1bGUge1xuICAgIGxldCBjb250ZW50ID0gcnVsZS5jb250ZW50LnJlcGxhY2UoXG4gICAgICAgIC8oKD86XnxcXHMrfDspKD86LXdlYmtpdC0pP2FuaW1hdGlvbig/OlxccyopOig/OlxccyopKShbXjtdKykvZyxcbiAgICAgICAgKF8sIHN0YXJ0LCBhbmltYXRpb25EZWNsYXJhdGlvbnMpID0+IHN0YXJ0ICtcbiAgICAgICAgICAgIGFuaW1hdGlvbkRlY2xhcmF0aW9ucy5yZXBsYWNlKFxuICAgICAgICAgICAgICAgIHRoaXMuX2FuaW1hdGlvbkRlY2xhcmF0aW9uS2V5ZnJhbWVzUmUsXG4gICAgICAgICAgICAgICAgKG9yaWdpbmFsOiBzdHJpbmcsIGxlYWRpbmdTcGFjZXM6IHN0cmluZywgcXVvdGUgPSAnJywgcXVvdGVkTmFtZTogc3RyaW5nLFxuICAgICAgICAgICAgICAgICBub25RdW90ZWROYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChxdW90ZWROYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtsZWFkaW5nU3BhY2VzfSR7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zY29wZUFuaW1hdGlvbktleWZyYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke3F1b3RlfSR7cXVvdGVkTmFtZX0ke3F1b3RlfWAsIHNjb3BlU2VsZWN0b3IsIHVuc2NvcGVkS2V5ZnJhbWVzU2V0KX1gO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFuaW1hdGlvbktleXdvcmRzLmhhcyhub25RdW90ZWROYW1lKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbCA6XG4gICAgICAgICAgICAgICAgICAgICAgICBgJHtsZWFkaW5nU3BhY2VzfSR7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2NvcGVBbmltYXRpb25LZXlmcmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9uUXVvdGVkTmFtZSwgc2NvcGVTZWxlY3RvciwgdW5zY29wZWRLZXlmcmFtZXNTZXQpfWA7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoXG4gICAgICAgIC8oKD86XnxcXHMrfDspKD86LXdlYmtpdC0pP2FuaW1hdGlvbi1uYW1lKD86XFxzKik6KD86XFxzKikpKFteO10rKS9nLFxuICAgICAgICAoX21hdGNoLCBzdGFydCwgY29tbWFTZXBhcmF0ZWRLZXlmcmFtZXMpID0+IGAke3N0YXJ0fSR7XG4gICAgICAgICAgICBjb21tYVNlcGFyYXRlZEtleWZyYW1lcy5zcGxpdCgnLCcpXG4gICAgICAgICAgICAgICAgLm1hcChcbiAgICAgICAgICAgICAgICAgICAgKGtleWZyYW1lOiBzdHJpbmcpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zY29wZUFuaW1hdGlvbktleWZyYW1lKGtleWZyYW1lLCBzY29wZVNlbGVjdG9yLCB1bnNjb3BlZEtleWZyYW1lc1NldCkpXG4gICAgICAgICAgICAgICAgLmpvaW4oJywnKX1gKTtcbiAgICByZXR1cm4gey4uLnJ1bGUsIGNvbnRlbnR9O1xuICB9XG5cbiAgLypcbiAgICogUHJvY2VzcyBzdHlsZXMgdG8gY29udmVydCBuYXRpdmUgU2hhZG93RE9NIHJ1bGVzIHRoYXQgd2lsbCB0cmlwXG4gICAqIHVwIHRoZSBjc3MgcGFyc2VyOyB3ZSByZWx5IG9uIGRlY29yYXRpbmcgdGhlIHN0eWxlc2hlZXQgd2l0aCBpbmVydCBydWxlcy5cbiAgICpcbiAgICogRm9yIGV4YW1wbGUsIHdlIGNvbnZlcnQgdGhpcyBydWxlOlxuICAgKlxuICAgKiBwb2x5ZmlsbC1uZXh0LXNlbGVjdG9yIHsgY29udGVudDogJzpob3N0IG1lbnUtaXRlbSc7IH1cbiAgICogOjpjb250ZW50IG1lbnUtaXRlbSB7XG4gICAqXG4gICAqIHRvIHRoaXM6XG4gICAqXG4gICAqIHNjb3BlTmFtZSBtZW51LWl0ZW0ge1xuICAgKlxuICAgKiovXG4gIHByaXZhdGUgX2luc2VydFBvbHlmaWxsRGlyZWN0aXZlc0luQ3NzVGV4dChjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBjc3NUZXh0LnJlcGxhY2UoX2Nzc0NvbnRlbnROZXh0U2VsZWN0b3JSZSwgZnVuY3Rpb24oLi4ubTogc3RyaW5nW10pIHtcbiAgICAgIHJldHVybiBtWzJdICsgJ3snO1xuICAgIH0pO1xuICB9XG5cbiAgLypcbiAgICogUHJvY2VzcyBzdHlsZXMgdG8gYWRkIHJ1bGVzIHdoaWNoIHdpbGwgb25seSBhcHBseSB1bmRlciB0aGUgcG9seWZpbGxcbiAgICpcbiAgICogRm9yIGV4YW1wbGUsIHdlIGNvbnZlcnQgdGhpcyBydWxlOlxuICAgKlxuICAgKiBwb2x5ZmlsbC1ydWxlIHtcbiAgICogICBjb250ZW50OiAnOmhvc3QgbWVudS1pdGVtJztcbiAgICogLi4uXG4gICAqIH1cbiAgICpcbiAgICogdG8gdGhpczpcbiAgICpcbiAgICogc2NvcGVOYW1lIG1lbnUtaXRlbSB7Li4ufVxuICAgKlxuICAgKiovXG4gIHByaXZhdGUgX2luc2VydFBvbHlmaWxsUnVsZXNJbkNzc1RleHQoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gY3NzVGV4dC5yZXBsYWNlKF9jc3NDb250ZW50UnVsZVJlLCAoLi4ubTogc3RyaW5nW10pID0+IHtcbiAgICAgIGNvbnN0IHJ1bGUgPSBtWzBdLnJlcGxhY2UobVsxXSwgJycpLnJlcGxhY2UobVsyXSwgJycpO1xuICAgICAgcmV0dXJuIG1bNF0gKyBydWxlO1xuICAgIH0pO1xuICB9XG5cbiAgLyogRW5zdXJlIHN0eWxlcyBhcmUgc2NvcGVkLiBQc2V1ZG8tc2NvcGluZyB0YWtlcyBhIHJ1bGUgbGlrZTpcbiAgICpcbiAgICogIC5mb28gey4uLiB9XG4gICAqXG4gICAqICBhbmQgY29udmVydHMgdGhpcyB0b1xuICAgKlxuICAgKiAgc2NvcGVOYW1lIC5mb28geyAuLi4gfVxuICAgKi9cbiAgcHJpdmF0ZSBfc2NvcGVDc3NUZXh0KGNzc1RleHQ6IHN0cmluZywgc2NvcGVTZWxlY3Rvcjogc3RyaW5nLCBob3N0U2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgdW5zY29wZWRSdWxlcyA9IHRoaXMuX2V4dHJhY3RVbnNjb3BlZFJ1bGVzRnJvbUNzc1RleHQoY3NzVGV4dCk7XG4gICAgLy8gcmVwbGFjZSA6aG9zdCBhbmQgOmhvc3QtY29udGV4dCAtc2hhZG93Y3NzaG9zdCBhbmQgLXNoYWRvd2Nzc2hvc3QgcmVzcGVjdGl2ZWx5XG4gICAgY3NzVGV4dCA9IHRoaXMuX2luc2VydFBvbHlmaWxsSG9zdEluQ3NzVGV4dChjc3NUZXh0KTtcbiAgICBjc3NUZXh0ID0gdGhpcy5fY29udmVydENvbG9uSG9zdChjc3NUZXh0KTtcbiAgICBjc3NUZXh0ID0gdGhpcy5fY29udmVydENvbG9uSG9zdENvbnRleHQoY3NzVGV4dCk7XG4gICAgY3NzVGV4dCA9IHRoaXMuX2NvbnZlcnRTaGFkb3dET01TZWxlY3RvcnMoY3NzVGV4dCk7XG4gICAgaWYgKHNjb3BlU2VsZWN0b3IpIHtcbiAgICAgIGNzc1RleHQgPSB0aGlzLl9zY29wZUtleWZyYW1lc1JlbGF0ZWRDc3MoY3NzVGV4dCwgc2NvcGVTZWxlY3Rvcik7XG4gICAgICBjc3NUZXh0ID0gdGhpcy5fc2NvcGVTZWxlY3RvcnMoY3NzVGV4dCwgc2NvcGVTZWxlY3RvciwgaG9zdFNlbGVjdG9yKTtcbiAgICB9XG4gICAgY3NzVGV4dCA9IGNzc1RleHQgKyAnXFxuJyArIHVuc2NvcGVkUnVsZXM7XG4gICAgcmV0dXJuIGNzc1RleHQudHJpbSgpO1xuICB9XG5cbiAgLypcbiAgICogUHJvY2VzcyBzdHlsZXMgdG8gYWRkIHJ1bGVzIHdoaWNoIHdpbGwgb25seSBhcHBseSB1bmRlciB0aGUgcG9seWZpbGxcbiAgICogYW5kIGRvIG5vdCBwcm9jZXNzIHZpYSBDU1NPTS4gKENTU09NIGlzIGRlc3RydWN0aXZlIHRvIHJ1bGVzIG9uIHJhcmVcbiAgICogb2NjYXNpb25zLCBlLmcuIC13ZWJraXQtY2FsYyBvbiBTYWZhcmkuKVxuICAgKiBGb3IgZXhhbXBsZSwgd2UgY29udmVydCB0aGlzIHJ1bGU6XG4gICAqXG4gICAqIEBwb2x5ZmlsbC11bnNjb3BlZC1ydWxlIHtcbiAgICogICBjb250ZW50OiAnbWVudS1pdGVtJztcbiAgICogLi4uIH1cbiAgICpcbiAgICogdG8gdGhpczpcbiAgICpcbiAgICogbWVudS1pdGVtIHsuLi59XG4gICAqXG4gICAqKi9cbiAgcHJpdmF0ZSBfZXh0cmFjdFVuc2NvcGVkUnVsZXNGcm9tQ3NzVGV4dChjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGxldCByID0gJyc7XG4gICAgbGV0IG06IFJlZ0V4cEV4ZWNBcnJheXxudWxsO1xuICAgIF9jc3NDb250ZW50VW5zY29wZWRSdWxlUmUubGFzdEluZGV4ID0gMDtcbiAgICB3aGlsZSAoKG0gPSBfY3NzQ29udGVudFVuc2NvcGVkUnVsZVJlLmV4ZWMoY3NzVGV4dCkpICE9PSBudWxsKSB7XG4gICAgICBjb25zdCBydWxlID0gbVswXS5yZXBsYWNlKG1bMl0sICcnKS5yZXBsYWNlKG1bMV0sIG1bNF0pO1xuICAgICAgciArPSBydWxlICsgJ1xcblxcbic7XG4gICAgfVxuICAgIHJldHVybiByO1xuICB9XG5cbiAgLypcbiAgICogY29udmVydCBhIHJ1bGUgbGlrZSA6aG9zdCguZm9vKSA+IC5iYXIgeyB9XG4gICAqXG4gICAqIHRvXG4gICAqXG4gICAqIC5mb288c2NvcGVOYW1lPiA+IC5iYXJcbiAgICovXG4gIHByaXZhdGUgX2NvbnZlcnRDb2xvbkhvc3QoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gY3NzVGV4dC5yZXBsYWNlKF9jc3NDb2xvbkhvc3RSZSwgKF8sIGhvc3RTZWxlY3RvcnM6IHN0cmluZywgb3RoZXJTZWxlY3RvcnM6IHN0cmluZykgPT4ge1xuICAgICAgaWYgKGhvc3RTZWxlY3RvcnMpIHtcbiAgICAgICAgY29uc3QgY29udmVydGVkU2VsZWN0b3JzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBjb25zdCBob3N0U2VsZWN0b3JBcnJheSA9IGhvc3RTZWxlY3RvcnMuc3BsaXQoJywnKS5tYXAoKHApID0+IHAudHJpbSgpKTtcbiAgICAgICAgZm9yIChjb25zdCBob3N0U2VsZWN0b3Igb2YgaG9zdFNlbGVjdG9yQXJyYXkpIHtcbiAgICAgICAgICBpZiAoIWhvc3RTZWxlY3RvcikgYnJlYWs7XG4gICAgICAgICAgY29uc3QgY29udmVydGVkU2VsZWN0b3IgPVxuICAgICAgICAgICAgICBfcG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yICsgaG9zdFNlbGVjdG9yLnJlcGxhY2UoX3BvbHlmaWxsSG9zdCwgJycpICsgb3RoZXJTZWxlY3RvcnM7XG4gICAgICAgICAgY29udmVydGVkU2VsZWN0b3JzLnB1c2goY29udmVydGVkU2VsZWN0b3IpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb252ZXJ0ZWRTZWxlY3RvcnMuam9pbignLCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IgKyBvdGhlclNlbGVjdG9ycztcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qXG4gICAqIGNvbnZlcnQgYSBydWxlIGxpa2UgOmhvc3QtY29udGV4dCguZm9vKSA+IC5iYXIgeyB9XG4gICAqXG4gICAqIHRvXG4gICAqXG4gICAqIC5mb288c2NvcGVOYW1lPiA+IC5iYXIsIC5mb28gPHNjb3BlTmFtZT4gPiAuYmFyIHsgfVxuICAgKlxuICAgKiBhbmRcbiAgICpcbiAgICogOmhvc3QtY29udGV4dCguZm9vOmhvc3QpIC5iYXIgeyAuLi4gfVxuICAgKlxuICAgKiB0b1xuICAgKlxuICAgKiAuZm9vPHNjb3BlTmFtZT4gLmJhciB7IC4uLiB9XG4gICAqL1xuICBwcml2YXRlIF9jb252ZXJ0Q29sb25Ib3N0Q29udGV4dChjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBjc3NUZXh0LnJlcGxhY2UoX2Nzc0NvbG9uSG9zdENvbnRleHRSZUdsb2JhbCwgKHNlbGVjdG9yVGV4dCkgPT4ge1xuICAgICAgLy8gV2UgaGF2ZSBjYXB0dXJlZCBhIHNlbGVjdG9yIHRoYXQgY29udGFpbnMgYSBgOmhvc3QtY29udGV4dGAgcnVsZS5cblxuICAgICAgLy8gRm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgYDpob3N0LWNvbnRleHRgIG1heSBjb250YWluIGEgY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2Ygc2VsZWN0b3JzLlxuICAgICAgLy8gRWFjaCBjb250ZXh0IHNlbGVjdG9yIGdyb3VwIHdpbGwgY29udGFpbiBhIGxpc3Qgb2YgaG9zdC1jb250ZXh0IHNlbGVjdG9ycyB0aGF0IG11c3QgbWF0Y2hcbiAgICAgIC8vIGFuIGFuY2VzdG9yIG9mIHRoZSBob3N0LlxuICAgICAgLy8gKE5vcm1hbGx5IGBjb250ZXh0U2VsZWN0b3JHcm91cHNgIHdpbGwgb25seSBjb250YWluIGEgc2luZ2xlIGFycmF5IG9mIGNvbnRleHQgc2VsZWN0b3JzLilcbiAgICAgIGNvbnN0IGNvbnRleHRTZWxlY3Rvckdyb3Vwczogc3RyaW5nW11bXSA9IFtbXV07XG5cbiAgICAgIC8vIFRoZXJlIG1heSBiZSBtb3JlIHRoYW4gYDpob3N0LWNvbnRleHRgIGluIHRoaXMgc2VsZWN0b3Igc28gYHNlbGVjdG9yVGV4dGAgY291bGQgbG9vayBsaWtlOlxuICAgICAgLy8gYDpob3N0LWNvbnRleHQoLm9uZSk6aG9zdC1jb250ZXh0KC50d28pYC5cbiAgICAgIC8vIEV4ZWN1dGUgYF9jc3NDb2xvbkhvc3RDb250ZXh0UmVgIG92ZXIgYW5kIG92ZXIgdW50aWwgd2UgaGF2ZSBleHRyYWN0ZWQgYWxsIHRoZVxuICAgICAgLy8gYDpob3N0LWNvbnRleHRgIHNlbGVjdG9ycyBmcm9tIHRoaXMgc2VsZWN0b3IuXG4gICAgICBsZXQgbWF0Y2g6IFJlZ0V4cEV4ZWNBcnJheXxudWxsO1xuICAgICAgd2hpbGUgKChtYXRjaCA9IF9jc3NDb2xvbkhvc3RDb250ZXh0UmUuZXhlYyhzZWxlY3RvclRleHQpKSkge1xuICAgICAgICAvLyBgbWF0Y2hgID0gWyc6aG9zdC1jb250ZXh0KDxzZWxlY3RvcnM+KTxyZXN0PicsIDxzZWxlY3RvcnM+LCA8cmVzdD5dXG5cbiAgICAgICAgLy8gVGhlIGA8c2VsZWN0b3JzPmAgY291bGQgYWN0dWFsbHkgYmUgYSBjb21tYSBzZXBhcmF0ZWQgbGlzdDogYDpob3N0LWNvbnRleHQoLm9uZSwgLnR3bylgLlxuICAgICAgICBjb25zdCBuZXdDb250ZXh0U2VsZWN0b3JzID1cbiAgICAgICAgICAgIChtYXRjaFsxXSA/PyAnJykudHJpbSgpLnNwbGl0KCcsJykubWFwKChtKSA9PiBtLnRyaW0oKSkuZmlsdGVyKChtKSA9PiBtICE9PSAnJyk7XG5cbiAgICAgICAgLy8gV2UgbXVzdCBkdXBsaWNhdGUgdGhlIGN1cnJlbnQgc2VsZWN0b3IgZ3JvdXAgZm9yIGVhY2ggb2YgdGhlc2UgbmV3IHNlbGVjdG9ycy5cbiAgICAgICAgLy8gRm9yIGV4YW1wbGUgaWYgdGhlIGN1cnJlbnQgZ3JvdXBzIGFyZTpcbiAgICAgICAgLy8gYGBgXG4gICAgICAgIC8vIFtcbiAgICAgICAgLy8gICBbJ2EnLCAnYicsICdjJ10sXG4gICAgICAgIC8vICAgWyd4JywgJ3knLCAneiddLFxuICAgICAgICAvLyBdXG4gICAgICAgIC8vIGBgYFxuICAgICAgICAvLyBBbmQgd2UgaGF2ZSBhIG5ldyBzZXQgb2YgY29tbWEgc2VwYXJhdGVkIHNlbGVjdG9yczogYDpob3N0LWNvbnRleHQobSxuKWAgdGhlbiB0aGUgbmV3XG4gICAgICAgIC8vIGdyb3VwcyBhcmU6XG4gICAgICAgIC8vIGBgYFxuICAgICAgICAvLyBbXG4gICAgICAgIC8vICAgWydhJywgJ2InLCAnYycsICdtJ10sXG4gICAgICAgIC8vICAgWyd4JywgJ3knLCAneicsICdtJ10sXG4gICAgICAgIC8vICAgWydhJywgJ2InLCAnYycsICduJ10sXG4gICAgICAgIC8vICAgWyd4JywgJ3knLCAneicsICduJ10sXG4gICAgICAgIC8vIF1cbiAgICAgICAgLy8gYGBgXG4gICAgICAgIGNvbnN0IGNvbnRleHRTZWxlY3Rvckdyb3Vwc0xlbmd0aCA9IGNvbnRleHRTZWxlY3Rvckdyb3Vwcy5sZW5ndGg7XG4gICAgICAgIHJlcGVhdEdyb3Vwcyhjb250ZXh0U2VsZWN0b3JHcm91cHMsIG5ld0NvbnRleHRTZWxlY3RvcnMubGVuZ3RoKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXdDb250ZXh0U2VsZWN0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBjb250ZXh0U2VsZWN0b3JHcm91cHNMZW5ndGg7IGorKykge1xuICAgICAgICAgICAgY29udGV4dFNlbGVjdG9yR3JvdXBzW2ogKyBpICogY29udGV4dFNlbGVjdG9yR3JvdXBzTGVuZ3RoXS5wdXNoKG5ld0NvbnRleHRTZWxlY3RvcnNbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgYHNlbGVjdG9yVGV4dGAgYW5kIHNlZSByZXBlYXQgdG8gc2VlIGlmIHRoZXJlIGFyZSBtb3JlIGA6aG9zdC1jb250ZXh0YHMuXG4gICAgICAgIHNlbGVjdG9yVGV4dCA9IG1hdGNoWzJdO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dCBzZWxlY3RvcnMgbm93IG11c3QgYmUgY29tYmluZWQgd2l0aCBlYWNoIG90aGVyIHRvIGNhcHR1cmUgYWxsIHRoZSBwb3NzaWJsZVxuICAgICAgLy8gc2VsZWN0b3JzIHRoYXQgYDpob3N0LWNvbnRleHRgIGNhbiBtYXRjaC4gU2VlIGBjb21iaW5lSG9zdENvbnRleHRTZWxlY3RvcnMoKWAgZm9yIG1vcmVcbiAgICAgIC8vIGluZm8gYWJvdXQgaG93IHRoaXMgaXMgZG9uZS5cbiAgICAgIHJldHVybiBjb250ZXh0U2VsZWN0b3JHcm91cHNcbiAgICAgICAgICAubWFwKChjb250ZXh0U2VsZWN0b3JzKSA9PiBjb21iaW5lSG9zdENvbnRleHRTZWxlY3RvcnMoY29udGV4dFNlbGVjdG9ycywgc2VsZWN0b3JUZXh0KSlcbiAgICAgICAgICAuam9pbignLCAnKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qXG4gICAqIENvbnZlcnQgY29tYmluYXRvcnMgbGlrZSA6OnNoYWRvdyBhbmQgcHNldWRvLWVsZW1lbnRzIGxpa2UgOjpjb250ZW50XG4gICAqIGJ5IHJlcGxhY2luZyB3aXRoIHNwYWNlLlxuICAgKi9cbiAgcHJpdmF0ZSBfY29udmVydFNoYWRvd0RPTVNlbGVjdG9ycyhjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBfc2hhZG93RE9NU2VsZWN0b3JzUmUucmVkdWNlKChyZXN1bHQsIHBhdHRlcm4pID0+IHJlc3VsdC5yZXBsYWNlKHBhdHRlcm4sICcgJyksIGNzc1RleHQpO1xuICB9XG5cbiAgLy8gY2hhbmdlIGEgc2VsZWN0b3IgbGlrZSAnZGl2JyB0byAnbmFtZSBkaXYnXG4gIHByaXZhdGUgX3Njb3BlU2VsZWN0b3JzKGNzc1RleHQ6IHN0cmluZywgc2NvcGVTZWxlY3Rvcjogc3RyaW5nLCBob3N0U2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHByb2Nlc3NSdWxlcyhjc3NUZXh0LCAocnVsZTogQ3NzUnVsZSkgPT4ge1xuICAgICAgbGV0IHNlbGVjdG9yID0gcnVsZS5zZWxlY3RvcjtcbiAgICAgIGxldCBjb250ZW50ID0gcnVsZS5jb250ZW50O1xuICAgICAgaWYgKHJ1bGUuc2VsZWN0b3JbMF0gIT09ICdAJykge1xuICAgICAgICBzZWxlY3RvciA9IHRoaXMuX3Njb3BlU2VsZWN0b3IocnVsZS5zZWxlY3Rvciwgc2NvcGVTZWxlY3RvciwgaG9zdFNlbGVjdG9yKTtcbiAgICAgIH0gZWxzZSBpZiAoc2NvcGVkQXRSdWxlSWRlbnRpZmllcnMuc29tZShhdFJ1bGUgPT4gcnVsZS5zZWxlY3Rvci5zdGFydHNXaXRoKGF0UnVsZSkpKSB7XG4gICAgICAgIGNvbnRlbnQgPSB0aGlzLl9zY29wZVNlbGVjdG9ycyhydWxlLmNvbnRlbnQsIHNjb3BlU2VsZWN0b3IsIGhvc3RTZWxlY3Rvcik7XG4gICAgICB9IGVsc2UgaWYgKHJ1bGUuc2VsZWN0b3Iuc3RhcnRzV2l0aCgnQGZvbnQtZmFjZScpIHx8IHJ1bGUuc2VsZWN0b3Iuc3RhcnRzV2l0aCgnQHBhZ2UnKSkge1xuICAgICAgICBjb250ZW50ID0gdGhpcy5fc3RyaXBTY29waW5nU2VsZWN0b3JzKHJ1bGUuY29udGVudCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IENzc1J1bGUoc2VsZWN0b3IsIGNvbnRlbnQpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBhIGNzcyB0ZXh0IHRoYXQgaXMgd2l0aGluIGEgcnVsZSB0aGF0IHNob3VsZCBub3QgY29udGFpbiBzY29wZSBzZWxlY3RvcnMgYnkgc2ltcGx5XG4gICAqIHJlbW92aW5nIHRoZW0hIEFuIGV4YW1wbGUgb2Ygc3VjaCBhIHJ1bGUgaXMgYEBmb250LWZhY2VgLlxuICAgKlxuICAgKiBgQGZvbnQtZmFjZWAgcnVsZXMgY2Fubm90IGNvbnRhaW4gbmVzdGVkIHNlbGVjdG9ycy4gTm9yIGNhbiB0aGV5IGJlIG5lc3RlZCB1bmRlciBhIHNlbGVjdG9yLlxuICAgKiBOb3JtYWxseSB0aGlzIHdvdWxkIGJlIGEgc3ludGF4IGVycm9yIGJ5IHRoZSBhdXRob3Igb2YgdGhlIHN0eWxlcy4gQnV0IGluIHNvbWUgcmFyZSBjYXNlcywgc3VjaFxuICAgKiBhcyBpbXBvcnRpbmcgc3R5bGVzIGZyb20gYSBsaWJyYXJ5LCBhbmQgYXBwbHlpbmcgYDpob3N0IDo6bmctZGVlcGAgdG8gdGhlIGltcG9ydGVkIHN0eWxlcywgd2VcbiAgICogY2FuIGVuZCB1cCB3aXRoIGJyb2tlbiBjc3MgaWYgdGhlIGltcG9ydGVkIHN0eWxlcyBoYXBwZW4gdG8gY29udGFpbiBAZm9udC1mYWNlIHJ1bGVzLlxuICAgKlxuICAgKiBGb3IgZXhhbXBsZTpcbiAgICpcbiAgICogYGBgXG4gICAqIDpob3N0IDo6bmctZGVlcCB7XG4gICAqICAgaW1wb3J0ICdzb21lL2xpYi9jb250YWluaW5nL2ZvbnQtZmFjZSc7XG4gICAqIH1cbiAgICpcbiAgICogU2ltaWxhciBsb2dpYyBhcHBsaWVzIHRvIGBAcGFnZWAgcnVsZXMgd2hpY2ggY2FuIGNvbnRhaW4gYSBwYXJ0aWN1bGFyIHNldCBvZiBwcm9wZXJ0aWVzLFxuICAgKiBhcyB3ZWxsIGFzIHNvbWUgc3BlY2lmaWMgYXQtcnVsZXMuIFNpbmNlIHRoZXkgY2FuJ3QgYmUgZW5jYXBzdWxhdGVkLCB3ZSBoYXZlIHRvIHN0cmlwXG4gICAqIGFueSBzY29waW5nIHNlbGVjdG9ycyBmcm9tIHRoZW0uIEZvciBtb3JlIGluZm9ybWF0aW9uOiBodHRwczovL3d3dy53My5vcmcvVFIvY3NzLXBhZ2UtM1xuICAgKiBgYGBcbiAgICovXG4gIHByaXZhdGUgX3N0cmlwU2NvcGluZ1NlbGVjdG9ycyhjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBwcm9jZXNzUnVsZXMoY3NzVGV4dCwgKHJ1bGUpID0+IHtcbiAgICAgIGNvbnN0IHNlbGVjdG9yID0gcnVsZS5zZWxlY3Rvci5yZXBsYWNlKF9zaGFkb3dEZWVwU2VsZWN0b3JzLCAnICcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZShfcG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yUmUsICcgJyk7XG4gICAgICByZXR1cm4gbmV3IENzc1J1bGUoc2VsZWN0b3IsIHJ1bGUuY29udGVudCk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9zY29wZVNlbGVjdG9yKHNlbGVjdG9yOiBzdHJpbmcsIHNjb3BlU2VsZWN0b3I6IHN0cmluZywgaG9zdFNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBzZWxlY3Rvci5zcGxpdCgnLCcpXG4gICAgICAgIC5tYXAoKHBhcnQpID0+IHBhcnQudHJpbSgpLnNwbGl0KF9zaGFkb3dEZWVwU2VsZWN0b3JzKSlcbiAgICAgICAgLm1hcCgoZGVlcFBhcnRzKSA9PiB7XG4gICAgICAgICAgY29uc3QgW3NoYWxsb3dQYXJ0LCAuLi5vdGhlclBhcnRzXSA9IGRlZXBQYXJ0cztcbiAgICAgICAgICBjb25zdCBhcHBseVNjb3BlID0gKHNoYWxsb3dQYXJ0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zZWxlY3Rvck5lZWRzU2NvcGluZyhzaGFsbG93UGFydCwgc2NvcGVTZWxlY3RvcikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2FwcGx5U2VsZWN0b3JTY29wZShzaGFsbG93UGFydCwgc2NvcGVTZWxlY3RvciwgaG9zdFNlbGVjdG9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiBzaGFsbG93UGFydDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIHJldHVybiBbYXBwbHlTY29wZShzaGFsbG93UGFydCksIC4uLm90aGVyUGFydHNdLmpvaW4oJyAnKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmpvaW4oJywgJyk7XG4gIH1cblxuICBwcml2YXRlIF9zZWxlY3Rvck5lZWRzU2NvcGluZyhzZWxlY3Rvcjogc3RyaW5nLCBzY29wZVNlbGVjdG9yOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCByZSA9IHRoaXMuX21ha2VTY29wZU1hdGNoZXIoc2NvcGVTZWxlY3Rvcik7XG4gICAgcmV0dXJuICFyZS50ZXN0KHNlbGVjdG9yKTtcbiAgfVxuXG4gIHByaXZhdGUgX21ha2VTY29wZU1hdGNoZXIoc2NvcGVTZWxlY3Rvcjogc3RyaW5nKTogUmVnRXhwIHtcbiAgICBjb25zdCBscmUgPSAvXFxbL2c7XG4gICAgY29uc3QgcnJlID0gL1xcXS9nO1xuICAgIHNjb3BlU2VsZWN0b3IgPSBzY29wZVNlbGVjdG9yLnJlcGxhY2UobHJlLCAnXFxcXFsnKS5yZXBsYWNlKHJyZSwgJ1xcXFxdJyk7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoJ14oJyArIHNjb3BlU2VsZWN0b3IgKyAnKScgKyBfc2VsZWN0b3JSZVN1ZmZpeCwgJ20nKTtcbiAgfVxuXG4gIC8vIHNjb3BlIHZpYSBuYW1lIGFuZCBbaXM9bmFtZV1cbiAgcHJpdmF0ZSBfYXBwbHlTaW1wbGVTZWxlY3RvclNjb3BlKHNlbGVjdG9yOiBzdHJpbmcsIHNjb3BlU2VsZWN0b3I6IHN0cmluZywgaG9zdFNlbGVjdG9yOiBzdHJpbmcpOlxuICAgICAgc3RyaW5nIHtcbiAgICAvLyBJbiBBbmRyb2lkIGJyb3dzZXIsIHRoZSBsYXN0SW5kZXggaXMgbm90IHJlc2V0IHdoZW4gdGhlIHJlZ2V4IGlzIHVzZWQgaW4gU3RyaW5nLnJlcGxhY2UoKVxuICAgIF9wb2x5ZmlsbEhvc3RSZS5sYXN0SW5kZXggPSAwO1xuICAgIGlmIChfcG9seWZpbGxIb3N0UmUudGVzdChzZWxlY3RvcikpIHtcbiAgICAgIGNvbnN0IHJlcGxhY2VCeSA9IGBbJHtob3N0U2VsZWN0b3J9XWA7XG4gICAgICByZXR1cm4gc2VsZWN0b3JcbiAgICAgICAgICAucmVwbGFjZShcbiAgICAgICAgICAgICAgX3BvbHlmaWxsSG9zdE5vQ29tYmluYXRvclJlLFxuICAgICAgICAgICAgICAoaG5jLCBzZWxlY3RvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3Rvci5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAvKFteOl0qKSg6KikoLiopLyxcbiAgICAgICAgICAgICAgICAgICAgKF86IHN0cmluZywgYmVmb3JlOiBzdHJpbmcsIGNvbG9uOiBzdHJpbmcsIGFmdGVyOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmVmb3JlICsgcmVwbGFjZUJ5ICsgY29sb24gKyBhZnRlcjtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgLnJlcGxhY2UoX3BvbHlmaWxsSG9zdFJlLCByZXBsYWNlQnkgKyAnICcpO1xuICAgIH1cblxuICAgIHJldHVybiBzY29wZVNlbGVjdG9yICsgJyAnICsgc2VsZWN0b3I7XG4gIH1cblxuICAvLyByZXR1cm4gYSBzZWxlY3RvciB3aXRoIFtuYW1lXSBzdWZmaXggb24gZWFjaCBzaW1wbGUgc2VsZWN0b3JcbiAgLy8gZS5nLiAuZm9vLmJhciA+IC56b3QgYmVjb21lcyAuZm9vW25hbWVdLmJhcltuYW1lXSA+IC56b3RbbmFtZV0gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfYXBwbHlTZWxlY3RvclNjb3BlKHNlbGVjdG9yOiBzdHJpbmcsIHNjb3BlU2VsZWN0b3I6IHN0cmluZywgaG9zdFNlbGVjdG9yOiBzdHJpbmcpOlxuICAgICAgc3RyaW5nIHtcbiAgICBjb25zdCBpc1JlID0gL1xcW2lzPShbXlxcXV0qKVxcXS9nO1xuICAgIHNjb3BlU2VsZWN0b3IgPSBzY29wZVNlbGVjdG9yLnJlcGxhY2UoaXNSZSwgKF86IHN0cmluZywgLi4ucGFydHM6IHN0cmluZ1tdKSA9PiBwYXJ0c1swXSk7XG5cbiAgICBjb25zdCBhdHRyTmFtZSA9ICdbJyArIHNjb3BlU2VsZWN0b3IgKyAnXSc7XG5cbiAgICBjb25zdCBfc2NvcGVTZWxlY3RvclBhcnQgPSAocDogc3RyaW5nKSA9PiB7XG4gICAgICBsZXQgc2NvcGVkUCA9IHAudHJpbSgpO1xuXG4gICAgICBpZiAoIXNjb3BlZFApIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICBpZiAocC5pbmRleE9mKF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IpID4gLTEpIHtcbiAgICAgICAgc2NvcGVkUCA9IHRoaXMuX2FwcGx5U2ltcGxlU2VsZWN0b3JTY29wZShwLCBzY29wZVNlbGVjdG9yLCBob3N0U2VsZWN0b3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcmVtb3ZlIDpob3N0IHNpbmNlIGl0IHNob3VsZCBiZSB1bm5lY2Vzc2FyeVxuICAgICAgICBjb25zdCB0ID0gcC5yZXBsYWNlKF9wb2x5ZmlsbEhvc3RSZSwgJycpO1xuICAgICAgICBpZiAodC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IHQubWF0Y2goLyhbXjpdKikoOiopKC4qKS8pO1xuICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICBzY29wZWRQID0gbWF0Y2hlc1sxXSArIGF0dHJOYW1lICsgbWF0Y2hlc1syXSArIG1hdGNoZXNbM107XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzY29wZWRQO1xuICAgIH07XG5cbiAgICBjb25zdCBzYWZlQ29udGVudCA9IG5ldyBTYWZlU2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgIHNlbGVjdG9yID0gc2FmZUNvbnRlbnQuY29udGVudCgpO1xuXG4gICAgbGV0IHNjb3BlZFNlbGVjdG9yID0gJyc7XG4gICAgbGV0IHN0YXJ0SW5kZXggPSAwO1xuICAgIGxldCByZXM6IFJlZ0V4cEV4ZWNBcnJheXxudWxsO1xuICAgIGNvbnN0IHNlcCA9IC8oIHw+fFxcK3x+KD8hPSkpXFxzKi9nO1xuXG4gICAgLy8gSWYgYSBzZWxlY3RvciBhcHBlYXJzIGJlZm9yZSA6aG9zdCBpdCBzaG91bGQgbm90IGJlIHNoaW1tZWQgYXMgaXRcbiAgICAvLyBtYXRjaGVzIG9uIGFuY2VzdG9yIGVsZW1lbnRzIGFuZCBub3Qgb24gZWxlbWVudHMgaW4gdGhlIGhvc3QncyBzaGFkb3dcbiAgICAvLyBgOmhvc3QtY29udGV4dChkaXYpYCBpcyB0cmFuc2Zvcm1lZCB0b1xuICAgIC8vIGAtc2hhZG93Y3NzaG9zdC1uby1jb21iaW5hdG9yZGl2LCBkaXYgLXNoYWRvd2Nzc2hvc3Qtbm8tY29tYmluYXRvcmBcbiAgICAvLyB0aGUgYGRpdmAgaXMgbm90IHBhcnQgb2YgdGhlIGNvbXBvbmVudCBpbiB0aGUgMm5kIHNlbGVjdG9ycyBhbmQgc2hvdWxkIG5vdCBiZSBzY29wZWQuXG4gICAgLy8gSGlzdG9yaWNhbGx5IGBjb21wb25lbnQtdGFnOmhvc3RgIHdhcyBtYXRjaGluZyB0aGUgY29tcG9uZW50IHNvIHdlIGFsc28gd2FudCB0byBwcmVzZXJ2ZVxuICAgIC8vIHRoaXMgYmVoYXZpb3IgdG8gYXZvaWQgYnJlYWtpbmcgbGVnYWN5IGFwcHMgKGl0IHNob3VsZCBub3QgbWF0Y2gpLlxuICAgIC8vIFRoZSBiZWhhdmlvciBzaG91bGQgYmU6XG4gICAgLy8gLSBgdGFnOmhvc3RgIC0+IGB0YWdbaF1gICh0aGlzIGlzIHRvIGF2b2lkIGJyZWFraW5nIGxlZ2FjeSBhcHBzLCBzaG91bGQgbm90IG1hdGNoIGFueXRoaW5nKVxuICAgIC8vIC0gYHRhZyA6aG9zdGAgLT4gYHRhZyBbaF1gIChgdGFnYCBpcyBub3Qgc2NvcGVkIGJlY2F1c2UgaXQncyBjb25zaWRlcmVkIHBhcnQgb2YgYVxuICAgIC8vICAgYDpob3N0LWNvbnRleHQodGFnKWApXG4gICAgY29uc3QgaGFzSG9zdCA9IHNlbGVjdG9yLmluZGV4T2YoX3BvbHlmaWxsSG9zdE5vQ29tYmluYXRvcikgPiAtMTtcbiAgICAvLyBPbmx5IHNjb3BlIHBhcnRzIGFmdGVyIHRoZSBmaXJzdCBgLXNoYWRvd2Nzc2hvc3Qtbm8tY29tYmluYXRvcmAgd2hlbiBpdCBpcyBwcmVzZW50XG4gICAgbGV0IHNob3VsZFNjb3BlID0gIWhhc0hvc3Q7XG5cbiAgICB3aGlsZSAoKHJlcyA9IHNlcC5leGVjKHNlbGVjdG9yKSkgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IHNlcGFyYXRvciA9IHJlc1sxXTtcbiAgICAgIGNvbnN0IHBhcnQgPSBzZWxlY3Rvci5zbGljZShzdGFydEluZGV4LCByZXMuaW5kZXgpLnRyaW0oKTtcblxuICAgICAgLy8gQSBzcGFjZSBmb2xsb3dpbmcgYW4gZXNjYXBlZCBoZXggdmFsdWUgYW5kIGZvbGxvd2VkIGJ5IGFub3RoZXIgaGV4IGNoYXJhY3RlclxuICAgICAgLy8gKGllOiBcIi5cXGZjIGJlclwiIGZvciBcIi7DvGJlclwiKSBpcyBub3QgYSBzZXBhcmF0b3IgYmV0d2VlbiAyIHNlbGVjdG9yc1xuICAgICAgLy8gYWxzbyBrZWVwIGluIG1pbmQgdGhhdCBiYWNrc2xhc2hlcyBhcmUgcmVwbGFjZWQgYnkgYSBwbGFjZWhvbGRlciBieSBTYWZlU2VsZWN0b3JcbiAgICAgIC8vIFRoZXNlIGVzY2FwZWQgc2VsZWN0b3JzIGhhcHBlbiBmb3IgZXhhbXBsZSB3aGVuIGVzYnVpbGQgcnVucyB3aXRoIG9wdGltaXphdGlvbi5taW5pZnkuXG4gICAgICBpZiAocGFydC5tYXRjaCgvX19lc2MtcGgtKFxcZCspX18vKSAmJiBzZWxlY3RvcltyZXMuaW5kZXggKyAxXT8ubWF0Y2goL1thLWZBLUZcXGRdLykpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHNob3VsZFNjb3BlID0gc2hvdWxkU2NvcGUgfHwgcGFydC5pbmRleE9mKF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IpID4gLTE7XG4gICAgICBjb25zdCBzY29wZWRQYXJ0ID0gc2hvdWxkU2NvcGUgPyBfc2NvcGVTZWxlY3RvclBhcnQocGFydCkgOiBwYXJ0O1xuICAgICAgc2NvcGVkU2VsZWN0b3IgKz0gYCR7c2NvcGVkUGFydH0gJHtzZXBhcmF0b3J9IGA7XG4gICAgICBzdGFydEluZGV4ID0gc2VwLmxhc3RJbmRleDtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJ0ID0gc2VsZWN0b3Iuc3Vic3RyaW5nKHN0YXJ0SW5kZXgpO1xuICAgIHNob3VsZFNjb3BlID0gc2hvdWxkU2NvcGUgfHwgcGFydC5pbmRleE9mKF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IpID4gLTE7XG4gICAgc2NvcGVkU2VsZWN0b3IgKz0gc2hvdWxkU2NvcGUgPyBfc2NvcGVTZWxlY3RvclBhcnQocGFydCkgOiBwYXJ0O1xuXG4gICAgLy8gcmVwbGFjZSB0aGUgcGxhY2Vob2xkZXJzIHdpdGggdGhlaXIgb3JpZ2luYWwgdmFsdWVzXG4gICAgcmV0dXJuIHNhZmVDb250ZW50LnJlc3RvcmUoc2NvcGVkU2VsZWN0b3IpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5zZXJ0UG9seWZpbGxIb3N0SW5Dc3NUZXh0KHNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBzZWxlY3Rvci5yZXBsYWNlKF9jb2xvbkhvc3RDb250ZXh0UmUsIF9wb2x5ZmlsbEhvc3RDb250ZXh0KVxuICAgICAgICAucmVwbGFjZShfY29sb25Ib3N0UmUsIF9wb2x5ZmlsbEhvc3QpO1xuICB9XG59XG5cbmNsYXNzIFNhZmVTZWxlY3RvciB7XG4gIHByaXZhdGUgcGxhY2Vob2xkZXJzOiBzdHJpbmdbXSA9IFtdO1xuICBwcml2YXRlIGluZGV4ID0gMDtcbiAgcHJpdmF0ZSBfY29udGVudDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHNlbGVjdG9yOiBzdHJpbmcpIHtcbiAgICAvLyBSZXBsYWNlcyBhdHRyaWJ1dGUgc2VsZWN0b3JzIHdpdGggcGxhY2Vob2xkZXJzLlxuICAgIC8vIFRoZSBXUyBpbiBbYXR0cj1cInZhIGx1ZVwiXSB3b3VsZCBvdGhlcndpc2UgYmUgaW50ZXJwcmV0ZWQgYXMgYSBzZWxlY3RvciBzZXBhcmF0b3IuXG4gICAgc2VsZWN0b3IgPSB0aGlzLl9lc2NhcGVSZWdleE1hdGNoZXMoc2VsZWN0b3IsIC8oXFxbW15cXF1dKlxcXSkvZyk7XG5cbiAgICAvLyBDU1MgYWxsb3dzIGZvciBjZXJ0YWluIHNwZWNpYWwgY2hhcmFjdGVycyB0byBiZSB1c2VkIGluIHNlbGVjdG9ycyBpZiB0aGV5J3JlIGVzY2FwZWQuXG4gICAgLy8gRS5nLiBgLmZvbzpibHVlYCB3b24ndCBtYXRjaCBhIGNsYXNzIGNhbGxlZCBgZm9vOmJsdWVgLCBiZWNhdXNlIHRoZSBjb2xvbiBkZW5vdGVzIGFcbiAgICAvLyBwc2V1ZG8tY2xhc3MsIGJ1dCB3cml0aW5nIGAuZm9vXFw6Ymx1ZWAgd2lsbCBtYXRjaCwgYmVjYXVzZSB0aGUgY29sb24gd2FzIGVzY2FwZWQuXG4gICAgLy8gUmVwbGFjZSBhbGwgZXNjYXBlIHNlcXVlbmNlcyAoYFxcYCBmb2xsb3dlZCBieSBhIGNoYXJhY3Rlcikgd2l0aCBhIHBsYWNlaG9sZGVyIHNvXG4gICAgLy8gdGhhdCBvdXIgaGFuZGxpbmcgb2YgcHNldWRvLXNlbGVjdG9ycyBkb2Vzbid0IG1lc3Mgd2l0aCB0aGVtLlxuICAgIC8vIEVzY2FwZWQgY2hhcmFjdGVycyBoYXZlIGEgc3BlY2lmaWMgcGxhY2Vob2xkZXIgc28gdGhleSBjYW4gYmUgZGV0ZWN0ZWQgc2VwYXJhdGVseS5cbiAgICBzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoLyhcXFxcLikvZywgKF8sIGtlZXApID0+IHtcbiAgICAgIGNvbnN0IHJlcGxhY2VCeSA9IGBfX2VzYy1waC0ke3RoaXMuaW5kZXh9X19gO1xuICAgICAgdGhpcy5wbGFjZWhvbGRlcnMucHVzaChrZWVwKTtcbiAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgIHJldHVybiByZXBsYWNlQnk7XG4gICAgfSk7XG5cbiAgICAvLyBSZXBsYWNlcyB0aGUgZXhwcmVzc2lvbiBpbiBgOm50aC1jaGlsZCgybiArIDEpYCB3aXRoIGEgcGxhY2Vob2xkZXIuXG4gICAgLy8gV1MgYW5kIFwiK1wiIHdvdWxkIG90aGVyd2lzZSBiZSBpbnRlcnByZXRlZCBhcyBzZWxlY3RvciBzZXBhcmF0b3JzLlxuICAgIHRoaXMuX2NvbnRlbnQgPSBzZWxlY3Rvci5yZXBsYWNlKC8oOm50aC1bLVxcd10rKShcXChbXildK1xcKSkvZywgKF8sIHBzZXVkbywgZXhwKSA9PiB7XG4gICAgICBjb25zdCByZXBsYWNlQnkgPSBgX19waC0ke3RoaXMuaW5kZXh9X19gO1xuICAgICAgdGhpcy5wbGFjZWhvbGRlcnMucHVzaChleHApO1xuICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgcmV0dXJuIHBzZXVkbyArIHJlcGxhY2VCeTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlc3RvcmUoY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gY29udGVudC5yZXBsYWNlKC9fXyg/OnBofGVzYy1waCktKFxcZCspX18vZywgKF9waCwgaW5kZXgpID0+IHRoaXMucGxhY2Vob2xkZXJzWytpbmRleF0pO1xuICB9XG5cbiAgY29udGVudCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jb250ZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcGxhY2VzIGFsbCBvZiB0aGUgc3Vic3RyaW5ncyB0aGF0IG1hdGNoIGEgcmVnZXggd2l0aGluIGFcbiAgICogc3BlY2lhbCBzdHJpbmcgKGUuZy4gYF9fcGgtMF9fYCwgYF9fcGgtMV9fYCwgZXRjKS5cbiAgICovXG4gIHByaXZhdGUgX2VzY2FwZVJlZ2V4TWF0Y2hlcyhjb250ZW50OiBzdHJpbmcsIHBhdHRlcm46IFJlZ0V4cCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGNvbnRlbnQucmVwbGFjZShwYXR0ZXJuLCAoXywga2VlcCkgPT4ge1xuICAgICAgY29uc3QgcmVwbGFjZUJ5ID0gYF9fcGgtJHt0aGlzLmluZGV4fV9fYDtcbiAgICAgIHRoaXMucGxhY2Vob2xkZXJzLnB1c2goa2VlcCk7XG4gICAgICB0aGlzLmluZGV4Kys7XG4gICAgICByZXR1cm4gcmVwbGFjZUJ5O1xuICAgIH0pO1xuICB9XG59XG5cbmNvbnN0IF9jc3NDb250ZW50TmV4dFNlbGVjdG9yUmUgPVxuICAgIC9wb2x5ZmlsbC1uZXh0LXNlbGVjdG9yW159XSpjb250ZW50OltcXHNdKj8oWydcIl0pKC4qPylcXDFbO1xcc10qfShbXntdKj8pey9naW07XG5jb25zdCBfY3NzQ29udGVudFJ1bGVSZSA9IC8ocG9seWZpbGwtcnVsZSlbXn1dKihjb250ZW50OltcXHNdKihbJ1wiXSkoLio/KVxcMylbO1xcc10qW159XSp9L2dpbTtcbmNvbnN0IF9jc3NDb250ZW50VW5zY29wZWRSdWxlUmUgPVxuICAgIC8ocG9seWZpbGwtdW5zY29wZWQtcnVsZSlbXn1dKihjb250ZW50OltcXHNdKihbJ1wiXSkoLio/KVxcMylbO1xcc10qW159XSp9L2dpbTtcbmNvbnN0IF9wb2x5ZmlsbEhvc3QgPSAnLXNoYWRvd2Nzc2hvc3QnO1xuLy8gbm90ZTogOmhvc3QtY29udGV4dCBwcmUtcHJvY2Vzc2VkIHRvIC1zaGFkb3djc3Nob3N0Y29udGV4dC5cbmNvbnN0IF9wb2x5ZmlsbEhvc3RDb250ZXh0ID0gJy1zaGFkb3djc3Njb250ZXh0JztcbmNvbnN0IF9wYXJlblN1ZmZpeCA9ICcoPzpcXFxcKCgnICtcbiAgICAnKD86XFxcXChbXikoXSpcXFxcKXxbXikoXSopKz8nICtcbiAgICAnKVxcXFwpKT8oW14se10qKSc7XG5jb25zdCBfY3NzQ29sb25Ib3N0UmUgPSBuZXcgUmVnRXhwKF9wb2x5ZmlsbEhvc3QgKyBfcGFyZW5TdWZmaXgsICdnaW0nKTtcbmNvbnN0IF9jc3NDb2xvbkhvc3RDb250ZXh0UmVHbG9iYWwgPSBuZXcgUmVnRXhwKF9wb2x5ZmlsbEhvc3RDb250ZXh0ICsgX3BhcmVuU3VmZml4LCAnZ2ltJyk7XG5jb25zdCBfY3NzQ29sb25Ib3N0Q29udGV4dFJlID0gbmV3IFJlZ0V4cChfcG9seWZpbGxIb3N0Q29udGV4dCArIF9wYXJlblN1ZmZpeCwgJ2ltJyk7XG5jb25zdCBfcG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yID0gX3BvbHlmaWxsSG9zdCArICctbm8tY29tYmluYXRvcic7XG5jb25zdCBfcG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yUmUgPSAvLXNoYWRvd2Nzc2hvc3Qtbm8tY29tYmluYXRvcihbXlxcc10qKS87XG5jb25zdCBfc2hhZG93RE9NU2VsZWN0b3JzUmUgPSBbXG4gIC86OnNoYWRvdy9nLFxuICAvOjpjb250ZW50L2csXG4gIC8vIERlcHJlY2F0ZWQgc2VsZWN0b3JzXG4gIC9cXC9zaGFkb3ctZGVlcFxcLy9nLFxuICAvXFwvc2hhZG93XFwvL2csXG5dO1xuXG4vLyBUaGUgZGVlcCBjb21iaW5hdG9yIGlzIGRlcHJlY2F0ZWQgaW4gdGhlIENTUyBzcGVjXG4vLyBTdXBwb3J0IGZvciBgPj4+YCwgYGRlZXBgLCBgOjpuZy1kZWVwYCBpcyB0aGVuIGFsc28gZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBmdXR1cmUuXG4vLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9wdWxsLzE3Njc3XG5jb25zdCBfc2hhZG93RGVlcFNlbGVjdG9ycyA9IC8oPzo+Pj4pfCg/OlxcL2RlZXBcXC8pfCg/Ojo6bmctZGVlcCkvZztcbmNvbnN0IF9zZWxlY3RvclJlU3VmZml4ID0gJyhbPlxcXFxzfitbLix7Ol1bXFxcXHNcXFxcU10qKT8kJztcbmNvbnN0IF9wb2x5ZmlsbEhvc3RSZSA9IC8tc2hhZG93Y3NzaG9zdC9naW07XG5jb25zdCBfY29sb25Ib3N0UmUgPSAvOmhvc3QvZ2ltO1xuY29uc3QgX2NvbG9uSG9zdENvbnRleHRSZSA9IC86aG9zdC1jb250ZXh0L2dpbTtcblxuY29uc3QgX25ld0xpbmVzUmUgPSAvXFxyP1xcbi9nO1xuY29uc3QgX2NvbW1lbnRSZSA9IC9cXC9cXCpbXFxzXFxTXSo/XFwqXFwvL2c7XG5jb25zdCBfY29tbWVudFdpdGhIYXNoUmUgPSAvXFwvXFwqXFxzKiNcXHMqc291cmNlKE1hcHBpbmcpP1VSTD0vZztcbmNvbnN0IENPTU1FTlRfUExBQ0VIT0xERVIgPSAnJUNPTU1FTlQlJztcbmNvbnN0IF9jb21tZW50V2l0aEhhc2hQbGFjZUhvbGRlclJlID0gbmV3IFJlZ0V4cChDT01NRU5UX1BMQUNFSE9MREVSLCAnZycpO1xuXG5jb25zdCBCTE9DS19QTEFDRUhPTERFUiA9ICclQkxPQ0slJztcbmNvbnN0IF9ydWxlUmUgPSBuZXcgUmVnRXhwKFxuICAgIGAoXFxcXHMqKD86JHtDT01NRU5UX1BMQUNFSE9MREVSfVxcXFxzKikqKShbXjtcXFxce1xcXFx9XSs/KShcXFxccyopKCg/OnslQkxPQ0slfT9cXFxccyo7Pyl8KD86XFxcXHMqOykpYCxcbiAgICAnZycpO1xuY29uc3QgQ09OVEVOVF9QQUlSUyA9IG5ldyBNYXAoW1sneycsICd9J11dKTtcblxuY29uc3QgQ09NTUFfSU5fUExBQ0VIT0xERVIgPSAnJUNPTU1BX0lOX1BMQUNFSE9MREVSJSc7XG5jb25zdCBTRU1JX0lOX1BMQUNFSE9MREVSID0gJyVTRU1JX0lOX1BMQUNFSE9MREVSJSc7XG5jb25zdCBDT0xPTl9JTl9QTEFDRUhPTERFUiA9ICclQ09MT05fSU5fUExBQ0VIT0xERVIlJztcblxuY29uc3QgX2Nzc0NvbW1hSW5QbGFjZWhvbGRlclJlR2xvYmFsID0gbmV3IFJlZ0V4cChDT01NQV9JTl9QTEFDRUhPTERFUiwgJ2cnKTtcbmNvbnN0IF9jc3NTZW1pSW5QbGFjZWhvbGRlclJlR2xvYmFsID0gbmV3IFJlZ0V4cChTRU1JX0lOX1BMQUNFSE9MREVSLCAnZycpO1xuY29uc3QgX2Nzc0NvbG9uSW5QbGFjZWhvbGRlclJlR2xvYmFsID0gbmV3IFJlZ0V4cChDT0xPTl9JTl9QTEFDRUhPTERFUiwgJ2cnKTtcblxuZXhwb3J0IGNsYXNzIENzc1J1bGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc2VsZWN0b3I6IHN0cmluZywgcHVibGljIGNvbnRlbnQ6IHN0cmluZykge31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NSdWxlcyhpbnB1dDogc3RyaW5nLCBydWxlQ2FsbGJhY2s6IChydWxlOiBDc3NSdWxlKSA9PiBDc3NSdWxlKTogc3RyaW5nIHtcbiAgY29uc3QgZXNjYXBlZCA9IGVzY2FwZUluU3RyaW5ncyhpbnB1dCk7XG4gIGNvbnN0IGlucHV0V2l0aEVzY2FwZWRCbG9ja3MgPSBlc2NhcGVCbG9ja3MoZXNjYXBlZCwgQ09OVEVOVF9QQUlSUywgQkxPQ0tfUExBQ0VIT0xERVIpO1xuICBsZXQgbmV4dEJsb2NrSW5kZXggPSAwO1xuICBjb25zdCBlc2NhcGVkUmVzdWx0ID0gaW5wdXRXaXRoRXNjYXBlZEJsb2Nrcy5lc2NhcGVkU3RyaW5nLnJlcGxhY2UoX3J1bGVSZSwgKC4uLm06IHN0cmluZ1tdKSA9PiB7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBtWzJdO1xuICAgIGxldCBjb250ZW50ID0gJyc7XG4gICAgbGV0IHN1ZmZpeCA9IG1bNF07XG4gICAgbGV0IGNvbnRlbnRQcmVmaXggPSAnJztcbiAgICBpZiAoc3VmZml4ICYmIHN1ZmZpeC5zdGFydHNXaXRoKCd7JyArIEJMT0NLX1BMQUNFSE9MREVSKSkge1xuICAgICAgY29udGVudCA9IGlucHV0V2l0aEVzY2FwZWRCbG9ja3MuYmxvY2tzW25leHRCbG9ja0luZGV4KytdO1xuICAgICAgc3VmZml4ID0gc3VmZml4LnN1YnN0cmluZyhCTE9DS19QTEFDRUhPTERFUi5sZW5ndGggKyAxKTtcbiAgICAgIGNvbnRlbnRQcmVmaXggPSAneyc7XG4gICAgfVxuICAgIGNvbnN0IHJ1bGUgPSBydWxlQ2FsbGJhY2sobmV3IENzc1J1bGUoc2VsZWN0b3IsIGNvbnRlbnQpKTtcbiAgICByZXR1cm4gYCR7bVsxXX0ke3J1bGUuc2VsZWN0b3J9JHttWzNdfSR7Y29udGVudFByZWZpeH0ke3J1bGUuY29udGVudH0ke3N1ZmZpeH1gO1xuICB9KTtcbiAgcmV0dXJuIHVuZXNjYXBlSW5TdHJpbmdzKGVzY2FwZWRSZXN1bHQpO1xufVxuXG5jbGFzcyBTdHJpbmdXaXRoRXNjYXBlZEJsb2NrcyB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlc2NhcGVkU3RyaW5nOiBzdHJpbmcsIHB1YmxpYyBibG9ja3M6IHN0cmluZ1tdKSB7fVxufVxuXG5mdW5jdGlvbiBlc2NhcGVCbG9ja3MoXG4gICAgaW5wdXQ6IHN0cmluZywgY2hhclBhaXJzOiBNYXA8c3RyaW5nLCBzdHJpbmc+LCBwbGFjZWhvbGRlcjogc3RyaW5nKTogU3RyaW5nV2l0aEVzY2FwZWRCbG9ja3Mge1xuICBjb25zdCByZXN1bHRQYXJ0czogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgZXNjYXBlZEJsb2Nrczogc3RyaW5nW10gPSBbXTtcbiAgbGV0IG9wZW5DaGFyQ291bnQgPSAwO1xuICBsZXQgbm9uQmxvY2tTdGFydEluZGV4ID0gMDtcbiAgbGV0IGJsb2NrU3RhcnRJbmRleCA9IC0xO1xuICBsZXQgb3BlbkNoYXI6IHN0cmluZ3x1bmRlZmluZWQ7XG4gIGxldCBjbG9zZUNoYXI6IHN0cmluZ3x1bmRlZmluZWQ7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dC5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGNoYXIgPSBpbnB1dFtpXTtcbiAgICBpZiAoY2hhciA9PT0gJ1xcXFwnKSB7XG4gICAgICBpKys7XG4gICAgfSBlbHNlIGlmIChjaGFyID09PSBjbG9zZUNoYXIpIHtcbiAgICAgIG9wZW5DaGFyQ291bnQtLTtcbiAgICAgIGlmIChvcGVuQ2hhckNvdW50ID09PSAwKSB7XG4gICAgICAgIGVzY2FwZWRCbG9ja3MucHVzaChpbnB1dC5zdWJzdHJpbmcoYmxvY2tTdGFydEluZGV4LCBpKSk7XG4gICAgICAgIHJlc3VsdFBhcnRzLnB1c2gocGxhY2Vob2xkZXIpO1xuICAgICAgICBub25CbG9ja1N0YXJ0SW5kZXggPSBpO1xuICAgICAgICBibG9ja1N0YXJ0SW5kZXggPSAtMTtcbiAgICAgICAgb3BlbkNoYXIgPSBjbG9zZUNoYXIgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjaGFyID09PSBvcGVuQ2hhcikge1xuICAgICAgb3BlbkNoYXJDb3VudCsrO1xuICAgIH0gZWxzZSBpZiAob3BlbkNoYXJDb3VudCA9PT0gMCAmJiBjaGFyUGFpcnMuaGFzKGNoYXIpKSB7XG4gICAgICBvcGVuQ2hhciA9IGNoYXI7XG4gICAgICBjbG9zZUNoYXIgPSBjaGFyUGFpcnMuZ2V0KGNoYXIpO1xuICAgICAgb3BlbkNoYXJDb3VudCA9IDE7XG4gICAgICBibG9ja1N0YXJ0SW5kZXggPSBpICsgMTtcbiAgICAgIHJlc3VsdFBhcnRzLnB1c2goaW5wdXQuc3Vic3RyaW5nKG5vbkJsb2NrU3RhcnRJbmRleCwgYmxvY2tTdGFydEluZGV4KSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKGJsb2NrU3RhcnRJbmRleCAhPT0gLTEpIHtcbiAgICBlc2NhcGVkQmxvY2tzLnB1c2goaW5wdXQuc3Vic3RyaW5nKGJsb2NrU3RhcnRJbmRleCkpO1xuICAgIHJlc3VsdFBhcnRzLnB1c2gocGxhY2Vob2xkZXIpO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdFBhcnRzLnB1c2goaW5wdXQuc3Vic3RyaW5nKG5vbkJsb2NrU3RhcnRJbmRleCkpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBTdHJpbmdXaXRoRXNjYXBlZEJsb2NrcyhyZXN1bHRQYXJ0cy5qb2luKCcnKSwgZXNjYXBlZEJsb2Nrcyk7XG59XG5cbi8qKlxuICogT2JqZWN0IGNvbnRhaW5pbmcgYXMga2V5cyBjaGFyYWN0ZXJzIHRoYXQgc2hvdWxkIGJlIHN1YnN0aXR1dGVkIGJ5IHBsYWNlaG9sZGVyc1xuICogd2hlbiBmb3VuZCBpbiBzdHJpbmdzIGR1cmluZyB0aGUgY3NzIHRleHQgcGFyc2luZywgYW5kIGFzIHZhbHVlcyB0aGUgcmVzcGVjdGl2ZVxuICogcGxhY2Vob2xkZXJzXG4gKi9cbmNvbnN0IEVTQ0FQRV9JTl9TVFJJTkdfTUFQOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgJzsnOiBTRU1JX0lOX1BMQUNFSE9MREVSLFxuICAnLCc6IENPTU1BX0lOX1BMQUNFSE9MREVSLFxuICAnOic6IENPTE9OX0lOX1BMQUNFSE9MREVSXG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBwcm92aWRlZCBjc3MgdGV4dCBhbmQgaW5zaWRlIHN0cmluZ3MgKG1lYW5pbmcsIGluc2lkZSBwYWlycyBvZiB1bmVzY2FwZWQgc2luZ2xlIG9yXG4gKiBkb3VibGUgcXVvdGVzKSByZXBsYWNlIHNwZWNpZmljIGNoYXJhY3RlcnMgd2l0aCB0aGVpciByZXNwZWN0aXZlIHBsYWNlaG9sZGVycyBhcyBpbmRpY2F0ZWRcbiAqIGJ5IHRoZSBgRVNDQVBFX0lOX1NUUklOR19NQVBgIG1hcC5cbiAqXG4gKiBGb3IgZXhhbXBsZSBjb252ZXJ0IHRoZSB0ZXh0XG4gKiAgYGFuaW1hdGlvbjogXCJteS1hbmltOmF0XFxcImlvblwiIDFzO2BcbiAqIHRvXG4gKiAgYGFuaW1hdGlvbjogXCJteS1hbmltJUNPTE9OX0lOX1BMQUNFSE9MREVSJWF0XFxcImlvblwiIDFzO2BcbiAqXG4gKiBUaGlzIGlzIG5lY2Vzc2FyeSBpbiBvcmRlciB0byByZW1vdmUgdGhlIG1lYW5pbmcgb2Ygc29tZSBjaGFyYWN0ZXJzIHdoZW4gZm91bmQgaW5zaWRlIHN0cmluZ3NcbiAqIChmb3IgZXhhbXBsZSBgO2AgaW5kaWNhdGVzIHRoZSBlbmQgb2YgYSBjc3MgZGVjbGFyYXRpb24sIGAsYCB0aGUgc2VxdWVuY2Ugb2YgdmFsdWVzIGFuZCBgOmAgdGhlXG4gKiBkaXZpc2lvbiBiZXR3ZWVuIHByb3BlcnR5IGFuZCB2YWx1ZSBkdXJpbmcgYSBkZWNsYXJhdGlvbiwgbm9uZSBvZiB0aGVzZSBtZWFuaW5ncyBhcHBseSB3aGVuIHN1Y2hcbiAqIGNoYXJhY3RlcnMgYXJlIHdpdGhpbiBzdHJpbmdzIGFuZCBzbyBpbiBvcmRlciB0byBwcmV2ZW50IHBhcnNpbmcgaXNzdWVzIHRoZXkgbmVlZCB0byBiZSByZXBsYWNlZFxuICogd2l0aCBwbGFjZWhvbGRlciB0ZXh0IGZvciB0aGUgZHVyYXRpb24gb2YgdGhlIGNzcyBtYW5pcHVsYXRpb24gcHJvY2VzcykuXG4gKlxuICogQHBhcmFtIGlucHV0IHRoZSBvcmlnaW5hbCBjc3MgdGV4dC5cbiAqXG4gKiBAcmV0dXJucyB0aGUgY3NzIHRleHQgd2l0aCBzcGVjaWZpYyBjaGFyYWN0ZXJzIGluIHN0cmluZ3MgcmVwbGFjZWQgYnkgcGxhY2Vob2xkZXJzLlxuICoqL1xuZnVuY3Rpb24gZXNjYXBlSW5TdHJpbmdzKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgcmVzdWx0ID0gaW5wdXQ7XG4gIGxldCBjdXJyZW50UXVvdGVDaGFyOiBzdHJpbmd8bnVsbCA9IG51bGw7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0Lmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgY2hhciA9IHJlc3VsdFtpXTtcbiAgICBpZiAoY2hhciA9PT0gJ1xcXFwnKSB7XG4gICAgICBpKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChjdXJyZW50UXVvdGVDaGFyICE9PSBudWxsKSB7XG4gICAgICAgIC8vIGluZGV4IGkgaXMgaW5zaWRlIGEgcXVvdGVkIHN1Yi1zdHJpbmdcbiAgICAgICAgaWYgKGNoYXIgPT09IGN1cnJlbnRRdW90ZUNoYXIpIHtcbiAgICAgICAgICBjdXJyZW50UXVvdGVDaGFyID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBwbGFjZWhvbGRlcjogc3RyaW5nfHVuZGVmaW5lZCA9IEVTQ0FQRV9JTl9TVFJJTkdfTUFQW2NoYXJdO1xuICAgICAgICAgIGlmIChwbGFjZWhvbGRlcikge1xuICAgICAgICAgICAgcmVzdWx0ID0gYCR7cmVzdWx0LnN1YnN0cigwLCBpKX0ke3BsYWNlaG9sZGVyfSR7cmVzdWx0LnN1YnN0cihpICsgMSl9YDtcbiAgICAgICAgICAgIGkgKz0gcGxhY2Vob2xkZXIubGVuZ3RoIC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gJ1xcJycgfHwgY2hhciA9PT0gJ1wiJykge1xuICAgICAgICBjdXJyZW50UXVvdGVDaGFyID0gY2hhcjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBSZXBsYWNlIGluIGEgc3RyaW5nIGFsbCBvY2N1cnJlbmNlcyBvZiBrZXlzIGluIHRoZSBgRVNDQVBFX0lOX1NUUklOR19NQVBgIG1hcCB3aXRoIHRoZWlyXG4gKiBvcmlnaW5hbCByZXByZXNlbnRhdGlvbiwgdGhpcyBpcyBzaW1wbHkgdXNlZCB0byByZXZlcnQgdGhlIGNoYW5nZXMgYXBwbGllZCBieSB0aGVcbiAqIGVzY2FwZUluU3RyaW5ncyBmdW5jdGlvbi5cbiAqXG4gKiBGb3IgZXhhbXBsZSBpdCByZXZlcnRzIHRoZSB0ZXh0OlxuICogIGBhbmltYXRpb246IFwibXktYW5pbSVDT0xPTl9JTl9QTEFDRUhPTERFUiVhdFxcXCJpb25cIiAxcztgXG4gKiB0byBpdCdzIG9yaWdpbmFsIGZvcm0gb2Y6XG4gKiAgYGFuaW1hdGlvbjogXCJteS1hbmltOmF0XFxcImlvblwiIDFzO2BcbiAqXG4gKiBOb3RlOiBGb3IgdGhlIHNha2Ugb2Ygc2ltcGxpY2l0eSB0aGlzIGZ1bmN0aW9uIGRvZXMgbm90IGNoZWNrIHRoYXQgdGhlIHBsYWNlaG9sZGVycyBhcmVcbiAqIGFjdHVhbGx5IGluc2lkZSBzdHJpbmdzIGFzIGl0IHdvdWxkIGFueXdheSBiZSBleHRyZW1lbHkgdW5saWtlbHkgdG8gZmluZCB0aGVtIG91dHNpZGUgb2Ygc3RyaW5ncy5cbiAqXG4gKiBAcGFyYW0gaW5wdXQgdGhlIGNzcyB0ZXh0IGNvbnRhaW5pbmcgdGhlIHBsYWNlaG9sZGVycy5cbiAqXG4gKiBAcmV0dXJucyB0aGUgY3NzIHRleHQgd2l0aG91dCB0aGUgcGxhY2Vob2xkZXJzLlxuICovXG5mdW5jdGlvbiB1bmVzY2FwZUluU3RyaW5ncyhpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IHJlc3VsdCA9IGlucHV0LnJlcGxhY2UoX2Nzc0NvbW1hSW5QbGFjZWhvbGRlclJlR2xvYmFsLCAnLCcpO1xuICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShfY3NzU2VtaUluUGxhY2Vob2xkZXJSZUdsb2JhbCwgJzsnKTtcbiAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoX2Nzc0NvbG9uSW5QbGFjZWhvbGRlclJlR2xvYmFsLCAnOicpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFVuZXNjYXBlIGFsbCBxdW90ZXMgcHJlc2VudCBpbiBhIHN0cmluZywgYnV0IG9ubHkgaWYgdGhlIHN0cmluZyB3YXMgYWN0dWFsbHkgYWxyZWFkeVxuICogcXVvdGVkLlxuICpcbiAqIFRoaXMgZ2VuZXJhdGVzIGEgXCJjYW5vbmljYWxcIiByZXByZXNlbnRhdGlvbiBvZiBzdHJpbmdzIHdoaWNoIGNhbiBiZSB1c2VkIHRvIG1hdGNoIHN0cmluZ3NcbiAqIHdoaWNoIHdvdWxkIG90aGVyd2lzZSBvbmx5IGRpZmZlciBiZWNhdXNlIG9mIGRpZmZlcmVudGx5IGVzY2FwZWQgcXVvdGVzLlxuICpcbiAqIEZvciBleGFtcGxlIGl0IGNvbnZlcnRzIHRoZSBzdHJpbmcgKGFzc3VtZWQgdG8gYmUgcXVvdGVkKTpcbiAqICBgdGhpcyBcXFxcXCJpc1xcXFxcIiBhIFxcXFwnXFxcXFxcXFwndGVzdGBcbiAqIHRvOlxuICogIGB0aGlzIFwiaXNcIiBhICdcXFxcXFxcXCd0ZXN0YFxuICogKG5vdGUgdGhhdCB0aGUgbGF0dGVyIGJhY2tzbGFzaGVzIGFyZSBub3QgcmVtb3ZlZCBhcyB0aGV5IGFyZSBub3QgYWN0dWFsbHkgZXNjYXBpbmcgdGhlIHNpbmdsZVxuICogcXVvdGUpXG4gKlxuICpcbiAqIEBwYXJhbSBpbnB1dCB0aGUgc3RyaW5nIHBvc3NpYmx5IGNvbnRhaW5pbmcgZXNjYXBlZCBxdW90ZXMuXG4gKiBAcGFyYW0gaXNRdW90ZWQgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIHN0cmluZyB3YXMgcXVvdGVkIGluc2lkZSBhIGJpZ2dlciBzdHJpbmcgKGlmIG5vdFxuICogdGhlbiBpdCBtZWFucyB0aGF0IGl0IGRvZXNuJ3QgcmVwcmVzZW50IGFuIGlubmVyIHN0cmluZyBhbmQgdGh1cyBubyB1bmVzY2FwaW5nIGlzIHJlcXVpcmVkKVxuICpcbiAqIEByZXR1cm5zIHRoZSBzdHJpbmcgaW4gdGhlIFwiY2Fub25pY2FsXCIgcmVwcmVzZW50YXRpb24gd2l0aG91dCBlc2NhcGVkIHF1b3Rlcy5cbiAqL1xuZnVuY3Rpb24gdW5lc2NhcGVRdW90ZXMoc3RyOiBzdHJpbmcsIGlzUXVvdGVkOiBib29sZWFuKTogc3RyaW5nIHtcbiAgcmV0dXJuICFpc1F1b3RlZCA/IHN0ciA6IHN0ci5yZXBsYWNlKC8oKD86XnxbXlxcXFxdKSg/OlxcXFxcXFxcKSopXFxcXCg/PVsnXCJdKS9nLCAnJDEnKTtcbn1cblxuLyoqXG4gKiBDb21iaW5lIHRoZSBgY29udGV4dFNlbGVjdG9yc2Agd2l0aCB0aGUgYGhvc3RNYXJrZXJgIGFuZCB0aGUgYG90aGVyU2VsZWN0b3JzYFxuICogdG8gY3JlYXRlIGEgc2VsZWN0b3IgdGhhdCBtYXRjaGVzIHRoZSBzYW1lIGFzIGA6aG9zdC1jb250ZXh0KClgLlxuICpcbiAqIEdpdmVuIGEgc2luZ2xlIGNvbnRleHQgc2VsZWN0b3IgYEFgIHdlIG5lZWQgdG8gb3V0cHV0IHNlbGVjdG9ycyB0aGF0IG1hdGNoIG9uIHRoZSBob3N0IGFuZCBhcyBhblxuICogYW5jZXN0b3Igb2YgdGhlIGhvc3Q6XG4gKlxuICogYGBgXG4gKiBBIDxob3N0TWFya2VyPiwgQTxob3N0TWFya2VyPiB7fVxuICogYGBgXG4gKlxuICogV2hlbiB0aGVyZSBpcyBtb3JlIHRoYW4gb25lIGNvbnRleHQgc2VsZWN0b3Igd2UgYWxzbyBoYXZlIHRvIGNyZWF0ZSBjb21iaW5hdGlvbnMgb2YgdGhvc2VcbiAqIHNlbGVjdG9ycyB3aXRoIGVhY2ggb3RoZXIuIEZvciBleGFtcGxlIGlmIHRoZXJlIGFyZSBgQWAgYW5kIGBCYCBzZWxlY3RvcnMgdGhlIG91dHB1dCBpczpcbiAqXG4gKiBgYGBcbiAqIEFCPGhvc3RNYXJrZXI+LCBBQiA8aG9zdE1hcmtlcj4sIEEgQjxob3N0TWFya2VyPixcbiAqIEIgQTxob3N0TWFya2VyPiwgQSBCIDxob3N0TWFya2VyPiwgQiBBIDxob3N0TWFya2VyPiB7fVxuICogYGBgXG4gKlxuICogQW5kIHNvIG9uLi4uXG4gKlxuICogQHBhcmFtIGNvbnRleHRTZWxlY3RvcnMgYW4gYXJyYXkgb2YgY29udGV4dCBzZWxlY3RvcnMgdGhhdCB3aWxsIGJlIGNvbWJpbmVkLlxuICogQHBhcmFtIG90aGVyU2VsZWN0b3JzIHRoZSByZXN0IG9mIHRoZSBzZWxlY3RvcnMgdGhhdCBhcmUgbm90IGNvbnRleHQgc2VsZWN0b3JzLlxuICovXG5mdW5jdGlvbiBjb21iaW5lSG9zdENvbnRleHRTZWxlY3RvcnMoY29udGV4dFNlbGVjdG9yczogc3RyaW5nW10sIG90aGVyU2VsZWN0b3JzOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBob3N0TWFya2VyID0gX3BvbHlmaWxsSG9zdE5vQ29tYmluYXRvcjtcbiAgX3BvbHlmaWxsSG9zdFJlLmxhc3RJbmRleCA9IDA7ICAvLyByZXNldCB0aGUgcmVnZXggdG8gZW5zdXJlIHdlIGdldCBhbiBhY2N1cmF0ZSB0ZXN0XG4gIGNvbnN0IG90aGVyU2VsZWN0b3JzSGFzSG9zdCA9IF9wb2x5ZmlsbEhvc3RSZS50ZXN0KG90aGVyU2VsZWN0b3JzKTtcblxuICAvLyBJZiB0aGVyZSBhcmUgbm8gY29udGV4dCBzZWxlY3RvcnMgdGhlbiBqdXN0IG91dHB1dCBhIGhvc3QgbWFya2VyXG4gIGlmIChjb250ZXh0U2VsZWN0b3JzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBob3N0TWFya2VyICsgb3RoZXJTZWxlY3RvcnM7XG4gIH1cblxuICBjb25zdCBjb21iaW5lZDogc3RyaW5nW10gPSBbY29udGV4dFNlbGVjdG9ycy5wb3AoKSB8fCAnJ107XG4gIHdoaWxlIChjb250ZXh0U2VsZWN0b3JzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBsZW5ndGggPSBjb21iaW5lZC5sZW5ndGg7XG4gICAgY29uc3QgY29udGV4dFNlbGVjdG9yID0gY29udGV4dFNlbGVjdG9ycy5wb3AoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBwcmV2aW91c1NlbGVjdG9ycyA9IGNvbWJpbmVkW2ldO1xuICAgICAgLy8gQWRkIHRoZSBuZXcgc2VsZWN0b3IgYXMgYSBkZXNjZW5kYW50IG9mIHRoZSBwcmV2aW91cyBzZWxlY3RvcnNcbiAgICAgIGNvbWJpbmVkW2xlbmd0aCAqIDIgKyBpXSA9IHByZXZpb3VzU2VsZWN0b3JzICsgJyAnICsgY29udGV4dFNlbGVjdG9yO1xuICAgICAgLy8gQWRkIHRoZSBuZXcgc2VsZWN0b3IgYXMgYW4gYW5jZXN0b3Igb2YgdGhlIHByZXZpb3VzIHNlbGVjdG9yc1xuICAgICAgY29tYmluZWRbbGVuZ3RoICsgaV0gPSBjb250ZXh0U2VsZWN0b3IgKyAnICcgKyBwcmV2aW91c1NlbGVjdG9ycztcbiAgICAgIC8vIEFkZCB0aGUgbmV3IHNlbGVjdG9yIHRvIGFjdCBvbiB0aGUgc2FtZSBlbGVtZW50IGFzIHRoZSBwcmV2aW91cyBzZWxlY3RvcnNcbiAgICAgIGNvbWJpbmVkW2ldID0gY29udGV4dFNlbGVjdG9yICsgcHJldmlvdXNTZWxlY3RvcnM7XG4gICAgfVxuICB9XG4gIC8vIEZpbmFsbHkgY29ubmVjdCB0aGUgc2VsZWN0b3IgdG8gdGhlIGBob3N0TWFya2VyYHM6IGVpdGhlciBhY3RpbmcgZGlyZWN0bHkgb24gdGhlIGhvc3RcbiAgLy8gKEE8aG9zdE1hcmtlcj4pIG9yIGFzIGFuIGFuY2VzdG9yIChBIDxob3N0TWFya2VyPikuXG4gIHJldHVybiBjb21iaW5lZFxuICAgICAgLm1hcChcbiAgICAgICAgICBzID0+IG90aGVyU2VsZWN0b3JzSGFzSG9zdCA/XG4gICAgICAgICAgICAgIGAke3N9JHtvdGhlclNlbGVjdG9yc31gIDpcbiAgICAgICAgICAgICAgYCR7c30ke2hvc3RNYXJrZXJ9JHtvdGhlclNlbGVjdG9yc30sICR7c30gJHtob3N0TWFya2VyfSR7b3RoZXJTZWxlY3RvcnN9YClcbiAgICAgIC5qb2luKCcsJyk7XG59XG5cbi8qKlxuICogTXV0YXRlIHRoZSBnaXZlbiBgZ3JvdXBzYCBhcnJheSBzbyB0aGF0IHRoZXJlIGFyZSBgbXVsdGlwbGVzYCBjbG9uZXMgb2YgdGhlIG9yaWdpbmFsIGFycmF5XG4gKiBzdG9yZWQuXG4gKlxuICogRm9yIGV4YW1wbGUgYHJlcGVhdEdyb3VwcyhbYSwgYl0sIDMpYCB3aWxsIHJlc3VsdCBpbiBgW2EsIGIsIGEsIGIsIGEsIGJdYCAtIGJ1dCBpbXBvcnRhbnRseSB0aGVcbiAqIG5ld2x5IGFkZGVkIGdyb3VwcyB3aWxsIGJlIGNsb25lcyBvZiB0aGUgb3JpZ2luYWwuXG4gKlxuICogQHBhcmFtIGdyb3VwcyBBbiBhcnJheSBvZiBncm91cHMgb2Ygc3RyaW5ncyB0aGF0IHdpbGwgYmUgcmVwZWF0ZWQuIFRoaXMgYXJyYXkgaXMgbXV0YXRlZFxuICogICAgIGluLXBsYWNlLlxuICogQHBhcmFtIG11bHRpcGxlcyBUaGUgbnVtYmVyIG9mIHRpbWVzIHRoZSBjdXJyZW50IGdyb3VwcyBzaG91bGQgYXBwZWFyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVwZWF0R3JvdXBzKGdyb3Vwczogc3RyaW5nW11bXSwgbXVsdGlwbGVzOiBudW1iZXIpOiB2b2lkIHtcbiAgY29uc3QgbGVuZ3RoID0gZ3JvdXBzLmxlbmd0aDtcbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBtdWx0aXBsZXM7IGkrKykge1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgbGVuZ3RoOyBqKyspIHtcbiAgICAgIGdyb3Vwc1tqICsgKGkgKiBsZW5ndGgpXSA9IGdyb3Vwc1tqXS5zbGljZSgwKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==