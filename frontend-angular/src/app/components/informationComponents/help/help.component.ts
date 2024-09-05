import { Component } from '@angular/core';
import { NavbarComponent } from '../../homeCompenents/navbar/navbar.component';

@Component({
  imports:[NavbarComponent],
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrl: './help.component.css',
  standalone: true,
})
export class HelpComponent {

}
