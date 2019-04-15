const { Transform } = require('stream');

const utils = require('./utils');

class BtoB extends Transform {

  constructor(options = {}) {
    super(options);

    this.encode = options.encode !== false; // default true
    this.flip = options.flip !== false; // default true
    this.reverse = options.reverse !== false; // default true

    this.transformations = [
      'byte_flip',
      'byte_reverse',
    ];
    if (!this.encode) {
      this.transformations = this.transformations.reverse();
    }
  }

  _transform(data, encoding, callback) {
    const result = new Buffer(data.length);
    data.forEach((byte, i) => {
      let b = byte;
      this.transformations.forEach(funcKey => {
        const funcName = funcKey.split('_').pop();
        b = utils[funcName](b);
      });
      result[i] = b;
    });
    callback(null, result);
  }

}

module.exports = BtoB;
