import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarLabelComponent } from './star-label.component';

describe('StarLabelComponent', () => {
  let component: StarLabelComponent;
  let fixture: ComponentFixture<StarLabelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StarLabelComponent]
    });
    fixture = TestBed.createComponent(StarLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
