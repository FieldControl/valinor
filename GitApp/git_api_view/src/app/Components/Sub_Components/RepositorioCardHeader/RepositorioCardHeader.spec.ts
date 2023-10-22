import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositorioCardHeaderComponent } from './RepositorioCardHeader.component';

describe('UserRepositoryComponent', () => {
  let component: RepositorioCardHeaderComponent;
  let fixture: ComponentFixture<RepositorioCardHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepositorioCardHeaderComponent]
    });
    fixture = TestBed.createComponent(RepositorioCardHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
