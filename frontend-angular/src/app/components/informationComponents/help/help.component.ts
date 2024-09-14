import { Component } from '@angular/core';
import { NavbarComponent } from '../../homeCompenents/navbar/navbar.component';
import { HeaderComponent } from '../../homeCompenents/header/header.component';

@Component({
  imports:[NavbarComponent, HeaderComponent],
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrl: './help.component.css',
  standalone: true,
})
export class HelpComponent {

  title = 'About Kanban';

}
