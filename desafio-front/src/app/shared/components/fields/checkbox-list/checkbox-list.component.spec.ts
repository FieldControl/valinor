import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { FormGroup } from '@ng-stack/forms';

import { CheckboxFieldComponent } from '../checkbox-field/checkbox-field.component';
import { CheckboxListComponent } from './checkbox-list.component';


describe('CheckboxListComponent', () => {
  let component: CheckboxListComponent;
  let fixture: ComponentFixture<CheckboxListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      declarations: [
        CheckboxFieldComponent,
        CheckboxListComponent,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxListComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
