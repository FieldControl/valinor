import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnCardComponent } from './column-card.component';

describe('ColumnCardComponent', () => {
  let component: ColumnCardComponent;
  let fixture: ComponentFixture<ColumnCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
