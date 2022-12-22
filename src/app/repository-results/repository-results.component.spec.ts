import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoryResultsComponent } from './repository-results.component';

describe('RepositoryResultsComponent', () => {
  let component: RepositoryResultsComponent;
  let fixture: ComponentFixture<RepositoryResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RepositoryResultsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepositoryResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
