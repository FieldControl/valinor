import { Injectable } from '@nestjs/common';
import { Task } from './task';

@Injectable()
export class TaskService {
    tasks: Task[] = [
        { id: 1, description: 'Hello NestJS', completed: true },
        { id: 2, description: 'Kanban esta Pronto?', completed: true },
        { id: 3, description: 'Estudar mais Angular', completed: true },
    ];


    getAll() {
        return this.tasks;
    }

    getById(id: number) {
        const task = this.tasks.find((value) => value.id == id);
        return task;
    }

    create(task: Task) {
        let lastId = 0;
        if(this.tasks.length > 0){
            lastId = this.tasks[this.tasks.length - 1].id;
        }

        task.id = lastId + 1;
        this.tasks.push(task);

        return task;
    }

    update(task: Task) {
        const tasskArray = this.getById(task.id);
        if(tasskArray) {
            tasskArray.description = task.description;
            tasskArray.completed = task.completed;
        }

        return tasskArray;
    }

    delete(id: number) {
        const index = this.tasks.findIndex((value) => value.id == id);
        this.tasks.splice(index, 1);
    }
}
