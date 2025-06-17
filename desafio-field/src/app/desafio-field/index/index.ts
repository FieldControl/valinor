import { Component, OnInit } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';

const CREATE_TASK = gql`
  mutation createTask($task: String!) {
    createTask(task: $task)
  }
`;




@Component({
  selector: 'app-index',
  imports: [CdkDropList, CdkDrag],
  templateUrl: './index.html',
  styleUrl: './index.css',
  standalone: true,
})

export class Index {
  todo = [''];
  ed = [''];
  urgente = [''];
  lp = ['']
  concluido = [''];
  lixeira: string[] = [];
  drop(event: CdkDragDrop<string[]>) {
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


addCard(listName: string) {
  
  const newCard = prompt('Adicione uma tarefa:');
  if (newCard) {
    switch (listName) {
      case 'todo':
        this.todo.push(newCard);
        break;
      case 'done':
        this.ed.push(newCard);
        break;
      case 'urgente':
        this.urgente.push(newCard);
        break;
      case 'lp':
        this.lp.push(newCard);
        break;
      case 'concluido':
        this.concluido.push(newCard);
        break;
        
    }
    
  
  }
} 
}



