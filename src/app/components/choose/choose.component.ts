import { Component, OnInit } from '@angular/core';
import { CarouselComponent } from '../carousel/carousel.component';

@Component({
  selector: 'app-choose',
  templateUrl: './choose.component.html',
  styleUrls: ['./choose.component.scss']
})
export class ChooseComponent implements OnInit {
  active: string = 'Default';
  ngOnInit(): void {
    this.active = 'Default';
  }

  constructor(public CarouselComponent: CarouselComponent) { }
}
