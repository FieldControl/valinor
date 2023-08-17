import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorFeedbackComponent } from './error-feedback.component';
import { NgIconsModule } from '@ng-icons/core';
import { heroXCircle } from '@ng-icons/heroicons/outline';

describe('ErrorFeedbackComponent', () => {
  let component: ErrorFeedbackComponent;
  let fixture: ComponentFixture<ErrorFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ErrorFeedbackComponent],
      imports: [
        NgIconsModule.withIcons({ heroXCircle }),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render error message', () => {
    const errorMessageElement: HTMLElement = fixture.nativeElement.querySelector('.font-bold');
    expect(errorMessageElement.textContent).toContain('Oopss! Ocorreu um erro na sua requisição, tente novamente mais tarde!');
  });

  it('should render error icon', () => {
    const errorIconElement: HTMLElement = fixture.nativeElement.querySelector('ng-icon');
    expect(errorIconElement.getAttribute('name')).toBe('heroXCircle');
  });
});
