import { Component, OnInit } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { MatDialog } from '@angular/material/dialog'; 

@Component({
  selector: 'app-task',
  standalone: true, 
  imports: [MatIconModule, MatDividerModule, MatButtonModule, MatMenuModule, MatDialogModule], 
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})

export class TaskComponent {
  constructor(private dialog: MatDialog) {} // Módulo para utilizar modal - Angular material Design UI 

  // Função para abrir modal após clique no botão "Adicionar tarefa"
  openDialog() {
    const dialogRef = this.dialog.open(TaskDialogComponent , {width: "40%"}); // Definindo largura como 40% 

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Tarefa adicionada:', result); // Imprime resultado no console para teste e apuração 
      }
    });
  }

}