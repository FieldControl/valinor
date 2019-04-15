const BtoB = require('./btob');

class BtoBEncoder extends BtoB {
  constructor(options) {
    super({ ...options, encode: true });
  }
}

module.exports = BtoBEncoder;
