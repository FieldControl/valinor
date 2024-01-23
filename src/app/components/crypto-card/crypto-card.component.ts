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
      spaceBetween: 94,
      breakpoints :{
        375: {
          spaceBetween: 50
        },
        425: {
          spaceBetween: 20
        },
        500: {
          slidesPerView: 3,
          spaceBetween: 144
        },
        600: {
          slidesPerView: 3,
          spaceBetween: 94
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 94
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 100
        },
        1440: {

        }
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
