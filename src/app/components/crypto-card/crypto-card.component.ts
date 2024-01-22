import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { DataCoinRanking } from '../../models/crypto-coin';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crypto-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crypto-card.component.html',
  styleUrl: './crypto-card.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CryptoCardComponent {
  @Input({ required: true }) cryptos: DataCoinRanking | any;
}
