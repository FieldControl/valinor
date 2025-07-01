import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormColumn } from './form-column';

describe('FormColumn', () => {
  let component: FormColumn;
  let fixture: ComponentFixture<FormColumn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormColumn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormColumn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
