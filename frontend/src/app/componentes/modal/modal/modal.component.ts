import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Colunas } from '../../coluna';
import { ColunasService } from '../../colunas.service';
import { Router } from '@angular/router';
import { Tarefa } from '../../tarefa'; 

let nextId = 1;
let nextIdTarefa = 100;
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() isVisible: boolean = false; 
  @Output() closeModal = new EventEmitter<void>();
  @Output() columnAdded = new EventEmitter<string>(); 
  
  coluna: Colunas = {
    id: nextId++,
    title: ''
  };
  tarefa: Tarefa = {
    id: nextIdTarefa++,
    title: '',
    columnId: 0
  };

  task: string = ''; 
  colunas: Colunas[] = []; 
  selectedColunaId: number | null = null; 

  constructor(private service: ColunasService, private router: Router) {
    this.service.listar().subscribe(colunas => {
      this.colunas = colunas; 
    });
  }

  criarColuna() {
    console.log('Creating column:', this.coluna); 
    this.service.criarColuna(this.coluna).subscribe(() => {
      console.log('Column created successfully');
      this.columnAdded.emit(); 
      this.coluna.title = ''; 
       location.reload(); 
    }, error => {
      console.error('Error creating column:', error);
    });
  }

  criarTarefa() {
    console.log('Creating task with title:', this.task);
    if (this.selectedColunaId === null) {
        console.error('No column selected for the task.');
        return;
    }
    const novaTarefa: Tarefa = { id: nextIdTarefa++, title: this.task, columnId: this.selectedColunaId };
    this.service.criarTarefa(novaTarefa).subscribe(() => {
        console.log('Task created successfully');
        this.task = '';
        location.reload(); 
    }, error => {
        console.error('Error creating task:', error); 
    });
  }

  cancelar() {
    this.closeModal.emit();
  }

  confirm() {
    this.criarColuna(); 
  }
}
