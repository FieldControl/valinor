import { TestBed, ComponentFixture } from '@angular/core/testing';
import { BoardComponent } from './board.component';
import { TaskService } from '../../services/task.service';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';

describe('BoardComponent', () => {
  let fixture: ComponentFixture<BoardComponent>;
  let component: BoardComponent;
  let taskServiceMock: any;

  beforeEach(async () => {
    taskServiceMock = {
      tasksInProcess: signal([{ id: '1', title: 'Task 1', status: 'EM_PROCESSO' }]),
      tasksFinalized: signal([{ id: '2', title: 'Task 2', status: 'FINALIZADO' }]),
      loadTasks: jasmine.createSpy('loadTasks'),
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, BoardComponent],
      providers: [{ provide: TaskService, useValue: taskServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Should create the component', () => {
    expect(component).toBeTruthy();
  });
});
