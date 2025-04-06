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
    const kanbanServiceMock = jasmine.createSpyObj('KanbanService', [
      'getColumns',
      'addColumn',
      'deleteColumn',
      'addCard',
      'deleteCard',
      'updateCard',
      'moveCard',
    ]);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, DragDropModule], 
      declarations: [KanbanBoardComponent], 
      providers: [
        { provide: KanbanService, useValue: kanbanServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanBoardComponent);
    component = fixture.componentInstance;
    kanbanService = TestBed.inject(KanbanService) as jasmine.SpyObj<KanbanService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy(); 
  });

  it('should load columns on init', () => {
    const mockColumns = [
      { id: 1, title: 'To Do', cards: [] },
      { id: 2, title: 'In Progress', cards: [] },
    ];

    kanbanService.getColumns.and.returnValue(of(mockColumns)); 

    component.ngOnInit(); 
    fixture.detectChanges();

    expect(component.columns).toEqual(mockColumns); 
  });

  it('should add a column', () => {
    kanbanService.addColumn.and.returnValue(of({})); 
    spyOn(component, 'loadColumns'); 
    component.addColumn('New Column'); 
    expect(component.loadColumns).toHaveBeenCalled(); 
  });
});
