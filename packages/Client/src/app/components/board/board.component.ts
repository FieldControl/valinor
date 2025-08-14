import { Component } from '@angular/core';
import { TopBarComponent } from "../top-bar/top-bar.component";
import { ColumnComponent } from "../column/column.component";
import { CommonModule } from '@angular/common';

interface Coluna {
  titulo: string;
  cards: string[];
}

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  standalone: true,
  imports: [TopBarComponent, ColumnComponent, CommonModule]
})
export class BoardComponent {
  colunas: Coluna[] = [
    { titulo: 'A Fazer', cards: ['Tarefa 1', 'Tarefa 2', 'Tarefa 3'] },
    { titulo: 'Em Progresso', cards: ['Tarefa 4', 'Tarefa 5'] },
    { titulo: 'Concluído', cards: ['Tarefa 6'] }
  ];

  i: number = 0

  adicionarColuna() {
    this.colunas.push({
      titulo: `Nova Coluna ${this.colunas.length + 1}`,
      cards: []
    });
  }

   removerColuna(index: number) {
    console.log(`Remover coluna: ${this.colunas[index].titulo}`);
  }

  moverColuna(index: number, direcao: 'esquerda' | 'direita') {
    console.log(`Mover coluna ${this.colunas[index].titulo} para ${direcao}`);
  }

  renomearColuna(index: number) {
    console.log(`Renomear coluna: ${this.colunas[index].titulo}`);
  }

  criarCard(index: number) {
    console.log(`Criar card na coluna: ${this.colunas[index].titulo}`);
  }

  removerCard(colIndex: number, cardIndex: number) {
    console.log(`Remover card '${this.colunas[colIndex].cards[cardIndex]}' da coluna ${this.colunas[colIndex].titulo}`);
  }

  moveCardLeft(colIndex: number, cardIndex: number) {
    if (colIndex > 0) {
      const card = this.colunas[colIndex].cards.splice(cardIndex, 1)[0];
      this.colunas[colIndex - 1].cards.push(card);
      console.log(`Card '${card}'moved of column ${colIndex} for column ${colIndex - 1}`);
      }else{
        console.log(`Card '${this.colunas[colIndex].cards[cardIndex]}' já está na primeira coluna`);
    }
    }

  moveCardRight(colIndex: number, cardIndex: number) {
    if (colIndex < this.colunas.length - 1) {
      const card = this.colunas[colIndex].cards.splice(cardIndex, 1)[0];
      this.colunas[colIndex + 1].cards.push(card);
      console.log(`Card '${card}'moved of column ${colIndex} for column ${colIndex + 1}`);
      }else{
        console.log(`Card '${this.colunas[colIndex].cards[cardIndex]}' já está na última coluna`);
    }
  }

  renomearCard(colIndex: number, cardIndex: number) {
    console.log(`Renomear card '${this.colunas[colIndex].cards[cardIndex]}'`);
  }
}

