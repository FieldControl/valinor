import { Component, OnInit } from '@angular/core';
import { NavbarService } from '../navbar.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private router: Router, public nav: NavbarService) { }

  logout() {

  	localStorage.removeItem('token');
  	localStorage.removeItem('email');

  	this.nav.hide(); 

  	this.router.navigateByUrl('/login');

  }
 

  ngOnInit() {


  }

}
