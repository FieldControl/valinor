import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';

import { GET_BOARDS } from '../../data-access/board.queries';

import { Boards } from '../../ui/boards/boards';
import { BoardModal } from '../../ui/board-modal/board-modal';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Boards, BoardModal],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  boards: any[] = [];
  loading = true;
  error: any;

  // "configurações" dos modais dos boards
  isBoardModalOpen = false;
  modalMode: 'create' | 'edit' | 'remove' = 'create';
  selectedBoard: any = null;

  private apollo = inject(Apollo);
  private router = inject(Router);

  ngOnInit() {
    this.apollo
      .watchQuery({
        query: GET_BOARDS,
      })
      .valueChanges.subscribe((result: any) => {
        this.boards = result?.data?.boards;
        this.loading = result.loading;
        this.error = result.error;
      });
  }

  openBoard(id: string) {
    this.router.navigate(['/board', id]);
  }

  openCreateBoardModal() {
    this.modalMode = 'create';
    this.selectedBoard = null;
    this.isBoardModalOpen = true;
  }

  openEditBoardModal(board: any) {
    this.modalMode = 'edit';
    this.selectedBoard = board;
    this.isBoardModalOpen = true;
  }

  openRemoveBoardModal(board: any) {
    this.modalMode = 'remove';
    this.selectedBoard = board;
    this.isBoardModalOpen = true;
  }
}