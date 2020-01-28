import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { FormControl } from '@ng-stack/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { DatepickerFieldComponent } from './datepicker-field.component';


describe('DatepickerFieldComponent', () => {
  let component: DatepickerFieldComponent;
  let fixture: ComponentFixture<DatepickerFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BsDatepickerModule.forRoot(),
        ReactiveFormsModule,
      ],
      declarations: [ DatepickerFieldComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatepickerFieldComponent);
    component = fixture.componentInstance;
    component.control = new FormControl();
    component.errorMsgs = {};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
