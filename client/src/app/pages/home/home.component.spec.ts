import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { ColumnService } from '../../services/column.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('Componente Home', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockColumnService: Partial<ColumnService>;

  beforeEach(async () => {
    mockColumnService = {
      getAllColumns: jasmine.createSpy('getAllColumns').and.returnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent, CommonModule],
      providers: [
        { provide: ColumnService, useValue: mockColumnService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar as colunas ao inicializar', () => {
    const mockColumns = [
      { id: '1', name: 'Coluna 1', color: 'red' },
      { id: '2', name: 'Coluna 2', color: 'blue' },
    ];

    (mockColumnService.getAllColumns as jasmine.Spy).and.returnValue(of(mockColumns));

    component.ngOnInit();
    expect(mockColumnService.getAllColumns).toHaveBeenCalled();
    expect(component.columns).toEqual(mockColumns);
    expect(component.taskColumns).toEqual([
      { id: '1', name: 'Coluna 1' },
      { id: '2', name: 'Coluna 2' },
    ]);
  });

  it('deve registrar erro se carregar as colunas falhar', () => {
    spyOn(console, 'error');
    (mockColumnService.getAllColumns as jasmine.Spy).and.returnValue(throwError(() => new Error('Erro ao carregar as colunas')));

    component.ngOnInit();
    expect(console.error).toHaveBeenCalledWith('Erro ao carregar as colunas:', jasmine.any(Error));
  });

  it('deve abrir o modal de adicionar tarefa', () => {
    component.openAddTaskModal();
    expect(component.isAddTaskModalOpen).toBeTrue();
  });

  it('deve fechar o modal de adicionar tarefa', () => {
    component.isAddTaskModalOpen = true;
    component.closeAddTaskModal();
    expect(component.isAddTaskModalOpen).toBeFalse();
  });

  it('deve abrir o modal de adicionar coluna', () => {
    component.openAddColumnModal();
    expect(component.isAddColumnModalOpen).toBeTrue();
  });

  it('deve fechar o modal de adicionar coluna', () => {
    component.isAddColumnModalOpen = true;
    component.closeAddColumnModal();
    expect(component.isAddColumnModalOpen).toBeFalse();
  });
});
