import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskComponent } from './task.component';
import { TaskService } from '../../Services/task.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;
  let taskService: TaskService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [TaskService],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService);
    component.task = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      columnId: '123',
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delete a task', () => {
    spyOn(taskService, 'deleteTask').and.returnValue(of('1'));
    spyOn(component.taskDeleted, 'emit');
    component.deleteTask();
    expect(component.taskDeleted.emit).toHaveBeenCalledWith('1');
  });
});
