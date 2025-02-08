import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddColumnComponent } from './add-column.component.js';

describe('EditColumnComponent', () => {
  let component: AddColumnComponent;
  let fixture: ComponentFixture<AddColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddColumnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
