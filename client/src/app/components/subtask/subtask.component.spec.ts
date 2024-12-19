import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubtaskComponent } from './subtask.component';
import { SubtaskService } from '../../services/subtask.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('Componente Subtarefa', () => {
  let component: SubtaskComponent;
  let fixture: ComponentFixture<SubtaskComponent>;
  let mockSubtaskService: Partial<SubtaskService>;

  beforeEach(async () => {
    mockSubtaskService = {
      updateSubtask: jasmine.createSpy('updateSubtask').and.returnValue(of(null)),
      deleteSubtask: jasmine.createSpy('deleteSubtask').and.returnValue(of(null)),
    };

    await TestBed.configureTestingModule({
      imports: [SubtaskComponent, CommonModule],
      providers: [
        { provide: SubtaskService, useValue: mockSubtaskService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SubtaskComponent);
    component = fixture.componentInstance;
    component.id = 'subtask-id';
    component.task = 'task-id';
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve atualizar a subtarefa quando o checkbox for clicado', () => {
    spyOn(console, 'log');
    component.isCompleted = false;
    const event = { target: { checked: true } };
    component.onCheckboxClick(event);
    expect(mockSubtaskService.updateSubtask).toHaveBeenCalledWith('subtask-id', true, 'task-id');
    expect(console.log).toHaveBeenCalledWith('Subtarefa atualizada');
  });

  it('deve registrar erro se a atualização da subtarefa falhar', () => {
    spyOn(console, 'log');
    (mockSubtaskService.updateSubtask as jasmine.Spy).and.returnValue(throwError(() => new Error('Erro ao atualizar subtarefa')));
    component.isCompleted = false;
    const event = { target: { checked: true } };
    component.onCheckboxClick(event);
    expect(console.log).toHaveBeenCalledWith('Erro ao atualizar subtarefa');
  });

  it('deve deletar a subtarefa quando deleteSubtask for chamado', () => {
    spyOn(console, 'log');
    component.deleteSubtask();
    expect(mockSubtaskService.deleteSubtask).toHaveBeenCalledWith('subtask-id', 'task-id');
    expect(console.log).toHaveBeenCalledWith('Subtarefa deletada');
  });

  it('deve registrar erro se a deleção da subtarefa falhar', () => {
    spyOn(console, 'log');
    (mockSubtaskService.deleteSubtask as jasmine.Spy).and.returnValue(throwError(() => new Error('Erro ao deletar subtarefa')));
    component.deleteSubtask();
    expect(console.log).toHaveBeenCalledWith('Erro ao deletar subtarefa');
  });
});
