import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TaskService } from './services/task.service';
import { signal } from '@angular/core';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let taskServiceMock: any;

  beforeEach(async () => {
    taskServiceMock = {
      loadTasks: jasmine.createSpy('loadTasks'),
      tasksInProcess: signal([{ id: '1', title: 'Task 1', status: 'EM_PROCESSO' }]),
      tasksFinalized: signal([{ id: '2', title: 'Task 2', status: 'FINALIZADO' }]),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: TaskService, useValue: taskServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Must create the AppComponent', () => {
    expect(component).toBeTruthy();
  });
});
