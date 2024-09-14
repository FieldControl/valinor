import { Component } from '@angular/core';
import { NavbarComponent } from '../../homeCompenents/navbar/navbar.component';
import { HeaderComponent } from '../../homeCompenents/header/header.component';

@Component({
  imports: [NavbarComponent, HeaderComponent],
  selector: 'app-developer',
  templateUrl: './developer.component.html',
  styleUrl: './developer.component.css',
  standalone: true,
})
export class DeveloperComponent {
  title = 'Developer';

}
