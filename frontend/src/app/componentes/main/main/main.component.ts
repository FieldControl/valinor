import { Component } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  isModalVisible: boolean = false;
  newColumn: string = ''; // Propriedade para armazenar o texto da nova coluna

  

  // Método para receber o texto do modal
  addColumn(columnName: string) {
    this.newColumn = columnName; // Armazena o texto na nova propriedade
  }
}
