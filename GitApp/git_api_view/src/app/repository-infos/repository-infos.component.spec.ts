import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoryInfosComponent } from './repository-infos.component';

describe('RepositoryInfosComponent', () => {
  let component: RepositoryInfosComponent;
  let fixture: ComponentFixture<RepositoryInfosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepositoryInfosComponent]
    });
    fixture = TestBed.createComponent(RepositoryInfosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
