import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnComponent } from './column';

describe('Column', () => {
  let component: ColumnComponent;
  let fixture: ComponentFixture<ColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnComponent);
    component = fixture.componentInstance;
    component.column = { id: '1', title: 'Test Column', cards: [] };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
