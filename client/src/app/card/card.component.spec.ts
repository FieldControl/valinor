import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h3');
    expect(titleElement.textContent).toContain(component.title);
  });

  it('should render description', () => {
    component.description = 'Card Description';
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const descriptionElement = compiled.querySelector('p');
    expect(descriptionElement.textContent).toContain('Card Description');
  });
});
