import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MessageErrorComponent } from './message-error.component';

describe('MessageErrorComponent', () => {
  let component: MessageErrorComponent;
  let fixture: ComponentFixture<MessageErrorComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MessageErrorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageErrorComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should add error class when isError is true', () => {
    component.isError = true;
    const errorMessage = 'Error message';

    fixture.detectChanges();

    const errorMessageElement = fixture.debugElement.query(By.css('.content'));
    expect(errorMessageElement).toBeTruthy();
  });

  it('should display the error message', () => {
    const errorMessage = 'Error message';
    component.isError = true;
    component.text = errorMessage;

    fixture.detectChanges();

    const messageElement = fixture.debugElement.query(By.css('.content'));

    expect(messageElement.nativeElement.textContent).toContain(errorMessage);
  });

  it('should not add error class when isError is false', () => {
    component.isError = false;
    fixture.detectChanges();
    const errorMessageElement = fixture.debugElement.query(By.css('.content'));
    expect(errorMessageElement).toBeFalsy();
  });
});
