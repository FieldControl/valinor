import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { TaskService, Task } from '../../services/task.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-task',
  standalone: true, 
  imports: [ReactiveFormsModule], 
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})

export class TaskComponent {

  form: FormGroup
  allTasks: Task[] = []


  constructor(private fb: FormBuilder, private taskService: TaskService){
    this.form = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      description: [''],
      status: ['', Validators.required],
      priority: ['', Validators.required]
    });
  }

  addTask(): void {
    if(this.form.valid){
      const newTask: Task = {
        id: uuidv4(),
        name: this.form.value.name,
        description: this.form.value.description,
        status: this.form.value.status,
        priority: this.form.value.priority
      }
    this.taskService.addTask(newTask)
    this.form.reset()
    // this.taskService.addTask(newTask).subscribe((data) => {
    //   this.allTasks.push(data);
    // });
  }
}
}

// export class TaskComponent {
//   form: FormGroup

//   constructor(private fb: FormBuilder){
//     this.form = this.fb.group({
//       id: [''],
//       name: ['', Validators.required],
//       description: [''],
//       status: ['', Validators.required],
//       priority: ['', Validators.required]
//     });
//   }

//   // Cria uma nova tarefa 
//   addTask(){
//     if(this.form.valid){
//       const newTask: Task = {
//         id: allTasks.length,
//         name: this.form.value.name,
//         description: this.form.value.description,
//         status: this.form.value.status as TaskStatus,
//         priority: this.form.value.priority as TaskPriority
//       }
//       console.log("Tarefa adicionada com sucesso: ", newTask)
//       allTasks.push(newTask)
//     }
//     else {
//       console.log("Formulário inválido")
//     }
//     console.log(allTasks)


//   }
// }
