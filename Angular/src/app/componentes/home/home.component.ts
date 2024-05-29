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
  cli: string[] = [];
  negociacao: string[] = [];
  concluida: string[] = [];
  entrega: string[] = [];

  addCampo(): void {
    const userInput = prompt("Digite o nome da venda");
    if (userInput !== null && userInput.trim() !== "") {
      this.cli.push(userInput.trim());
    }
  }
  
  removeItem(column: string, index: number): void {
    if (column === 'cli') {
      this.cli.splice(index, 1);
    } else if (column === 'negociacao') {
      this.negociacao.splice(index, 1);
    } else if (column === 'concluida') {
      this.concluida.splice(index, 1);
    } else if (column === 'entrega') {
      this.entrega.splice(index, 1);
    }
  }

  editItem(column: string, index: number): void {
    const userInput = prompt("Digite o novo nome da venda");
    if (userInput !== null && userInput.trim() !== "") {
      if (column === 'cli') {
        this.cli[index] = userInput.trim();
      } else if (column === 'negociacao') {
        this.negociacao[index] = userInput.trim();
      } else if (column === 'concluida') {
        this.concluida[index] = userInput.trim();
      } else if (column === 'entrega') {
        this.entrega[index] = userInput.trim();
      }
    }
  }
  
  salvarInformacoes(column: string, index: number): void {
    const data = {
      cli: this.cli[index],
      negociacao: this.negociacao,
      concluida: this.concluida,
      entrega: this.entrega
    };
    
    axios.post('http://localhost:3000/cards', data)
      .then(response => {
        console.log(response);
        alert('Informações salvas com sucesso!');
      })
      .catch(error => {
        console.error(error);
      });
  }

  drop(event: CdkDragDrop<string[]>): void {
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