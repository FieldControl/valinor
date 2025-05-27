import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnheaderComponent } from './columnheader.component';

describe('ColumnheaderComponent', () => {
  let component: ColumnheaderComponent;
  let fixture: ComponentFixture<ColumnheaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnheaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
