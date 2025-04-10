import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBtnComponent } from './add-btn.component';

describe('AddBtnComponent', () => {
  let component: AddBtnComponent;
  let fixture: ComponentFixture<AddBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBtnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
