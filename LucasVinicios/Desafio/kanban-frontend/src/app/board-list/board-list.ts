// src/app/board-list/board-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { KanbanApiService } from '../kanban-api'; 
import { Board } from '../models/board.model';
import { RouterModule } from '@angular/router'; 
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../notificacao'; // Verifique o caminho correto

@Component({
  selector: 'app-board-list',
  standalone: true, 
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './board-list.html',
  styleUrl: './board-list.scss'
})
export class BoardListComponent implements OnInit {
  boards: Board[] = [];
  newBoardTitle: string ="";

  showEditBoardModal = false;
  editingBoard: Board | null = null;
  editedBoardTitle: string='';

  showCreateBoardForm: boolean = false; 

  constructor(private kanbanApi: KanbanApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.getBoards();
  }

  getBoards(): void {
    this.kanbanApi.getBoards().subscribe({
      next: (data) => {
        this.boards = data;
        console.log('Boards carregados (BoardList):', this.boards);
      },
      error: (error) => {
        console.error('Erro ao carregar boards (BoardList):', error);
        this.notificationService.error("Erro ao carregar boards!");
      }
    });
  }

  toggleCreateBoardForm(): void {
    this.showCreateBoardForm = !this.showCreateBoardForm;
    this.newBoardTitle = ''; 
    console.log('showCreateBoardForm:', this.showCreateBoardForm);
  }

  createBoardAndHideForm(): void {
    if (this.newBoardTitle.trim()){
      this.kanbanApi.createBoard(this.newBoardTitle).subscribe({
        next: (newBoard) => {
          console.log('Board criado:', newBoard);
          this.newBoardTitle = '';
          this.getBoards();
          this.notificationService.success("Quadro criado com sucesso!");
          this.toggleCreateBoardForm();
        },
        error: (error) => {
          console.error('Erro ao criar board:', error);
          this.notificationService.error("Erro ao criar o quadro!");
        }
      });
    } else {
      alert('Por favor, insira um título para o novo quadro.');
    }
  }

  openEditBoardModal(board: Board): void {
    console.log('Botão "Editar" clicado. Board recebido:', board);
    if (board) { 
        this.editingBoard = {...board};
        this.editedBoardTitle = board.title;
        this.showEditBoardModal = true;
        console.log('Modal de edição marcado para abrir para:', this.editingBoard);
    } else {
        console.warn('Tentou abrir modal de edição para um board nulo ou indefinido.');
        this.notificationService.error("Não foi possível editar: quadro inválido.");
    }
  }

  closeEditBoardModal(): void {
    console.log('Botão "Cancelar" do modal de edição clicado. Fechando modal.');
    this.showEditBoardModal = false;
    this.editingBoard = null;
    this.editedBoardTitle = "";
  }

  saveEditedBoard(): void {
    console.log('Botão "Salvar" do modal de edição clicado. Salvando alterações...');
    if (this.editingBoard && this.editedBoardTitle.trim()) {
      this.kanbanApi.updateBoard(this.editingBoard.id, {title: this.editedBoardTitle}).subscribe({
        next: (updateBoard) => {
          console.log('Board editado com sucesso na API:', updateBoard);
          this.closeEditBoardModal();
          this.getBoards();
          this.notificationService.success("Quadro editado com sucesso!");
        },
          error: (error) => {
          console.error("Erro ao editar board na API:", error);
          this.notificationService.error("Erro ao editar quadro!");
        }
      });
    } else{
      alert("Por favor, insira um título válido para o quadro.");
      console.warn('Tentou salvar board sem título ou com board nulo.');
    }
  }

  deleteBoard(boardId: number): void {
    console.log('Botão "Excluir" clicado. ID do Board para exclusão:', boardId);
    if (confirm("Tem certeza que deseja excluir este quadro? Todas as colunas e cards serão excluídos!")) {
      this.kanbanApi.removeBoard(boardId).subscribe({
        next: () => {
        console.log("Board excluído com sucesso na API:", boardId);
        this.getBoards();
        this.notificationService.success("Quadro excluído com sucesso!");
        
      },
      error: (error) => {
        this.notificationService.error("Erro ao deletar o quadro!");
        console.error("Erro ao excluir quadro na API:", error);
      }
    });
  }
 }
}