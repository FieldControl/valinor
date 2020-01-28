import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { FormControl } from '@ng-stack/forms';

import { FieldErrorComponent } from '../field-error/field-error.component';
import { SelectFieldComponent } from './select-field.component';


describe('SelectFieldComponent', () => {
  let component: SelectFieldComponent;
  let fixture: ComponentFixture<SelectFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
      ],
      declarations: [
        FieldErrorComponent,
        SelectFieldComponent,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectFieldComponent);
    component = fixture.componentInstance;
    component.control = new FormControl();
    component.errorMsgs = {};
    component.options = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
