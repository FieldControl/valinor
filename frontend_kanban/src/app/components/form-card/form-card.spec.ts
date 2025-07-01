import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCard } from './form-card';

describe('FormCard', () => {
  let component: FormCard;
  let fixture: ComponentFixture<FormCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
