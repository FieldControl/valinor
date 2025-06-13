import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IBoard } from '../../../shared/DTO/board.dto';

@Component({
  selector: 'app-board.component',
  imports: [],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  private readonly router = inject(Router)

  // Criação/edição de um board
  putBoard($event: Event, board?: IBoard) {
    $event.preventDefault();
    $event.stopPropagation();
    this.router.navigate(['/board/add'], {
      queryParams: { board: board ?? null }
    });
  }
}
