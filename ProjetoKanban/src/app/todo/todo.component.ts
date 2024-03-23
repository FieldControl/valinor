import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Tarefa } from '../modelo/tarefa';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss']
})
export class TodoComponent implements OnInit {

  todoForm!: FormGroup;
  tarefas: Tarefa[] = [];
  emprogresso: Tarefa[] = [];
  feitas: Tarefa[] = [];
  updateIndex:any
  isEditEnabled :boolean = false

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.todoForm = this.fb.group({
      item: ['', Validators.required]
    });
  }

  addTask() {
    this.tarefas.push({
      description: this.todoForm.value.item,
      done: false
    });
    this.todoForm.reset();
  }
         //editar tarefa
  edit(item:Tarefa, i : number){
    this.todoForm.controls['item'].setValue(item.description);
    this.updateIndex = i;
    this.isEditEnabled = true;
  }
  updateTask(){
    this.tarefas[this.updateIndex].description = this.todoForm.value.item;
    this.tarefas[this.updateIndex].done = false
    this.todoForm.reset();
    this.updateIndex = undefined;
    this.isEditEnabled = false;
  }

  deleteTarefa(index: number) {
    this.tarefas.splice(index, 1);
  }

  deleteTarefaEmprogresso(index: number) {
    this.emprogresso.splice(index, 1);
  }

  deleteTarefaFeita(index: number) {
    this.emprogresso.splice(index, 1);
  }
   // Arrastar e soltar o card
  drop(event: CdkDragDrop<Tarefa[]>) {
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
