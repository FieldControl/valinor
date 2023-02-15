import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentsCardComponent } from './agents-card.component';

describe('AgentsCardComponent', () => {
  let component: AgentsCardComponent;
  let fixture: ComponentFixture<AgentsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgentsCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
