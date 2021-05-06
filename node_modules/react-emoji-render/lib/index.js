"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toArray = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _renderer = require("./renderer");

Object.defineProperty(exports, "toArray", {
  enumerable: true,
  get: function get() {
    return _renderer.toArray;
  }
});
exports.Twemoji = Twemoji;
exports.Emojione = Emojione;
exports.EmojioneV4 = EmojioneV4;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _renderer2 = _interopRequireDefault(_renderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var protocol = "https";

if (typeof location !== "undefined" && location.protocol === "http:") {
  protocol = "http";
}

exports.default = _renderer2.default;
function Twemoji(_ref) {
  var svg = _ref.svg,
      options = _ref.options,
      rest = _objectWithoutProperties(_ref, ["svg", "options"]);

  var size = svg ? "" : "72x72";
  var ext = svg ? "svg" : "png";

  options = _extends({
    protocol: protocol,
    baseUrl: "//twemoji.maxcdn.com/2/" + (svg ? "svg/" : ""),
    size: size,
    ext: ext
  }, options);

  return _react2.default.createElement(_renderer2.default, _extends({ options: options }, rest));
}

Twemoji.propTypes = {
  text: _propTypes2.default.string,
  options: _propTypes2.default.object,
  svg: _propTypes2.default.bool
};

function Emojione(_ref2) {
  var svg = _ref2.svg,
      options = _ref2.options,
      rest = _objectWithoutProperties(_ref2, ["svg", "options"]);

  var ext = svg ? "svg" : "png";

  options = _extends({
    protocol: protocol,
    baseUrl: "//cdnjs.cloudflare.com/ajax/libs/emojione/2.2.7/assets/" + ext + "/",
    size: "",
    ext: ext,
    emojione: true
  }, options);

  return _react2.default.createElement(_renderer2.default, _extends({ options: options }, rest));
}

Emojione.propTypes = {
  text: _propTypes2.default.string,
  options: _propTypes2.default.object,
  svg: _propTypes2.default.bool
};

function EmojioneV4(_ref3) {
  var size = _ref3.size,
      options = _ref3.options,
      rest = _objectWithoutProperties(_ref3, ["size", "options"]);

  var ext = "png";

  options = _extends({
    protocol: protocol,
    baseUrl: "//cdn.jsdelivr.net/emojione/assets/4.0/" + ext + "/",
    size: size,
    ext: ext,
    emojione: true
  }, options);

  return _react2.default.createElement(_renderer2.default, _extends({ options: options }, rest));
}

EmojioneV4.propTypes = {
  text: _propTypes2.default.string,
  options: _propTypes2.default.object,
  size: _propTypes2.default.oneOf([32, 64, 128])
};
EmojioneV4.defaultProps = {
  size: 64
};