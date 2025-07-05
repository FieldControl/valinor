import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColunaService, Coluna, Card } from '../services/coluna.service';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kanban-board.component.html'
})
export class KanbanBoardComponent {
  colunas: Coluna[] = [];
  novoTituloColuna = '';
  novoTituloCard = '';
  novaDescricaoCard = '';
  colunaSelecionadaId = '';
  editedTituloColuna = '';
  editedColunaId: string | null = null;
  editedCardId: string | null = null;
  editedTitulo = '';
  editedDescricao = '';

  constructor(private colunaService: ColunaService) {
    this.colunas = this.colunaService.getColunas();
  }

  criarColuna() {
    if (this.novoTituloColuna.trim()) {
      this.colunaService.criarColuna(this.novoTituloColuna.trim());
      this.novoTituloColuna = '';
    }
  }

  criarCard() {
    if (!this.colunaSelecionadaId) {
      alert('Por favor, selecione uma coluna antes de adicionar um card.');
      return;
    }
    if (!this.novoTituloCard.trim()) {
      alert('O título do card não pode estar vazio.');
      return;
    }
    this.colunaService.criarCard(
      this.colunaSelecionadaId,
      this.novoTituloCard.trim(),
      this.novaDescricaoCard.trim()
    );
    this.novoTituloCard = '';
    this.novaDescricaoCard = '';
  }

  iniciarEdicaoColuna(coluna: Coluna) {
    this.editedColunaId = coluna.id;
    this.editedTituloColuna = coluna.titulo;
  }

  salvarEdicaoColuna() {
    if (this.editedColunaId && this.editedTituloColuna.trim()) {
      this.colunaService.editarColuna(this.editedColunaId, this.editedTituloColuna.trim());
      this.editedColunaId = null;
      this.editedTituloColuna = '';
    }
  }

  cancelarEdicaoColuna() {
    this.editedColunaId = null;
  }

  deletarColuna(id: string) {
    this.colunaService.deletarColuna(id);
    this.colunas = this.colunaService.getColunas(); // força refresh
  }


  iniciarEdicaoCard(card: Card) {
    this.editedCardId = card.id;
    this.editedTitulo = card.titulo;
    this.editedDescricao = card.descricao;
  }

  salvarEdicaoCard() {
    if (this.editedCardId && this.editedTitulo.trim()) {
      this.colunaService.editarCard(this.editedCardId, this.editedTitulo.trim(), this.editedDescricao.trim());
      this.editedCardId = null;
      this.editedTitulo = '';
      this.editedDescricao = '';
    }
  }

  cancelarEdicaoCard() {
    this.editedCardId = null;
  }

  deletarCard(id: string) {
    this.colunaService.deletarCard(id);
    this.colunas = this.colunaService.getColunas(); // força refresh
  }


  isEditingColuna(id: string) {
    return this.editedColunaId === id;
  }

  isEditingCard(id: string) {
    return this.editedCardId === id;
  }
}
