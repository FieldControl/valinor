import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { ModalComponent } from '../../Components/modal/modal.component';
import { ColumnService } from '../../Services/column.service';
import { TaskService } from '../../Services/task.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let columnService: ColumnService;
  let taskService: TaskService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeComponent, ModalComponent],
      imports: [HttpClientTestingModule],
      providers: [ColumnService, TaskService],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    columnService = TestBed.inject(ColumnService);
    taskService = TestBed.inject(TaskService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load columns', () => {
    const columns = [{ id: '1', title: 'Test Column' }];
    spyOn(columnService, 'getAllColumns').and.returnValue(of(columns));
    component.loadColumns();
    expect(component.columns).toEqual(columns);
  });

  it('should load tasks', () => {
    const tasks = [{ id: '1', title: 'Test Task', columnId: '1' }];
    spyOn(taskService, 'getAllTasks').and.returnValue(of(tasks));
    component.loadTasks();
    expect(component.tasks).toEqual(tasks);
  });
});
