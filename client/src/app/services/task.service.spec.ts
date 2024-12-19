import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { TaskService } from './task.service';
import { of, throwError } from 'rxjs';
import {
  CREATE_TASK,
  GET_ALL_TASKS,
  GET_TASKS_BY_STATUS,
  DELETE_TASK,
  UPDATE_NAME,
  UPDATE_DESCRIPTION,
  UPDATE_STATUS,
} from '../graphql/task-queries-mutations';

describe('TaskService', () => {
  let service: TaskService;
  let mockApollo: jasmine.SpyObj<Apollo>;

  beforeEach(() => {
    mockApollo = jasmine.createSpyObj('Apollo', ['mutate', 'watchQuery']);

    TestBed.configureTestingModule({
      providers: [
        TaskService,
        { provide: Apollo, useValue: mockApollo },
      ],
    });

    service = TestBed.inject(TaskService);
  });

  it('deve criar uma nova task', (done) => {
    const mockUpdateCache = jasmine.createSpy('updateCache');
    mockApollo.mutate.and.returnValue(of({ data: { createTask: { id: '1', name: 'Task 1' } } }));

    service.createTask('Task 1', 'Description', 'ToDo').subscribe((result) => {
      expect(mockApollo.mutate).toHaveBeenCalledWith(
        jasmine.objectContaining({
          mutation: CREATE_TASK,
          variables: { name: 'Task 1', description: 'Description', status: 'ToDo' },
          update: jasmine.any(Function),
        })
      );
      done();
    });
  });

  it('deve buscar todas as tasks', (done) => {
    const mockTasks = [
      { id: '1', name: 'Task 1', description: 'Desc 1', status: 'ToDo' },
    ];
    mockApollo.watchQuery.and.returnValue({
      valueChanges: of({ data: { getAllTasks: mockTasks } }),
    } as any);

    service.getAllTasks().subscribe((tasks) => {
      expect(tasks).toEqual(mockTasks);
      expect(mockApollo.watchQuery).toHaveBeenCalledWith(
        jasmine.objectContaining({ query: GET_ALL_TASKS })
      );
      done();
    });
  });

  it('deve deletar uma task', (done) => {
    mockApollo.mutate.and.returnValue(of({}));

    service.deleteTask('1', 'ToDo').subscribe(() => {
      expect(mockApollo.mutate).toHaveBeenCalledWith(
        jasmine.objectContaining({
          mutation: DELETE_TASK,
          variables: { id: '1' },
          update: jasmine.any(Function),
        })
      );
      done();
    });
  });

  it('deve atualizar o nome de uma task', (done) => {
    mockApollo.mutate.and.returnValue(of({ data: { updateName: true } }));

    service.updateName('1', 'New Task Name', 'ToDo').subscribe(() => {
      expect(mockApollo.mutate).toHaveBeenCalledWith(
        jasmine.objectContaining({
          mutation: UPDATE_NAME,
          variables: { id: '1', newName: 'New Task Name' },
          update: jasmine.any(Function),
        })
      );
      done();
    });
  });

  it('deve atualizar a descrição de uma task', (done) => {
    mockApollo.mutate.and.returnValue(of({ data: { updateDescription: true } }));

    service.updateDescription('1', 'Updated Description', 'ToDo').subscribe(() => {
      expect(mockApollo.mutate).toHaveBeenCalledWith(
        jasmine.objectContaining({
          mutation: UPDATE_DESCRIPTION,
          variables: { id: '1', newDescription: 'Updated Description' },
          update: jasmine.any(Function),
        })
      );
      done();
    });
  });

  it('deve atualizar o status de uma task', (done) => {
    mockApollo.mutate.and.returnValue(of({ data: { updateStatus: true } }));

    service.updateStatus('1', 'InProgress', 'ToDo').subscribe(() => {
      expect(mockApollo.mutate).toHaveBeenCalledWith(
        jasmine.objectContaining({
          mutation: UPDATE_STATUS,
          variables: { id: '1', newStatus: 'InProgress' },
          update: jasmine.any(Function),
        })
      );
      done();
    });
  });

  it('deve buscar tasks pelo status', (done) => {
    const mockTasks = [
      { id: '1', name: 'Task 1', description: 'Desc 1', status: 'ToDo' },
    ];
    mockApollo.watchQuery.and.returnValue({
      valueChanges: of({ data: { getTasksByStatus: mockTasks } }),
    } as any);

    service.getTaskByStatus('ToDo').subscribe((tasks) => {
      expect(tasks).toEqual(mockTasks);
      expect(mockApollo.watchQuery).toHaveBeenCalledWith(
        jasmine.objectContaining({ query: GET_TASKS_BY_STATUS, variables: { status: 'ToDo' } })
      );
      done();
    });
  });
});
