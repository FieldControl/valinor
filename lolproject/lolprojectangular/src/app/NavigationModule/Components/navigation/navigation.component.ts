import { Component, OnInit } from '@angular/core';

@Component({
  selector: '../navigation',
  templateUrl: '../navigation/navigation.component.html',
  styleUrls: ['../navigation/navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  auth: boolean = false;

  constructor() {

  }

  ngOnInit(): void {
    if (localStorage.getItem('token')) {
      this.auth = true;
    } else {
      this.auth = false;
    }
  }

  verifyTokenInLocalStorage(){
    if (localStorage.getItem('token')) {
      this.auth = true;
    } else {
      this.auth = false;
    }
  }
}

