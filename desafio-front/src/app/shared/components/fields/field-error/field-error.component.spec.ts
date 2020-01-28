import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormControl } from '@ng-stack/forms';

import { FieldErrorComponent } from './field-error.component';


describe('FieldErrorComponent', () => {
  let component: FieldErrorComponent;
  let fixture: ComponentFixture<FieldErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldErrorComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldErrorComponent);
    component = fixture.componentInstance;
    component.control = new FormControl();
    component.errorMsgs = {};
    component.ObjectKeys = Object.keys;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
