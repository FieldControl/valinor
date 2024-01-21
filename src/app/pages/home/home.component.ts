import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit} from '@angular/core';
import { Swiper } from 'swiper/types';
import { CryptoCardComponent } from '../../components/crypto-card/crypto-card.component';
import { CryptoCurrencyPricesComponent } from '../../components/crypto-currency-prices/crypto-currency-prices.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CryptoCardComponent,
    CryptoCurrencyPricesComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent implements OnInit {
  title: string = 'Valinor Coin';
  subtitle: string = 'Preços de criptomoedas por\n capitalização de mercado';


  ngOnInit(): void {
  }
}
