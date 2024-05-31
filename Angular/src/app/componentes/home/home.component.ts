import { Component } from '@angular/core';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import axios from 'axios';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, DragDropModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent {
  cli: { nome: string, idCard: string }[] = [];
  negociacao: { nome: string, idCard: string }[] = [];
  concluida: { nome: string, idCard: string }[] = [];
  entrega: { nome: string, idCard: string }[] = [];

  addCampo(): void {
    const userInput = prompt("Digite o nome da venda");
    if (userInput !== null && userInput.trim() !== "") {
      axios.post('http://localhost:3000/cards', { cli: userInput.trim() })
        .then(response => {
          const idCard = response.data.idCard; 
          console.log(response);
          alert(`Venda adicionada com sucesso! ID: ${idCard}`);
          this.cli.push({ nome: userInput.trim(), idCard: idCard });
        })
        .catch(error => {
          console.error(error);
        });
    }
  }


  
  removeItem(column: string, index: number): void {
    let item: { nome: string, idCard: string } | null = null;
    if (column === 'cli') {
      item = this.cli[index];
      this.cli.splice(index, 1);
    } else if (column === 'negociacao') {
      item = this.negociacao[index];
      this.negociacao.splice(index, 1);
    } else if (column === 'concluida') {
      item = this.concluida[index];
      this.concluida.splice(index, 1);
    } else if (column === 'entrega') {
      item = this.entrega[index];
      this.entrega.splice(index, 1);
    }
    if (item !== null) {
      axios.delete(`http://localhost:3000/cards/${item.idCard}`)
        .then(response => {
          console.log(response.data);
          alert(`Venda removida com sucesso!`);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }
  editItem(column: string, index: number): void {
    const userInput = prompt("Digite o novo nome da venda");
    if (userInput !== null && userInput.trim() !== "") {
      let item = null;
      if (column === 'cli') {
        item = this.cli[index];
        this.cli[index] = { ...item, nome: userInput.trim() };
      } else if (column === 'negociacao') {
        item = this.negociacao[index];
        this.negociacao[index] = { ...item, nome: userInput.trim() };
      } else if (column === 'concluida') {
        item = this.concluida[index];
        this.concluida[index] = { ...item, nome: userInput.trim() };
      } else if (column === 'entrega') {
        item = this.entrega[index];
        this.entrega[index] = { ...item, nome: userInput.trim() };
      }
      if (item !== null) {
        axios.patch(`http://localhost:3000/cards/${item.idCard}`, { cli: userInput.trim() })
          .then(response => {
            console.log(response.data);
            alert(`Nome da venda atualizado com sucesso!`);
          })
          .catch(error => {
            console.error(error);
          });
      }
    }
  }

  drop(event: CdkDragDrop<{ nome: string, idCard: string }[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}


