import { Component, OnInit } from '@angular/core';
import { NavigationComponent } from '../navigation/navigation.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {


  constructor(private navigationcOmponent:NavigationComponent, private router: Router) { }

  ngOnInit(): void {

  }

  logout(){
    alert("DESLOGADO COM SUCESSO !")
    localStorage.removeItem('token')
    this.navigationcOmponent.verifyTokenInLocalStorage();
    this.router.navigate([''])

  }

}
