import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'SPA-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'SPA';
  content = 'Welcome do Meat App!'

  constructor() { }

  ngOnInit() {
  }
}
