const chai = require('chai');
const { expect } = chai;

const fs = require('fs');
const path = require('path');
const { BtoBEncoder, BtoBDecoder, utils } = require('../src');

describe('btob', () => {

  it('should flip byte correctly', () => {
    const input = utils.fromString('01010101');
    let output;
    output = utils.flip(input);
    output = utils.toString(output);
    expect(output).to.equal('10101010');
  });

  it('should reverse byte correctly', () => {
    const input = utils.fromString('11001010');
    let output;
    output = utils.reverse(input);
    output = utils.toString(output);
    expect(output).to.equal('01010011');
  });

  it('should encode and decode', (done) => {
    const inputFilePath = path.resolve(__dirname, './assets/test.txt');
    const inputString = fs.readFileSync(inputFilePath, 'utf8')
    const inputStream = fs.createReadStream(inputFilePath);
    const btob1 = new BtoBEncoder();
    const btob2 = new BtoBDecoder();
    let result1 = new Buffer([]);
    let result2 = new Buffer([]);

    inputStream.pipe(btob1)
      .on('data', (d) => result1 = Buffer.concat([result1, d]))
      .on('end', () => {
        expect(result1.toString()).to.be.not.equals(inputString);
      })
      .pipe(btob2)
      .on('data', (d) => result2 = Buffer.concat([result2, d]))
      .on('end', () => {
        expect(result2.toString()).to.be.equals(inputString);
        done();
      });
  });

});
