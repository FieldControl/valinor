import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositorySearchComponent } from './repository-search.component';

describe('RepositorySearchComponent', () => {
  let component: RepositorySearchComponent;
  let fixture: ComponentFixture<RepositorySearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepositorySearchComponent]
    });
    fixture = TestBed.createComponent(RepositorySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
