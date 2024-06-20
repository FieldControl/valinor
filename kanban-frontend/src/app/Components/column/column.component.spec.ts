import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColumnComponent } from './column.component';
import { TaskService } from '../../Services/task.service';
import { ColumnService } from '../../Services/column.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Column } from '../../Models/column.model';

describe('ColumnComponent', () => {
  let component: ColumnComponent;
  let fixture: ComponentFixture<ColumnComponent>;
  let taskService: TaskService;
  const mockColumn: Column = { id: '123', title: 'Test Column' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColumnComponent ],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [TaskService, ColumnService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService);

    component.column = mockColumn;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a new task', () => {
    spyOn(taskService, 'createTask').and.returnValue(of({
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      columnId: mockColumn.id
    }));
    component.newTaskTitle = 'Test Task';
    component.newTaskDescription = 'Test Description';
    component.createTask();
    expect(component.tasks.length).toBe(1);
  });
});
