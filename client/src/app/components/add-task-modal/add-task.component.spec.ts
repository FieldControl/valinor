import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AddTaskModalComponent } from './add-task-modal.component';
import { TaskService } from '../../services/task.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { Apollo } from 'apollo-angular'; // Adicione o Apollo aqui.

describe('AddTaskModalComponent', () => {
  let component: AddTaskModalComponent;
  let fixture: ComponentFixture<AddTaskModalComponent>;
  let mockTaskService: jasmine.SpyObj<TaskService>;
  let mockApollo: jasmine.SpyObj<Apollo>;

  beforeEach(() => {
    // Mock do serviço TaskService
    mockTaskService = jasmine.createSpyObj('TaskService', ['createTask']);
    // Mock do Apollo Client
    mockApollo = jasmine.createSpyObj('Apollo', ['mutate']);

    TestBed.configureTestingModule({

      imports: [ReactiveFormsModule, AddTaskModalComponent],
      providers: [
        { provide: TaskService, useValue: mockTaskService },
        { provide: Apollo, useValue: mockApollo },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTaskModalComponent);
    component = fixture.componentInstance;
    component.taskColumns = [
      { id: '1', name: 'To Do' },
      { id: '2', name: 'In Progress' },
    ];
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve invalidar o formulário quando os campos obrigatórios estiverem vazios', () => {
    component.taskForm.controls['taskName'].setValue('');
    component.taskForm.controls['taskStatus'].setValue('');
    expect(component.taskForm.valid).toBeFalse();
  });

  it('deve validar o formulário quando todos os campos obrigatórios forem preenchidos', () => {
    component.taskForm.controls['taskName'].setValue('Nova Tarefa');
    component.taskForm.controls['taskStatus'].setValue('1');
    expect(component.taskForm.valid).toBeTrue();
  });

  it('deve emitir evento ao fechar o modal', () => {
    spyOn(component.closeAddTaskEvent, 'emit');

    const closeModalButton = fixture.debugElement.query(By.css('.close-modal'));
    closeModalButton.triggerEventHandler('click', null);

    expect(component.closeAddTaskEvent.emit).toHaveBeenCalled();
  });
});
