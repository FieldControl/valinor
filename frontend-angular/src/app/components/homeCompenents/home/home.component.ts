import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { Router,RouterModule } from '@angular/router';

@Component({
  imports: [HeaderComponent, NavbarComponent, RouterModule],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true
})
export class HomeComponent {
  constructor(private router : Router){}

  title = 'Kanban Challenge';


  switchAccount(){
    this.router.navigate(['acesso']); 
  }

  navigateBoards(){
    this.router.navigate(['boardsList']); 
  }

  navigateDeveloper(){
    this.router.navigate(['developer']);
  }

  navigateHelp(){
    this.router.navigate(['help']);
  }
  
}
