import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BoardService } from '../../services/board.service';
import { IBoard } from '../../models/board';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-boards',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './boards.component.html',
  styleUrl: './boards.component.css',
})
export class BoardsComponent {
  private boardService = inject(BoardService)
  private router = inject(Router);
  boards: IBoard[] = [];

  ngOnInit(): void {
    this.getBoards()
  }

  getBoards() {
    this.boardService.list().subscribe({
      next: (data) => {
        this.boards = data;
        console.log('Quadros', this.boards)
      },
      error: (e) => {
        console.log('Erro ao obter quadros: ',e)
      }
    })
  }

}
