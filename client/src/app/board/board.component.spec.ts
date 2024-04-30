import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BoardComponent } from './board.component';
import { ColumnComponent } from '../column/column.component';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoardComponent, ColumnComponent],
      imports: [FormsModule]
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
    const columnElements = compiled.querySelectorAll('.kanban-column');
    expect(columnElements.length).toBe(component.columns.length);
  });

  it('should add column', () => {
    const initialColumnCount = component.columns.length;
    component.newColumnTitle = 'New Column';
    component.addColumn();
    expect(component.columns.length).toBe(initialColumnCount + 1);
    expect(component.columns[initialColumnCount].title).toBe('New Column');
  });
});
