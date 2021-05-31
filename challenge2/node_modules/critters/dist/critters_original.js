function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex.default : ex;
}

var path = _interopDefault(require('path'));
var prettyBytes = _interopDefault(require('pretty-bytes'));
var sources = _interopDefault(require('webpack-sources'));
var postcss = _interopDefault(require('postcss'));
var cssnano = _interopDefault(require('cssnano'));
var log = _interopDefault(require('webpack-log'));
var minimatch = _interopDefault(require('minimatch'));
var jsdom = require('jsdom');
var css = _interopDefault(require('css'));

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === 'string') return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === 'Object' && o.constructor) n = o.constructor.name;
  if (n === 'Map' || n === 'Set') return Array.from(o);
  if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it;

  if (typeof Symbol === 'undefined' || o[Symbol.iterator] == null) {
    if (
      Array.isArray(o) ||
      (it = _unsupportedIterableToArray(o)) ||
      (allowArrayLike && o && typeof o.length === 'number')
    ) {
      if (it) o = it;
      var i = 0;
      return function () {
        if (i >= o.length)
          return {
            done: true,
          };
        return {
          done: false,
          value: o[i++],
        };
      };
    }

    throw new TypeError(
      'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
    );
  }

  it = o[Symbol.iterator]();
  return it.next.bind(it);
}

/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
/**
 * Parse HTML into a mutable, serializable DOM Document, provided by JSDOM.
 * @private
 * @param {String} html   HTML to parse into a Document instance
 */

function createDocument(html) {
  var jsdom$1 = new jsdom.JSDOM(html, {
    contentType: 'text/html',
  });
  var window = jsdom$1.window;
  var document = window.document;
  document.$jsdom = jsdom$1;
  return document;
}
/**
 * Serialize a Document to an HTML String
 * @private
 * @param {Document} document   A Document, such as one created via `createDocument()`
 */

function serializeDocument(document) {
  return document.$jsdom.serialize();
}
/** Like node.textContent, except it works */

function setNodeText(node, text) {
  while (node.lastChild) {
    node.removeChild(node.lastChild);
  }

  node.appendChild(node.ownerDocument.createTextNode(text));
}

/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
/**
 * Parse a textual CSS Stylesheet into a Stylesheet instance.
 * Stylesheet is a mutable ReworkCSS AST with format similar to CSSOM.
 * @see https://github.com/reworkcss/css
 * @private
 * @param {String} stylesheet
 * @returns {css.Stylesheet} ast
 */

function parseStylesheet(stylesheet) {
  return css.parse(stylesheet);
}
/**
 * Serialize a ReworkCSS Stylesheet to a String of CSS.
 * @private
 * @param {css.Stylesheet} ast          A Stylesheet to serialize, such as one returned from `parseStylesheet()`
 * @param {Object} options              Options to pass to `css.stringify()`
 * @param {Boolean} [options.compress]  Compress CSS output (removes comments, whitespace, etc)
 */

function serializeStylesheet(ast, options) {
  return css.stringify(ast, options);
}
/**
 * Converts a walkStyleRules() iterator to mark nodes with `.$$remove=true` instead of actually removing them.
 * This means they can be removed in a second pass, allowing the first pass to be nondestructive (eg: to preserve mirrored sheets).
 * @private
 * @param {Function} iterator   Invoked on each node in the tree. Return `false` to remove that node.
 * @returns {(rule) => void} nonDestructiveIterator
 */

function markOnly(predicate) {
  return function (rule) {
    var sel = rule.selectors;

    if (predicate(rule) === false) {
      rule.$$remove = true;
    }

    rule.$$markedSelectors = rule.selectors;

    if (rule._other) {
      rule._other.$$markedSelectors = rule._other.selectors;
    }

    rule.selectors = sel;
  };
}
/**
 * Apply filtered selectors to a rule from a previous markOnly run.
 * @private
 * @param {css.Rule} rule The Rule to apply marked selectors to (if they exist).
 */

function applyMarkedSelectors(rule) {
  if (rule.$$markedSelectors) {
    rule.selectors = rule.$$markedSelectors;
  }

  if (rule._other) {
    applyMarkedSelectors(rule._other);
  }
}
/**
 * Recursively walk all rules in a stylesheet.
 * @private
 * @param {css.Rule} node       A Stylesheet or Rule to descend into.
 * @param {Function} iterator   Invoked on each node in the tree. Return `false` to remove that node.
 */

function walkStyleRules(node, iterator) {
  if (node.stylesheet) return walkStyleRules(node.stylesheet, iterator);
  node.rules = node.rules.filter(function (rule) {
    if (rule.rules) {
      walkStyleRules(rule, iterator);
    }

    rule._other = undefined;
    rule.filterSelectors = filterSelectors;
    return iterator(rule) !== false;
  });
}
/**
 * Recursively walk all rules in two identical stylesheets, filtering nodes into one or the other based on a predicate.
 * @private
 * @param {css.Rule} node       A Stylesheet or Rule to descend into.
 * @param {css.Rule} node2      A second tree identical to `node`
 * @param {Function} iterator   Invoked on each node in the tree. Return `false` to remove that node from the first tree, true to remove it from the second.
 */

function walkStyleRulesWithReverseMirror(node, node2, iterator) {
  if (node2 === null) return walkStyleRules(node, iterator);
  if (node.stylesheet)
    return walkStyleRulesWithReverseMirror(
      node.stylesheet,
      node2.stylesheet,
      iterator
    );

  var _splitFilter = splitFilter(node.rules, node2.rules, function (
    rule,
    index,
    rules,
    rules2
  ) {
    var rule2 = rules2[index];

    if (rule.rules) {
      walkStyleRulesWithReverseMirror(rule, rule2, iterator);
    }

    rule._other = rule2;
    rule.filterSelectors = filterSelectors;
    return iterator(rule) !== false;
  });

  node.rules = _splitFilter[0];
  node2.rules = _splitFilter[1];
} // Like [].filter(), but applies the opposite filtering result to a second copy of the Array without a second pass.
// This is just a quicker version of generating the compliment of the set returned from a filter operation.

function splitFilter(a, b, predicate) {
  var aOut = [];
  var bOut = [];

  for (var index = 0; index < a.length; index++) {
    if (predicate(a[index], index, a, b)) {
      aOut.push(a[index]);
    } else {
      bOut.push(a[index]);
    }
  }

  return [aOut, bOut];
} // can be invoked on a style rule to subset its selectors (with reverse mirroring)

