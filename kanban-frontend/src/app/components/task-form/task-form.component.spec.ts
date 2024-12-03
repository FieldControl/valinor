import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TaskFormComponent } from './task-form.component';
import { TaskService } from '../../services/task.service';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { FormsModule } from '@angular/forms';

describe('TaskFormComponent', () => {
  let fixture: ComponentFixture<TaskFormComponent>;
  let component: TaskFormComponent;
  let taskServiceMock: Partial<TaskService>;

  beforeEach(async () => {
    taskServiceMock = {
      addTask: jasmine.createSpy('addTask'),
    };

    await TestBed.configureTestingModule({
      imports: [TaskFormComponent, ApolloTestingModule, FormsModule],
      providers: [{ provide: TaskService, useValue: taskServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('Should emit the card creation event', () => {
    spyOn(component.createTask, 'emit');
    component.title = 'New Card';
    component.onSubmit();

    expect(component.createTask.emit).toHaveBeenCalledWith('New Card');
  });

  it('Should clear title after submission', () => {
    component.title = 'New Card';
    component.onSubmit();

    expect(component.title).toBe('');
  });
});
