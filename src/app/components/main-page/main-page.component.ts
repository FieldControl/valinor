import { Component, OnInit } from '@angular/core';
import { apiService } from 'src/app/service.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  template: ''
})
export class MainPageComponent implements OnInit{
  active: string = 'main';
  public random: number = 0;

  constructor(public apiService: apiService) {}

  ngOnInit(): void {
    this.generateRandomNumberWithDelay();
  }

  public generateRandomNumberWithDelay(): void {

    const randomNumber = Math.floor(Math.random() * 20);
    this.random = randomNumber;
    setTimeout(() => {
      this.generateRandomNumberWithDelay();
    }, 5000);
  }
}
