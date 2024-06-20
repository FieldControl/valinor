import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { environment } from '../../environment/environment';
import { Task } from '../Models/task.model';

describe('TaskService', () => {
  let service: TaskService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });
    service = TestBed.inject(TaskService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a new task', () => {
    const newTask: Task = {
      id: '1',
      title: 'New Task',
      description: 'Description',
      columnId: '123'
    };

    service.createTask(newTask).subscribe(task => {
      expect(task).toEqual(newTask);
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/tasks`);
    expect(req.request.method).toBe('POST');
    req.flush(newTask);
  });

  it('should update an existing task', () => {
    const updatedTask: Task = {
      id: '1',
      title: 'Updated Task',
      description: 'Updated Description',
      columnId: '123'
    };

    service.updateTask(updatedTask.id, updatedTask).subscribe(task => {
      expect(task).toEqual(updatedTask);
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/tasks/${updatedTask.id}`);
    expect(req.request.method).toBe('PATCH');
    req.flush(updatedTask);
  });

  it('should delete an existing task', () => {
    const taskId = '1';

    service.deleteTask(taskId).subscribe(result => {
      expect(result).toBe(taskId);
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/tasks/${taskId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(taskId);
  });
});
