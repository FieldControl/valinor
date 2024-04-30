import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoardComponent } from './board.component';
import { ColumnComponent } from '../column/column.component';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoardComponent, ColumnComponent] // Adicionando ColumnComponent como declaração
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render columns', () => {
    const compiled = fixture.nativeElement;
    const columnElements = compiled.querySelectorAll('app-column'); // Selecionando elementos com seletor 'app-column'
    expect(columnElements.length).toBe(component.columns.length);
  });

  it('should add column', () => {
    const initialColumnCount = component.columns.length;
    component.newColumnTitle = 'New Column';
    component.addColumn();
    fixture.detectChanges(); // Detectar as alterações na visualização
    expect(component.columns.length).toBe(initialColumnCount + 1);
    expect(component.columns[initialColumnCount].title).toBe('New Column');
  });
});
