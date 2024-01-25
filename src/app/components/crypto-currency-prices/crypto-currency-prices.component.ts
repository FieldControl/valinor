import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NgxSkeletonLoaderComponent, NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-crypto-currency-prices',
  standalone: true,
  imports: [NgOptimizedImage, CommonModule, NgxSkeletonLoaderModule],
  templateUrl: './crypto-currency-prices.component.html',
  styleUrl: './crypto-currency-prices.component.css',
})
export class CryptoCurrencyPricesComponent implements OnInit{
  @Input({ required: true }) cryptos: [] | any;
  loader: boolean = true

  constructor() {}


  ngOnInit(): void {
    this.loader = false
  }


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
