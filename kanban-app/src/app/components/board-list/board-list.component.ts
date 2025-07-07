import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Board } from '../../models/board.model';
import { KanbanService } from '../../services/kanban.service';

@Component({
  selector: 'app-board-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="board-list-container">
      <div class="header">
        <h1>Meus Quadros Kanban</h1>
        <button
          class="btn btn-primary"
          (click)="showCreateForm = !showCreateForm"
        >
          Criar Novo Quadro
        </button>
      </div>

      <div class="create-board-form" *ngIf="showCreateForm">
        <div class="form-group">
          <input
            type="text"
            [(ngModel)]="newBoardName"
            placeholder="Nome do quadro"
            class="form-control"
            (keyup.enter)="createBoard()"
          />
          <button
            class="btn btn-success"
            (click)="createBoard()"
            [disabled]="!newBoardName.trim()"
          >
            Criar
          </button>
          <button class="btn btn-secondary" (click)="cancelCreate()">
            Cancelar
          </button>
        </div>
      </div>

      <div class="boards-grid">
        <div
          class="board-card"
          *ngFor="let board of boards; trackBy: trackByBoardId"
        >
          <div class="board-header">
            <h3>{{ board?.name || 'Board sem nome' }}</h3>
            <div class="board-actions">
              <button class="btn btn-sm btn-outline" (click)="startEdit(board)">
                ✏️
              </button>
              <button
                class="btn btn-sm btn-danger"
                (click)="deleteBoard(board)"
              >
                🗑️
              </button>
            </div>
          </div>

          <div class="edit-form" *ngIf="editingBoard?.id === board.id">
            <input
              type="text"
              [(ngModel)]="editBoardName"
              class="form-control"
              (keyup.enter)="updateBoard()"
            />
            <div class="form-actions">
              <button class="btn btn-sm btn-success" (click)="updateBoard()">
                Salvar
              </button>
              <button class="btn btn-sm btn-secondary" (click)="cancelEdit()">
                Cancelar
              </button>
            </div>
          </div>

          <div class="board-footer">
            <span class="column-count">
              {{ board.columns?.length || 0 }} colunas
            </span>
            <a [routerLink]="['/board', board.id]" class="btn btn-primary">
              Abrir Quadro
            </a>
          </div>
        </div>
      </div>

      <div
        class="empty-state"
        *ngIf="!loading && boards.length === 0 && !error"
      >
        <h3>Nenhum quadro encontrado</h3>
        <p>Comece criando seu primeiro quadro Kanban!</p>
      </div>

      <div class="loading-state" *ngIf="loading">
        <h3>Carregando quadros...</h3>
        <p>Aguarde um momento enquanto buscamos seus quadros.</p>
      </div>

      <div class="error-state" *ngIf="error && !loading">
        <h3>Erro ao carregar quadros</h3>
        <p>{{ error }}</p>
        <button class="btn btn-primary" (click)="loadBoards()">
          Tentar Novamente
        </button>
      </div>
    </div>
  `,
  styleUrl: './board-list.component.scss',
})
export class BoardListComponent implements OnInit {
  boards: Board[] = [];
  showCreateForm = false;
  newBoardName = '';
  editingBoard: Board | null = null;
  editBoardName = '';
  loading = true;
  error: string | null = null;

  constructor(private kanbanService: KanbanService) {}

  ngOnInit(): void {
    this.loadBoards();
  }

  loadBoards(): void {
    this.loading = true;
    this.error = null;

    console.log('🔄 Iniciando carregamento dos boards...');

    this.kanbanService.getBoards().subscribe({
      next: (boards) => {
        console.log('Boards carregados:', boards);
        this.boards = Array.isArray(boards) ? boards : [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar quadros:', error);
        this.error =
          'Erro ao carregar quadros. Verifique se a API está rodando.';
        this.boards = []; 
        this.loading = false;
      },
    });
  }

  createBoard(): void {
    if (!this.newBoardName.trim()) return;

    this.kanbanService
      .createBoard({ name: this.newBoardName.trim() })
      .subscribe({
        next: (board) => {
          this.boards.push(board);
          this.cancelCreate();
        },
        error: (error) => {
          console.error('Erro ao criar quadro:', error);
        },
      });
  }

  startEdit(board: Board): void {
    this.editingBoard = board;
    this.editBoardName = board.name;
  }

  updateBoard(): void {
    if (!this.editingBoard || !this.editBoardName.trim()) return;

    this.kanbanService
      .updateBoard({
        id: Number(this.editingBoard.id),
        name: this.editBoardName.trim(),
      })
      .subscribe({
        next: () => {
          this.loadBoards(); // Recarrega a lista completa
          this.cancelEdit();
        },
        error: (error) => {
          console.error('Erro ao atualizar quadro:', error);
        },
      });
  }

  deleteBoard(board: Board): void {
    if (!confirm(`Tem certeza que deseja excluir o quadro "${board.name}"?`))
      return;

    this.kanbanService.deleteBoard(Number(board.id)).subscribe({
      next: () => {
        this.boards = this.boards.filter((b) => b.id !== board.id);
      },
      error: (error) => {
        console.error('Erro ao excluir quadro:', error);
      },
    });
  }

  trackByBoardId(index: number, board: Board): string {
    return board?.id || index.toString();
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.newBoardName = '';
  }

  cancelEdit(): void {
    this.editingBoard = null;
    this.editBoardName = '';
  }
}
