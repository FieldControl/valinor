import { Component, Input } from '@angular/core';
import { Board } from 'src/app/core/api/api-service.service';

@Component({
  selector: 'app-card-board',
  templateUrl: './card-board.component.html',
  styleUrls: ['./card-board.component.scss'],
})
export class CardBoardComponent {
  @Input({ required: true }) board!: Board;
}
