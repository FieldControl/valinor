import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogofildComponent } from './logofild.component';

describe('LogofildComponent', () => {
  let component: LogofildComponent;
  let fixture: ComponentFixture<LogofildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogofildComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogofildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
