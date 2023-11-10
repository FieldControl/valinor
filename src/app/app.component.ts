import { Component, OnInit } from '@angular/core';
import { Location } from "@angular/common";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  url: string = '';
  constructor(location: Location) {
    this.url = location.path();
  }

  ngOnInit(): void { }

}
