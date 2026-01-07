import { Component } from '@angular/core';
import { BoardService, Column, BoardUser } from '../service/board/board-service';
import { ColumnService } from '../service/column/column-service';
import { CardService } from '../service/card/card-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BoardInterface {
  id: number;
  name: string;
  createdAt: string;
}

@Component({
  selector: 'app-board',
  imports: [CommonModule, FormsModule],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  constructor(
    private readonly boardService: BoardService,
    private readonly columnService: ColumnService,
    private readonly cardService: CardService
  ) {}

  boards!: BoardInterface[];
  selectedBoardId: number | null = null;
  isLoading: boolean = true;
  hasBoards: boolean = false;
  showCreateBoardModal: boolean = false;
  showCreateColumnModal: boolean = false;
  showCreateCardModal: boolean = false;
  showEditColumnModal: boolean = false;
  showEditCardModal: boolean = false;
  showDeleteColumnModal: boolean = false;
  showDeleteCardModal: boolean = false;
  showAddUserModal: boolean = false;
  newBoardName: string = '';
  newColumnName: string = '';
  newCardName: string = '';
  newCardDescription: string = '';
  newUserEmail: string = '';
  selectedColumnId: number | null = null;
  editingColumnId: number | null = null;
  editingCardId: number | null = null;
  deletingColumnId: number | null = null;
  deletingCardId: number | null = null;
  editColumnName: string = '';
  editCardName: string = '';
  editCardDescription: string = '';
  editCardAssignedUserId: number | null = null;
  
  boardUsers: BoardUser[] = [];
  columns: Column[] = [];
  draggedCardId: number | null = null;
  draggedFromColumnId: number | null = null;

  get selectedBoardName(): string {
    const board = this.boards?.find(b => b.id === this.selectedBoardId);
    return board?.name || 'Board';
  }

  ngOnInit() {
    this.loadBoards();
  }

  loadBoards() {
    this.boardService.findAllUserBoards().subscribe({
      next: (response) => {
        const boards = response?.data?.myBoards ?? [];

        this.boards = boards;
        this.hasBoards = boards.length > 0;

        if (this.hasBoards && !this.selectedBoardId) {
          this.selectedBoardId = boards[0].id;
          this.loadBoardData(boards[0].id);
        }
      },
      error: (err) => {
        console.error('Erro ao buscar boards', err);
        this.boards = [];
        this.hasBoards = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  loadBoardData(boardId: number) {
    this.boardService.getBoardWithColumns(boardId).subscribe({
      next: (response) => {
        const board = response?.data?.getBoard;
        if (board) {
          this.columns = board.columns || [];
        }
      },
      error: (err) => {
        console.error('Erro ao carregar dados do board', err);
      }
    });
    
    this.boardService.getBoardUsers(boardId).subscribe({
      next: (response) => {
        this.boardUsers = response?.data?.getBoardUsers || [];
      },
      error: (err) => {
        console.error('Erro ao carregar usuários do board', err);
      }
    });
  }

  selectBoard(boardId: number) {
    this.selectedBoardId = boardId;
    this.loadBoardData(boardId);
  }

  openCreateBoardModal() {
    console.log('Abrindo modal de criar board');
    this.showCreateBoardModal = true;
    this.newBoardName = '';
  }

  closeCreateBoardModal() {
    console.log('Fechando modal de criar board');
    this.showCreateBoardModal = false;
    this.newBoardName = '';
  }

  createBoard() {
    if (!this.newBoardName.trim()) {
      return;
    }

    this.boardService.createBoard(this.newBoardName).subscribe({
      next: (response) => {
        const newBoard = response?.data?.createBoard;
        if (newBoard) {
          this.boards.push(newBoard);
          this.hasBoards = true;
          this.selectedBoardId = newBoard.id;
          this.loadBoardData(newBoard.id);
          this.closeCreateBoardModal();
        }
      },
      error: (err) => {
        console.error('Erro ao criar board', err);
      }
    });
  }

  openCreateColumnModal() {
    console.log('Abrindo modal de criar coluna');
    this.showCreateColumnModal = true;
    this.newColumnName = '';
  }

  closeCreateColumnModal() {
    console.log('Fechando modal de criar coluna');
    this.showCreateColumnModal = false;
    this.newColumnName = '';
  }

  createColumn() {
    if (!this.newColumnName.trim() || !this.selectedBoardId) {
      return;
    }

    this.columnService.createColumn(this.newColumnName, this.selectedBoardId).subscribe({
      next: (response) => {
        const newColumn = response?.data?.createColumn;
        if (newColumn) {
          this.columns.push({ ...newColumn, cards: [] });
          this.closeCreateColumnModal();
        }
      },
      error: (err) => {
        console.error('Erro ao criar coluna', err);
      }
    });
  }

  openCreateCardModal(columnId: number) {
    this.selectedColumnId = columnId;
    this.showCreateCardModal = true;
    this.newCardName = '';
    this.newCardDescription = '';
  }

  closeCreateCardModal() {
    this.showCreateCardModal = false;
    this.newCardName = '';
    this.newCardDescription = '';
    this.selectedColumnId = null;
  }

  createCard() {
    if (!this.newCardName.trim() || !this.selectedColumnId) {
      return;
    }
    
    this.cardService.createCard(
      this.newCardName, 
      this.newCardDescription || null, 
      this.selectedColumnId
    ).subscribe({
      next: (response) => {
        const newCard = response?.data?.createCard;
        if (newCard) {
          const column = this.columns.find(c => c.id === this.selectedColumnId);
          if (column) {
            if (!column.cards) {
              column.cards = [];
            }
            column.cards.push(newCard);
          }
          this.closeCreateCardModal();
        }
      },
      error: (err) => {
        console.error('Erro ao criar card', err);
      }
    });
  }

  openEditColumnModal(column: Column) {
    this.editingColumnId = column.id;
    this.editColumnName = column.name;
    this.showEditColumnModal = true;
  }

  closeEditColumnModal() {
    this.showEditColumnModal = false;
    this.editingColumnId = null;
    this.editColumnName = '';
  }

  updateColumn() {
    if (!this.editColumnName.trim() || !this.editingColumnId) {
      return;
    }

    this.columnService.updateColumn(this.editingColumnId, this.editColumnName).subscribe({
      next: (response) => {
        const updatedColumn = response?.data?.updateColumn;
        if (updatedColumn) {
          const column = this.columns.find(c => c.id === this.editingColumnId);
          if (column) {
            column.name = updatedColumn.name;
          }
          this.closeEditColumnModal();
        }
      },
      error: (err) => {
        console.error('Erro ao atualizar coluna', err);
      }
    });
  }

  openEditCardModal(card: any) {
    this.editingCardId = card.id;
    this.editCardName = card.name;
    this.editCardDescription = card.description || '';
    this.editCardAssignedUserId = card.assignedUserId || null;
    this.showEditCardModal = true;
  }

  closeEditCardModal() {
    this.showEditCardModal = false;
    this.editingCardId = null;
    this.editCardName = '';
    this.editCardDescription = '';
    this.editCardAssignedUserId = null;
  }

  updateCard() {
    if (!this.editCardName.trim() || !this.editingCardId) {
      return;
    }

    const assignedUserId = this.editCardAssignedUserId !== null && this.editCardAssignedUserId !== undefined
      ? Number(this.editCardAssignedUserId) 
      : null;

    this.cardService.updateCard(
      this.editingCardId,
      this.editCardName,
      this.editCardDescription || null,
      assignedUserId
    ).subscribe({
      next: (response) => {
        const updatedCard = response?.data?.updateCard;
        if (updatedCard) {
          for (const column of this.columns) {
            const cardIndex = column.cards?.findIndex(c => c.id === this.editingCardId) ?? -1;
            if (cardIndex !== -1 && column.cards) {
              column.cards[cardIndex] = {
                ...column.cards[cardIndex],
                name: updatedCard.name,
                description: updatedCard.description,
                assignedUserId: updatedCard.assignedUserId,
                assignedUserName: updatedCard.assignedUserName
              };
              break;
            }
          }
          this.closeEditCardModal();
        }
      },
      error: (err) => {
        console.error('Erro ao atualizar card', err);
      }
    });
  }

  openDeleteColumnModal(columnId: number) {
    this.deletingColumnId = columnId;
    this.showDeleteColumnModal = true;
  }

  closeDeleteColumnModal() {
    this.showDeleteColumnModal = false;
    this.deletingColumnId = null;
  }

  confirmDeleteColumn() {
    if (!this.deletingColumnId) {
      return;
    }

    this.columnService.deleteColumn(this.deletingColumnId).subscribe({
      next: () => {
        this.columns = this.columns.filter(c => c.id !== this.deletingColumnId);
        this.closeDeleteColumnModal();
      },
      error: (err) => {
        console.error('Erro ao excluir coluna', err);
        alert('Erro ao excluir coluna. Verifique se não há cards nela.');
      }
    });
  }

  openDeleteCardModal(cardId: number) {
    this.deletingCardId = cardId;
    this.showDeleteCardModal = true;
  }

  closeDeleteCardModal() {
    this.showDeleteCardModal = false;
    this.deletingCardId = null;
  }

  confirmDeleteCard() {
    if (!this.deletingCardId) {
      return;
    }

    this.cardService.deleteCard(this.deletingCardId).subscribe({
      next: () => {
        for (const column of this.columns) {
          const cardIndex = column.cards?.findIndex(c => c.id === this.deletingCardId) ?? -1;
          if (cardIndex !== -1 && column.cards) {
            column.cards.splice(cardIndex, 1);
            break;
          }
        }
        this.closeDeleteCardModal();
      },
      error: (err) => {
        console.error('Erro ao excluir card', err);
      }
    });
  }

  logout() {
    localStorage.removeItem('access_token');
    window.location.href = '';
  }

  onDragStart(event: DragEvent, cardId: number, columnId: number) {
    this.draggedCardId = cardId;
    this.draggedFromColumnId = columnId;
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', event.target as any);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, targetColumnId: number) {
    event.preventDefault();
    
    if (this.draggedCardId && this.draggedFromColumnId !== targetColumnId) {
      const sourceColumn = this.columns.find(c => c.id === this.draggedFromColumnId);
      const targetColumn = this.columns.find(c => c.id === targetColumnId);
      const cardIndex = sourceColumn?.cards?.findIndex(c => c.id === this.draggedCardId) ?? -1;
      
      if (sourceColumn && targetColumn && cardIndex !== -1) {
        const card = sourceColumn.cards![cardIndex];
        sourceColumn.cards!.splice(cardIndex, 1);
        if (!targetColumn.cards) {
          targetColumn.cards = [];
        }
        targetColumn.cards.push({ ...card, columnId: targetColumnId });
        this.cardService.moveCard(this.draggedCardId, targetColumnId).subscribe({
          next: () => {
            console.log('Card movido com sucesso');
          },
          error: (err) => {
            console.error('Erro ao mover card', err);
            targetColumn.cards = targetColumn.cards!.filter(c => c.id !== this.draggedCardId);
            sourceColumn.cards!.push(card);
          }
        });
      }
    }
    
    this.draggedCardId = null;
    this.draggedFromColumnId = null;
  }

  onDragEnd() {
    this.draggedCardId = null;
    this.draggedFromColumnId = null;
  }

  // Add User to Board
  openAddUserModal() {
    this.showAddUserModal = true;
    this.newUserEmail = '';
  }

  closeAddUserModal() {
    this.showAddUserModal = false;
    this.newUserEmail = '';
  }

  addUserToBoard() {
    if (!this.newUserEmail.trim() || !this.selectedBoardId) {
      return;
    }

    this.boardService.addUserToBoard(this.selectedBoardId, this.newUserEmail).subscribe({
      next: (response) => {
        const newUser = response?.data?.addUserToBoard;
        if (newUser) {
          this.boardUsers.push(newUser);
          this.closeAddUserModal();
          alert(`Usuário ${newUser.name} adicionado ao board com sucesso!`);
        }
      },
      error: (err) => {
        console.error('Erro ao adicionar usuário ao board', err);
        const errorMessage = err?.error?.errors?.[0]?.message || 'Erro ao adicionar usuário';
        alert(errorMessage);
      }
    });
  }
}
