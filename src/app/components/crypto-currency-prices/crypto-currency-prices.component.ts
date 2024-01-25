import { Component, Input, Pipe } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-crypto-currency-prices',
  standalone: true,
  imports: [NgOptimizedImage, CommonModule],
  templateUrl: './crypto-currency-prices.component.html',
  styleUrl: './crypto-currency-prices.component.css',
})
export class CryptoCurrencyPricesComponent {
  @Input({ required: true }) cryptos: [] | any;

  constructor() {}

  isPositive(value: string): boolean {
    const parsedValue = parseFloat(value);
    if (parsedValue > 0) {
      return true;
    } else {
      return false;
    }
  }

  removeSymbol(value: string) {
    const num = Math.abs(parseFloat(value));
    return num.toFixed(2);
  }
}
