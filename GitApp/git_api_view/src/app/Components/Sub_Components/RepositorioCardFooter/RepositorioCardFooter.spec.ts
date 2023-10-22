import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositorioCardFooter } from './RepositorioCardFooter.component';

describe('RepositoryInfosComponent', () => {
  let component: RepositorioCardFooter;
  let fixture: ComponentFixture<RepositorioCardFooter>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepositorioCardFooter]
    });
    fixture = TestBed.createComponent(RepositorioCardFooter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
