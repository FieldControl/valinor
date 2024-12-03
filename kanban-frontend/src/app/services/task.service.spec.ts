import { TestBed } from '@angular/core/testing';
import { ApolloTestingModule, ApolloTestingController } from 'apollo-angular/testing';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [TaskService],
    });

    service = TestBed.inject(TaskService);
    controller = TestBed.inject(ApolloTestingController);
  });

  it('should st load cards correctly', (done: DoneFn) => {
    const mockCards = [
      { id: '1', title: 'Card 1', status: 'EM_PROCESSO' },
    ];

    service.loadTasks();

    const op = controller.expectOne((operation) => operation.operationName === 'GET_TASKS');

    expect(op.operation.variables).toEqual({});

    op.flush({
      data: { getTasks: mockCards },
    });

    setTimeout(() => {
      const tasks = service['tasks']();
      expect(tasks.length).toEqual(1);
      expect(tasks[0]).toEqual(mockCards[0]);
      done();
    }, 0);
  });
});
