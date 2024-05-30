import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenCardComponent } from './open-card.component';

describe('OpenCardComponent', () => {
  let component: OpenCardComponent;
  let fixture: ComponentFixture<OpenCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OpenCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
