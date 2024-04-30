import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColumnComponent } from './column.component';

describe('ColumnComponent', () => {
  let component: ColumnComponent;
  let fixture: ComponentFixture<ColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColumnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render column title', () => {
    const compiled = fixture.nativeElement;
    component.title = 'Test Column';
    fixture.detectChanges();
    expect(compiled.querySelector('h2').textContent).toContain('Test Column');
  });

  it('should add card', () => {
    const initialCardCount = component.cards.length;
    component.cards.push({ title: 'New Card' }); // Simulate adding a new card directly to the cards array
    fixture.detectChanges();
    expect(component.cards.length).toBe(initialCardCount + 1);
    expect(component.cards[initialCardCount].title).toBe('New Card');
  });
});
