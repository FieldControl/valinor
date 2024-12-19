import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskComponent } from './task.component';
import { of, throwError } from 'rxjs';
import { SubtaskService } from '../../services/subtask.service';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { CommonModule } from '@angular/common';

describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;
  let mockSubtaskService: Partial<SubtaskService>;

  beforeEach(async () => {
    mockSubtaskService = {
      getSubtasksByTask: jasmine.createSpy('getSubtasksByTask').and.returnValue(of([
        { id: '1', name: 'Subtarefa 1', isCompleted: true, task: 'task-id' },
        { id: '2', name: 'Subtarefa 2', isCompleted: false, task: 'task-id' },
      ])),
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, TaskComponent, TaskModalComponent],
      providers: [
        { provide: SubtaskService, useValue: mockSubtaskService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
    component.id = 'task-id';  // Definindo um id de tarefa para o componente
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar as subtarefas na inicialização', () => {
    component.ngOnInit();
    expect(mockSubtaskService.getSubtasksByTask).toHaveBeenCalledWith(component.id);
    expect(component.subtasks).toEqual([
      { id: '1', name: 'Subtarefa 1', isCompleted: true, task: 'task-id' },
      { id: '2', name: 'Subtarefa 2', isCompleted: false, task: 'task-id' },
    ]);
    expect(component.counts).toEqual({ completed: 1, total: 2 });
  });

  it('deve abrir o modal quando openModal for chamado', () => {
    component.openModal();
    expect(component.isTaskModalOpen).toBeTrue();
  });

  it('deve fechar o modal quando closeModal for chamado', () => {
    component.closeModal();
    expect(component.isTaskModalOpen).toBeFalse();
  });

  it('deve registrar erro se falhar ao carregar subtarefas', () => {
    spyOn(console, 'log');
    (mockSubtaskService.getSubtasksByTask as jasmine.Spy).and.returnValue(throwError(() => new Error('Erro ao carregar subtarefas')));
    component.ngOnInit();
    expect(console.log).toHaveBeenCalledWith('Erro ao carregar as subtarefas', jasmine.any(Error));
  });
});