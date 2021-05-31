"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.columnsRule = exports.column = void 0;

var _postcssValueParser = require("postcss-value-parser");

var _border = _interopRequireDefault(require("./border.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const strValues = ['auto', 'inherit', 'unset', 'initial'];

const column = columns => {
  let newValue = {
    front: '',
    back: ''
  };
  let shouldNormalize = false;
  columns.walk(node => {
    const {
      type,
      value
    } = node;

    if (type === 'word' && strValues.indexOf(value.toLowerCase())) {
      const parsedVal = (0, _postcssValueParser.unit)(value);

      if (parsedVal.unit !== '') {
        // surely its the column's width
        // it needs to be at the front
        newValue.front = `${newValue.front} ${value}`;
        shouldNormalize = true;
      }
    } else if (type === 'word') {
      newValue.back = `${newValue.back} ${value}`;
    }
  });

  if (shouldNormalize) {
    return `${newValue.front.trimStart()} ${newValue.back.trimStart()}`;
  }

  return columns;
};

exports.column = column;
const columnsRule = _border.default;
exports.columnsRule = columnsRule;