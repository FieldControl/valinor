import { Component, OnInit } from '@angular/core';
import { MainPageComponent } from '../main-page/main-page.component';

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

  constructor(public MainPageComponent: MainPageComponent) { }
}
