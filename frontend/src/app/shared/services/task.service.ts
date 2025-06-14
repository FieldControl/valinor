import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { IColumn, IColumnCreate } from "../DTO/column.dto";
import { ITask, ITaskCreate } from "../DTO/task.dto";

@Injectable({
    providedIn: "root"
})
export class TaskService {
    http = inject(HttpClient);

    post(task: ITaskCreate) {
        return this.http.post<ITask>(`http://localhost:3000/tasks`, task);
    }

    delete(taskId: number) {
        return this.http.delete(`http://localhost:3000/tasks/${taskId}`);
    }
}


