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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,CdkDropList, CdkDrag,DragDropModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
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
  removeItem(index: number): void {
    this.cli.splice(index, 1);
  }
  salvarInformacoes(): void {
    console.log('Salvando informações dos cards...');
    console.log('Clientes Cadastrados:', this.cli);
    console.log('Pedidos em Negociação:', this.negociacao);
    console.log('Pedidos Concluídos:', this.concluida);
    console.log('Pedidos em Entrega:', this.entrega);

    localStorage.setItem('clientesCadastrados', JSON.stringify(this.cli));
    localStorage.setItem('pedidosNegociacao', JSON.stringify(this.negociacao));
    localStorage.setItem('pedidosConcluidos', JSON.stringify(this.concluida));
    localStorage.setItem('pedidosEntrega', JSON.stringify(this.entrega));


    alert('Informações salvas com sucesso!');

  }
  constructor() {
    this.cli = JSON.parse(localStorage.getItem('clientesCadastrados') || '[]');
    this.negociacao = JSON.parse(localStorage.getItem('pedidosNegociacao') || '[]');
    this.concluida = JSON.parse(localStorage.getItem('pedidosConcluidos') || '[]');
    this.entrega = JSON.parse(localStorage.getItem('pedidosEntrega') || '[]');
  }


  drop(event: CdkDragDrop<string[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      console.log('Transferindo item...')
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }  
}
