import { Component, OnInit } from '@angular/core';
import { apiService } from 'src/app/service.service';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements OnInit{
  active: string = 'main';
  public random: number = 0;

  constructor(public apiService: apiService) {}

  ngOnInit(): void {
    this.generateRandomNumberWithDelay();
  }

  public generateRandomNumberWithDelay(): void {

    const randomNumber = Math.floor(Math.random() * 20);
    console.log(randomNumber);
    this.random = randomNumber;

    setTimeout(() => {
      this.generateRandomNumberWithDelay();
    }, 5000);
  }
}
