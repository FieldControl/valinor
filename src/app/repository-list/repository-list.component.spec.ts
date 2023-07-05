import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoryListComponent } from './repository-list.component';

describe('RepositoryListComponent', () => {
  let component: RepositoryListComponent;
  let fixture: ComponentFixture<RepositoryListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepositoryListComponent]
    });
    fixture = TestBed.createComponent(RepositoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