function filterSelectors(predicate) {
  if (this._other) {
    var _splitFilter2 = splitFilter(
      this.selectors,
      this._other.selectors,
      predicate
    );
    var a = _splitFilter2[0];
    var b = _splitFilter2[1];

    this.selectors = a;
    this._other.selectors = b;
  } else {
    this.selectors = this.selectors.filter(predicate);
  }
}

function tap(inst, hook, pluginName, async, callback) {
  if (inst.hooks) {
    var camel = hook.replace(/-([a-z])/g, function (s, i) {
      return i.toUpperCase();
    });
    inst.hooks[camel][async ? 'tapAsync' : 'tap'](pluginName, callback);
  } else {
    inst.plugin(hook, callback);
  }
}

function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }

  if (result && result.then) {
    return result.then(void 0, recover);
  }

  return result;
}

var Critters = /* #__PURE__ */ (function () {
  function Critters(options) {
    this.options = Object.assign(
      {
        logLevel: 'info',
        externalStylesheets: [],
        path: '',
        publicPath: '',
        preload: 'media',
        reduceInlineStyles: false, // compress: false,
      },
      options || {}
    );
    this.options.pruneSource = this.options.pruneSource !== false;
    this.urlFilter = this.options.filter;

    if (this.urlFilter instanceof RegExp) {
      this.urlFilter = this.urlFilter.test.bind(this.urlFilter);
    }

    this.logger = {
      warn: console.log,
      info: console.log,
    };
  }
  /**
   * Read the contents of a file from Webpack's input filesystem
   */

  var _proto = Critters.prototype;

  _proto.readFile = function readFile(filename) {
    var fs = this.fs; // || compilation.outputFileSystem;

    return new Promise(function (resolve, reject) {
      var callback = function callback(err, data) {
        if (err) reject(err);
        else resolve(data);
      };

      if (fs && fs.readFile) {
        fs.readFile(filename, callback);
      } else {
        require('fs').readFile(filename, 'utf8', callback);
      }
    });
  };

  _proto.process = (function (_process) {
    function process(_x) {
      return _process.apply(this, arguments);
    }

    process.toString = function () {
      return _process.toString();
    };

    return process;
  })(function (html) {
    try {
      var _temp5 = function _temp5() {
        // console.log('2 ', serializeDocument(document));
        // go through all the style tags in the document and reduce them to only critical CSS
        var styles = _this2.getAffectedStyleTags(document);

        return Promise.resolve(
          Promise.all(
            styles.map(function (style) {
              return _this2.processStyle(style, document);
            })
          )
        ).then(function () {
          function _temp2() {
            // serialize the document back to HTML and we're done
            var output = serializeDocument(document);
            // var end = process.hrtime.bigint();
            // console.log('Time ' + parseFloat(end - start) / 1000000.0);
            console.timeEnd('critters');

            return output;
          }

          var _temp = (function () {
            if (
              _this2.options.mergeStylesheets !== false &&
              styles.length !== 0
            ) {
              return Promise.resolve(
                _this2.mergeStylesheets(document)
              ).then(function () {});
            }
          })();

          return _temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp);
        });
      };

      var _this2 = this;

      var outputPath = _this2.options.path;
      var publicPath = _this2.options.publicPath;
      // var start = process.hrtime.bigint();
      console.time('critters');
      // Parse the generated HTML in a DOM we can mutate

      var document = createDocument(html); // if (this.options.additionalStylesheets) {
      //   const styleSheetsIncluded = [];
      //   (this.options.additionalStylesheets || []).forEach((cssFile) => {
      //     if (styleSheetsIncluded.includes(cssFile)) {
      //       return;
      //     }
      //     styleSheetsIncluded.push(cssFile);
      //     const webpackCssAssets = Object.keys(
      //       compilation.assets
      //     ).filter((file) => minimatch(file, cssFile));
      //     webpackCssAssets.map((asset) => {
      //       const tag = document.createElement('style');
      //       tag.innerHTML = compilation.assets[asset].source();
      //       document.head.appendChild(tag);
      //     });
      //   });
      // }
      // `external:false` skips processing of external sheets
      // console.log('1 ', serializeDocument(document));

      var _temp6 = (function () {
        if (_this2.options.external !== false) {
          var externalSheets = [].slice.call(
            document.querySelectorAll('link[rel="stylesheet"]')
          );
          return Promise.resolve(
            Promise.all(
              externalSheets.map(function (link) {
                return _this2.embedLinkedStylesheet(
                  link,
                  outputPath,
                  publicPath
                );
              })
            )
          ).then(function () {});
        }
      })();

      return Promise.resolve(
        _temp6 && _temp6.then ? _temp6.then(_temp5) : _temp5(_temp6)
      );
    } catch (e) {
      return Promise.reject(e);
    }
  });

  _proto.getAffectedStyleTags = function getAffectedStyleTags(document) {
    var styles = [].slice.call(document.querySelectorAll('style')); // `inline:false` skips processing of inline stylesheets

    if (this.options.reduceInlineStyles === false) {
      return styles.filter(function (style) {
        return style.$$external;
      });
    }

    return styles;
  };

  _proto.mergeStylesheets = function mergeStylesheets(document) {
    try {
      var _temp9 = function _temp9() {
        setNodeText(first, sheet);
      };

      var _this4 = this;

      var styles = _this4.getAffectedStyleTags(document);

      if (styles.length === 0) {
        // this.logger.warn('Merging inline stylesheets into a single <style> tag skipped, no inline stylesheets to merge');
        return Promise.resolve();
      }

      var first = styles[0];
      var sheet = first.textContent;

      for (var i = 1; i < styles.length; i++) {
        var node = styles[i];
        sheet += node.textContent;
        node.remove();
      }

      var _temp10 = (function () {
        if (_this4.options.compress !== false) {
          var before = sheet;
          // var processor = postcss([cssnano()]);
          return Promise.resolve(
            // processor.process(before, {
            //   from: undefined,
            // })
            before
          ).then(function (result) {
            // @todo sourcemap support (elsewhere first)
            sheet = result.css;
          });
        }
      })();

      return Promise.resolve(_temp9(_temp10));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.embedLinkedStylesheet = function embedLinkedStylesheet(
    link,
    outputPath,
    publicPath
  ) {
    try {
      var _temp14 = function _temp14(_result2) {
        if (_exit2) return _result2;
        // CSS loader is only injected for the first sheet, then this becomes an empty string
        var cssLoaderPreamble =
          "function $loadcss(u,m,l){(l=document.createElement('link')).rel='stylesheet';l.href=u;document.head.appendChild(l)}";
        var lazy = preloadMode === 'js-lazy';

        if (lazy) {
          cssLoaderPreamble = cssLoaderPreamble.replace(
            'l.href',
            "l.media='print';l.onload=function(){l.media=m};l.href"
          );
        } // console.log('sheet ', sheet);
        // the reduced critical CSS gets injected into a new <style> tag

        console.log('here1');
        var style = document.createElement('style');
        style.$$external = true;
        style.appendChild(document.createTextNode(sheet)); // style.innerHTML = sheet;

        link.parentNode.insertBefore(style, link);
        console.log('here2');

        if (
          _this6.options.inlineThreshold &&
          sheet.length < _this6.options.inlineThreshold
        ) {
          style.$$reduce = false;

          _this6.logger.info(
            '\x1B[32mInlined all of ' +
              href +
              ' (' +
              sheet.length +
              ' was below the threshold of ' +
              _this6.options.inlineThreshold +
              ')\x1B[39m'
          ); // if (asset) {
          //   delete compilation.assets[relativePath];
          // } else {
          //   this.logger.warn(
          //     `  > ${href} was not found in assets. the resource may still be emitted but will be unreferenced.`
          //   );
          // }

          link.parentNode.removeChild(link);
          return;
        } // drop references to webpack asset locations onto the tag, used for later reporting and in-place asset updates

        style.$$name = href;
        style.$$asset = asset;
        style.$$assetName = relativePath; // style.$$assets = compilation.assets;

        style.$$links = [link]; // Allow disabling any mutation of the stylesheet link:

        if (preloadMode === false) return;
        var noscriptFallback = false;

        if (preloadMode === 'body') {
          document.body.appendChild(link);
        } else {
          link.setAttribute('rel', 'preload');
          link.setAttribute('as', 'style');

          if (preloadMode === 'js' || preloadMode === 'js-lazy') {
            var script = document.createElement('script');
            var js =
              cssLoaderPreamble +
              '$loadcss(' +
              JSON.stringify(href) +
              (lazy ? ',' + JSON.stringify(media || 'all') : '') +
              ')';
            script.appendChild(document.createTextNode(js));
            link.parentNode.insertBefore(script, link.nextSibling);
            style.$$links.push(script);
            cssLoaderPreamble = '';
            noscriptFallback = true;
          } else if (preloadMode === 'media') {
            // @see https://github.com/filamentgroup/loadCSS/blob/af1106cfe0bf70147e22185afa7ead96c01dec48/src/loadCSS.js#L26
            link.setAttribute('rel', 'stylesheet');
            link.removeAttribute('as');
            link.setAttribute('media', 'print');
            link.setAttribute(
              'onload',
              "this.media='" + (media || 'all') + "'"
            );
            noscriptFallback = true;
          } else if (preloadMode === 'swap') {
            link.setAttribute('onload', "this.rel='stylesheet'");
            noscriptFallback = true;
          } else {
            var bodyLink = document.createElement('link');
            bodyLink.setAttribute('rel', 'stylesheet');
            if (media) bodyLink.setAttribute('media', media);
            bodyLink.setAttribute('href', href);
            document.body.appendChild(bodyLink);
            style.$$links.push(bodyLink);
          }
        }

        if (_this6.options.noscriptFallback !== false && noscriptFallback) {
          var noscript = document.createElement('noscript');
          var noscriptLink = document.createElement('link');
          noscriptLink.setAttribute('rel', 'stylesheet');
          noscriptLink.setAttribute('href', href);
          if (media) noscriptLink.setAttribute('media', media);
          noscript.appendChild(noscriptLink);
          link.parentNode.insertBefore(noscript, link.nextSibling);
          style.$$links.push(noscript);
        }
      };

      var _exit2;

      var _this6 = this;

      var href = link.getAttribute('href');
      var media = link.getAttribute('media');
      var document = link.ownerDocument;
      var preloadMode = _this6.options.preload; // skip filtered resources, or network resources if no filter is provided
      // if (this.urlFilter ? this.urlFilter(href) : href.match(/^(https?:)?\/\//)) {

      if (
        _this6.urlFilter
          ? _this6.urlFilter(href)
          : !(href || '').match(/\.css$/)
      ) {
        return Promise.resolve();
      } // CHECK - the output path
      // path on disk (with output.publicPath removed)

      var normalizedPath = href.replace(/^\//, '');
      var pathPrefix = (publicPath || '').replace(/(^\/|\/$)/g, '') + '/';

      if (normalizedPath.indexOf(pathPrefix) === 0) {
        normalizedPath = normalizedPath
          .substring(pathPrefix.length)
          .replace(/^\//, '');
      }

      var filename = path.resolve(outputPath, normalizedPath); // try to find a matching asset by filename in webpack's output (not yet written to disk)

      var relativePath = path
        .relative(outputPath, filename)
        .replace(/^\.\//, '');
      var asset = ''; // compilation.assets[relativePath];

      console.log('filename ', filename); // Attempt to read from assets, falling back to a disk read

      var sheet = asset && asset.source();

      var _temp15 = (function () {
        if (!sheet) {
          var _temp16 = _catch(
            function () {
              return Promise.resolve(_this6.readFile(filename)).then(function (
                _this5$readFile
              ) {
                sheet = _this5$readFile;
              }); // this.logger.warn(
              //   `Stylesheet "${relativePath}" not found in assets, but a file was located on disk.${
              //     this.options.pruneSource
              //       ? ' This means pruneSource will not be applied.'
              //       : ''
              //   }`
              // );
            },
            function (e) {
              console.log(e); // this.logger.warn(`Unable to locate stylesheet: ${relativePath}`);

              _exit2 = 1;
            }
          );

          if (_temp16 && _temp16.then) return _temp16.then(function () {});
        }
      })();

      return Promise.resolve(
        _temp15 && _temp15.then ? _temp15.then(_temp14) : _temp14(_temp15)
      );
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Parse the stylesheet within a <style> element, then reduce it to contain only rules used by the document.
   */

  _proto.processStyle = function processStyle(style, document) {
    try {
      var _this8 = this;

      if (style.$$reduce === false) return Promise.resolve();
      var name = style.$$name ? style.$$name.replace(/^\//, '') : 'inline CSS';
      var options = _this8.options; // const document = style.ownerDocument;

      var head = document.querySelector('head');
      var keyframesMode = options.keyframes || 'critical'; // we also accept a boolean value for options.keyframes

      if (keyframesMode === true) keyframesMode = 'all';
      if (keyframesMode === false) keyframesMode = 'none'; // basically `.textContent`

      var sheet =
        style.childNodes.length > 0 &&
        [].map
          .call(style.childNodes, function (node) {
            return node.nodeValue;
          })
          .join('\n'); // store a reference to the previous serialized stylesheet for reporting stats

      var before = sheet; // Skip empty stylesheets

      if (!sheet) return Promise.resolve();
      var ast = parseStylesheet(sheet);
      var astInverse = options.pruneSource ? parseStylesheet(sheet) : null; // a string to search for font names (very loose)

      var criticalFonts = '';
      var failedSelectors = [];
      var criticalKeyframeNames = []; // Walk all CSS rules, marking unused rules with `.$$remove=true` for removal in the second pass.
      // This first pass is also used to collect font and keyframe usage used in the second pass.

      walkStyleRules(
        ast,
        markOnly(function (rule) {
          if (rule.type === 'rule') {
            // Filter the selector list down to only those match
            rule.filterSelectors(function (sel) {
              // Strip pseudo-elements and pseudo-classes, since we only care that their associated elements exist.
              // This means any selector for a pseudo-element or having a pseudo-class will be inlined if the rest of the selector matches.
              if (sel !== ':root') {
                sel = sel
                  .replace(/(?:>\s*)?::?[a-z-]+\s*(\{|$)/gi, '$1')
                  .trim();
              }

              if (!sel) return false;

              try {
                return document.querySelector(sel) != null;
              } catch (e) {
                failedSelectors.push(sel + ' -> ' + e.message);
                return false;
              }
            }); // If there are no matched selectors, remove the rule:

            if (rule.selectors.length === 0) {
              return false;
            }

            if (rule.declarations) {
              for (var i = 0; i < rule.declarations.length; i++) {
                var decl = rule.declarations[i]; // detect used fonts

                if (
                  decl.property &&
                  decl.property.match(/\bfont(-family)?\b/i)
                ) {
                  criticalFonts += ' ' + decl.value;
                } // detect used keyframes

                if (
                  decl.property === 'animation' ||
                  decl.property === 'animation-name'
                ) {
                  // @todo: parse animation declarations and extract only the name. for now we'll do a lazy match.
                  var names = decl.value.split(/\s+/);

                  for (var j = 0; j < names.length; j++) {
                    var _name = names[j].trim();

                    if (_name) criticalKeyframeNames.push(_name);
                  }
                }
              }
            }
          } // keep font rules, they're handled in the second pass:

          if (rule.type === 'font-face') return; // If there are no remaining rules, remove the whole rule:

          var rules =
            rule.rules &&
            rule.rules.filter(function (rule) {
              return !rule.$$remove;
            });
          return !rules || rules.length !== 0;
        })
      );

      if (failedSelectors.length !== 0) {
        _this8.logger.warn(
          failedSelectors.length +
            ' rules skipped due to selector errors:\n  ' +
            failedSelectors.join('\n  ')
        );
      }

      var shouldPreloadFonts =
        options.fonts === true || options.preloadFonts === true;
      var shouldInlineFonts =
        options.fonts !== false && options.inlineFonts === true;
      var preloadedFonts = []; // Second pass, using data picked up from the first

      walkStyleRulesWithReverseMirror(ast, astInverse, function (rule) {
        // remove any rules marked in the first pass
        if (rule.$$remove === true) return false;
        applyMarkedSelectors(rule); // prune @keyframes rules

        if (rule.type === 'keyframes') {
          if (keyframesMode === 'none') return false;
          if (keyframesMode === 'all') return true;
          return criticalKeyframeNames.indexOf(rule.name) !== -1;
        } // prune @font-face rules

        if (rule.type === 'font-face') {
          var family, src;

          for (var i = 0; i < rule.declarations.length; i++) {
            var decl = rule.declarations[i];

            if (decl.property === 'src') {
              // @todo parse this properly and generate multiple preloads with type="font/woff2" etc
              src = (decl.value.match(/url\s*\(\s*(['"]?)(.+?)\1\s*\)/) ||
                [])[2];
            } else if (decl.property === 'font-family') {
              family = decl.value;
            }
          }

          if (src && shouldPreloadFonts && preloadedFonts.indexOf(src) === -1) {
            preloadedFonts.push(src);
            var preload = document.createElement('link');
            preload.setAttribute('rel', 'preload');
            preload.setAttribute('as', 'font');
            preload.setAttribute('crossorigin', 'anonymous');
            preload.setAttribute('href', src.trim());
            head.appendChild(preload);
          } // if we're missing info, if the font is unused, or if critical font inlining is disabled, remove the rule:

          if (
            !family ||
            !src ||
            criticalFonts.indexOf(family) === -1 ||
            !shouldInlineFonts
          ) {
            return false;
          }
        }
      });
      sheet = serializeStylesheet(ast, {
        compress: _this8.options.compress !== false,
      }).trim(); // If all rules were removed, get rid of the style element entirely

      if (sheet.trim().length === 0) {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }

        return Promise.resolve();
      }

      var afterText = '';

      if (options.pruneSource) {
        var sheetInverse = serializeStylesheet(astInverse, {
          compress: _this8.options.compress !== false,
        }); // const asset = style.$$asset;
        // if (asset) {
        // if external stylesheet would be below minimum size, just inline everything

        var minSize = _this8.options.minimumExternalSize;

        if (minSize && sheetInverse.length < minSize) {
          _this8.logger.info(
            '\x1B[32mInlined all of ' +
              name +
              ' (non-critical external stylesheet would have been ' +
              sheetInverse.length +
              'b, which was below the threshold of ' +
              minSize +
              ')\x1B[39m'
          );

          setNodeText(style, before); // remove any associated external resources/loaders:

          if (style.$$links) {
            for (
              var _iterator = _createForOfIteratorHelperLoose(style.$$links),
                _step;
              !(_step = _iterator()).done;

            ) {
              var link = _step.value;
              var parent = link.parentNode;
              if (parent) parent.removeChild(link);
            }
          } // delete the webpack asset:

          delete style.$$assets[style.$$assetName];
          return Promise.resolve();
        }

        var percent = (sheetInverse.length / before.length) * 100;
        afterText =
          ', reducing non-inlined size ' +
          (percent | 0) +
          '% to ' +
          prettyBytes(sheetInverse.length); // style.$$assets[style.$$assetName] = new sources.LineToLineMappedSource(
        //   sheetInverse,
        //   style.$$assetName,
        //   before
        // );
        // } else {
        // this.logger.warn(
        //   'pruneSource is enabled, but a style (' +
        //     name +
        //     ') has no corresponding Webpack asset.'
        // );
        // }
        // }
        // replace the inline stylesheet with its critical'd counterpart

        setNodeText(style, sheet); // output stats
        // const percent = ((sheet.length / before.length) * 100) | 0;
        // this.logger.info(
        //   '\u001b[32mInlined ' +
        //     prettyBytes(sheet.length) +
        //     ' (' +
        //     percent +
        //     '% of original ' +
        //     prettyBytes(before.length) +
        //     ') of ' +
        //     name +
        //     afterText +
        //     '.\u001b[39m'
        // );
      }

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return Critters;
})(); // Original code picks 1 html and during prune removes CSS files from assets. What if theres another dependency

function _catch$1(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }

  if (result && result.then) {
    return result.then(void 0, recover);
  }

  return result;
}

var PLUGIN_NAME = 'critters-webpack-plugin';
/**
 * The mechanism to use for lazy-loading stylesheets.
 * _[JS]_ indicates that a strategy requires JavaScript (falls back to `<noscript>`).
 *
 * - **default:** Move stylesheet links to the end of the document and insert preload meta tags in their place.
 * - **"body":** Move all external stylesheet links to the end of the document.
 * - **"media":** Load stylesheets asynchronously by adding `media="not x"` and removing once loaded. _[JS]_
 * - **"swap":** Convert stylesheet links to preloads that swap to `rel="stylesheet"` once loaded. _[JS]_
 * - **"js":** Inject an asynchronous CSS loader similar to [LoadCSS](https://github.com/filamentgroup/loadCSS) and use it to load stylesheets. _[JS]_
 * - **"js-lazy":** Like `"js"`, but the stylesheet is disabled until fully loaded.
 * @typedef {(default|'body'|'media'|'swap'|'js'|'js-lazy')} PreloadStrategy
 * @public
 */

/**
 * Controls which keyframes rules are inlined.
 *
 * - **"critical":** _(default)_ inline keyframes rules that are used by the critical CSS.
 * - **"all":** Inline all keyframes rules.
 * - **"none":** Remove all keyframes rules.
 * @typedef {('critical'|'all'|'none')} KeyframeStrategy
 * @private
 * @property {String} keyframes     Which {@link KeyframeStrategy keyframe strategy} to use (default: `critical`)_
 */

/**
 * Controls log level of the plugin. Specifies the level the logger should use. A logger will
 * not produce output for any log level beneath the specified level. Available levels and order
 * are:
 *
 * - **"info"** _(default)_
 * - **"warn"**
 * - **"error"**
 * - **"trace"**
 * - **"debug"**
 * - **"silent"**
 * @typedef {('info'|'warn'|'error'|'trace'|'debug'|'silent')} LogLevel
 * @public
 */

/**
 * All optional. Pass them to `new Critters({ ... })`.
 * @public
 * @typedef Options
 * @property {Boolean} external     Inline styles from external stylesheets _(default: `true`)_
 * @property {Number} inlineThreshold Inline external stylesheets smaller than a given size _(default: `0`)_
 * @property {Number} minimumExternalSize If the non-critical external stylesheet would be below this size, just inline it _(default: `0`)_
 * @property {Boolean} pruneSource  Remove inlined rules from the external stylesheet _(default: `true`)_
 * @property {Boolean} mergeStylesheets Merged inlined stylesheets into a single <style> tag _(default: `true`)_
 * @property {String[]} additionalStylesheets Glob for matching other stylesheets to be used while looking for critical CSS _(default: ``)_.
 * @property {String} preload       Which {@link PreloadStrategy preload strategy} to use
 * @property {Boolean} noscriptFallback Add `<noscript>` fallback to JS-based strategies
 * @property {Boolean} inlineFonts  Inline critical font-face rules _(default: `false`)_
 * @property {Boolean} preloadFonts Preloads critical fonts _(default: `true`)_
 * @property {Boolean} fonts        Shorthand for setting `inlineFonts`+`preloadFonts`
 *  - Values:
 *  - `true` to inline critical font-face rules and preload the fonts
 *  - `false` to don't inline any font-face rules and don't preload fonts
 * @property {String} keyframes     Controls which keyframes rules are inlined.
 *  - Values:
 *  - `"critical"`: _(default)_ inline keyframes rules used by the critical CSS
 *  - `"all"` inline all keyframes rules
 *  - `"none"` remove all keyframes rules
 * @property {Boolean} compress     Compress resulting critical CSS _(default: `true`)_
 * @property {String} logLevel      Controls {@link LogLevel log level} of the plugin _(default: `"info"`)_
 */

/**
 * Create a Critters plugin instance with the given options.
 * @public
 * @param {Options} options Options to control how Critters inlines CSS.
 * @example
 * // webpack.config.js
 * module.exports = {
 *   plugins: [
 *     new Critters({
 *       // Outputs: <link rel="preload" onload="this.rel='stylesheet'">
 *       preload: 'swap',
 *
 *       // Don't inline critical font-face rules, but preload the font URLs:
 *       preloadFonts: true
 *     })
 *   ]
 * }
 */

var Critters$1 = /* #__PURE__ */ (function () {
  /** @private */
  function Critters(options) {
    this.options = Object.assign(
      {
        logLevel: 'info',
        externalStylesheets: [],
      },
      options || {}
    );
    this.options.pruneSource = this.options.pruneSource !== false;
    this.urlFilter = this.options.filter;

    if (this.urlFilter instanceof RegExp) {
      this.urlFilter = this.urlFilter.test.bind(this.urlFilter);
    }

    this.logger = log({
      name: 'Critters',
      unique: true,
      level: this.options.logLevel,
    });
  }
  /**
   * Invoked by Webpack during plugin initialization
   */

  var _proto = Critters.prototype;

  _proto.apply = function apply(compiler) {
    var _this = this;

    // hook into the compiler to get a Compilation instance...
    tap(compiler, 'compilation', PLUGIN_NAME, false, function (compilation) {
      // ... which is how we get an "after" hook into html-webpack-plugin's HTML generation.
      if (
        compilation.hooks &&
        compilation.hooks.htmlWebpackPluginAfterHtmlProcessing
      ) {
        tap(
          compilation,
          'html-webpack-plugin-after-html-processing',
          PLUGIN_NAME,
          true,
          function (htmlPluginData, callback) {
            _this
              .process(compiler, compilation, htmlPluginData.html)
              .then(function (html) {
                callback(null, {
                  html: html,
                });
              })
              .catch(callback);
          }
        );
      } else {
        // If html-webpack-plugin isn't used, process the first HTML asset as an optimize step
        tap(compilation, 'optimize-assets', PLUGIN_NAME, true, function (
          assets,
          callback
        ) {
          var htmlAssetName;

          for (var name in assets) {
            if (name.match(/\.html$/)) {
              htmlAssetName = name;
              break;
            }
          }

          if (!htmlAssetName) {
            return callback(Error('Could not find HTML asset.'));
          }

          var html = assets[htmlAssetName].source();
          if (!html) return callback(Error('Empty HTML asset.'));

          _this
            .process(compiler, compilation, String(html))
            .then(function (html) {
              assets[htmlAssetName] = new sources.RawSource(html);
              callback();
            })
            .catch(callback);
        });
      }
    });
  };
  /**
   * Read the contents of a file from Webpack's input filesystem
   */

  _proto.readFile = function readFile(compilation, filename) {
    var fs = this.fs || compilation.outputFileSystem;
    return new Promise(function (resolve, reject) {
      var callback = function callback(err, data) {
        if (err) reject(err);
        else resolve(data);
      };

      if (fs && fs.readFile) {
        fs.readFile(filename, callback);
      } else {
        require('fs').readFile(filename, 'utf8', callback);
      }
    });
  };
  /**
   * Apply critical CSS processing to html-webpack-plugin
   */

  _proto.process = function process(compiler, compilation, html) {
    try {
      var _temp5 = function _temp5() {
        // go through all the style tags in the document and reduce them to only critical CSS
        var styles = [].slice.call(document.querySelectorAll('style'));
        return Promise.resolve(
          Promise.all(
            styles.map(function (style) {
              return _this3.processStyle(style, document);
            })
          )
        ).then(function () {
          function _temp2() {
            // serialize the document back to HTML and we're done
            return serializeDocument(document);
          }

          var _temp = (function () {
            if (
              _this3.options.mergeStylesheets !== false &&
              styles.length !== 0
            ) {
              return Promise.resolve(
                _this3.mergeStylesheets(document)
              ).then(function () {});
            }
          })();

          return _temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp);
        });
      };

      var _this3 = this;

      var outputPath = compiler.options.output.path;
      var publicPath = compiler.options.output.publicPath; // Parse the generated HTML in a DOM we can mutate

      var document = createDocument(html);

      if (_this3.options.additionalStylesheets) {
        var styleSheetsIncluded = [];
        (_this3.options.additionalStylesheets || []).forEach(function (
          cssFile
        ) {
          if (styleSheetsIncluded.includes(cssFile)) {
            return;
          }

          styleSheetsIncluded.push(cssFile);
          var webpackCssAssets = Object.keys(compilation.assets).filter(
            function (file) {
              return minimatch(file, cssFile);
            }
          );
          webpackCssAssets.map(function (asset) {
            var tag = document.createElement('style');
            tag.innerHTML = compilation.assets[asset].source();
            document.head.appendChild(tag);
          });
        });
      } // `external:false` skips processing of external sheets

      var _temp6 = (function () {
        if (_this3.options.external !== false) {
          var externalSheets = [].slice.call(
            document.querySelectorAll('link[rel="stylesheet"]')
          );
          return Promise.resolve(
            Promise.all(
              externalSheets.map(function (link) {
                return _this3.embedLinkedStylesheet(
                  link,
                  compilation,
                  outputPath,
                  publicPath
                );
              })
            )
          ).then(function () {});
        }
      })();

      return Promise.resolve(
        _temp6 && _temp6.then ? _temp6.then(_temp5) : _temp5(_temp6)
      );
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.mergeStylesheets = function mergeStylesheets(document) {
    try {
      var _temp9 = function _temp9() {
        setNodeText(first, sheet);
      };

      var _this5 = this;

      var styles = [].slice.call(document.querySelectorAll('style'));

      if (styles.length === 0) {
        _this5.logger.warn(
          'Merging inline stylesheets into a single <style> tag skipped, no inline stylesheets to merge'
        );

        return Promise.resolve();
      }

      var first = styles[0];
      var sheet = first.textContent;

      for (var i = 1; i < styles.length; i++) {
        var node = styles[i];
        sheet += node.textContent;
        node.remove();
      }

      var _temp10 = (function () {
        if (_this5.options.compress !== false) {
          var before = sheet;
          var processor = postcss([cssnano()]);
          return Promise.resolve(
            processor.process(before, {
              from: undefined,
            })
          ).then(function (result) {
            // @todo sourcemap support (elsewhere first)
            sheet = result.css;
          });
        }
      })();

      return Promise.resolve(
        _temp10 && _temp10.then ? _temp10.then(_temp9) : _temp9(_temp10)
      );
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Inline the target stylesheet referred to by a <link rel="stylesheet"> (assuming it passes `options.filter`)
   */

  _proto.embedLinkedStylesheet = function embedLinkedStylesheet(
    link,
    compilation,
    outputPath,
    publicPath
  ) {
    try {
      var _temp14 = function _temp14(_result2) {
        if (_exit2) return _result2;
        // CSS loader is only injected for the first sheet, then this becomes an empty string
        var cssLoaderPreamble =
          "function $loadcss(u,m,l){(l=document.createElement('link')).rel='stylesheet';l.href=u;document.head.appendChild(l)}";
        var lazy = preloadMode === 'js-lazy';

        if (lazy) {
          cssLoaderPreamble = cssLoaderPreamble.replace(
            'l.href',
            "l.media='print';l.onload=function(){l.media=m};l.href"
          );
        } // the reduced critical CSS gets injected into a new <style> tag

        var style = document.createElement('style');
        style.appendChild(document.createTextNode(sheet));
        link.parentNode.insertBefore(style, link);

        if (
          _this7.options.inlineThreshold &&
          sheet.length < _this7.options.inlineThreshold
        ) {
          style.$$reduce = false;

          _this7.logger.info(
            '\x1B[32mInlined all of ' +
              href +
              ' (' +
              sheet.length +
              ' was below the threshold of ' +
              _this7.options.inlineThreshold +
              ')\x1B[39m'
          );

          if (asset) {
            delete compilation.assets[relativePath];
          } else {
            _this7.logger.warn(
              '  > ' +
                href +
                ' was not found in assets. the resource may still be emitted but will be unreferenced.'
            );
          }

          link.parentNode.removeChild(link);
          return;
        } // drop references to webpack asset locations onto the tag, used for later reporting and in-place asset updates

        style.$$name = href;
        style.$$asset = asset;
        style.$$assetName = relativePath;
        style.$$assets = compilation.assets;
        style.$$links = [link]; // Allow disabling any mutation of the stylesheet link:

        if (preloadMode === false) return;
        var noscriptFallback = false;

        if (preloadMode === 'body') {
          document.body.appendChild(link);
        } else {
          link.setAttribute('rel', 'preload');
          link.setAttribute('as', 'style');

          if (preloadMode === 'js' || preloadMode === 'js-lazy') {
            var script = document.createElement('script');
            var js =
              cssLoaderPreamble +
              '$loadcss(' +
              JSON.stringify(href) +
              (lazy ? ',' + JSON.stringify(media || 'all') : '') +
              ')';
            script.appendChild(document.createTextNode(js));
            link.parentNode.insertBefore(script, link.nextSibling);
            style.$$links.push(script);
            cssLoaderPreamble = '';
            noscriptFallback = true;
          } else if (preloadMode === 'media') {
            // @see https://github.com/filamentgroup/loadCSS/blob/af1106cfe0bf70147e22185afa7ead96c01dec48/src/loadCSS.js#L26
            link.setAttribute('rel', 'stylesheet');
            link.removeAttribute('as');
            link.setAttribute('media', 'print');
            link.setAttribute(
              'onload',
              "this.media='" + (media || 'all') + "'"
            );
            noscriptFallback = true;
          } else if (preloadMode === 'swap') {
            link.setAttribute('onload', "this.rel='stylesheet'");
            noscriptFallback = true;
          } else {
            var bodyLink = document.createElement('link');
            bodyLink.setAttribute('rel', 'stylesheet');
            if (media) bodyLink.setAttribute('media', media);
            bodyLink.setAttribute('href', href);
            document.body.appendChild(bodyLink);
            style.$$links.push(bodyLink);
          }
        }

        if (_this7.options.noscriptFallback !== false && noscriptFallback) {
          var noscript = document.createElement('noscript');
          var noscriptLink = document.createElement('link');
          noscriptLink.setAttribute('rel', 'stylesheet');
          noscriptLink.setAttribute('href', href);
          if (media) noscriptLink.setAttribute('media', media);
          noscript.appendChild(noscriptLink);
          link.parentNode.insertBefore(noscript, link.nextSibling);
          style.$$links.push(noscript);
        }
      };

      var _exit2;

      var _this7 = this;

      var href = link.getAttribute('href');
      var media = link.getAttribute('media');
      var document = link.ownerDocument;
      var preloadMode = _this7.options.preload; // skip filtered resources, or network resources if no filter is provided

      if (
        _this7.urlFilter
          ? _this7.urlFilter(href)
          : href.match(/^(https?:)?\/\//)
      ) {
        return Promise.resolve();
      } // path on disk (with output.publicPath removed)

      var normalizedPath = href.replace(/^\//, '');
      var pathPrefix = (publicPath || '').replace(/(^\/|\/$)/g, '') + '/';

      if (normalizedPath.indexOf(pathPrefix) === 0) {
        normalizedPath = normalizedPath
          .substring(pathPrefix.length)
          .replace(/^\//, '');
      }

      var filename = path.resolve(outputPath, normalizedPath); // try to find a matching asset by filename in webpack's output (not yet written to disk)

      var relativePath = path
        .relative(outputPath, filename)
        .replace(/^\.\//, '');
      var asset = compilation.assets[relativePath]; // Attempt to read from assets, falling back to a disk read

      var sheet = asset && asset.source();

      var _temp15 = (function () {
        if (!sheet) {
          var _temp16 = _catch$1(
            function () {
              return Promise.resolve(
                _this7.readFile(compilation, filename)
              ).then(function (_this6$readFile) {
                sheet = _this6$readFile;

                _this7.logger.warn(
                  'Stylesheet "' +
                    relativePath +
                    '" not found in assets, but a file was located on disk.' +
                    (_this7.options.pruneSource
                      ? ' This means pruneSource will not be applied.'
                      : '')
                );
              });
            },
            function () {
              _this7.logger.warn(
                'Unable to locate stylesheet: ' + relativePath
              );

              _exit2 = 1;
            }
          );

          if (_temp16 && _temp16.then) return _temp16.then(function () {});
        }
      })();

      return Promise.resolve(
        _temp15 && _temp15.then ? _temp15.then(_temp14) : _temp14(_temp15)
      );
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Parse the stylesheet within a <style> element, then reduce it to contain only rules used by the document.
   */

  _proto.processStyle = function processStyle(style) {
    try {
      var _this9 = this;

      if (style.$$reduce === false) return Promise.resolve();
      var name = style.$$name ? style.$$name.replace(/^\//, '') : 'inline CSS';
      var options = _this9.options;
      var document = style.ownerDocument;
      var head = document.querySelector('head');
      var keyframesMode = options.keyframes || 'critical'; // we also accept a boolean value for options.keyframes

      if (keyframesMode === true) keyframesMode = 'all';
      if (keyframesMode === false) keyframesMode = 'none'; // basically `.textContent`

      var sheet =
        style.childNodes.length > 0 &&
        [].map
          .call(style.childNodes, function (node) {
            return node.nodeValue;
          })
          .join('\n'); // store a reference to the previous serialized stylesheet for reporting stats

      var before = sheet; // Skip empty stylesheets

      if (!sheet) return Promise.resolve();
      var ast = parseStylesheet(sheet);
      var astInverse = options.pruneSource ? parseStylesheet(sheet) : null; // a string to search for font names (very loose)

      var criticalFonts = '';
      var failedSelectors = [];
      var criticalKeyframeNames = []; // Walk all CSS rules, marking unused rules with `.$$remove=true` for removal in the second pass.
      // This first pass is also used to collect font and keyframe usage used in the second pass.

      walkStyleRules(
        ast,
        markOnly(function (rule) {
          if (rule.type === 'rule') {
            // Filter the selector list down to only those match
            rule.filterSelectors(function (sel) {
              // Strip pseudo-elements and pseudo-classes, since we only care that their associated elements exist.
              // This means any selector for a pseudo-element or having a pseudo-class will be inlined if the rest of the selector matches.
              if (sel !== ':root') {
                sel = sel
                  .replace(/(?:>\s*)?::?[a-z-]+\s*(\{|$)/gi, '$1')
                  .trim();
              }

              if (!sel) return false;

              try {
                return document.querySelector(sel) != null;
              } catch (e) {
                failedSelectors.push(sel + ' -> ' + e.message);
                return false;
              }
            }); // If there are no matched selectors, remove the rule:

            if (rule.selectors.length === 0) {
              return false;
            }

            if (rule.declarations) {
              for (var i = 0; i < rule.declarations.length; i++) {
                var decl = rule.declarations[i]; // detect used fonts

                if (
                  decl.property &&
                  decl.property.match(/\bfont(-family)?\b/i)
                ) {
                  criticalFonts += ' ' + decl.value;
                } // detect used keyframes

                if (
                  decl.property === 'animation' ||
                  decl.property === 'animation-name'
                ) {
                  // @todo: parse animation declarations and extract only the name. for now we'll do a lazy match.
                  var names = decl.value.split(/\s+/);

                  for (var j = 0; j < names.length; j++) {
                    var _name = names[j].trim();

                    if (_name) criticalKeyframeNames.push(_name);
                  }
                }
              }
            }
          } // keep font rules, they're handled in the second pass:

          if (rule.type === 'font-face') return; // If there are no remaining rules, remove the whole rule:

          var rules =
            rule.rules &&
            rule.rules.filter(function (rule) {
              return !rule.$$remove;
            });
          return !rules || rules.length !== 0;
        })
      );

      if (failedSelectors.length !== 0) {
        _this9.logger.warn(
          failedSelectors.length +
            ' rules skipped due to selector errors:\n  ' +
            failedSelectors.join('\n  ')
        );
      }

      var shouldPreloadFonts =
        options.fonts === true || options.preloadFonts === true;
      var shouldInlineFonts =
        options.fonts !== false && options.inlineFonts === true;
      var preloadedFonts = []; // Second pass, using data picked up from the first

      walkStyleRulesWithReverseMirror(ast, astInverse, function (rule) {
        // remove any rules marked in the first pass
        if (rule.$$remove === true) return false;
        applyMarkedSelectors(rule); // prune @keyframes rules

        if (rule.type === 'keyframes') {
          if (keyframesMode === 'none') return false;
          if (keyframesMode === 'all') return true;
          return criticalKeyframeNames.indexOf(rule.name) !== -1;
        } // prune @font-face rules

        if (rule.type === 'font-face') {
          var family, src;

          for (var i = 0; i < rule.declarations.length; i++) {
            var decl = rule.declarations[i];

            if (decl.property === 'src') {
              // @todo parse this properly and generate multiple preloads with type="font/woff2" etc
              src = (decl.value.match(/url\s*\(\s*(['"]?)(.+?)\1\s*\)/) ||
                [])[2];
            } else if (decl.property === 'font-family') {
              family = decl.value;
            }
          }

          if (src && shouldPreloadFonts && preloadedFonts.indexOf(src) === -1) {
            preloadedFonts.push(src);
            var preload = document.createElement('link');
            preload.setAttribute('rel', 'preload');
            preload.setAttribute('as', 'font');
            preload.setAttribute('crossorigin', 'anonymous');
            preload.setAttribute('href', src.trim());
            head.appendChild(preload);
          } // if we're missing info, if the font is unused, or if critical font inlining is disabled, remove the rule:

          if (
            !family ||
            !src ||
            criticalFonts.indexOf(family) === -1 ||
            !shouldInlineFonts
          ) {
            return false;
          }
        }
      });
      sheet = serializeStylesheet(ast, {
        compress: _this9.options.compress !== false,
      }).trim(); // If all rules were removed, get rid of the style element entirely

      if (sheet.trim().length === 0) {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }

        return Promise.resolve();
      }

      var afterText = '';

      if (options.pruneSource) {
        var sheetInverse = serializeStylesheet(astInverse, {
          compress: _this9.options.compress !== false,
        });
        var asset = style.$$asset;

        if (asset) {
          // if external stylesheet would be below minimum size, just inline everything
          var minSize = _this9.options.minimumExternalSize;

          if (minSize && sheetInverse.length < minSize) {
            _this9.logger.info(
              '\x1B[32mInlined all of ' +
                name +
                ' (non-critical external stylesheet would have been ' +
                sheetInverse.length +
                'b, which was below the threshold of ' +
                minSize +
                ')\x1B[39m'
            );

            setNodeText(style, before); // remove any associated external resources/loaders:

            if (style.$$links) {
              for (
                var _iterator = _createForOfIteratorHelperLoose(style.$$links),
                  _step;
                !(_step = _iterator()).done;

              ) {
                var link = _step.value;
                var parent = link.parentNode;
                if (parent) parent.removeChild(link);
              }
            } // delete the webpack asset:

            delete style.$$assets[style.$$assetName];
            return Promise.resolve();
          }

          var _percent = (sheetInverse.length / before.length) * 100;

          afterText =
            ', reducing non-inlined size ' +
            (_percent | 0) +
            '% to ' +
            prettyBytes(sheetInverse.length);
          style.$$assets[
            style.$$assetName
          ] = new sources.LineToLineMappedSource(
            sheetInverse,
            style.$$assetName,
            before
          );
        } else {
          _this9.logger.warn(
            'pruneSource is enabled, but a style (' +
              name +
              ') has no corresponding Webpack asset.'
          );
        }
      } // replace the inline stylesheet with its critical'd counterpart

      setNodeText(style, sheet); // output stats

      var percent = ((sheet.length / before.length) * 100) | 0;

      _this9.logger.info(
        '\x1B[32mInlined ' +
          prettyBytes(sheet.length) +
          ' (' +
          percent +
          '% of original ' +
          prettyBytes(before.length) +
          ') of ' +
          name +
          afterText +
          '.\x1B[39m'
      );

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return Critters;
})();

exports.core = Critters;
exports.default = Critters$1;
// # sourceMappingURL=critters.js.map
