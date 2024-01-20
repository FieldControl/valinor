import { Component } from '@angular/core';
import {MatTableModule} from '@angular/material/table';

@Component({
  selector: 'app-crypto-currency-prices',
  standalone: true,
  imports: [MatTableModule],
  templateUrl: './crypto-currency-prices.component.html',
  styleUrl: './crypto-currency-prices.component.css'
})
export class CryptoCurrencyPricesComponent {
}
