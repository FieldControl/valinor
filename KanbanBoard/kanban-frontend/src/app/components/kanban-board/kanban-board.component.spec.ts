import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KanbanBoardComponent } from './kanban-board.component';
import { KanbanService } from '../../services/kanban.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs'; // Para criar observables simulados
import { DragDropModule } from '@angular/cdk/drag-drop';

describe('KanbanBoardComponent', () => {
  let component: KanbanBoardComponent;
  let fixture: ComponentFixture<KanbanBoardComponent>;
  let kanbanService: jasmine.SpyObj<KanbanService>;

  beforeEach(async () => {
    // Cria um mock do KanbanService
    const kanbanServiceMock = jasmine.createSpyObj('KanbanService', [
      'getColumns',
      'addColumn',
      'deleteColumn',
      'addCard',
      'deleteCard',
      'updateCard',
      'moveCard',
    ]);

    // Configura o módulo de teste
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, DragDropModule], // Módulos necessários
      declarations: [KanbanBoardComponent], // O componente sendo testado
      providers: [
        { provide: KanbanService, useValue: kanbanServiceMock }, // Usa o mock
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanBoardComponent);
    component = fixture.componentInstance;
    kanbanService = TestBed.inject(KanbanService) as jasmine.SpyObj<KanbanService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy(); // Verifica se o componente foi criado
  });

  it('should load columns on init', () => {
    const mockColumns = [
      { id: 1, title: 'To Do', cards: [] },
      { id: 2, title: 'In Progress', cards: [] },
    ];

    kanbanService.getColumns.and.returnValue(of(mockColumns)); // Simula a resposta do serviço

    component.ngOnInit(); // Chama o método de inicialização
    fixture.detectChanges();

    expect(component.columns).toEqual(mockColumns); // Verifica se as colunas foram carregadas
  });

  it('should add a column', () => {
    kanbanService.addColumn.and.returnValue(of({})); // Simula a adição de uma coluna
    spyOn(component, 'loadColumns'); // Espiona o método de recarregar colunas

    component.addColumn('New Column'); // Adiciona uma coluna
    expect(component.loadColumns).toHaveBeenCalled(); // Verifica se recarregou as colunas
  });
});
