import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Kanban } from './kanban';
import { TaskService, Task } from './task.service';
import { of } from 'rxjs';

describe('Kanban Component', () => {
  let component: Kanban;
  let fixture: ComponentFixture<Kanban>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;

  const mockTask: Task = {
    id: 1,
    name: 'Test Task',
    desc: 'Task description',
    step: 0,
  };

  beforeEach(async () => {
    taskServiceSpy = jasmine.createSpyObj('TaskService', [
      'getTasks',
      'createTask',
      'updateTask',
      'removeTask',
    ]);

    await TestBed.configureTestingModule({
      imports: [Kanban], // Kanban is standalone
      providers: [{ provide: TaskService, useValue: taskServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(Kanban);
    component = fixture.componentInstance;
  });

  it('should load tasks on init', () => {
    taskServiceSpy.getTasks.and.returnValue(of([mockTask]));

    fixture.detectChanges(); // triggers ngOnInit

    expect(taskServiceSpy.getTasks).toHaveBeenCalled();
    expect(component.tasks.length).toBe(1);
    expect(component.tasks[0].name).toBe('Test Task');
  });

  it('should edit a task', () => {
    component.editTask(mockTask);
    expect(component.editingTask).toEqual(mockTask);
  });

  it('should save a task', () => {
    component.editingTask = { ...mockTask };
    taskServiceSpy.updateTask.and.returnValue(of(mockTask));
    taskServiceSpy.getTasks.and.returnValue(of([mockTask]));

    component.saveTask();

    expect(taskServiceSpy.updateTask).toHaveBeenCalledWith(
      mockTask.id,
      mockTask.name,
      mockTask.desc,
      mockTask.step
    );
    expect(component.editingTask).toBeNull();
  });

  it('should cancel edit', () => {
    component.editingTask = mockTask;
    component.cancelEdit();
    expect(component.editingTask).toBeNull();
  });

  it('should delete a task', () => {
    component.editingTask = mockTask;
    taskServiceSpy.removeTask.and.returnValue(of({ id: 1, name: 'Deleted Task', desc: '', step: 0 }));
    taskServiceSpy.getTasks.and.returnValue(of([]));

    component.deleteTask();

    expect(taskServiceSpy.removeTask).toHaveBeenCalledWith(mockTask.id);
    expect(component.editingTask).toBeNull();
  });
});
