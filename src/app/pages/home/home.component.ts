import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit} from '@angular/core';
import { CryptoCardComponent } from '../../components/crypto-card/crypto-card.component';
import { CryptoCurrencyPricesComponent } from '../../components/crypto-currency-prices/crypto-currency-prices.component';
import { SearchInputComponent } from '../../components/search-input/search-input.component';
import { PaginationBtnComponent } from '../../components/pagination-btn/pagination-btn.component';
import { DataCoinRanking } from '../../models/crypto-coin';
import { CoinRankingAPIService } from '../../services/coin-ranking-api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CryptoCardComponent,
    CryptoCurrencyPricesComponent,
    SearchInputComponent,
    PaginationBtnComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent implements OnInit {
  cryptos: DataCoinRanking | any;
  title: string = 'Valinor Coin';
  subtitle: string = 'Preços de criptomoedas por\n capitalização de mercado';

  constructor(private service: CoinRankingAPIService){}

  ngOnInit(): void {
    this.service.getCryptoData().subscribe({
      next: (response: DataCoinRanking) => {
        this.cryptos = response.data.coins;
      },
    });
  }
}
