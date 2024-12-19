import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskModalComponent } from './task-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SubtaskComponent } from '../subtask/subtask.component';
import { SubtaskService } from '../../services/subtask.service';
import { TaskService } from '../../services/task.service';
import { Apollo } from 'apollo-angular';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

describe('TaskModalComponent', () => {
  let component: TaskModalComponent;
  let fixture: ComponentFixture<TaskModalComponent>;
  let subtaskService: SubtaskService;
  let taskService: TaskService;
  let apollo: Apollo;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TaskModalComponent, SubtaskComponent],
      providers: [
        {
          provide: Apollo,
          useValue: {
            watchQuery: jasmine.createSpy().and.returnValue(of({})),
            mutate: jasmine.createSpy().and.returnValue(of({})),
          }, // Mock do Apollo
        },
        {
          provide: SubtaskService,
          useValue: {
            createSubtask: jasmine.createSpy().and.returnValue(of({})),
          },
        },
        {
          provide: TaskService,
          useValue: {
            updateName: jasmine.createSpy().and.returnValue(of({})),
            updateStatus: jasmine.createSpy().and.returnValue(of({})),
            updateDescription: jasmine.createSpy().and.returnValue(of({})),
            deleteTask: jasmine.createSpy().and.returnValue(of({})),
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskModalComponent);
    component = fixture.componentInstance;
    subtaskService = TestBed.inject(SubtaskService);
    taskService = TestBed.inject(TaskService);
    apollo = TestBed.inject(Apollo);

    // Definindo valores iniciais para os inputs do componente
    component.name = 'Task 1';
    component.description = 'Descrição da Tarefa 1';
    component.status = 'Em Progresso';
    component.color = 'azul';
    component.id = '1';
    component.columnId = '2';
    component.columns = [{ id: '2', name: 'A Fazer', color: 'azul' }];
    component.subtasks = [
      { id: '1', name: 'Subtarefa 1', task: '1', isCompleted: false },
    ];

    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve alternar o estado de edição do nome quando editTaskName for chamado', () => {
    component.editTaskName();
    expect(component.isEditingName).toBeTrue();
    expect(component.isEditingDescription).toBeFalse();
  });

  it('deve atualizar o nome da tarefa quando updateName for chamado', () => {
    component.newName = 'Tarefa Atualizada';
    component.updateName();
    expect(taskService.updateName).toHaveBeenCalledWith(
      '1',
      'Tarefa Atualizada',
      '2'
    );
  });

  it('deve atualizar o status da tarefa quando updateStatus for chamado', () => {
    const column = { id: '3', name: 'Em Progresso', color: 'verde' };
    component.updateStatus(column);
    expect(taskService.updateStatus).toHaveBeenCalledWith('1', '3', '2');
  });

  it('deve atualizar a descrição da tarefa quando updateDescription for chamado', () => {
    component.newDescription = 'Descrição atualizada';
    component.updateDescription();
    expect(taskService.updateDescription).toHaveBeenCalledWith(
      '1',
      'Descrição atualizada',
      '2'
    );
  });

  it('deve excluir a tarefa quando deleteTask for chamado e confirmado', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteTask();
    expect(taskService.deleteTask).toHaveBeenCalledWith('1', '2');
  });

  it('deve emitir o evento de fechamento quando closeModal for chamado', () => {
    spyOn(component.closeTaskEvent, 'emit');
    component.closeModal();
    expect(component.closeTaskEvent.emit).toHaveBeenCalled();
  });

  it('deve alternar o dropdown ao passar o mouse sobre o seletor de status', () => {
    const statusDiv = fixture.debugElement.query(By.css('.custom-select'));
    statusDiv.triggerEventHandler('mouseenter', {});
    expect(component.dropdownOpen).toBeTrue();
    statusDiv.triggerEventHandler('mouseleave', {});
    expect(component.dropdownOpen).toBeFalse();
  });

  it('não deve criar uma subtarefa quando o formulário for inválido', () => {
    component.subtaskForm.controls['subtaskName'].setValue('');
    component.onSubmit();
    expect(subtaskService.createSubtask).not.toHaveBeenCalled();
  });
});
