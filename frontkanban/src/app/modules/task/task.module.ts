import { ChangeDetectorRef, EventEmitter, Inject, NgModule, Output } from '@angular/core';


@NgModule({
  declarations: [],
})
export class TaskModule {
  @Output() taskCreated = new EventEmitter<TaskModule>();
  id?: string;
  title?: string;
  description?: string;
  userId?: string;
  status?: number;
  data?: Date;
  constructor(
    @Inject('id') id?: string,
    @Inject('title') title?: string,
    @Inject('description') description?: string,
    @Inject('userId') userId?: string,
    @Inject('status') status?: number,
    @Inject('data') data?: Date,
    private cd?: ChangeDetectorRef
  ) {
    this.id = id ? id : '';
    this.title = title;
    this.description = description;
    this.userId = userId;
    this.status = status;
    this.data = data ? data : undefined;
  }
  async postTask(title: string, description: string, status: number, userId :string) : Promise<TaskModule> {
    return await fetch('http://localhost:3333/task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: '',
        title: title,
        description: description,
        status: status,
        userId: userId,
        data: null
      }),
    })
      .then(response => response.json())
      .then(data => { return data; });
  }


  async putTask(task: TaskModule) {
    console.log('entrou no put')
    await fetch(`http://localhost:3333/task/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    })
    .then((response) => {
      console.log('entrou no then1')
      return response.json()})
    .then((data: TaskModule) => {
      console.log('Success:', data);
      
      return data;
    })

    .catch((error) => {
    console.error('Error:', error);
    });
  
  }
  async deleteTask(id?: string) {
    console.log('entrou no delite')
    await fetch(`http://localhost:3333/task/${id}`, {
      method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    })
    console.log('saiu do delete')
  
  }
}