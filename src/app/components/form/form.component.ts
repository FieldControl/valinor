import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { TaskService, Task } from '../../services/task.service';
import { v4 as uuidv4 } from 'uuid';
import { MatDialogRef } from '@angular/material/dialog';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})

export class FormComponent {
  form: FormGroup // formulário que receberá os dados para criar nova tarefa
  allTasks: Task[] = [] // Array para armazenar as tarefas disponíveis no arquivo db.json 

  constructor(
    private dialogRef: MatDialogRef<TaskDialogComponent>, // Modulo para uso do modal - Angular Material Design UI 
    private fb: FormBuilder, private taskService: TaskService){ // Modelagem do FormGroup 
    this.form = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      description: [''],
      status: ['ToDo', Validators.required], // "Pendente" começa selecionado 
    });
  }

  addTask(): void {
    if(this.form.valid){ // Valida se dados foram preenchidos corretamente 
      // Cria uma nova tarefa que será enviada para o db.json através do método addTask presente do service Task
      const newTask: Task = {
        id: uuidv4(),
        name: this.form.value.name,
        description: this.form.value.description,
        status: this.form.value.status,
      }
      this.taskService.addTask(newTask) // Chama método addTask
      this.dialogRef.close(newTask); // Fecha o modal 
      this.form.reset() // Reseta formulário 
    }
  }
}
