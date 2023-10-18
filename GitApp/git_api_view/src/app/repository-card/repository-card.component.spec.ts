import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoryCardComponent } from './repository-card.component';

describe('RepositoryCardComponent', () => {
  let component: RepositoryCardComponent;
  let fixture: ComponentFixture<RepositoryCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepositoryCardComponent]
    });
    fixture = TestBed.createComponent(RepositoryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
