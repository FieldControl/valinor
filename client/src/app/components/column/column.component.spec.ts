import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColumnComponent } from './column.component';
import { ColumnService } from '../../services/column.service';
import { TaskService } from '../../services/task.service';
import { of, throwError } from 'rxjs';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { CommonModule } from '@angular/common';

describe('ColumnComponent', () => {
  let component: ColumnComponent;
  let fixture: ComponentFixture<ColumnComponent>;
  let mockTaskService: Partial<TaskService>;
  let mockColumnService: Partial<ColumnService>;

  beforeEach(async () => {
    mockTaskService = {
      getTaskByStatus: jasmine.createSpy('getTaskByStatus').and.returnValue({
        subscribe: jasmine.createSpy('subscribe').and.callFake((callbacks: any) => {
          callbacks.next([{ id: '1', name: 'Tarefa 1', status: "6763278458c030f6d76b0fcc", description: 'Descrição' }]);
        }),
      }),
    };

    mockColumnService = {
      deleteColumn: jasmine.createSpy('deleteColumn').and.returnValue({
        subscribe: jasmine.createSpy('subscribe').and.callFake((callbacks: any) => {
          callbacks.next();
        }),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [
        ColumnComponent,
        ApolloTestingModule,
        CommonModule,
      ],
      providers: [
        { provide: TaskService, useValue: mockTaskService },
        { provide: ColumnService, useValue: mockColumnService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar as tarefas na inicialização', () => {
    component.ngOnInit();
    expect(mockTaskService.getTaskByStatus).toHaveBeenCalledWith(component.id);
    expect(component.tasks).toEqual([
      { id: '1', name: 'Tarefa 1', status: "6763278458c030f6d76b0fcc", description: 'Descrição' },
    ]);
  });

  it('deve deletar a coluna quando deleteColumn for chamado', () => {
    spyOn(window, 'confirm').and.returnValue(true)
    component.deleteColumn();
    expect(mockColumnService.deleteColumn).toHaveBeenCalledWith(component.id);
  });

  it('não deve deletar a coluna se o usuário cancelar a confirmação', () => {
    spyOn(window, 'confirm').and.returnValue(false)
    component.deleteColumn();
    expect(mockColumnService.deleteColumn).not.toHaveBeenCalled();
  });

  it('deve emitir openModalEvent quando onOpenModal for chamado', () => {
    spyOn(component.openModalEvent, 'emit');
    component.onOpenModal();
    expect(component.openModalEvent.emit).toHaveBeenCalled();
  });

  it('deve registrar erro se falhar ao carregar as tarefas', () => {
    spyOn(console, 'error');
    (mockTaskService.getTaskByStatus as jasmine.Spy).and.returnValue(
      throwError(() => new Error('Erro ao carregar tarefas'))
    );
    component.ngOnInit();
    expect(console.error).toHaveBeenCalledWith(
      'Erro ao carregar as tarefas:',
      jasmine.any(Error)
    );
  });

  it('deve registrar erro se falhar ao deletar a coluna', () => {
    spyOn(console, 'error');
    (mockColumnService.deleteColumn as jasmine.Spy).and.returnValue(
      throwError(() => new Error('Erro ao deletar coluna'))
    );
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteColumn();
    expect(console.error).toHaveBeenCalledWith(
      'Erro ao deletar a coluna:',
      jasmine.any(Error)
    );
  });
});
