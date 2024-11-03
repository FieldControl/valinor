import { Component } from '@angular/core';
import { BoardComponent } from "../../components/board-component/board.component";

@Component({
  selector: 'app-board-page',
  standalone: true,
  imports: [BoardComponent],
  templateUrl: './board-page.component.html',
  styleUrl: './board-page.component.css'
})
export class BoardPageComponent {

}
