exports.flip = (b) => {
  if (this.flip) {
    b = (~b) & 255;
  }
  return b;
}

exports.reverse = (b) => {
  if (this.reverse) {
    b = '00000000' + Number(b).toString(2);
    b = b.substr(b.length - 8);
    b = b.split('').reverse().join('');
    b = parseInt(b, 2);
  }
  return b;
}

exports.toString = (b) => {
  b = '00000000' + Number(b).toString(2);
  b = b.substr(b.length - 8);
  return b;
}

exports.fromString = (b) => {
  b = parseInt(b, 2);
  return b;
};
