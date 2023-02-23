import { Component, OnInit } from '@angular/core';

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

  constructor() {
    const consoleLog = () => {
      console.log(this.active)
    }
  }
}