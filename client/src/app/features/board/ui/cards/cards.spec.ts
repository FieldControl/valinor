import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cards } from './cards';
import { By } from '@angular/platform-browser';

describe('CardsComponent', () => {
  let component: Cards;
  let fixture: ComponentFixture<Cards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cards]
    }).compileComponents();

    fixture = TestBed.createComponent(Cards);
    component = fixture.componentInstance;

    component.card = { 
      id: 1, 
      title: 'Teste Card', 
      description: 'Descrição teste' 
    };
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve renderizar o título do card', () => {
    const titleEl = fixture.debugElement.query(By.css('.card-title')).nativeElement;
    expect(titleEl.textContent).toContain('Teste Card');
  });
});