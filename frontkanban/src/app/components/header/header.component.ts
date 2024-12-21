import { Component } from '@angular/core';
import { LogofildComponent } from "../logofild/logofild.component";
import { BtnComponent } from "../btn/btn.component";
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-header',
  imports: [LogofildComponent, BtnComponent, LoginComponent],
  standalone: true,
  providers: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  
}
