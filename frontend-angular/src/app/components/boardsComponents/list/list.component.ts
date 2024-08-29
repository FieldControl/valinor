import { Component, OnInit } from '@angular/core';
import { BoardService } from '../../../services/boards/board.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent implements OnInit {
  constructor(private readonly boardService : BoardService){}
  ngOnInit(): void {
    toSignal(this.boardService.getBoard().pipe());
  }
}
