import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortNumber'
})
export class ShortNumberPipe implements PipeTransform {

  transform(number: number, args?: any): any {
    if (isNaN(number))
      return null; // will only work value is a number
    if (number === null)
      return 0;
    if (number === 0)
      return 0;

    if (number.toString().includes(',')) {
      number = parseFloat(number.toString().replace(/\,/g, ''));
    }

    let abs = Math.abs(number);
    const rounder = Math.pow(10, 1);
    const isNegative = number < 0; // will also work for Negetive numbers
    let key = '';

    const powers = [
      { key: 'Q', value: Math.pow(10, 15) },// quadrillion
      { key: 'T', value: Math.pow(10, 12) },// Trillion
      { key: 'B', value: Math.pow(10, 9) }, // Billion
      { key: 'M', value: Math.pow(10, 6) }, // Million
      { key: 'K', value: 1000 }             // Thousand
    ];

    for (let i = 0; i < powers.length; i++) {
      let reduced = abs / powers[i].value;
      reduced = Math.round(reduced * rounder) / rounder;
      if (reduced >= 1) {
        abs = reduced;
        key = powers[i].key;
        break;
      }
    }
    return (isNegative ? '-' : '') + abs + key;
  }
}
