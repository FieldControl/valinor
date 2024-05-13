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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,CdkDropList, CdkDrag,DragDropModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  cli: string[] = [];
  negociacao: string[] = [];
  concluida: string[] = [];
  cancelada: string[] = [];

  addCampo(): void {
    const userInput = prompt("Digite o nome da venda");
    if (userInput !== null && userInput.trim() !== "") {
      this.cli.push(userInput.trim());
    }
  }
  removeItem(index: number): void {
    this.cli.splice(index, 1);
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
