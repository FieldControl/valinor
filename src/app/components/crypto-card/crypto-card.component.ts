import { AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoinRankingAPIService } from '../../services/coin-ranking-api.service';
import { swiperJsParams } from './swiperjs-config';

@Component({
  selector: 'app-crypto-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crypto-card.component.html',
  styleUrl: './crypto-card.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CryptoCardComponent implements OnInit, AfterViewInit {
  @ViewChild('swiperContainer') swiperContainer: any;
  swiper: any = swiperJsParams;
  cryptos!: Array<any>;

  constructor(private service: CoinRankingAPIService) {}

  ngOnInit(): void {
    this.service.getCryptoData().subscribe({
      next: response => {
        this.cryptos = response.data.coins;
      },
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.swiperJsInit();
    }, 500) 
  }

  /* SWIPER CONFIGS */
  swiperJsInit() {
    Object.assign(this.swiperContainer.nativeElement, this.swiper);
    this.swiperContainer.nativeElement.initialize();
  }
}
