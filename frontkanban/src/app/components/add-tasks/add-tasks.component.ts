import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { BgComponent } from "../bg/bg.component";
import { CardComponent } from "../card/card.component";
import { InputTitleComponent } from "../input-title/input-title.component";
import { InputTextareaComponent } from "../input-textarea/input-textarea.component";
import { BtnComponent } from "../btn/btn.component";
import { TaskModule } from '../../modules/task/task.module';
import { UserModule } from '../../modules/user/user.module';





@Component({
  selector: 'app-add-tasks',
  imports: [BgComponent, CardComponent, InputTitleComponent, InputTextareaComponent, BtnComponent],
  standalone: true,
  providers: [],
  templateUrl: './add-tasks.component.html',
  styleUrl: './add-tasks.component.css',
})
export class AddTasksComponent {
  @Output() taskCreated = new EventEmitter<TaskModule>();
  
  showthis: boolean = false
  task: TaskModule = new TaskModule()
  user!: UserModule
  toggleShowthis(){
    this.showthis = !this.showthis
  }
  submitAddTask(e:Event){
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement);
    const title = String(formData.get('title'))
    const description = String(formData.get('description'))
    const status = Number(formData.get('status'))
    console.log(title, description, status)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {      
      this.user = new UserModule( 
        JSON.parse(storedUser).id,
        JSON.parse(storedUser).name,
        JSON.parse(storedUser).email,
        JSON.parse(storedUser).password
      );
    }
    const userId = this.user.id? this.user.id : ''
    this.task.postTask(title, description, status, userId)
    .then((data: TaskModule) => {
      console.log(data)
      this.taskCreated.emit(data); 
    }); 
    
    this.showthis = false
  }
}
