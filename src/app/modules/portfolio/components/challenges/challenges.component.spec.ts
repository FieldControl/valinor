import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengesComponent } from './challenges.component';

describe('ChallengesComponent', () => {
  let component: ChallengesComponent;
  let fixture: ComponentFixture<ChallengesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChallengesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChallengesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
