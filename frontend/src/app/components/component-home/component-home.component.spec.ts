import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentHomeComponent } from './component-home.component';

describe('ComponentHomeComponent', () => {
  let component: ComponentHomeComponent;
  let fixture: ComponentFixture<ComponentHomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ComponentHomeComponent],
    });
    fixture = TestBed.createComponent(ComponentHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
