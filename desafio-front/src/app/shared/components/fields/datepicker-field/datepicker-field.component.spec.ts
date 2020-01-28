import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatepickerFieldComponent } from './datepicker-field.component';


describe('DatepickerFieldComponent', () => {
  let component: DatepickerFieldComponent;
  let fixture: ComponentFixture<DatepickerFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatepickerFieldComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatepickerFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
