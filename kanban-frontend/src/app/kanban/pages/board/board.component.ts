import { Component, OnInit } from '@angular/core';
import { BoardService } from '../../services/board.service';
import { Board } from '@models/board.model';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit {
  board: Board | null = null;

  constructor(private boardService: BoardService) {}

  ngOnInit(): void {
    this.boardService.getMockBoard().subscribe((board) => {
      this.board = board;
    });
  }
}