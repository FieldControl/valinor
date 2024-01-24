import {
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoinRankingAPIService } from '../../services/coin-ranking-api.service';

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
  cryptos!: Array<any>;

  constructor(private service: CoinRankingAPIService) {}

  ngOnInit(): void {
    this.service.getCryptoData().subscribe({
      next: (response) => {
        this.cryptos = response.data.coins;
      },
    });
  }

  /* SWIPER CONFIGS */
  ngAfterViewInit(): void {
    const swiperParams = {
      slidesPerView: 2,
      spaceBetween: 68,
      breakpoints: {
        375: {
          spaceBetween: 14,
        },
        425: {
          slidesPerView: 3,
          spaceBetween: 188,
        },
        500: {
          slidesPerView: 3,
          spaceBetween: 128,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 34,
        },
        1024: {
          slidesPerView: 4,
          spaceBetween: 128,
        },
        1280: {
          slidesPerView: 5,
          spaceBetween: 24,
        },
        1440: {
          slidesPerView: 5,
          spaceBetween: 188,
        },
      },
      speed: 18000,
      direction: 'horizontal',
      autoplay: {
        delay: 0,
      },
      loop: true,
      freeMode: true,
    };
    Object.assign(this.swiperContainer.nativeElement, swiperParams);
    this.swiperContainer.nativeElement.initialize();
  }
}
