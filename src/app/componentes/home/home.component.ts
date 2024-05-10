import { Component } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList
} from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CdkDropList, CdkDrag],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  addCampo(): void {
    const userInput = prompt("Digite o nome da venda");
    if (userInput !== null && userInput !== "") {
      const novaVenda = document.createElement("h3");
      novaVenda.classList.add("venda");
      const texto = document.createTextNode(userInput);
      novaVenda.appendChild(texto);
      const card = document.getElementById("card");
      card?.appendChild(novaVenda);
    }
  }


  todo = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];

  done = ['Get up', 'Brush teeth', 'Take a shower', 'Check e-mail', 'Walk dog'];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

}
