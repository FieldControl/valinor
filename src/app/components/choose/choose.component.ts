import { Component, Input, OnInit } from '@angular/core';
import { MainPageComponent } from '../main-page/main-page.component';
import { CommonModule } from '@angular/common';

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
