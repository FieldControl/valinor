import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepoCardComponent } from './repo-card.component';
import { MatIconModule } from '@angular/material/icon';

describe('RepoCardComponent', () => {
  let component: RepoCardComponent;
  let fixture: ComponentFixture<RepoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RepoCardComponent],
      imports: [MatIconModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RepoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
