import { Component, EventEmitter, Output } from '@angular/core';
import { BgComponent } from "../bg/bg.component";
import { CardComponent } from "../card/card.component";
import { InputTitleComponent } from "../input-title/input-title.component";
import { InputTextareaComponent } from "../input-textarea/input-textarea.component";
import { BtnComponent } from "../btn/btn.component";
import { TaskModule } from '../../modules/task/task.module';


@Component({
  selector: 'app-edit-task',
  imports: [BgComponent, CardComponent, InputTitleComponent, InputTextareaComponent, BtnComponent,],
  templateUrl: './edit-task.component.html',
  styleUrl: './edit-task.component.css'
})
export class EditTaskComponent {
  @Output() taskEdited = new EventEmitter<TaskModule>();
  showthis: boolean = false
  task!: TaskModule
  title?:string | undefined
  description?:string | undefined
  status? : number | undefined
  moduleTask: TaskModule = new TaskModule()
  
  
  
  
  toggleShowthis(task?: TaskModule){
    this.task = task!
    if(this.task){
      this.title = this.task.title
      this.description = this.task.description
      this.status = this.task.status
    }
    console.log(this.title,': ', this.description)
    this.showthis = !this.showthis
  }
  submitEditTask(e:Event) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    this.title = String(formData.get('title'))
    this.description = String(formData.get('description'))
    this.status = Number(formData.get('status'))
    console.log(this.title, this.description, this.status)
    const editedTask: TaskModule = new TaskModule(
      this.task.id, 
      this.title, 
      this.description, 
      this.task.userId,
      this.status,
      this.task.data
    )
    this.moduleTask.putTask(editedTask).then((data) => { 
      this.taskEdited.emit(editedTask); 
    });
    this.close();
  }
  close(){
      this.showthis = false
  }
}
