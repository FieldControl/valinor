import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CryptoCardComponent } from '../../components/crypto-card/crypto-card.component';
import { CoinMarketCapAPIService } from '../../services/coin-market-cap-api.service';
import { CryptoCoin } from '../../models/crypto-coin';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CryptoCurrencyPricesComponent } from '../../components/crypto-currency-prices/crypto-currency-prices.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CryptoCardComponent,
    MatSlideToggleModule,
    CryptoCurrencyPricesComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class HomeComponent implements OnInit {
  title: string = 'Valinor Coin';
  subtitle: string = 'Preços de criptomoedas por capitalização de mercado';
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


