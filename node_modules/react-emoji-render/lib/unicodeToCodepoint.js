"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = unicodeToCodepoint;
// avoid runtime RegExp creation for not so smart,
// not JIT based, and old browsers / engines
// https://github.com/twitter/twemoji/blob/gh-pages/2/twemoji.js#L232
var UFE0Fg = /\uFE0F/g;

// \u200D is a zero-width joiner character
// https://github.com/twitter/twemoji/blob/gh-pages/2/twemoji.js#L235
var U200D = String.fromCharCode(0x200d);

// convert utf16 into code points
function toCodePoint(input) {
  var separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "-";

  var codePoints = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = input[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var codePoint = _step.value;

      codePoints.push(codePoint.codePointAt(0).toString(16));
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return codePoints.join(separator);
}

function unicodeToCodepoint(input) {
  return toCodePoint(input.indexOf(U200D) < 0 ? input.replace(UFE0Fg, "") : input);
}