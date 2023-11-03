import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideBarComponent } from './slide-bar.component';

describe('SlideBarComponent', () => {
  let component: SlideBarComponent;
  let fixture: ComponentFixture<SlideBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SlideBarComponent]
    });
    fixture = TestBed.createComponent(SlideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
