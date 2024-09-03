import { Component } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { HeaderComponent } from '../header/header.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  imports: [HeaderComponent, NavbarComponent],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true
})
export class HomeComponent {
  constructor(private appComponent : AppComponent){}

  title = 'Home';
}
