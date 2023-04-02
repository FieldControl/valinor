import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositorieIssuesComponent } from './repositorie-issues.component';

describe('RepositorieIssuesComponent', () => {
  let component: RepositorieIssuesComponent;
  let fixture: ComponentFixture<RepositorieIssuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RepositorieIssuesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepositorieIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
