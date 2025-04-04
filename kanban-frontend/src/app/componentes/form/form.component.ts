import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../task.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent implements OnInit{

  formulario!: FormGroup;
  isEditMode: boolean = false;
  taskId: number | null = null

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private taskService: TaskService,
    private fb: FormBuilder
  ){
    this.formulario = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      responsavel: ['', [Validators.required]],
      status: ['1', [Validators.required]]
    })
  }

  ngOnInit(): void {
    this.taskId = +this.route.snapshot.paramMap.get('id')!

    if(this.taskId){
      this.isEditMode = true
      this.loadTaskForEdit()
    }
  }

  loadTaskForEdit():void{
    this.taskService.getTaskById(this.taskId!).subscribe(task => {
      this.formulario.patchValue({
        title: task.title,
        description: task.description,
        responsavel: task.responsavel,
        status: task.status
      })
    })
  }

  onSubmit():void{

    if(this.formulario.invalid){
      Object.values(this.formulario.controls).forEach(control => {
        control.markAsTouched()
      })
      return
    }

      const taskData: Task = this.formulario.value

      if(this.isEditMode){
        this.taskService.updateTask(this.taskId!, taskData).subscribe(() =>{
          this.router.navigate([''])
        })
      }else{
        this.taskService.addTask(taskData).subscribe(() =>{
          this.router.navigate([''])
        })
      }


  }

  cancelar(){
    this.router.navigate([''])
  }

}
