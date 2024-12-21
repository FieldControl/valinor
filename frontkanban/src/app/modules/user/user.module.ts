import { Inject, NgModule } from '@angular/core';
import { TaskModule } from '../task/task.module';




@NgModule({
  declarations: [],
})
export class UserModule {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  
  constructor(
    @Inject('id') id?: string,
    @Inject('name') name?: string,
    @Inject('email') email?: string,
    @Inject('password') password?: string
  ) {
      this.id = id;
      this.name = name; 
      this.email = email; 
      this.password = password; 
    }
  async getTasksForUser(userId: string) {
    return await fetch(`http://localhost:3333/task/${userId}`)
        .then(response => response.json())
        .then(data => {
          const tasks: TaskModule[] = []
          for(let i = 0; i < data.length ; i++ ){
            tasks.push(data[i])
          };
          return tasks;
        })
        .catch(error => {
            console.error(error);
          }
        )
  }
}
