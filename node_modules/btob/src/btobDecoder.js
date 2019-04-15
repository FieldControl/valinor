const BtoB = require('./btob');

class BtoBDecoder extends BtoB {
  constructor(options) {
    super({ ...options, encode: false });
  }
}

module.exports = BtoBDecoder;
