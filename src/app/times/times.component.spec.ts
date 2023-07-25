import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesComponent } from './times.component';

describe('TimesComponent', () => {
  let component: TimesComponent;
  let fixture: ComponentFixture<TimesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimesComponent]
    });
    fixture = TestBed.createComponent(TimesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
