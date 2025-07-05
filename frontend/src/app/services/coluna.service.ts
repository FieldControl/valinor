import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

export interface Card {
  id: string;
  titulo: string;
  descricao: string;
}

export interface Coluna {
  id: string;
  titulo: string;
  cards: Card[];
}

@Injectable({ providedIn: 'root' })
export class ColunaService {
  private colunas: Coluna[] = [];

  getColunas(): Coluna[] {
    return this.colunas;
  }

  criarColuna(titulo: string): void {
    this.colunas.push({
      id: uuidv4(),
      titulo,
      cards: [],
    });
  }

  editarColuna(id: string, novoTitulo: string): void {
    const coluna = this.colunas.find(c => c.id === id);
    if (coluna) coluna.titulo = novoTitulo;
  }

  deletarColuna(id: string): void {
    this.colunas = this.colunas.filter(c => c.id !== id);
  }

  criarCard(colunaId: string, titulo: string, descricao: string): void {
    const coluna = this.colunas.find(c => c.id === colunaId);
    if (coluna) {
      coluna.cards.push({
        id: uuidv4(),
        titulo,
        descricao,
      });
    }
  }

  editarCard(cardId: string, novoTitulo: string, novaDescricao: string): void {
    for (const coluna of this.colunas) {
      const card = coluna.cards.find(c => c.id === cardId);
      if (card) {
        card.titulo = novoTitulo;
        card.descricao = novaDescricao;
        return;
      }
    }
  }

  deletarCard(cardId: string): void {
    for (const coluna of this.colunas) {
      coluna.cards = coluna.cards.filter(c => c.id !== cardId);
    }
  }
}
