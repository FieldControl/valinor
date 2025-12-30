import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Column } from './column';

describe('Column', () => {
  let component: Column;
  let fixture: ComponentFixture<Column>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Column]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Column);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
