import { Component } from '@angular/core';
import { apiService } from 'src/app/service.service';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent {
  constructor(public apiService: apiService){}
}
