import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BoardsComponent } from '../boards/boards.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidebarComponent, BoardsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
