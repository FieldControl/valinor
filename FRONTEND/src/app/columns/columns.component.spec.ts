//form-card.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnsComponent } from './columns.component';

describe('ColumnsComponent', () => {
  let component: ColumnsComponent;
  let fixture: ComponentFixture<ColumnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
