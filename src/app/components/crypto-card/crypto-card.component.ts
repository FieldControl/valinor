import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';

@Component({
  selector: 'app-crypto-card',
  standalone: true,
  imports: [],
  templateUrl: './crypto-card.component.html',
  styleUrl: './crypto-card.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CryptoCardComponent {}
