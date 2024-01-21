import { Component } from '@angular/core';
import { CryptoCoin } from '../../models/crypto-coin';
import { CoinMarketCapAPIService } from '../../services/coin-market-cap-api.service';

@Component({
  selector: 'app-crypto-currency-prices',
  standalone: true,
  imports: [],
  templateUrl: './crypto-currency-prices.component.html',
  styleUrl: './crypto-currency-prices.component.css',
})
export class CryptoCurrencyPricesComponent {
  cryptos: CryptoCoin | any;

  constructor(private service: CoinMarketCapAPIService) {}

  ngOnInit(): void {
    this.service.getCryptoData().subscribe({
      next: (response: CryptoCoin) => {
        this.cryptos = response.data;
      },
    });
  }
}
