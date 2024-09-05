import { Component } from '@angular/core';
import { Router,RouterModule } from '@angular/router';


@Component({
  imports:[RouterModule],
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  standalone: true,
})
export class NavbarComponent {
  constructor(private router : Router){}

  home(){
    this.router.navigate(['home']);
  }

  boards(){
    this.router.navigate(['boardsList']);
  }

  developer(){
    this.router.navigate(['developer']);
  }

  help(){
    this.router.navigate(['help']);
  }
  
  logout(){
    this.router.navigate(['accesso']);
  }
}
