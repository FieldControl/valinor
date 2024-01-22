import { Component, Input } from '@angular/core';
import { CoinRankingAPIService } from '../../services/coin-ranking-api.service';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { DataCoinRanking } from '../../models/crypto-coin';

@Component({
  selector: 'app-crypto-currency-prices',
  standalone: true,
  imports: [NgOptimizedImage, CommonModule],
  templateUrl: './crypto-currency-prices.component.html',
  styleUrl: './crypto-currency-prices.component.css',
})
export class CryptoCurrencyPricesComponent {
  @Input({ required: true }) cryptos: DataCoinRanking | any;

  constructor(public service: CoinRankingAPIService) {}

  ngOnInit(): void {}
}
