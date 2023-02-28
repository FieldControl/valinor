import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooserComponent } from './choose-header.component';

describe('ChooserComponent', () => {
  let component: ChooserComponent;
  let fixture: ComponentFixture<ChooserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChooserComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
