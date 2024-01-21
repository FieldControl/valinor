import { Component } from '@angular/core';
import { CoinRankingAPIService } from '../../services/coin-ranking-api.service';
import { NgOptimizedImage } from '@angular/common';
import { DataCoinRanking } from '../../models/crypto-coin';

@Component({
  selector: 'app-crypto-currency-prices',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './crypto-currency-prices.component.html',
  styleUrl: './crypto-currency-prices.component.css',
})
export class CryptoCurrencyPricesComponent {
  cryptos: DataCoinRanking | any;

  constructor(private service: CoinRankingAPIService) {}

  ngOnInit(): void {
    this.service.getCryptoData().subscribe({
      next: (response: DataCoinRanking) => {
        this.cryptos = response.data.coins;
        console.log(this.cryptos)
      },
    });
  }
}
