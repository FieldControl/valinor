/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/shadow_css", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.repeatGroups = exports.processRules = exports.CssRule = exports.ShadowCss = void 0;
    var tslib_1 = require("tslib");
    /**
     * This file is a port of shadowCSS from webcomponents.js to TypeScript.
     *
     * Please make sure to keep to edits in sync with the source file.
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
      dom inside the ShadowDOM. Polymer uses one of two techniques to implement
      this feature.
    
      By default, rules are prefixed with the host element tag name
      as a descendant selector. This ensures styling does not leak out of the 'top'
      of the element's ShadowDOM. For example,
    
      div {
          font-weight: bold;
        }
    
      becomes:
    
      x-foo div {
          font-weight: bold;
        }
    
      becomes:
    
    
      Alternatively, if WebComponents.ShadowCSS.strictStyling is set to true then
      selectors are scoped by adding an attribute selector suffix to each
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
    var ShadowCss = /** @class */ (function () {
        function ShadowCss() {
            this.strictStyling = true;
        }
        /*
         * Shim some cssText with the given selector. Returns cssText that can
         * be included in the document via WebComponents.ShadowCSS.addCssToDocument(css).
         *
         * When strictStyling is true:
         * - selector is the attribute added to all elements inside the host,
         * - hostSelector is the attribute added to the host itself.
         */
        ShadowCss.prototype.shimCssText = function (cssText, selector, hostSelector) {
            if (hostSelector === void 0) { hostSelector = ''; }
            var commentsWithHash = extractCommentsWithHash(cssText);
            cssText = stripComments(cssText);
            cssText = this._insertDirectives(cssText);
            var scopedCssText = this._scopeCssText(cssText, selector, hostSelector);
            return tslib_1.__spreadArray([scopedCssText], tslib_1.__read(commentsWithHash)).join('\n');
        };
        ShadowCss.prototype._insertDirectives = function (cssText) {
            cssText = this._insertPolyfillDirectivesInCssText(cssText);
            return this._insertPolyfillRulesInCssText(cssText);
        };
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
        ShadowCss.prototype._insertPolyfillDirectivesInCssText = function (cssText) {
            // Difference with webcomponents.js: does not handle comments
            return cssText.replace(_cssContentNextSelectorRe, function () {
                var m = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    m[_i] = arguments[_i];
                }
                return m[2] + '{';
            });
        };
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
        ShadowCss.prototype._insertPolyfillRulesInCssText = function (cssText) {
            // Difference with webcomponents.js: does not handle comments
            return cssText.replace(_cssContentRuleRe, function () {
                var m = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    m[_i] = arguments[_i];
                }
                var rule = m[0].replace(m[1], '').replace(m[2], '');
                return m[4] + rule;
            });
        };
        /* Ensure styles are scoped. Pseudo-scoping takes a rule like:
         *
         *  .foo {... }
         *
         *  and converts this to
         *
         *  scopeName .foo { ... }
         */
        ShadowCss.prototype._scopeCssText = function (cssText, scopeSelector, hostSelector) {
            var unscopedRules = this._extractUnscopedRulesFromCssText(cssText);
            // replace :host and :host-context -shadowcsshost and -shadowcsshost respectively
            cssText = this._insertPolyfillHostInCssText(cssText);
            cssText = this._convertColonHost(cssText);
            cssText = this._convertColonHostContext(cssText);
            cssText = this._convertShadowDOMSelectors(cssText);
            if (scopeSelector) {
                cssText = this._scopeSelectors(cssText, scopeSelector, hostSelector);
            }
            cssText = cssText + '\n' + unscopedRules;
            return cssText.trim();
        };
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
        ShadowCss.prototype._extractUnscopedRulesFromCssText = function (cssText) {
            // Difference with webcomponents.js: does not handle comments
            var r = '';
            var m;
            _cssContentUnscopedRuleRe.lastIndex = 0;
            while ((m = _cssContentUnscopedRuleRe.exec(cssText)) !== null) {
                var rule = m[0].replace(m[2], '').replace(m[1], m[4]);
                r += rule + '\n\n';
            }
            return r;
        };
        /*
         * convert a rule like :host(.foo) > .bar { }
         *
         * to
         *
         * .foo<scopeName> > .bar
         */
        ShadowCss.prototype._convertColonHost = function (cssText) {
            return cssText.replace(_cssColonHostRe, function (_, hostSelectors, otherSelectors) {
                var e_1, _a;
                if (hostSelectors) {
                    var convertedSelectors = [];
                    var hostSelectorArray = hostSelectors.split(',').map(function (p) { return p.trim(); });
                    try {
                        for (var hostSelectorArray_1 = tslib_1.__values(hostSelectorArray), hostSelectorArray_1_1 = hostSelectorArray_1.next(); !hostSelectorArray_1_1.done; hostSelectorArray_1_1 = hostSelectorArray_1.next()) {
                            var hostSelector = hostSelectorArray_1_1.value;
                            if (!hostSelector)
                                break;
                            var convertedSelector = _polyfillHostNoCombinator + hostSelector.replace(_polyfillHost, '') + otherSelectors;
                            convertedSelectors.push(convertedSelector);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (hostSelectorArray_1_1 && !hostSelectorArray_1_1.done && (_a = hostSelectorArray_1.return)) _a.call(hostSelectorArray_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    return convertedSelectors.join(',');
                }
                else {
                    return _polyfillHostNoCombinator + otherSelectors;
                }
            });
        };
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
        ShadowCss.prototype._convertColonHostContext = function (cssText) {
            return cssText.replace(_cssColonHostContextReGlobal, function (selectorText) {
                // We have captured a selector that contains a `:host-context` rule.
                var _a;
                // For backward compatibility `:host-context` may contain a comma separated list of selectors.
                // Each context selector group will contain a list of host-context selectors that must match
                // an ancestor of the host.
                // (Normally `contextSelectorGroups` will only contain a single array of context selectors.)
                var contextSelectorGroups = [[]];
                // There may be more than `:host-context` in this selector so `selectorText` could look like:
                // `:host-context(.one):host-context(.two)`.
                // Execute `_cssColonHostContextRe` over and over until we have extracted all the
                // `:host-context` selectors from this selector.
                var match;
                while (match = _cssColonHostContextRe.exec(selectorText)) {
                    // `match` = [':host-context(<selectors>)<rest>', <selectors>, <rest>]
                    // The `<selectors>` could actually be a comma separated list: `:host-context(.one, .two)`.
                    var newContextSelectors = ((_a = match[1]) !== null && _a !== void 0 ? _a : '').trim().split(',').map(function (m) { return m.trim(); }).filter(function (m) { return m !== ''; });
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
                    var contextSelectorGroupsLength = contextSelectorGroups.length;
                    repeatGroups(contextSelectorGroups, newContextSelectors.length);
                    for (var i = 0; i < newContextSelectors.length; i++) {
                        for (var j = 0; j < contextSelectorGroupsLength; j++) {
                            contextSelectorGroups[j + (i * contextSelectorGroupsLength)].push(newContextSelectors[i]);
                        }
                    }
                    // Update the `selectorText` and see repeat to see if there are more `:host-context`s.
                    selectorText = match[2];
                }
                // The context selectors now must be combined with each other to capture all the possible
                // selectors that `:host-context` can match. See `combineHostContextSelectors()` for more
                // info about how this is done.
                return contextSelectorGroups
                    .map(function (contextSelectors) { return combineHostContextSelectors(contextSelectors, selectorText); })
                    .join(', ');
            });
        };
        /*
         * Convert combinators like ::shadow and pseudo-elements like ::content
         * by replacing with space.
         */
        ShadowCss.prototype._convertShadowDOMSelectors = function (cssText) {
            return _shadowDOMSelectorsRe.reduce(function (result, pattern) { return result.replace(pattern, ' '); }, cssText);
        };
        // change a selector like 'div' to 'name div'
        ShadowCss.prototype._scopeSelectors = function (cssText, scopeSelector, hostSelector) {
            var _this = this;
            return processRules(cssText, function (rule) {
                var selector = rule.selector;
                var content = rule.content;
                if (rule.selector[0] !== '@') {
                    selector =
                        _this._scopeSelector(rule.selector, scopeSelector, hostSelector, _this.strictStyling);
                }
                else if (rule.selector.startsWith('@media') || rule.selector.startsWith('@supports') ||
                    rule.selector.startsWith('@document')) {
                    content = _this._scopeSelectors(rule.content, scopeSelector, hostSelector);
                }
                else if (rule.selector.startsWith('@font-face') || rule.selector.startsWith('@page')) {
                    content = _this._stripScopingSelectors(rule.content);
                }
                return new CssRule(selector, content);
            });
        };
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
        ShadowCss.prototype._stripScopingSelectors = function (cssText) {
            return processRules(cssText, function (rule) {
                var selector = rule.selector.replace(_shadowDeepSelectors, ' ')
                    .replace(_polyfillHostNoCombinatorRe, ' ');
                return new CssRule(selector, rule.content);
            });
        };
        ShadowCss.prototype._scopeSelector = function (selector, scopeSelector, hostSelector, strict) {
            var _this = this;
            return selector.split(',')
                .map(function (part) { return part.trim().split(_shadowDeepSelectors); })
                .map(function (deepParts) {
                var _a = tslib_1.__read(deepParts), shallowPart = _a[0], otherParts = _a.slice(1);
                var applyScope = function (shallowPart) {
                    if (_this._selectorNeedsScoping(shallowPart, scopeSelector)) {
                        return strict ?
                            _this._applyStrictSelectorScope(shallowPart, scopeSelector, hostSelector) :
                            _this._applySelectorScope(shallowPart, scopeSelector, hostSelector);
                    }
                    else {
                        return shallowPart;
                    }
                };
                return tslib_1.__spreadArray([applyScope(shallowPart)], tslib_1.__read(otherParts)).join(' ');
            })
                .join(', ');
        };
        ShadowCss.prototype._selectorNeedsScoping = function (selector, scopeSelector) {
            var re = this._makeScopeMatcher(scopeSelector);
            return !re.test(selector);
        };
        ShadowCss.prototype._makeScopeMatcher = function (scopeSelector) {
            var lre = /\[/g;
            var rre = /\]/g;
            scopeSelector = scopeSelector.replace(lre, '\\[').replace(rre, '\\]');
            return new RegExp('^(' + scopeSelector + ')' + _selectorReSuffix, 'm');
        };
        ShadowCss.prototype._applySelectorScope = function (selector, scopeSelector, hostSelector) {
            // Difference from webcomponents.js: scopeSelector could not be an array
            return this._applySimpleSelectorScope(selector, scopeSelector, hostSelector);
        };
        // scope via name and [is=name]
        ShadowCss.prototype._applySimpleSelectorScope = function (selector, scopeSelector, hostSelector) {
            // In Android browser, the lastIndex is not reset when the regex is used in String.replace()
            _polyfillHostRe.lastIndex = 0;
            if (_polyfillHostRe.test(selector)) {
                var replaceBy_1 = this.strictStyling ? "[" + hostSelector + "]" : scopeSelector;
                return selector
                    .replace(_polyfillHostNoCombinatorRe, function (hnc, selector) {
                    return selector.replace(/([^:]*)(:*)(.*)/, function (_, before, colon, after) {
                        return before + replaceBy_1 + colon + after;
                    });
                })
                    .replace(_polyfillHostRe, replaceBy_1 + ' ');
            }
            return scopeSelector + ' ' + selector;
        };
        // return a selector with [name] suffix on each simple selector
        // e.g. .foo.bar > .zot becomes .foo[name].bar[name] > .zot[name]  /** @internal */
        ShadowCss.prototype._applyStrictSelectorScope = function (selector, scopeSelector, hostSelector) {
            var _this = this;
            var isRe = /\[is=([^\]]*)\]/g;
            scopeSelector = scopeSelector.replace(isRe, function (_) {
                var parts = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    parts[_i - 1] = arguments[_i];
                }
                return parts[0];
            });
            var attrName = '[' + scopeSelector + ']';
            var _scopeSelectorPart = function (p) {
                var scopedP = p.trim();
                if (!scopedP) {
                    return '';
                }
                if (p.indexOf(_polyfillHostNoCombinator) > -1) {
                    scopedP = _this._applySimpleSelectorScope(p, scopeSelector, hostSelector);
                }
                else {
                    // remove :host since it should be unnecessary
                    var t = p.replace(_polyfillHostRe, '');
                    if (t.length > 0) {
                        var matches = t.match(/([^:]*)(:*)(.*)/);
                        if (matches) {
                            scopedP = matches[1] + attrName + matches[2] + matches[3];
                        }
                    }
                }
                return scopedP;
            };
            var safeContent = new SafeSelector(selector);
            selector = safeContent.content();
            var scopedSelector = '';
            var startIndex = 0;
            var res;
            var sep = /( |>|\+|~(?!=))\s*/g;
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
            var hasHost = selector.indexOf(_polyfillHostNoCombinator) > -1;
            // Only scope parts after the first `-shadowcsshost-no-combinator` when it is present
            var shouldScope = !hasHost;
            while ((res = sep.exec(selector)) !== null) {
                var separator = res[1];
                var part_1 = selector.slice(startIndex, res.index).trim();
                shouldScope = shouldScope || part_1.indexOf(_polyfillHostNoCombinator) > -1;
                var scopedPart = shouldScope ? _scopeSelectorPart(part_1) : part_1;
                scopedSelector += scopedPart + " " + separator + " ";
                startIndex = sep.lastIndex;
            }
            var part = selector.substring(startIndex);
            shouldScope = shouldScope || part.indexOf(_polyfillHostNoCombinator) > -1;
            scopedSelector += shouldScope ? _scopeSelectorPart(part) : part;
            // replace the placeholders with their original values
            return safeContent.restore(scopedSelector);
        };
        ShadowCss.prototype._insertPolyfillHostInCssText = function (selector) {
            return selector.replace(_colonHostContextRe, _polyfillHostContext)
                .replace(_colonHostRe, _polyfillHost);
        };
        return ShadowCss;
    }());
    exports.ShadowCss = ShadowCss;
    var SafeSelector = /** @class */ (function () {
        function SafeSelector(selector) {
            var _this = this;
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
            selector = this._escapeRegexMatches(selector, /(\\.)/g);
            // Replaces the expression in `:nth-child(2n + 1)` with a placeholder.
            // WS and "+" would otherwise be interpreted as selector separators.
            this._content = selector.replace(/(:nth-[-\w]+)(\([^)]+\))/g, function (_, pseudo, exp) {
                var replaceBy = "__ph-" + _this.index + "__";
                _this.placeholders.push(exp);
                _this.index++;
                return pseudo + replaceBy;
            });
        }
        SafeSelector.prototype.restore = function (content) {
            var _this = this;
            return content.replace(/__ph-(\d+)__/g, function (_ph, index) { return _this.placeholders[+index]; });
        };
        SafeSelector.prototype.content = function () {
            return this._content;
        };
        /**
         * Replaces all of the substrings that match a regex within a
         * special string (e.g. `__ph-0__`, `__ph-1__`, etc).
         */
        SafeSelector.prototype._escapeRegexMatches = function (content, pattern) {
            var _this = this;
            return content.replace(pattern, function (_, keep) {
                var replaceBy = "__ph-" + _this.index + "__";
                _this.placeholders.push(keep);
                _this.index++;
                return replaceBy;
            });
        };
        return SafeSelector;
    }());
    var _cssContentNextSelectorRe = /polyfill-next-selector[^}]*content:[\s]*?(['"])(.*?)\1[;\s]*}([^{]*?){/gim;
    var _cssContentRuleRe = /(polyfill-rule)[^}]*(content:[\s]*(['"])(.*?)\3)[;\s]*[^}]*}/gim;
    var _cssContentUnscopedRuleRe = /(polyfill-unscoped-rule)[^}]*(content:[\s]*(['"])(.*?)\3)[;\s]*[^}]*}/gim;
    var _polyfillHost = '-shadowcsshost';
    // note: :host-context pre-processed to -shadowcsshostcontext.
    var _polyfillHostContext = '-shadowcsscontext';
    var _parenSuffix = '(?:\\((' +
        '(?:\\([^)(]*\\)|[^)(]*)+?' +
        ')\\))?([^,{]*)';
    var _cssColonHostRe = new RegExp(_polyfillHost + _parenSuffix, 'gim');
    var _cssColonHostContextReGlobal = new RegExp(_polyfillHostContext + _parenSuffix, 'gim');
    var _cssColonHostContextRe = new RegExp(_polyfillHostContext + _parenSuffix, 'im');
    var _polyfillHostNoCombinator = _polyfillHost + '-no-combinator';
    var _polyfillHostNoCombinatorRe = /-shadowcsshost-no-combinator([^\s]*)/;
    var _shadowDOMSelectorsRe = [
        /::shadow/g,
        /::content/g,
        // Deprecated selectors
        /\/shadow-deep\//g,
        /\/shadow\//g,
    ];
    // The deep combinator is deprecated in the CSS spec
    // Support for `>>>`, `deep`, `::ng-deep` is then also deprecated and will be removed in the future.
    // see https://github.com/angular/angular/pull/17677
    var _shadowDeepSelectors = /(?:>>>)|(?:\/deep\/)|(?:::ng-deep)/g;
    var _selectorReSuffix = '([>\\s~+\[.,{:][\\s\\S]*)?$';
    var _polyfillHostRe = /-shadowcsshost/gim;
    var _colonHostRe = /:host/gim;
    var _colonHostContextRe = /:host-context/gim;
    var _commentRe = /\/\*\s*[\s\S]*?\*\//g;
    function stripComments(input) {
        return input.replace(_commentRe, '');
    }
    var _commentWithHashRe = /\/\*\s*#\s*source(Mapping)?URL=[\s\S]+?\*\//g;
    function extractCommentsWithHash(input) {
        return input.match(_commentWithHashRe) || [];
    }
    var BLOCK_PLACEHOLDER = '%BLOCK%';
    var QUOTE_PLACEHOLDER = '%QUOTED%';
    var _ruleRe = /(\s*)([^;\{\}]+?)(\s*)((?:{%BLOCK%}?\s*;?)|(?:\s*;))/g;
    var _quotedRe = /%QUOTED%/g;
    var CONTENT_PAIRS = new Map([['{', '}']]);
    var QUOTE_PAIRS = new Map([["\"", "\""], ["'", "'"]]);
    var CssRule = /** @class */ (function () {
        function CssRule(selector, content) {
            this.selector = selector;
            this.content = content;
        }
        return CssRule;
    }());
    exports.CssRule = CssRule;
    function processRules(input, ruleCallback) {
        var inputWithEscapedQuotes = escapeBlocks(input, QUOTE_PAIRS, QUOTE_PLACEHOLDER);
        var inputWithEscapedBlocks = escapeBlocks(inputWithEscapedQuotes.escapedString, CONTENT_PAIRS, BLOCK_PLACEHOLDER);
        var nextBlockIndex = 0;
        var nextQuoteIndex = 0;
        return inputWithEscapedBlocks.escapedString
            .replace(_ruleRe, function () {
            var m = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                m[_i] = arguments[_i];
            }
            var selector = m[2];
            var content = '';
            var suffix = m[4];
            var contentPrefix = '';
            if (suffix && suffix.startsWith('{' + BLOCK_PLACEHOLDER)) {
                content = inputWithEscapedBlocks.blocks[nextBlockIndex++];
                suffix = suffix.substring(BLOCK_PLACEHOLDER.length + 1);
                contentPrefix = '{';
            }
            var rule = ruleCallback(new CssRule(selector, content));
            return "" + m[1] + rule.selector + m[3] + contentPrefix + rule.content + suffix;
        })
            .replace(_quotedRe, function () { return inputWithEscapedQuotes.blocks[nextQuoteIndex++]; });
    }
    exports.processRules = processRules;
    var StringWithEscapedBlocks = /** @class */ (function () {
        function StringWithEscapedBlocks(escapedString, blocks) {
            this.escapedString = escapedString;
            this.blocks = blocks;
        }
        return StringWithEscapedBlocks;
    }());
    function escapeBlocks(input, charPairs, placeholder) {
        var resultParts = [];
        var escapedBlocks = [];
        var openCharCount = 0;
        var nonBlockStartIndex = 0;
        var blockStartIndex = -1;
        var openChar;
        var closeChar;
        for (var i = 0; i < input.length; i++) {
            var char = input[i];
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
     * @param hostMarker the string that selects the host element.
     * @param contextSelectors an array of context selectors that will be combined.
     * @param otherSelectors the rest of the selectors that are not context selectors.
     */
    function combineHostContextSelectors(contextSelectors, otherSelectors) {
        var hostMarker = _polyfillHostNoCombinator;
        _polyfillHostRe.lastIndex = 0; // reset the regex to ensure we get an accurate test
        var otherSelectorsHasHost = _polyfillHostRe.test(otherSelectors);
        // If there are no context selectors then just output a host marker
        if (contextSelectors.length === 0) {
            return hostMarker + otherSelectors;
        }
        var combined = [contextSelectors.pop() || ''];
        while (contextSelectors.length > 0) {
            var length_1 = combined.length;
            var contextSelector = contextSelectors.pop();
            for (var i = 0; i < length_1; i++) {
                var previousSelectors = combined[i];
                // Add the new selector as a descendant of the previous selectors
                combined[length_1 * 2 + i] = previousSelectors + ' ' + contextSelector;
                // Add the new selector as an ancestor of the previous selectors
                combined[length_1 + i] = contextSelector + ' ' + previousSelectors;
                // Add the new selector to act on the same element as the previous selectors
                combined[i] = contextSelector + previousSelectors;
            }
        }
        // Finally connect the selector to the `hostMarker`s: either acting directly on the host
        // (A<hostMarker>) or as an ancestor (A <hostMarker>).
        return combined
            .map(function (s) { return otherSelectorsHasHost ?
            "" + s + otherSelectors :
            "" + s + hostMarker + otherSelectors + ", " + s + " " + hostMarker + otherSelectors; })
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
    function repeatGroups(groups, multiples) {
        var length = groups.length;
        for (var i = 1; i < multiples; i++) {
            for (var j = 0; j < length; j++) {
                groups[j + (i * length)] = groups[j].slice(0);
            }
        }
    }
    exports.repeatGroups = repeatGroups;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhZG93X2Nzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9zaGFkb3dfY3NzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSDs7Ozs7Ozs7O09BU0c7SUFFSDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFpSEU7SUFFRjtRQUFBO1lBQ0Usa0JBQWEsR0FBWSxJQUFJLENBQUM7UUE0WmhDLENBQUM7UUExWkM7Ozs7Ozs7V0FPRztRQUNILCtCQUFXLEdBQVgsVUFBWSxPQUFlLEVBQUUsUUFBZ0IsRUFBRSxZQUF5QjtZQUF6Qiw2QkFBQSxFQUFBLGlCQUF5QjtZQUN0RSxJQUFNLGdCQUFnQixHQUFHLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFELE9BQU8sR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakMsT0FBTyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUxQyxJQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDMUUsT0FBTyx1QkFBQyxhQUFhLGtCQUFLLGdCQUFnQixHQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBRU8scUNBQWlCLEdBQXpCLFVBQTBCLE9BQWU7WUFDdkMsT0FBTyxHQUFHLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMzRCxPQUFPLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRUQ7Ozs7Ozs7Ozs7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Q0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDbEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDL0IsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDL0M7U0FDRjtJQUNILENBQUM7SUFQRCxvQ0FPQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIFRoaXMgZmlsZSBpcyBhIHBvcnQgb2Ygc2hhZG93Q1NTIGZyb20gd2ViY29tcG9uZW50cy5qcyB0byBUeXBlU2NyaXB0LlxuICpcbiAqIFBsZWFzZSBtYWtlIHN1cmUgdG8ga2VlcCB0byBlZGl0cyBpbiBzeW5jIHdpdGggdGhlIHNvdXJjZSBmaWxlLlxuICpcbiAqIFNvdXJjZTpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJjb21wb25lbnRzL3dlYmNvbXBvbmVudHNqcy9ibG9iLzRlZmVjZDdlMGUvc3JjL1NoYWRvd0NTUy9TaGFkb3dDU1MuanNcbiAqXG4gKiBUaGUgb3JpZ2luYWwgZmlsZSBsZXZlbCBjb21tZW50IGlzIHJlcHJvZHVjZWQgYmVsb3dcbiAqL1xuXG4vKlxuICBUaGlzIGlzIGEgbGltaXRlZCBzaGltIGZvciBTaGFkb3dET00gY3NzIHN0eWxpbmcuXG4gIGh0dHBzOi8vZHZjcy53My5vcmcvaGcvd2ViY29tcG9uZW50cy9yYXctZmlsZS90aXAvc3BlYy9zaGFkb3cvaW5kZXguaHRtbCNzdHlsZXNcblxuICBUaGUgaW50ZW50aW9uIGhlcmUgaXMgdG8gc3VwcG9ydCBvbmx5IHRoZSBzdHlsaW5nIGZlYXR1cmVzIHdoaWNoIGNhbiBiZVxuICByZWxhdGl2ZWx5IHNpbXBseSBpbXBsZW1lbnRlZC4gVGhlIGdvYWwgaXMgdG8gYWxsb3cgdXNlcnMgdG8gYXZvaWQgdGhlXG4gIG1vc3Qgb2J2aW91cyBwaXRmYWxscyBhbmQgZG8gc28gd2l0aG91dCBjb21wcm9taXNpbmcgcGVyZm9ybWFuY2Ugc2lnbmlmaWNhbnRseS5cbiAgRm9yIFNoYWRvd0RPTSBzdHlsaW5nIHRoYXQncyBub3QgY292ZXJlZCBoZXJlLCBhIHNldCBvZiBiZXN0IHByYWN0aWNlc1xuICBjYW4gYmUgcHJvdmlkZWQgdGhhdCBzaG91bGQgYWxsb3cgdXNlcnMgdG8gYWNjb21wbGlzaCBtb3JlIGNvbXBsZXggc3R5bGluZy5cblxuICBUaGUgZm9sbG93aW5nIGlzIGEgbGlzdCBvZiBzcGVjaWZpYyBTaGFkb3dET00gc3R5bGluZyBmZWF0dXJlcyBhbmQgYSBicmllZlxuICBkaXNjdXNzaW9uIG9mIHRoZSBhcHByb2FjaCB1c2VkIHRvIHNoaW0uXG5cbiAgU2hpbW1lZCBmZWF0dXJlczpcblxuICAqIDpob3N0LCA6aG9zdC1jb250ZXh0OiBTaGFkb3dET00gYWxsb3dzIHN0eWxpbmcgb2YgdGhlIHNoYWRvd1Jvb3QncyBob3N0XG4gIGVsZW1lbnQgdXNpbmcgdGhlIDpob3N0IHJ1bGUuIFRvIHNoaW0gdGhpcyBmZWF0dXJlLCB0aGUgOmhvc3Qgc3R5bGVzIGFyZVxuICByZWZvcm1hdHRlZCBhbmQgcHJlZml4ZWQgd2l0aCBhIGdpdmVuIHNjb3BlIG5hbWUgYW5kIHByb21vdGVkIHRvIGFcbiAgZG9jdW1lbnQgbGV2ZWwgc3R5bGVzaGVldC5cbiAgRm9yIGV4YW1wbGUsIGdpdmVuIGEgc2NvcGUgbmFtZSBvZiAuZm9vLCBhIHJ1bGUgbGlrZSB0aGlzOlxuXG4gICAgOmhvc3Qge1xuICAgICAgICBiYWNrZ3JvdW5kOiByZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gIGJlY29tZXM6XG5cbiAgICAuZm9vIHtcbiAgICAgIGJhY2tncm91bmQ6IHJlZDtcbiAgICB9XG5cbiAgKiBlbmNhcHN1bGF0aW9uOiBTdHlsZXMgZGVmaW5lZCB3aXRoaW4gU2hhZG93RE9NLCBhcHBseSBvbmx5IHRvXG4gIGRvbSBpbnNpZGUgdGhlIFNoYWRvd0RPTS4gUG9seW1lciB1c2VzIG9uZSBvZiB0d28gdGVjaG5pcXVlcyB0byBpbXBsZW1lbnRcbiAgdGhpcyBmZWF0dXJlLlxuXG4gIEJ5IGRlZmF1bHQsIHJ1bGVzIGFyZSBwcmVmaXhlZCB3aXRoIHRoZSBob3N0IGVsZW1lbnQgdGFnIG5hbWVcbiAgYXMgYSBkZXNjZW5kYW50IHNlbGVjdG9yLiBUaGlzIGVuc3VyZXMgc3R5bGluZyBkb2VzIG5vdCBsZWFrIG91dCBvZiB0aGUgJ3RvcCdcbiAgb2YgdGhlIGVsZW1lbnQncyBTaGFkb3dET00uIEZvciBleGFtcGxlLFxuXG4gIGRpdiB7XG4gICAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICB9XG5cbiAgYmVjb21lczpcblxuICB4LWZvbyBkaXYge1xuICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgfVxuXG4gIGJlY29tZXM6XG5cblxuICBBbHRlcm5hdGl2ZWx5LCBpZiBXZWJDb21wb25lbnRzLlNoYWRvd0NTUy5zdHJpY3RTdHlsaW5nIGlzIHNldCB0byB0cnVlIHRoZW5cbiAgc2VsZWN0b3JzIGFyZSBzY29wZWQgYnkgYWRkaW5nIGFuIGF0dHJpYnV0ZSBzZWxlY3RvciBzdWZmaXggdG8gZWFjaFxuICBzaW1wbGUgc2VsZWN0b3IgdGhhdCBjb250YWlucyB0aGUgaG9zdCBlbGVtZW50IHRhZyBuYW1lLiBFYWNoIGVsZW1lbnRcbiAgaW4gdGhlIGVsZW1lbnQncyBTaGFkb3dET00gdGVtcGxhdGUgaXMgYWxzbyBnaXZlbiB0aGUgc2NvcGUgYXR0cmlidXRlLlxuICBUaHVzLCB0aGVzZSBydWxlcyBtYXRjaCBvbmx5IGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgc2NvcGUgYXR0cmlidXRlLlxuICBGb3IgZXhhbXBsZSwgZ2l2ZW4gYSBzY29wZSBuYW1lIG9mIHgtZm9vLCBhIHJ1bGUgbGlrZSB0aGlzOlxuXG4gICAgZGl2IHtcbiAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgIH1cblxuICBiZWNvbWVzOlxuXG4gICAgZGl2W3gtZm9vXSB7XG4gICAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICB9XG5cbiAgTm90ZSB0aGF0IGVsZW1lbnRzIHRoYXQgYXJlIGR5bmFtaWNhbGx5IGFkZGVkIHRvIGEgc2NvcGUgbXVzdCBoYXZlIHRoZSBzY29wZVxuICBzZWxlY3RvciBhZGRlZCB0byB0aGVtIG1hbnVhbGx5LlxuXG4gICogdXBwZXIvbG93ZXIgYm91bmQgZW5jYXBzdWxhdGlvbjogU3R5bGVzIHdoaWNoIGFyZSBkZWZpbmVkIG91dHNpZGUgYVxuICBzaGFkb3dSb290IHNob3VsZCBub3QgY3Jvc3MgdGhlIFNoYWRvd0RPTSBib3VuZGFyeSBhbmQgc2hvdWxkIG5vdCBhcHBseVxuICBpbnNpZGUgYSBzaGFkb3dSb290LlxuXG4gIFRoaXMgc3R5bGluZyBiZWhhdmlvciBpcyBub3QgZW11bGF0ZWQuIFNvbWUgcG9zc2libGUgd2F5cyB0byBkbyB0aGlzIHRoYXRcbiAgd2VyZSByZWplY3RlZCBkdWUgdG8gY29tcGxleGl0eSBhbmQvb3IgcGVyZm9ybWFuY2UgY29uY2VybnMgaW5jbHVkZTogKDEpIHJlc2V0XG4gIGV2ZXJ5IHBvc3NpYmxlIHByb3BlcnR5IGZvciBldmVyeSBwb3NzaWJsZSBzZWxlY3RvciBmb3IgYSBnaXZlbiBzY29wZSBuYW1lO1xuICAoMikgcmUtaW1wbGVtZW50IGNzcyBpbiBqYXZhc2NyaXB0LlxuXG4gIEFzIGFuIGFsdGVybmF0aXZlLCB1c2VycyBzaG91bGQgbWFrZSBzdXJlIHRvIHVzZSBzZWxlY3RvcnNcbiAgc3BlY2lmaWMgdG8gdGhlIHNjb3BlIGluIHdoaWNoIHRoZXkgYXJlIHdvcmtpbmcuXG5cbiAgKiA6OmRpc3RyaWJ1dGVkOiBUaGlzIGJlaGF2aW9yIGlzIG5vdCBlbXVsYXRlZC4gSXQncyBvZnRlbiBub3QgbmVjZXNzYXJ5XG4gIHRvIHN0eWxlIHRoZSBjb250ZW50cyBvZiBhIHNwZWNpZmljIGluc2VydGlvbiBwb2ludCBhbmQgaW5zdGVhZCwgZGVzY2VuZGFudHNcbiAgb2YgdGhlIGhvc3QgZWxlbWVudCBjYW4gYmUgc3R5bGVkIHNlbGVjdGl2ZWx5LiBVc2VycyBjYW4gYWxzbyBjcmVhdGUgYW5cbiAgZXh0cmEgbm9kZSBhcm91bmQgYW4gaW5zZXJ0aW9uIHBvaW50IGFuZCBzdHlsZSB0aGF0IG5vZGUncyBjb250ZW50c1xuICB2aWEgZGVzY2VuZGVudCBzZWxlY3RvcnMuIEZvciBleGFtcGxlLCB3aXRoIGEgc2hhZG93Um9vdCBsaWtlIHRoaXM6XG5cbiAgICA8c3R5bGU+XG4gICAgICA6OmNvbnRlbnQoZGl2KSB7XG4gICAgICAgIGJhY2tncm91bmQ6IHJlZDtcbiAgICAgIH1cbiAgICA8L3N0eWxlPlxuICAgIDxjb250ZW50PjwvY29udGVudD5cblxuICBjb3VsZCBiZWNvbWU6XG5cbiAgICA8c3R5bGU+XG4gICAgICAvICpAcG9seWZpbGwgLmNvbnRlbnQtY29udGFpbmVyIGRpdiAqIC9cbiAgICAgIDo6Y29udGVudChkaXYpIHtcbiAgICAgICAgYmFja2dyb3VuZDogcmVkO1xuICAgICAgfVxuICAgIDwvc3R5bGU+XG4gICAgPGRpdiBjbGFzcz1cImNvbnRlbnQtY29udGFpbmVyXCI+XG4gICAgICA8Y29udGVudD48L2NvbnRlbnQ+XG4gICAgPC9kaXY+XG5cbiAgTm90ZSB0aGUgdXNlIG9mIEBwb2x5ZmlsbCBpbiB0aGUgY29tbWVudCBhYm92ZSBhIFNoYWRvd0RPTSBzcGVjaWZpYyBzdHlsZVxuICBkZWNsYXJhdGlvbi4gVGhpcyBpcyBhIGRpcmVjdGl2ZSB0byB0aGUgc3R5bGluZyBzaGltIHRvIHVzZSB0aGUgc2VsZWN0b3JcbiAgaW4gY29tbWVudHMgaW4gbGlldSBvZiB0aGUgbmV4dCBzZWxlY3RvciB3aGVuIHJ1bm5pbmcgdW5kZXIgcG9seWZpbGwuXG4qL1xuXG5leHBvcnQgY2xhc3MgU2hhZG93Q3NzIHtcbiAgc3RyaWN0U3R5bGluZzogYm9vbGVhbiA9IHRydWU7XG5cbiAgLypcbiAgICogU2hpbSBzb21lIGNzc1RleHQgd2l0aCB0aGUgZ2l2ZW4gc2VsZWN0b3IuIFJldHVybnMgY3NzVGV4dCB0aGF0IGNhblxuICAgKiBiZSBpbmNsdWRlZCBpbiB0aGUgZG9jdW1lbnQgdmlhIFdlYkNvbXBvbmVudHMuU2hhZG93Q1NTLmFkZENzc1RvRG9jdW1lbnQoY3NzKS5cbiAgICpcbiAgICogV2hlbiBzdHJpY3RTdHlsaW5nIGlzIHRydWU6XG4gICAqIC0gc2VsZWN0b3IgaXMgdGhlIGF0dHJpYnV0ZSBhZGRlZCB0byBhbGwgZWxlbWVudHMgaW5zaWRlIHRoZSBob3N0LFxuICAgKiAtIGhvc3RTZWxlY3RvciBpcyB0aGUgYXR0cmlidXRlIGFkZGVkIHRvIHRoZSBob3N0IGl0c2VsZi5cbiAgICovXG4gIHNoaW1Dc3NUZXh0KGNzc1RleHQ6IHN0cmluZywgc2VsZWN0b3I6IHN0cmluZywgaG9zdFNlbGVjdG9yOiBzdHJpbmcgPSAnJyk6IHN0cmluZyB7XG4gICAgY29uc3QgY29tbWVudHNXaXRoSGFzaCA9IGV4dHJhY3RDb21tZW50c1dpdGhIYXNoKGNzc1RleHQpO1xuICAgIGNzc1RleHQgPSBzdHJpcENvbW1lbnRzKGNzc1RleHQpO1xuICAgIGNzc1RleHQgPSB0aGlzLl9pbnNlcnREaXJlY3RpdmVzKGNzc1RleHQpO1xuXG4gICAgY29uc3Qgc2NvcGVkQ3NzVGV4dCA9IHRoaXMuX3Njb3BlQ3NzVGV4dChjc3NUZXh0LCBzZWxlY3RvciwgaG9zdFNlbGVjdG9yKTtcbiAgICByZXR1cm4gW3Njb3BlZENzc1RleHQsIC4uLmNvbW1lbnRzV2l0aEhhc2hdLmpvaW4oJ1xcbicpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5zZXJ0RGlyZWN0aXZlcyhjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNzc1RleHQgPSB0aGlzLl9pbnNlcnRQb2x5ZmlsbERpcmVjdGl2ZXNJbkNzc1RleHQoY3NzVGV4dCk7XG4gICAgcmV0dXJuIHRoaXMuX2luc2VydFBvbHlmaWxsUnVsZXNJbkNzc1RleHQoY3NzVGV4dCk7XG4gIH1cblxuICAvKlxuICAgKiBQcm9jZXNzIHN0eWxlcyB0byBjb252ZXJ0IG5hdGl2ZSBTaGFkb3dET00gcnVsZXMgdGhhdCB3aWxsIHRyaXBcbiAgICogdXAgdGhlIGNzcyBwYXJzZXI7IHdlIHJlbHkgb24gZGVjb3JhdGluZyB0aGUgc3R5bGVzaGVldCB3aXRoIGluZXJ0IHJ1bGVzLlxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSwgd2UgY29udmVydCB0aGlzIHJ1bGU6XG4gICAqXG4gICAqIHBvbHlmaWxsLW5leHQtc2VsZWN0b3IgeyBjb250ZW50OiAnOmhvc3QgbWVudS1pdGVtJzsgfVxuICAgKiA6OmNvbnRlbnQgbWVudS1pdGVtIHtcbiAgICpcbiAgICogdG8gdGhpczpcbiAgICpcbiAgICogc2NvcGVOYW1lIG1lbnUtaXRlbSB7XG4gICAqXG4gICAqKi9cbiAgcHJpdmF0ZSBfaW5zZXJ0UG9seWZpbGxEaXJlY3RpdmVzSW5Dc3NUZXh0KGNzc1RleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gRGlmZmVyZW5jZSB3aXRoIHdlYmNvbXBvbmVudHMuanM6IGRvZXMgbm90IGhhbmRsZSBjb21tZW50c1xuICAgIHJldHVybiBjc3NUZXh0LnJlcGxhY2UoX2Nzc0NvbnRlbnROZXh0U2VsZWN0b3JSZSwgZnVuY3Rpb24oLi4ubTogc3RyaW5nW10pIHtcbiAgICAgIHJldHVybiBtWzJdICsgJ3snO1xuICAgIH0pO1xuICB9XG5cbiAgLypcbiAgICogUHJvY2VzcyBzdHlsZXMgdG8gYWRkIHJ1bGVzIHdoaWNoIHdpbGwgb25seSBhcHBseSB1bmRlciB0aGUgcG9seWZpbGxcbiAgICpcbiAgICogRm9yIGV4YW1wbGUsIHdlIGNvbnZlcnQgdGhpcyBydWxlOlxuICAgKlxuICAgKiBwb2x5ZmlsbC1ydWxlIHtcbiAgICogICBjb250ZW50OiAnOmhvc3QgbWVudS1pdGVtJztcbiAgICogLi4uXG4gICAqIH1cbiAgICpcbiAgICogdG8gdGhpczpcbiAgICpcbiAgICogc2NvcGVOYW1lIG1lbnUtaXRlbSB7Li4ufVxuICAgKlxuICAgKiovXG4gIHByaXZhdGUgX2luc2VydFBvbHlmaWxsUnVsZXNJbkNzc1RleHQoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBEaWZmZXJlbmNlIHdpdGggd2ViY29tcG9uZW50cy5qczogZG9lcyBub3QgaGFuZGxlIGNvbW1lbnRzXG4gICAgcmV0dXJuIGNzc1RleHQucmVwbGFjZShfY3NzQ29udGVudFJ1bGVSZSwgKC4uLm06IHN0cmluZ1tdKSA9PiB7XG4gICAgICBjb25zdCBydWxlID0gbVswXS5yZXBsYWNlKG1bMV0sICcnKS5yZXBsYWNlKG1bMl0sICcnKTtcbiAgICAgIHJldHVybiBtWzRdICsgcnVsZTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qIEVuc3VyZSBzdHlsZXMgYXJlIHNjb3BlZC4gUHNldWRvLXNjb3BpbmcgdGFrZXMgYSBydWxlIGxpa2U6XG4gICAqXG4gICAqICAuZm9vIHsuLi4gfVxuICAgKlxuICAgKiAgYW5kIGNvbnZlcnRzIHRoaXMgdG9cbiAgICpcbiAgICogIHNjb3BlTmFtZSAuZm9vIHsgLi4uIH1cbiAgICovXG4gIHByaXZhdGUgX3Njb3BlQ3NzVGV4dChjc3NUZXh0OiBzdHJpbmcsIHNjb3BlU2VsZWN0b3I6IHN0cmluZywgaG9zdFNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHVuc2NvcGVkUnVsZXMgPSB0aGlzLl9leHRyYWN0VW5zY29wZWRSdWxlc0Zyb21Dc3NUZXh0KGNzc1RleHQpO1xuICAgIC8vIHJlcGxhY2UgOmhvc3QgYW5kIDpob3N0LWNvbnRleHQgLXNoYWRvd2Nzc2hvc3QgYW5kIC1zaGFkb3djc3Nob3N0IHJlc3BlY3RpdmVseVxuICAgIGNzc1RleHQgPSB0aGlzLl9pbnNlcnRQb2x5ZmlsbEhvc3RJbkNzc1RleHQoY3NzVGV4dCk7XG4gICAgY3NzVGV4dCA9IHRoaXMuX2NvbnZlcnRDb2xvbkhvc3QoY3NzVGV4dCk7XG4gICAgY3NzVGV4dCA9IHRoaXMuX2NvbnZlcnRDb2xvbkhvc3RDb250ZXh0KGNzc1RleHQpO1xuICAgIGNzc1RleHQgPSB0aGlzLl9jb252ZXJ0U2hhZG93RE9NU2VsZWN0b3JzKGNzc1RleHQpO1xuICAgIGlmIChzY29wZVNlbGVjdG9yKSB7XG4gICAgICBjc3NUZXh0ID0gdGhpcy5fc2NvcGVTZWxlY3RvcnMoY3NzVGV4dCwgc2NvcGVTZWxlY3RvciwgaG9zdFNlbGVjdG9yKTtcbiAgICB9XG4gICAgY3NzVGV4dCA9IGNzc1RleHQgKyAnXFxuJyArIHVuc2NvcGVkUnVsZXM7XG4gICAgcmV0dXJuIGNzc1RleHQudHJpbSgpO1xuICB9XG5cbiAgLypcbiAgICogUHJvY2VzcyBzdHlsZXMgdG8gYWRkIHJ1bGVzIHdoaWNoIHdpbGwgb25seSBhcHBseSB1bmRlciB0aGUgcG9seWZpbGxcbiAgICogYW5kIGRvIG5vdCBwcm9jZXNzIHZpYSBDU1NPTS4gKENTU09NIGlzIGRlc3RydWN0aXZlIHRvIHJ1bGVzIG9uIHJhcmVcbiAgICogb2NjYXNpb25zLCBlLmcuIC13ZWJraXQtY2FsYyBvbiBTYWZhcmkuKVxuICAgKiBGb3IgZXhhbXBsZSwgd2UgY29udmVydCB0aGlzIHJ1bGU6XG4gICAqXG4gICAqIEBwb2x5ZmlsbC11bnNjb3BlZC1ydWxlIHtcbiAgICogICBjb250ZW50OiAnbWVudS1pdGVtJztcbiAgICogLi4uIH1cbiAgICpcbiAgICogdG8gdGhpczpcbiAgICpcbiAgICogbWVudS1pdGVtIHsuLi59XG4gICAqXG4gICAqKi9cbiAgcHJpdmF0ZSBfZXh0cmFjdFVuc2NvcGVkUnVsZXNGcm9tQ3NzVGV4dChjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIERpZmZlcmVuY2Ugd2l0aCB3ZWJjb21wb25lbnRzLmpzOiBkb2VzIG5vdCBoYW5kbGUgY29tbWVudHNcbiAgICBsZXQgciA9ICcnO1xuICAgIGxldCBtOiBSZWdFeHBFeGVjQXJyYXl8bnVsbDtcbiAgICBfY3NzQ29udGVudFVuc2NvcGVkUnVsZVJlLmxhc3RJbmRleCA9IDA7XG4gICAgd2hpbGUgKChtID0gX2Nzc0NvbnRlbnRVbnNjb3BlZFJ1bGVSZS5leGVjKGNzc1RleHQpKSAhPT0gbnVsbCkge1xuICAgICAgY29uc3QgcnVsZSA9IG1bMF0ucmVwbGFjZShtWzJdLCAnJykucmVwbGFjZShtWzFdLCBtWzRdKTtcbiAgICAgIHIgKz0gcnVsZSArICdcXG5cXG4nO1xuICAgIH1cbiAgICByZXR1cm4gcjtcbiAgfVxuXG4gIC8qXG4gICAqIGNvbnZlcnQgYSBydWxlIGxpa2UgOmhvc3QoLmZvbykgPiAuYmFyIHsgfVxuICAgKlxuICAgKiB0b1xuICAgKlxuICAgKiAuZm9vPHNjb3BlTmFtZT4gPiAuYmFyXG4gICAqL1xuICBwcml2YXRlIF9jb252ZXJ0Q29sb25Ib3N0KGNzc1RleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGNzc1RleHQucmVwbGFjZShfY3NzQ29sb25Ib3N0UmUsIChfLCBob3N0U2VsZWN0b3JzOiBzdHJpbmcsIG90aGVyU2VsZWN0b3JzOiBzdHJpbmcpID0+IHtcbiAgICAgIGlmIChob3N0U2VsZWN0b3JzKSB7XG4gICAgICAgIGNvbnN0IGNvbnZlcnRlZFNlbGVjdG9yczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgY29uc3QgaG9zdFNlbGVjdG9yQXJyYXkgPSBob3N0U2VsZWN0b3JzLnNwbGl0KCcsJykubWFwKHAgPT4gcC50cmltKCkpO1xuICAgICAgICBmb3IgKGNvbnN0IGhvc3RTZWxlY3RvciBvZiBob3N0U2VsZWN0b3JBcnJheSkge1xuICAgICAgICAgIGlmICghaG9zdFNlbGVjdG9yKSBicmVhaztcbiAgICAgICAgICBjb25zdCBjb252ZXJ0ZWRTZWxlY3RvciA9XG4gICAgICAgICAgICAgIF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IgKyBob3N0U2VsZWN0b3IucmVwbGFjZShfcG9seWZpbGxIb3N0LCAnJykgKyBvdGhlclNlbGVjdG9ycztcbiAgICAgICAgICBjb252ZXJ0ZWRTZWxlY3RvcnMucHVzaChjb252ZXJ0ZWRTZWxlY3Rvcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbnZlcnRlZFNlbGVjdG9ycy5qb2luKCcsJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gX3BvbHlmaWxsSG9zdE5vQ29tYmluYXRvciArIG90aGVyU2VsZWN0b3JzO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLypcbiAgICogY29udmVydCBhIHJ1bGUgbGlrZSA6aG9zdC1jb250ZXh0KC5mb28pID4gLmJhciB7IH1cbiAgICpcbiAgICogdG9cbiAgICpcbiAgICogLmZvbzxzY29wZU5hbWU+ID4gLmJhciwgLmZvbyA8c2NvcGVOYW1lPiA+IC5iYXIgeyB9XG4gICAqXG4gICAqIGFuZFxuICAgKlxuICAgKiA6aG9zdC1jb250ZXh0KC5mb286aG9zdCkgLmJhciB7IC4uLiB9XG4gICAqXG4gICAqIHRvXG4gICAqXG4gICAqIC5mb288c2NvcGVOYW1lPiAuYmFyIHsgLi4uIH1cbiAgICovXG4gIHByaXZhdGUgX2NvbnZlcnRDb2xvbkhvc3RDb250ZXh0KGNzc1RleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGNzc1RleHQucmVwbGFjZShfY3NzQ29sb25Ib3N0Q29udGV4dFJlR2xvYmFsLCBzZWxlY3RvclRleHQgPT4ge1xuICAgICAgLy8gV2UgaGF2ZSBjYXB0dXJlZCBhIHNlbGVjdG9yIHRoYXQgY29udGFpbnMgYSBgOmhvc3QtY29udGV4dGAgcnVsZS5cblxuICAgICAgLy8gRm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgYDpob3N0LWNvbnRleHRgIG1heSBjb250YWluIGEgY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2Ygc2VsZWN0b3JzLlxuICAgICAgLy8gRWFjaCBjb250ZXh0IHNlbGVjdG9yIGdyb3VwIHdpbGwgY29udGFpbiBhIGxpc3Qgb2YgaG9zdC1jb250ZXh0IHNlbGVjdG9ycyB0aGF0IG11c3QgbWF0Y2hcbiAgICAgIC8vIGFuIGFuY2VzdG9yIG9mIHRoZSBob3N0LlxuICAgICAgLy8gKE5vcm1hbGx5IGBjb250ZXh0U2VsZWN0b3JHcm91cHNgIHdpbGwgb25seSBjb250YWluIGEgc2luZ2xlIGFycmF5IG9mIGNvbnRleHQgc2VsZWN0b3JzLilcbiAgICAgIGNvbnN0IGNvbnRleHRTZWxlY3Rvckdyb3Vwczogc3RyaW5nW11bXSA9IFtbXV07XG5cbiAgICAgIC8vIFRoZXJlIG1heSBiZSBtb3JlIHRoYW4gYDpob3N0LWNvbnRleHRgIGluIHRoaXMgc2VsZWN0b3Igc28gYHNlbGVjdG9yVGV4dGAgY291bGQgbG9vayBsaWtlOlxuICAgICAgLy8gYDpob3N0LWNvbnRleHQoLm9uZSk6aG9zdC1jb250ZXh0KC50d28pYC5cbiAgICAgIC8vIEV4ZWN1dGUgYF9jc3NDb2xvbkhvc3RDb250ZXh0UmVgIG92ZXIgYW5kIG92ZXIgdW50aWwgd2UgaGF2ZSBleHRyYWN0ZWQgYWxsIHRoZVxuICAgICAgLy8gYDpob3N0LWNvbnRleHRgIHNlbGVjdG9ycyBmcm9tIHRoaXMgc2VsZWN0b3IuXG4gICAgICBsZXQgbWF0Y2g6IFJlZ0V4cE1hdGNoQXJyYXl8bnVsbDtcbiAgICAgIHdoaWxlIChtYXRjaCA9IF9jc3NDb2xvbkhvc3RDb250ZXh0UmUuZXhlYyhzZWxlY3RvclRleHQpKSB7XG4gICAgICAgIC8vIGBtYXRjaGAgPSBbJzpob3N0LWNvbnRleHQoPHNlbGVjdG9ycz4pPHJlc3Q+JywgPHNlbGVjdG9ycz4sIDxyZXN0Pl1cblxuICAgICAgICAvLyBUaGUgYDxzZWxlY3RvcnM+YCBjb3VsZCBhY3R1YWxseSBiZSBhIGNvbW1hIHNlcGFyYXRlZCBsaXN0OiBgOmhvc3QtY29udGV4dCgub25lLCAudHdvKWAuXG4gICAgICAgIGNvbnN0IG5ld0NvbnRleHRTZWxlY3RvcnMgPVxuICAgICAgICAgICAgKG1hdGNoWzFdID8/ICcnKS50cmltKCkuc3BsaXQoJywnKS5tYXAobSA9PiBtLnRyaW0oKSkuZmlsdGVyKG0gPT4gbSAhPT0gJycpO1xuXG4gICAgICAgIC8vIFdlIG11c3QgZHVwbGljYXRlIHRoZSBjdXJyZW50IHNlbGVjdG9yIGdyb3VwIGZvciBlYWNoIG9mIHRoZXNlIG5ldyBzZWxlY3RvcnMuXG4gICAgICAgIC8vIEZvciBleGFtcGxlIGlmIHRoZSBjdXJyZW50IGdyb3VwcyBhcmU6XG4gICAgICAgIC8vIGBgYFxuICAgICAgICAvLyBbXG4gICAgICAgIC8vICAgWydhJywgJ2InLCAnYyddLFxuICAgICAgICAvLyAgIFsneCcsICd5JywgJ3onXSxcbiAgICAgICAgLy8gXVxuICAgICAgICAvLyBgYGBcbiAgICAgICAgLy8gQW5kIHdlIGhhdmUgYSBuZXcgc2V0IG9mIGNvbW1hIHNlcGFyYXRlZCBzZWxlY3RvcnM6IGA6aG9zdC1jb250ZXh0KG0sbilgIHRoZW4gdGhlIG5ld1xuICAgICAgICAvLyBncm91cHMgYXJlOlxuICAgICAgICAvLyBgYGBcbiAgICAgICAgLy8gW1xuICAgICAgICAvLyAgIFsnYScsICdiJywgJ2MnLCAnbSddLFxuICAgICAgICAvLyAgIFsneCcsICd5JywgJ3onLCAnbSddLFxuICAgICAgICAvLyAgIFsnYScsICdiJywgJ2MnLCAnbiddLFxuICAgICAgICAvLyAgIFsneCcsICd5JywgJ3onLCAnbiddLFxuICAgICAgICAvLyBdXG4gICAgICAgIC8vIGBgYFxuICAgICAgICBjb25zdCBjb250ZXh0U2VsZWN0b3JHcm91cHNMZW5ndGggPSBjb250ZXh0U2VsZWN0b3JHcm91cHMubGVuZ3RoO1xuICAgICAgICByZXBlYXRHcm91cHMoY29udGV4dFNlbGVjdG9yR3JvdXBzLCBuZXdDb250ZXh0U2VsZWN0b3JzLmxlbmd0aCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmV3Q29udGV4dFNlbGVjdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgY29udGV4dFNlbGVjdG9yR3JvdXBzTGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGNvbnRleHRTZWxlY3Rvckdyb3Vwc1tqICsgKGkgKiBjb250ZXh0U2VsZWN0b3JHcm91cHNMZW5ndGgpXS5wdXNoKFxuICAgICAgICAgICAgICAgIG5ld0NvbnRleHRTZWxlY3RvcnNbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgYHNlbGVjdG9yVGV4dGAgYW5kIHNlZSByZXBlYXQgdG8gc2VlIGlmIHRoZXJlIGFyZSBtb3JlIGA6aG9zdC1jb250ZXh0YHMuXG4gICAgICAgIHNlbGVjdG9yVGV4dCA9IG1hdGNoWzJdO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dCBzZWxlY3RvcnMgbm93IG11c3QgYmUgY29tYmluZWQgd2l0aCBlYWNoIG90aGVyIHRvIGNhcHR1cmUgYWxsIHRoZSBwb3NzaWJsZVxuICAgICAgLy8gc2VsZWN0b3JzIHRoYXQgYDpob3N0LWNvbnRleHRgIGNhbiBtYXRjaC4gU2VlIGBjb21iaW5lSG9zdENvbnRleHRTZWxlY3RvcnMoKWAgZm9yIG1vcmVcbiAgICAgIC8vIGluZm8gYWJvdXQgaG93IHRoaXMgaXMgZG9uZS5cbiAgICAgIHJldHVybiBjb250ZXh0U2VsZWN0b3JHcm91cHNcbiAgICAgICAgICAubWFwKGNvbnRleHRTZWxlY3RvcnMgPT4gY29tYmluZUhvc3RDb250ZXh0U2VsZWN0b3JzKGNvbnRleHRTZWxlY3RvcnMsIHNlbGVjdG9yVGV4dCkpXG4gICAgICAgICAgLmpvaW4oJywgJyk7XG4gICAgfSk7XG4gIH1cblxuICAvKlxuICAgKiBDb252ZXJ0IGNvbWJpbmF0b3JzIGxpa2UgOjpzaGFkb3cgYW5kIHBzZXVkby1lbGVtZW50cyBsaWtlIDo6Y29udGVudFxuICAgKiBieSByZXBsYWNpbmcgd2l0aCBzcGFjZS5cbiAgICovXG4gIHByaXZhdGUgX2NvbnZlcnRTaGFkb3dET01TZWxlY3RvcnMoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gX3NoYWRvd0RPTVNlbGVjdG9yc1JlLnJlZHVjZSgocmVzdWx0LCBwYXR0ZXJuKSA9PiByZXN1bHQucmVwbGFjZShwYXR0ZXJuLCAnICcpLCBjc3NUZXh0KTtcbiAgfVxuXG4gIC8vIGNoYW5nZSBhIHNlbGVjdG9yIGxpa2UgJ2RpdicgdG8gJ25hbWUgZGl2J1xuICBwcml2YXRlIF9zY29wZVNlbGVjdG9ycyhjc3NUZXh0OiBzdHJpbmcsIHNjb3BlU2VsZWN0b3I6IHN0cmluZywgaG9zdFNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBwcm9jZXNzUnVsZXMoY3NzVGV4dCwgKHJ1bGU6IENzc1J1bGUpID0+IHtcbiAgICAgIGxldCBzZWxlY3RvciA9IHJ1bGUuc2VsZWN0b3I7XG4gICAgICBsZXQgY29udGVudCA9IHJ1bGUuY29udGVudDtcbiAgICAgIGlmIChydWxlLnNlbGVjdG9yWzBdICE9PSAnQCcpIHtcbiAgICAgICAgc2VsZWN0b3IgPVxuICAgICAgICAgICAgdGhpcy5fc2NvcGVTZWxlY3RvcihydWxlLnNlbGVjdG9yLCBzY29wZVNlbGVjdG9yLCBob3N0U2VsZWN0b3IsIHRoaXMuc3RyaWN0U3R5bGluZyk7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgIHJ1bGUuc2VsZWN0b3Iuc3RhcnRzV2l0aCgnQG1lZGlhJykgfHwgcnVsZS5zZWxlY3Rvci5zdGFydHNXaXRoKCdAc3VwcG9ydHMnKSB8fFxuICAgICAgICAgIHJ1bGUuc2VsZWN0b3Iuc3RhcnRzV2l0aCgnQGRvY3VtZW50JykpIHtcbiAgICAgICAgY29udGVudCA9IHRoaXMuX3Njb3BlU2VsZWN0b3JzKHJ1bGUuY29udGVudCwgc2NvcGVTZWxlY3RvciwgaG9zdFNlbGVjdG9yKTtcbiAgICAgIH0gZWxzZSBpZiAocnVsZS5zZWxlY3Rvci5zdGFydHNXaXRoKCdAZm9udC1mYWNlJykgfHwgcnVsZS5zZWxlY3Rvci5zdGFydHNXaXRoKCdAcGFnZScpKSB7XG4gICAgICAgIGNvbnRlbnQgPSB0aGlzLl9zdHJpcFNjb3BpbmdTZWxlY3RvcnMocnVsZS5jb250ZW50KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgQ3NzUnVsZShzZWxlY3RvciwgY29udGVudCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIGEgY3NzIHRleHQgdGhhdCBpcyB3aXRoaW4gYSBydWxlIHRoYXQgc2hvdWxkIG5vdCBjb250YWluIHNjb3BlIHNlbGVjdG9ycyBieSBzaW1wbHlcbiAgICogcmVtb3ZpbmcgdGhlbSEgQW4gZXhhbXBsZSBvZiBzdWNoIGEgcnVsZSBpcyBgQGZvbnQtZmFjZWAuXG4gICAqXG4gICAqIGBAZm9udC1mYWNlYCBydWxlcyBjYW5ub3QgY29udGFpbiBuZXN0ZWQgc2VsZWN0b3JzLiBOb3IgY2FuIHRoZXkgYmUgbmVzdGVkIHVuZGVyIGEgc2VsZWN0b3IuXG4gICAqIE5vcm1hbGx5IHRoaXMgd291bGQgYmUgYSBzeW50YXggZXJyb3IgYnkgdGhlIGF1dGhvciBvZiB0aGUgc3R5bGVzLiBCdXQgaW4gc29tZSByYXJlIGNhc2VzLCBzdWNoXG4gICAqIGFzIGltcG9ydGluZyBzdHlsZXMgZnJvbSBhIGxpYnJhcnksIGFuZCBhcHBseWluZyBgOmhvc3QgOjpuZy1kZWVwYCB0byB0aGUgaW1wb3J0ZWQgc3R5bGVzLCB3ZVxuICAgKiBjYW4gZW5kIHVwIHdpdGggYnJva2VuIGNzcyBpZiB0aGUgaW1wb3J0ZWQgc3R5bGVzIGhhcHBlbiB0byBjb250YWluIEBmb250LWZhY2UgcnVsZXMuXG4gICAqXG4gICAqIEZvciBleGFtcGxlOlxuICAgKlxuICAgKiBgYGBcbiAgICogOmhvc3QgOjpuZy1kZWVwIHtcbiAgICogICBpbXBvcnQgJ3NvbWUvbGliL2NvbnRhaW5pbmcvZm9udC1mYWNlJztcbiAgICogfVxuICAgKlxuICAgKiBTaW1pbGFyIGxvZ2ljIGFwcGxpZXMgdG8gYEBwYWdlYCBydWxlcyB3aGljaCBjYW4gY29udGFpbiBhIHBhcnRpY3VsYXIgc2V0IG9mIHByb3BlcnRpZXMsXG4gICAqIGFzIHdlbGwgYXMgc29tZSBzcGVjaWZpYyBhdC1ydWxlcy4gU2luY2UgdGhleSBjYW4ndCBiZSBlbmNhcHN1bGF0ZWQsIHdlIGhhdmUgdG8gc3RyaXBcbiAgICogYW55IHNjb3Bpbmcgc2VsZWN0b3JzIGZyb20gdGhlbS4gRm9yIG1vcmUgaW5mb3JtYXRpb246IGh0dHBzOi8vd3d3LnczLm9yZy9UUi9jc3MtcGFnZS0zXG4gICAqIGBgYFxuICAgKi9cbiAgcHJpdmF0ZSBfc3RyaXBTY29waW5nU2VsZWN0b3JzKGNzc1RleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHByb2Nlc3NSdWxlcyhjc3NUZXh0LCBydWxlID0+IHtcbiAgICAgIGNvbnN0IHNlbGVjdG9yID0gcnVsZS5zZWxlY3Rvci5yZXBsYWNlKF9zaGFkb3dEZWVwU2VsZWN0b3JzLCAnICcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZShfcG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yUmUsICcgJyk7XG4gICAgICByZXR1cm4gbmV3IENzc1J1bGUoc2VsZWN0b3IsIHJ1bGUuY29udGVudCk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9zY29wZVNlbGVjdG9yKFxuICAgICAgc2VsZWN0b3I6IHN0cmluZywgc2NvcGVTZWxlY3Rvcjogc3RyaW5nLCBob3N0U2VsZWN0b3I6IHN0cmluZywgc3RyaWN0OiBib29sZWFuKTogc3RyaW5nIHtcbiAgICByZXR1cm4gc2VsZWN0b3Iuc3BsaXQoJywnKVxuICAgICAgICAubWFwKHBhcnQgPT4gcGFydC50cmltKCkuc3BsaXQoX3NoYWRvd0RlZXBTZWxlY3RvcnMpKVxuICAgICAgICAubWFwKChkZWVwUGFydHMpID0+IHtcbiAgICAgICAgICBjb25zdCBbc2hhbGxvd1BhcnQsIC4uLm90aGVyUGFydHNdID0gZGVlcFBhcnRzO1xuICAgICAgICAgIGNvbnN0IGFwcGx5U2NvcGUgPSAoc2hhbGxvd1BhcnQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3NlbGVjdG9yTmVlZHNTY29waW5nKHNoYWxsb3dQYXJ0LCBzY29wZVNlbGVjdG9yKSkge1xuICAgICAgICAgICAgICByZXR1cm4gc3RyaWN0ID9cbiAgICAgICAgICAgICAgICAgIHRoaXMuX2FwcGx5U3RyaWN0U2VsZWN0b3JTY29wZShzaGFsbG93UGFydCwgc2NvcGVTZWxlY3RvciwgaG9zdFNlbGVjdG9yKSA6XG4gICAgICAgICAgICAgICAgICB0aGlzLl9hcHBseVNlbGVjdG9yU2NvcGUoc2hhbGxvd1BhcnQsIHNjb3BlU2VsZWN0b3IsIGhvc3RTZWxlY3Rvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gc2hhbGxvd1BhcnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICByZXR1cm4gW2FwcGx5U2NvcGUoc2hhbGxvd1BhcnQpLCAuLi5vdGhlclBhcnRzXS5qb2luKCcgJyk7XG4gICAgICAgIH0pXG4gICAgICAgIC5qb2luKCcsICcpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2VsZWN0b3JOZWVkc1Njb3Bpbmcoc2VsZWN0b3I6IHN0cmluZywgc2NvcGVTZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgcmUgPSB0aGlzLl9tYWtlU2NvcGVNYXRjaGVyKHNjb3BlU2VsZWN0b3IpO1xuICAgIHJldHVybiAhcmUudGVzdChzZWxlY3Rvcik7XG4gIH1cblxuICBwcml2YXRlIF9tYWtlU2NvcGVNYXRjaGVyKHNjb3BlU2VsZWN0b3I6IHN0cmluZyk6IFJlZ0V4cCB7XG4gICAgY29uc3QgbHJlID0gL1xcWy9nO1xuICAgIGNvbnN0IHJyZSA9IC9cXF0vZztcbiAgICBzY29wZVNlbGVjdG9yID0gc2NvcGVTZWxlY3Rvci5yZXBsYWNlKGxyZSwgJ1xcXFxbJykucmVwbGFjZShycmUsICdcXFxcXScpO1xuICAgIHJldHVybiBuZXcgUmVnRXhwKCdeKCcgKyBzY29wZVNlbGVjdG9yICsgJyknICsgX3NlbGVjdG9yUmVTdWZmaXgsICdtJyk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseVNlbGVjdG9yU2NvcGUoc2VsZWN0b3I6IHN0cmluZywgc2NvcGVTZWxlY3Rvcjogc3RyaW5nLCBob3N0U2VsZWN0b3I6IHN0cmluZyk6XG4gICAgICBzdHJpbmcge1xuICAgIC8vIERpZmZlcmVuY2UgZnJvbSB3ZWJjb21wb25lbnRzLmpzOiBzY29wZVNlbGVjdG9yIGNvdWxkIG5vdCBiZSBhbiBhcnJheVxuICAgIHJldHVybiB0aGlzLl9hcHBseVNpbXBsZVNlbGVjdG9yU2NvcGUoc2VsZWN0b3IsIHNjb3BlU2VsZWN0b3IsIGhvc3RTZWxlY3Rvcik7XG4gIH1cblxuICAvLyBzY29wZSB2aWEgbmFtZSBhbmQgW2lzPW5hbWVdXG4gIHByaXZhdGUgX2FwcGx5U2ltcGxlU2VsZWN0b3JTY29wZShzZWxlY3Rvcjogc3RyaW5nLCBzY29wZVNlbGVjdG9yOiBzdHJpbmcsIGhvc3RTZWxlY3Rvcjogc3RyaW5nKTpcbiAgICAgIHN0cmluZyB7XG4gICAgLy8gSW4gQW5kcm9pZCBicm93c2VyLCB0aGUgbGFzdEluZGV4IGlzIG5vdCByZXNldCB3aGVuIHRoZSByZWdleCBpcyB1c2VkIGluIFN0cmluZy5yZXBsYWNlKClcbiAgICBfcG9seWZpbGxIb3N0UmUubGFzdEluZGV4ID0gMDtcbiAgICBpZiAoX3BvbHlmaWxsSG9zdFJlLnRlc3Qoc2VsZWN0b3IpKSB7XG4gICAgICBjb25zdCByZXBsYWNlQnkgPSB0aGlzLnN0cmljdFN0eWxpbmcgPyBgWyR7aG9zdFNlbGVjdG9yfV1gIDogc2NvcGVTZWxlY3RvcjtcbiAgICAgIHJldHVybiBzZWxlY3RvclxuICAgICAgICAgIC5yZXBsYWNlKFxuICAgICAgICAgICAgICBfcG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yUmUsXG4gICAgICAgICAgICAgIChobmMsIHNlbGVjdG9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgIC8oW146XSopKDoqKSguKikvLFxuICAgICAgICAgICAgICAgICAgICAoXzogc3RyaW5nLCBiZWZvcmU6IHN0cmluZywgY29sb246IHN0cmluZywgYWZ0ZXI6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBiZWZvcmUgKyByZXBsYWNlQnkgKyBjb2xvbiArIGFmdGVyO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAucmVwbGFjZShfcG9seWZpbGxIb3N0UmUsIHJlcGxhY2VCeSArICcgJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNjb3BlU2VsZWN0b3IgKyAnICcgKyBzZWxlY3RvcjtcbiAgfVxuXG4gIC8vIHJldHVybiBhIHNlbGVjdG9yIHdpdGggW25hbWVdIHN1ZmZpeCBvbiBlYWNoIHNpbXBsZSBzZWxlY3RvclxuICAvLyBlLmcuIC5mb28uYmFyID4gLnpvdCBiZWNvbWVzIC5mb29bbmFtZV0uYmFyW25hbWVdID4gLnpvdFtuYW1lXSAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9hcHBseVN0cmljdFNlbGVjdG9yU2NvcGUoc2VsZWN0b3I6IHN0cmluZywgc2NvcGVTZWxlY3Rvcjogc3RyaW5nLCBob3N0U2VsZWN0b3I6IHN0cmluZyk6XG4gICAgICBzdHJpbmcge1xuICAgIGNvbnN0IGlzUmUgPSAvXFxbaXM9KFteXFxdXSopXFxdL2c7XG4gICAgc2NvcGVTZWxlY3RvciA9IHNjb3BlU2VsZWN0b3IucmVwbGFjZShpc1JlLCAoXzogc3RyaW5nLCAuLi5wYXJ0czogc3RyaW5nW10pID0+IHBhcnRzWzBdKTtcblxuICAgIGNvbnN0IGF0dHJOYW1lID0gJ1snICsgc2NvcGVTZWxlY3RvciArICddJztcblxuICAgIGNvbnN0IF9zY29wZVNlbGVjdG9yUGFydCA9IChwOiBzdHJpbmcpID0+IHtcbiAgICAgIGxldCBzY29wZWRQID0gcC50cmltKCk7XG5cbiAgICAgIGlmICghc2NvcGVkUCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIGlmIChwLmluZGV4T2YoX3BvbHlmaWxsSG9zdE5vQ29tYmluYXRvcikgPiAtMSkge1xuICAgICAgICBzY29wZWRQID0gdGhpcy5fYXBwbHlTaW1wbGVTZWxlY3RvclNjb3BlKHAsIHNjb3BlU2VsZWN0b3IsIGhvc3RTZWxlY3Rvcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZW1vdmUgOmhvc3Qgc2luY2UgaXQgc2hvdWxkIGJlIHVubmVjZXNzYXJ5XG4gICAgICAgIGNvbnN0IHQgPSBwLnJlcGxhY2UoX3BvbHlmaWxsSG9zdFJlLCAnJyk7XG4gICAgICAgIGlmICh0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjb25zdCBtYXRjaGVzID0gdC5tYXRjaCgvKFteOl0qKSg6KikoLiopLyk7XG4gICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgIHNjb3BlZFAgPSBtYXRjaGVzWzFdICsgYXR0ck5hbWUgKyBtYXRjaGVzWzJdICsgbWF0Y2hlc1szXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNjb3BlZFA7XG4gICAgfTtcblxuICAgIGNvbnN0IHNhZmVDb250ZW50ID0gbmV3IFNhZmVTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgc2VsZWN0b3IgPSBzYWZlQ29udGVudC5jb250ZW50KCk7XG5cbiAgICBsZXQgc2NvcGVkU2VsZWN0b3IgPSAnJztcbiAgICBsZXQgc3RhcnRJbmRleCA9IDA7XG4gICAgbGV0IHJlczogUmVnRXhwRXhlY0FycmF5fG51bGw7XG4gICAgY29uc3Qgc2VwID0gLyggfD58XFwrfH4oPyE9KSlcXHMqL2c7XG5cbiAgICAvLyBJZiBhIHNlbGVjdG9yIGFwcGVhcnMgYmVmb3JlIDpob3N0IGl0IHNob3VsZCBub3QgYmUgc2hpbW1lZCBhcyBpdFxuICAgIC8vIG1hdGNoZXMgb24gYW5jZXN0b3IgZWxlbWVudHMgYW5kIG5vdCBvbiBlbGVtZW50cyBpbiB0aGUgaG9zdCdzIHNoYWRvd1xuICAgIC8vIGA6aG9zdC1jb250ZXh0KGRpdilgIGlzIHRyYW5zZm9ybWVkIHRvXG4gICAgLy8gYC1zaGFkb3djc3Nob3N0LW5vLWNvbWJpbmF0b3JkaXYsIGRpdiAtc2hhZG93Y3NzaG9zdC1uby1jb21iaW5hdG9yYFxuICAgIC8vIHRoZSBgZGl2YCBpcyBub3QgcGFydCBvZiB0aGUgY29tcG9uZW50IGluIHRoZSAybmQgc2VsZWN0b3JzIGFuZCBzaG91bGQgbm90IGJlIHNjb3BlZC5cbiAgICAvLyBIaXN0b3JpY2FsbHkgYGNvbXBvbmVudC10YWc6aG9zdGAgd2FzIG1hdGNoaW5nIHRoZSBjb21wb25lbnQgc28gd2UgYWxzbyB3YW50IHRvIHByZXNlcnZlXG4gICAgLy8gdGhpcyBiZWhhdmlvciB0byBhdm9pZCBicmVha2luZyBsZWdhY3kgYXBwcyAoaXQgc2hvdWxkIG5vdCBtYXRjaCkuXG4gICAgLy8gVGhlIGJlaGF2aW9yIHNob3VsZCBiZTpcbiAgICAvLyAtIGB0YWc6aG9zdGAgLT4gYHRhZ1toXWAgKHRoaXMgaXMgdG8gYXZvaWQgYnJlYWtpbmcgbGVnYWN5IGFwcHMsIHNob3VsZCBub3QgbWF0Y2ggYW55dGhpbmcpXG4gICAgLy8gLSBgdGFnIDpob3N0YCAtPiBgdGFnIFtoXWAgKGB0YWdgIGlzIG5vdCBzY29wZWQgYmVjYXVzZSBpdCdzIGNvbnNpZGVyZWQgcGFydCBvZiBhXG4gICAgLy8gICBgOmhvc3QtY29udGV4dCh0YWcpYClcbiAgICBjb25zdCBoYXNIb3N0ID0gc2VsZWN0b3IuaW5kZXhPZihfcG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yKSA+IC0xO1xuICAgIC8vIE9ubHkgc2NvcGUgcGFydHMgYWZ0ZXIgdGhlIGZpcnN0IGAtc2hhZG93Y3NzaG9zdC1uby1jb21iaW5hdG9yYCB3aGVuIGl0IGlzIHByZXNlbnRcbiAgICBsZXQgc2hvdWxkU2NvcGUgPSAhaGFzSG9zdDtcblxuICAgIHdoaWxlICgocmVzID0gc2VwLmV4ZWMoc2VsZWN0b3IpKSAhPT0gbnVsbCkge1xuICAgICAgY29uc3Qgc2VwYXJhdG9yID0gcmVzWzFdO1xuICAgICAgY29uc3QgcGFydCA9IHNlbGVjdG9yLnNsaWNlKHN0YXJ0SW5kZXgsIHJlcy5pbmRleCkudHJpbSgpO1xuICAgICAgc2hvdWxkU2NvcGUgPSBzaG91bGRTY29wZSB8fCBwYXJ0LmluZGV4T2YoX3BvbHlmaWxsSG9zdE5vQ29tYmluYXRvcikgPiAtMTtcbiAgICAgIGNvbnN0IHNjb3BlZFBhcnQgPSBzaG91bGRTY29wZSA/IF9zY29wZVNlbGVjdG9yUGFydChwYXJ0KSA6IHBhcnQ7XG4gICAgICBzY29wZWRTZWxlY3RvciArPSBgJHtzY29wZWRQYXJ0fSAke3NlcGFyYXRvcn0gYDtcbiAgICAgIHN0YXJ0SW5kZXggPSBzZXAubGFzdEluZGV4O1xuICAgIH1cblxuICAgIGNvbnN0IHBhcnQgPSBzZWxlY3Rvci5zdWJzdHJpbmcoc3RhcnRJbmRleCk7XG4gICAgc2hvdWxkU2NvcGUgPSBzaG91bGRTY29wZSB8fCBwYXJ0LmluZGV4T2YoX3BvbHlmaWxsSG9zdE5vQ29tYmluYXRvcikgPiAtMTtcbiAgICBzY29wZWRTZWxlY3RvciArPSBzaG91bGRTY29wZSA/IF9zY29wZVNlbGVjdG9yUGFydChwYXJ0KSA6IHBhcnQ7XG5cbiAgICAvLyByZXBsYWNlIHRoZSBwbGFjZWhvbGRlcnMgd2l0aCB0aGVpciBvcmlnaW5hbCB2YWx1ZXNcbiAgICByZXR1cm4gc2FmZUNvbnRlbnQucmVzdG9yZShzY29wZWRTZWxlY3Rvcik7XG4gIH1cblxuICBwcml2YXRlIF9pbnNlcnRQb2x5ZmlsbEhvc3RJbkNzc1RleHQoc2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHNlbGVjdG9yLnJlcGxhY2UoX2NvbG9uSG9zdENvbnRleHRSZSwgX3BvbHlmaWxsSG9zdENvbnRleHQpXG4gICAgICAgIC5yZXBsYWNlKF9jb2xvbkhvc3RSZSwgX3BvbHlmaWxsSG9zdCk7XG4gIH1cbn1cblxuY2xhc3MgU2FmZVNlbGVjdG9yIHtcbiAgcHJpdmF0ZSBwbGFjZWhvbGRlcnM6IHN0cmluZ1tdID0gW107XG4gIHByaXZhdGUgaW5kZXggPSAwO1xuICBwcml2YXRlIF9jb250ZW50OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Ioc2VsZWN0b3I6IHN0cmluZykge1xuICAgIC8vIFJlcGxhY2VzIGF0dHJpYnV0ZSBzZWxlY3RvcnMgd2l0aCBwbGFjZWhvbGRlcnMuXG4gICAgLy8gVGhlIFdTIGluIFthdHRyPVwidmEgbHVlXCJdIHdvdWxkIG90aGVyd2lzZSBiZSBpbnRlcnByZXRlZCBhcyBhIHNlbGVjdG9yIHNlcGFyYXRvci5cbiAgICBzZWxlY3RvciA9IHRoaXMuX2VzY2FwZVJlZ2V4TWF0Y2hlcyhzZWxlY3RvciwgLyhcXFtbXlxcXV0qXFxdKS9nKTtcblxuICAgIC8vIENTUyBhbGxvd3MgZm9yIGNlcnRhaW4gc3BlY2lhbCBjaGFyYWN0ZXJzIHRvIGJlIHVzZWQgaW4gc2VsZWN0b3JzIGlmIHRoZXkncmUgZXNjYXBlZC5cbiAgICAvLyBFLmcuIGAuZm9vOmJsdWVgIHdvbid0IG1hdGNoIGEgY2xhc3MgY2FsbGVkIGBmb286Ymx1ZWAsIGJlY2F1c2UgdGhlIGNvbG9uIGRlbm90ZXMgYVxuICAgIC8vIHBzZXVkby1jbGFzcywgYnV0IHdyaXRpbmcgYC5mb29cXDpibHVlYCB3aWxsIG1hdGNoLCBiZWNhdXNlIHRoZSBjb2xvbiB3YXMgZXNjYXBlZC5cbiAgICAvLyBSZXBsYWNlIGFsbCBlc2NhcGUgc2VxdWVuY2VzIChgXFxgIGZvbGxvd2VkIGJ5IGEgY2hhcmFjdGVyKSB3aXRoIGEgcGxhY2Vob2xkZXIgc29cbiAgICAvLyB0aGF0IG91ciBoYW5kbGluZyBvZiBwc2V1ZG8tc2VsZWN0b3JzIGRvZXNuJ3QgbWVzcyB3aXRoIHRoZW0uXG4gICAgc2VsZWN0b3IgPSB0aGlzLl9lc2NhcGVSZWdleE1hdGNoZXMoc2VsZWN0b3IsIC8oXFxcXC4pL2cpO1xuXG4gICAgLy8gUmVwbGFjZXMgdGhlIGV4cHJlc3Npb24gaW4gYDpudGgtY2hpbGQoMm4gKyAxKWAgd2l0aCBhIHBsYWNlaG9sZGVyLlxuICAgIC8vIFdTIGFuZCBcIitcIiB3b3VsZCBvdGhlcndpc2UgYmUgaW50ZXJwcmV0ZWQgYXMgc2VsZWN0b3Igc2VwYXJhdG9ycy5cbiAgICB0aGlzLl9jb250ZW50ID0gc2VsZWN0b3IucmVwbGFjZSgvKDpudGgtWy1cXHddKykoXFwoW14pXStcXCkpL2csIChfLCBwc2V1ZG8sIGV4cCkgPT4ge1xuICAgICAgY29uc3QgcmVwbGFjZUJ5ID0gYF9fcGgtJHt0aGlzLmluZGV4fV9fYDtcbiAgICAgIHRoaXMucGxhY2Vob2xkZXJzLnB1c2goZXhwKTtcbiAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgIHJldHVybiBwc2V1ZG8gKyByZXBsYWNlQnk7XG4gICAgfSk7XG4gIH1cblxuICByZXN0b3JlKGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGNvbnRlbnQucmVwbGFjZSgvX19waC0oXFxkKylfXy9nLCAoX3BoLCBpbmRleCkgPT4gdGhpcy5wbGFjZWhvbGRlcnNbK2luZGV4XSk7XG4gIH1cblxuICBjb250ZW50KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRlbnQ7XG4gIH1cblxuICAvKipcbiAgICogUmVwbGFjZXMgYWxsIG9mIHRoZSBzdWJzdHJpbmdzIHRoYXQgbWF0Y2ggYSByZWdleCB3aXRoaW4gYVxuICAgKiBzcGVjaWFsIHN0cmluZyAoZS5nLiBgX19waC0wX19gLCBgX19waC0xX19gLCBldGMpLlxuICAgKi9cbiAgcHJpdmF0ZSBfZXNjYXBlUmVnZXhNYXRjaGVzKGNvbnRlbnQ6IHN0cmluZywgcGF0dGVybjogUmVnRXhwKTogc3RyaW5nIHtcbiAgICByZXR1cm4gY29udGVudC5yZXBsYWNlKHBhdHRlcm4sIChfLCBrZWVwKSA9PiB7XG4gICAgICBjb25zdCByZXBsYWNlQnkgPSBgX19waC0ke3RoaXMuaW5kZXh9X19gO1xuICAgICAgdGhpcy5wbGFjZWhvbGRlcnMucHVzaChrZWVwKTtcbiAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgIHJldHVybiByZXBsYWNlQnk7XG4gICAgfSk7XG4gIH1cbn1cblxuY29uc3QgX2Nzc0NvbnRlbnROZXh0U2VsZWN0b3JSZSA9XG4gICAgL3BvbHlmaWxsLW5leHQtc2VsZWN0b3JbXn1dKmNvbnRlbnQ6W1xcc10qPyhbJ1wiXSkoLio/KVxcMVs7XFxzXSp9KFtee10qPyl7L2dpbTtcbmNvbnN0IF9jc3NDb250ZW50UnVsZVJlID0gLyhwb2x5ZmlsbC1ydWxlKVtefV0qKGNvbnRlbnQ6W1xcc10qKFsnXCJdKSguKj8pXFwzKVs7XFxzXSpbXn1dKn0vZ2ltO1xuY29uc3QgX2Nzc0NvbnRlbnRVbnNjb3BlZFJ1bGVSZSA9XG4gICAgLyhwb2x5ZmlsbC11bnNjb3BlZC1ydWxlKVtefV0qKGNvbnRlbnQ6W1xcc10qKFsnXCJdKSguKj8pXFwzKVs7XFxzXSpbXn1dKn0vZ2ltO1xuY29uc3QgX3BvbHlmaWxsSG9zdCA9ICctc2hhZG93Y3NzaG9zdCc7XG4vLyBub3RlOiA6aG9zdC1jb250ZXh0IHByZS1wcm9jZXNzZWQgdG8gLXNoYWRvd2Nzc2hvc3Rjb250ZXh0LlxuY29uc3QgX3BvbHlmaWxsSG9zdENvbnRleHQgPSAnLXNoYWRvd2Nzc2NvbnRleHQnO1xuY29uc3QgX3BhcmVuU3VmZml4ID0gJyg/OlxcXFwoKCcgK1xuICAgICcoPzpcXFxcKFteKShdKlxcXFwpfFteKShdKikrPycgK1xuICAgICcpXFxcXCkpPyhbXix7XSopJztcbmNvbnN0IF9jc3NDb2xvbkhvc3RSZSA9IG5ldyBSZWdFeHAoX3BvbHlmaWxsSG9zdCArIF9wYXJlblN1ZmZpeCwgJ2dpbScpO1xuY29uc3QgX2Nzc0NvbG9uSG9zdENvbnRleHRSZUdsb2JhbCA9IG5ldyBSZWdFeHAoX3BvbHlmaWxsSG9zdENvbnRleHQgKyBfcGFyZW5TdWZmaXgsICdnaW0nKTtcbmNvbnN0IF9jc3NDb2xvbkhvc3RDb250ZXh0UmUgPSBuZXcgUmVnRXhwKF9wb2x5ZmlsbEhvc3RDb250ZXh0ICsgX3BhcmVuU3VmZml4LCAnaW0nKTtcbmNvbnN0IF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IgPSBfcG9seWZpbGxIb3N0ICsgJy1uby1jb21iaW5hdG9yJztcbmNvbnN0IF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3JSZSA9IC8tc2hhZG93Y3NzaG9zdC1uby1jb21iaW5hdG9yKFteXFxzXSopLztcbmNvbnN0IF9zaGFkb3dET01TZWxlY3RvcnNSZSA9IFtcbiAgLzo6c2hhZG93L2csXG4gIC86OmNvbnRlbnQvZyxcbiAgLy8gRGVwcmVjYXRlZCBzZWxlY3RvcnNcbiAgL1xcL3NoYWRvdy1kZWVwXFwvL2csXG4gIC9cXC9zaGFkb3dcXC8vZyxcbl07XG5cbi8vIFRoZSBkZWVwIGNvbWJpbmF0b3IgaXMgZGVwcmVjYXRlZCBpbiB0aGUgQ1NTIHNwZWNcbi8vIFN1cHBvcnQgZm9yIGA+Pj5gLCBgZGVlcGAsIGA6Om5nLWRlZXBgIGlzIHRoZW4gYWxzbyBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIGZ1dHVyZS5cbi8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL3B1bGwvMTc2NzdcbmNvbnN0IF9zaGFkb3dEZWVwU2VsZWN0b3JzID0gLyg/Oj4+Pil8KD86XFwvZGVlcFxcLyl8KD86OjpuZy1kZWVwKS9nO1xuY29uc3QgX3NlbGVjdG9yUmVTdWZmaXggPSAnKFs+XFxcXHN+K1xcWy4sezpdW1xcXFxzXFxcXFNdKik/JCc7XG5jb25zdCBfcG9seWZpbGxIb3N0UmUgPSAvLXNoYWRvd2Nzc2hvc3QvZ2ltO1xuY29uc3QgX2NvbG9uSG9zdFJlID0gLzpob3N0L2dpbTtcbmNvbnN0IF9jb2xvbkhvc3RDb250ZXh0UmUgPSAvOmhvc3QtY29udGV4dC9naW07XG5cbmNvbnN0IF9jb21tZW50UmUgPSAvXFwvXFwqXFxzKltcXHNcXFNdKj9cXCpcXC8vZztcblxuZnVuY3Rpb24gc3RyaXBDb21tZW50cyhpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlucHV0LnJlcGxhY2UoX2NvbW1lbnRSZSwgJycpO1xufVxuXG5jb25zdCBfY29tbWVudFdpdGhIYXNoUmUgPSAvXFwvXFwqXFxzKiNcXHMqc291cmNlKE1hcHBpbmcpP1VSTD1bXFxzXFxTXSs/XFwqXFwvL2c7XG5cbmZ1bmN0aW9uIGV4dHJhY3RDb21tZW50c1dpdGhIYXNoKGlucHV0OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIHJldHVybiBpbnB1dC5tYXRjaChfY29tbWVudFdpdGhIYXNoUmUpIHx8IFtdO1xufVxuXG5jb25zdCBCTE9DS19QTEFDRUhPTERFUiA9ICclQkxPQ0slJztcbmNvbnN0IFFVT1RFX1BMQUNFSE9MREVSID0gJyVRVU9URUQlJztcbmNvbnN0IF9ydWxlUmUgPSAvKFxccyopKFteO1xce1xcfV0rPykoXFxzKikoKD86eyVCTE9DSyV9P1xccyo7Pyl8KD86XFxzKjspKS9nO1xuY29uc3QgX3F1b3RlZFJlID0gLyVRVU9URUQlL2c7XG5jb25zdCBDT05URU5UX1BBSVJTID0gbmV3IE1hcChbWyd7JywgJ30nXV0pO1xuY29uc3QgUVVPVEVfUEFJUlMgPSBuZXcgTWFwKFtbYFwiYCwgYFwiYF0sIFtgJ2AsIGAnYF1dKTtcblxuZXhwb3J0IGNsYXNzIENzc1J1bGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc2VsZWN0b3I6IHN0cmluZywgcHVibGljIGNvbnRlbnQ6IHN0cmluZykge31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NSdWxlcyhpbnB1dDogc3RyaW5nLCBydWxlQ2FsbGJhY2s6IChydWxlOiBDc3NSdWxlKSA9PiBDc3NSdWxlKTogc3RyaW5nIHtcbiAgY29uc3QgaW5wdXRXaXRoRXNjYXBlZFF1b3RlcyA9IGVzY2FwZUJsb2NrcyhpbnB1dCwgUVVPVEVfUEFJUlMsIFFVT1RFX1BMQUNFSE9MREVSKTtcbiAgY29uc3QgaW5wdXRXaXRoRXNjYXBlZEJsb2NrcyA9XG4gICAgICBlc2NhcGVCbG9ja3MoaW5wdXRXaXRoRXNjYXBlZFF1b3Rlcy5lc2NhcGVkU3RyaW5nLCBDT05URU5UX1BBSVJTLCBCTE9DS19QTEFDRUhPTERFUik7XG4gIGxldCBuZXh0QmxvY2tJbmRleCA9IDA7XG4gIGxldCBuZXh0UXVvdGVJbmRleCA9IDA7XG4gIHJldHVybiBpbnB1dFdpdGhFc2NhcGVkQmxvY2tzLmVzY2FwZWRTdHJpbmdcbiAgICAgIC5yZXBsYWNlKFxuICAgICAgICAgIF9ydWxlUmUsXG4gICAgICAgICAgKC4uLm06IHN0cmluZ1tdKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RvciA9IG1bMl07XG4gICAgICAgICAgICBsZXQgY29udGVudCA9ICcnO1xuICAgICAgICAgICAgbGV0IHN1ZmZpeCA9IG1bNF07XG4gICAgICAgICAgICBsZXQgY29udGVudFByZWZpeCA9ICcnO1xuICAgICAgICAgICAgaWYgKHN1ZmZpeCAmJiBzdWZmaXguc3RhcnRzV2l0aCgneycgKyBCTE9DS19QTEFDRUhPTERFUikpIHtcbiAgICAgICAgICAgICAgY29udGVudCA9IGlucHV0V2l0aEVzY2FwZWRCbG9ja3MuYmxvY2tzW25leHRCbG9ja0luZGV4KytdO1xuICAgICAgICAgICAgICBzdWZmaXggPSBzdWZmaXguc3Vic3RyaW5nKEJMT0NLX1BMQUNFSE9MREVSLmxlbmd0aCArIDEpO1xuICAgICAgICAgICAgICBjb250ZW50UHJlZml4ID0gJ3snO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcnVsZSA9IHJ1bGVDYWxsYmFjayhuZXcgQ3NzUnVsZShzZWxlY3RvciwgY29udGVudCkpO1xuICAgICAgICAgICAgcmV0dXJuIGAke21bMV19JHtydWxlLnNlbGVjdG9yfSR7bVszXX0ke2NvbnRlbnRQcmVmaXh9JHtydWxlLmNvbnRlbnR9JHtzdWZmaXh9YDtcbiAgICAgICAgICB9KVxuICAgICAgLnJlcGxhY2UoX3F1b3RlZFJlLCAoKSA9PiBpbnB1dFdpdGhFc2NhcGVkUXVvdGVzLmJsb2Nrc1tuZXh0UXVvdGVJbmRleCsrXSk7XG59XG5cbmNsYXNzIFN0cmluZ1dpdGhFc2NhcGVkQmxvY2tzIHtcbiAgY29uc3RydWN0b3IocHVibGljIGVzY2FwZWRTdHJpbmc6IHN0cmluZywgcHVibGljIGJsb2Nrczogc3RyaW5nW10pIHt9XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUJsb2NrcyhcbiAgICBpbnB1dDogc3RyaW5nLCBjaGFyUGFpcnM6IE1hcDxzdHJpbmcsIHN0cmluZz4sIHBsYWNlaG9sZGVyOiBzdHJpbmcpOiBTdHJpbmdXaXRoRXNjYXBlZEJsb2NrcyB7XG4gIGNvbnN0IHJlc3VsdFBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBlc2NhcGVkQmxvY2tzOiBzdHJpbmdbXSA9IFtdO1xuICBsZXQgb3BlbkNoYXJDb3VudCA9IDA7XG4gIGxldCBub25CbG9ja1N0YXJ0SW5kZXggPSAwO1xuICBsZXQgYmxvY2tTdGFydEluZGV4ID0gLTE7XG4gIGxldCBvcGVuQ2hhcjogc3RyaW5nfHVuZGVmaW5lZDtcbiAgbGV0IGNsb3NlQ2hhcjogc3RyaW5nfHVuZGVmaW5lZDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dC5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGNoYXIgPSBpbnB1dFtpXTtcbiAgICBpZiAoY2hhciA9PT0gJ1xcXFwnKSB7XG4gICAgICBpKys7XG4gICAgfSBlbHNlIGlmIChjaGFyID09PSBjbG9zZUNoYXIpIHtcbiAgICAgIG9wZW5DaGFyQ291bnQtLTtcbiAgICAgIGlmIChvcGVuQ2hhckNvdW50ID09PSAwKSB7XG4gICAgICAgIGVzY2FwZWRCbG9ja3MucHVzaChpbnB1dC5zdWJzdHJpbmcoYmxvY2tTdGFydEluZGV4LCBpKSk7XG4gICAgICAgIHJlc3VsdFBhcnRzLnB1c2gocGxhY2Vob2xkZXIpO1xuICAgICAgICBub25CbG9ja1N0YXJ0SW5kZXggPSBpO1xuICAgICAgICBibG9ja1N0YXJ0SW5kZXggPSAtMTtcbiAgICAgICAgb3BlbkNoYXIgPSBjbG9zZUNoYXIgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjaGFyID09PSBvcGVuQ2hhcikge1xuICAgICAgb3BlbkNoYXJDb3VudCsrO1xuICAgIH0gZWxzZSBpZiAob3BlbkNoYXJDb3VudCA9PT0gMCAmJiBjaGFyUGFpcnMuaGFzKGNoYXIpKSB7XG4gICAgICBvcGVuQ2hhciA9IGNoYXI7XG4gICAgICBjbG9zZUNoYXIgPSBjaGFyUGFpcnMuZ2V0KGNoYXIpO1xuICAgICAgb3BlbkNoYXJDb3VudCA9IDE7XG4gICAgICBibG9ja1N0YXJ0SW5kZXggPSBpICsgMTtcbiAgICAgIHJlc3VsdFBhcnRzLnB1c2goaW5wdXQuc3Vic3RyaW5nKG5vbkJsb2NrU3RhcnRJbmRleCwgYmxvY2tTdGFydEluZGV4KSk7XG4gICAgfVxuICB9XG4gIGlmIChibG9ja1N0YXJ0SW5kZXggIT09IC0xKSB7XG4gICAgZXNjYXBlZEJsb2Nrcy5wdXNoKGlucHV0LnN1YnN0cmluZyhibG9ja1N0YXJ0SW5kZXgpKTtcbiAgICByZXN1bHRQYXJ0cy5wdXNoKHBsYWNlaG9sZGVyKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHRQYXJ0cy5wdXNoKGlucHV0LnN1YnN0cmluZyhub25CbG9ja1N0YXJ0SW5kZXgpKTtcbiAgfVxuICByZXR1cm4gbmV3IFN0cmluZ1dpdGhFc2NhcGVkQmxvY2tzKHJlc3VsdFBhcnRzLmpvaW4oJycpLCBlc2NhcGVkQmxvY2tzKTtcbn1cblxuLyoqXG4gKiBDb21iaW5lIHRoZSBgY29udGV4dFNlbGVjdG9yc2Agd2l0aCB0aGUgYGhvc3RNYXJrZXJgIGFuZCB0aGUgYG90aGVyU2VsZWN0b3JzYFxuICogdG8gY3JlYXRlIGEgc2VsZWN0b3IgdGhhdCBtYXRjaGVzIHRoZSBzYW1lIGFzIGA6aG9zdC1jb250ZXh0KClgLlxuICpcbiAqIEdpdmVuIGEgc2luZ2xlIGNvbnRleHQgc2VsZWN0b3IgYEFgIHdlIG5lZWQgdG8gb3V0cHV0IHNlbGVjdG9ycyB0aGF0IG1hdGNoIG9uIHRoZSBob3N0IGFuZCBhcyBhblxuICogYW5jZXN0b3Igb2YgdGhlIGhvc3Q6XG4gKlxuICogYGBgXG4gKiBBIDxob3N0TWFya2VyPiwgQTxob3N0TWFya2VyPiB7fVxuICogYGBgXG4gKlxuICogV2hlbiB0aGVyZSBpcyBtb3JlIHRoYW4gb25lIGNvbnRleHQgc2VsZWN0b3Igd2UgYWxzbyBoYXZlIHRvIGNyZWF0ZSBjb21iaW5hdGlvbnMgb2YgdGhvc2VcbiAqIHNlbGVjdG9ycyB3aXRoIGVhY2ggb3RoZXIuIEZvciBleGFtcGxlIGlmIHRoZXJlIGFyZSBgQWAgYW5kIGBCYCBzZWxlY3RvcnMgdGhlIG91dHB1dCBpczpcbiAqXG4gKiBgYGBcbiAqIEFCPGhvc3RNYXJrZXI+LCBBQiA8aG9zdE1hcmtlcj4sIEEgQjxob3N0TWFya2VyPixcbiAqIEIgQTxob3N0TWFya2VyPiwgQSBCIDxob3N0TWFya2VyPiwgQiBBIDxob3N0TWFya2VyPiB7fVxuICogYGBgXG4gKlxuICogQW5kIHNvIG9uLi4uXG4gKlxuICogQHBhcmFtIGhvc3RNYXJrZXIgdGhlIHN0cmluZyB0aGF0IHNlbGVjdHMgdGhlIGhvc3QgZWxlbWVudC5cbiAqIEBwYXJhbSBjb250ZXh0U2VsZWN0b3JzIGFuIGFycmF5IG9mIGNvbnRleHQgc2VsZWN0b3JzIHRoYXQgd2lsbCBiZSBjb21iaW5lZC5cbiAqIEBwYXJhbSBvdGhlclNlbGVjdG9ycyB0aGUgcmVzdCBvZiB0aGUgc2VsZWN0b3JzIHRoYXQgYXJlIG5vdCBjb250ZXh0IHNlbGVjdG9ycy5cbiAqL1xuZnVuY3Rpb24gY29tYmluZUhvc3RDb250ZXh0U2VsZWN0b3JzKGNvbnRleHRTZWxlY3RvcnM6IHN0cmluZ1tdLCBvdGhlclNlbGVjdG9yczogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgaG9zdE1hcmtlciA9IF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3I7XG4gIF9wb2x5ZmlsbEhvc3RSZS5sYXN0SW5kZXggPSAwOyAgLy8gcmVzZXQgdGhlIHJlZ2V4IHRvIGVuc3VyZSB3ZSBnZXQgYW4gYWNjdXJhdGUgdGVzdFxuICBjb25zdCBvdGhlclNlbGVjdG9yc0hhc0hvc3QgPSBfcG9seWZpbGxIb3N0UmUudGVzdChvdGhlclNlbGVjdG9ycyk7XG5cbiAgLy8gSWYgdGhlcmUgYXJlIG5vIGNvbnRleHQgc2VsZWN0b3JzIHRoZW4ganVzdCBvdXRwdXQgYSBob3N0IG1hcmtlclxuICBpZiAoY29udGV4dFNlbGVjdG9ycy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gaG9zdE1hcmtlciArIG90aGVyU2VsZWN0b3JzO1xuICB9XG5cbiAgY29uc3QgY29tYmluZWQ6IHN0cmluZ1tdID0gW2NvbnRleHRTZWxlY3RvcnMucG9wKCkgfHwgJyddO1xuICB3aGlsZSAoY29udGV4dFNlbGVjdG9ycy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgbGVuZ3RoID0gY29tYmluZWQubGVuZ3RoO1xuICAgIGNvbnN0IGNvbnRleHRTZWxlY3RvciA9IGNvbnRleHRTZWxlY3RvcnMucG9wKCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcHJldmlvdXNTZWxlY3RvcnMgPSBjb21iaW5lZFtpXTtcbiAgICAgIC8vIEFkZCB0aGUgbmV3IHNlbGVjdG9yIGFzIGEgZGVzY2VuZGFudCBvZiB0aGUgcHJldmlvdXMgc2VsZWN0b3JzXG4gICAgICBjb21iaW5lZFtsZW5ndGggKiAyICsgaV0gPSBwcmV2aW91c1NlbGVjdG9ycyArICcgJyArIGNvbnRleHRTZWxlY3RvcjtcbiAgICAgIC8vIEFkZCB0aGUgbmV3IHNlbGVjdG9yIGFzIGFuIGFuY2VzdG9yIG9mIHRoZSBwcmV2aW91cyBzZWxlY3RvcnNcbiAgICAgIGNvbWJpbmVkW2xlbmd0aCArIGldID0gY29udGV4dFNlbGVjdG9yICsgJyAnICsgcHJldmlvdXNTZWxlY3RvcnM7XG4gICAgICAvLyBBZGQgdGhlIG5ldyBzZWxlY3RvciB0byBhY3Qgb24gdGhlIHNhbWUgZWxlbWVudCBhcyB0aGUgcHJldmlvdXMgc2VsZWN0b3JzXG4gICAgICBjb21iaW5lZFtpXSA9IGNvbnRleHRTZWxlY3RvciArIHByZXZpb3VzU2VsZWN0b3JzO1xuICAgIH1cbiAgfVxuICAvLyBGaW5hbGx5IGNvbm5lY3QgdGhlIHNlbGVjdG9yIHRvIHRoZSBgaG9zdE1hcmtlcmBzOiBlaXRoZXIgYWN0aW5nIGRpcmVjdGx5IG9uIHRoZSBob3N0XG4gIC8vIChBPGhvc3RNYXJrZXI+KSBvciBhcyBhbiBhbmNlc3RvciAoQSA8aG9zdE1hcmtlcj4pLlxuICByZXR1cm4gY29tYmluZWRcbiAgICAgIC5tYXAoXG4gICAgICAgICAgcyA9PiBvdGhlclNlbGVjdG9yc0hhc0hvc3QgP1xuICAgICAgICAgICAgICBgJHtzfSR7b3RoZXJTZWxlY3RvcnN9YCA6XG4gICAgICAgICAgICAgIGAke3N9JHtob3N0TWFya2VyfSR7b3RoZXJTZWxlY3RvcnN9LCAke3N9ICR7aG9zdE1hcmtlcn0ke290aGVyU2VsZWN0b3JzfWApXG4gICAgICAuam9pbignLCcpO1xufVxuXG4vKipcbiAqIE11dGF0ZSB0aGUgZ2l2ZW4gYGdyb3Vwc2AgYXJyYXkgc28gdGhhdCB0aGVyZSBhcmUgYG11bHRpcGxlc2AgY2xvbmVzIG9mIHRoZSBvcmlnaW5hbCBhcnJheVxuICogc3RvcmVkLlxuICpcbiAqIEZvciBleGFtcGxlIGByZXBlYXRHcm91cHMoW2EsIGJdLCAzKWAgd2lsbCByZXN1bHQgaW4gYFthLCBiLCBhLCBiLCBhLCBiXWAgLSBidXQgaW1wb3J0YW50bHkgdGhlXG4gKiBuZXdseSBhZGRlZCBncm91cHMgd2lsbCBiZSBjbG9uZXMgb2YgdGhlIG9yaWdpbmFsLlxuICpcbiAqIEBwYXJhbSBncm91cHMgQW4gYXJyYXkgb2YgZ3JvdXBzIG9mIHN0cmluZ3MgdGhhdCB3aWxsIGJlIHJlcGVhdGVkLiBUaGlzIGFycmF5IGlzIG11dGF0ZWRcbiAqICAgICBpbi1wbGFjZS5cbiAqIEBwYXJhbSBtdWx0aXBsZXMgVGhlIG51bWJlciBvZiB0aW1lcyB0aGUgY3VycmVudCBncm91cHMgc2hvdWxkIGFwcGVhci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlcGVhdEdyb3Vwcyhncm91cHM6IHN0cmluZ1tdW10sIG11bHRpcGxlczogbnVtYmVyKTogdm9pZCB7XG4gIGNvbnN0IGxlbmd0aCA9IGdyb3Vwcy5sZW5ndGg7XG4gIGZvciAobGV0IGkgPSAxOyBpIDwgbXVsdGlwbGVzOyBpKyspIHtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IGxlbmd0aDsgaisrKSB7XG4gICAgICBncm91cHNbaiArIChpICogbGVuZ3RoKV0gPSBncm91cHNbal0uc2xpY2UoMCk7XG4gICAgfVxuICB9XG59XG4iXX0=