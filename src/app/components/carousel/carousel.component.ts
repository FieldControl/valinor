import { Component, OnInit } from '@angular/core';
import { apiService } from 'src/app/service.service';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {
  active: string = 'main';

  ngOnInit(): void {
    this.active = 'main';
  }

  constructor(public apiService: apiService) { }
}
