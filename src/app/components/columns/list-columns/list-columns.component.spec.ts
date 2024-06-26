import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListColumnsComponent } from './list-columns.component';

describe('ListColumnsComponent', () => {
  let component: ListColumnsComponent;
  let fixture: ComponentFixture<ListColumnsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListColumnsComponent]
    });
    fixture = TestBed.createComponent(ListColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
