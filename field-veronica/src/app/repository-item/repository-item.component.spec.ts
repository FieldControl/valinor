import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoryItemComponent } from './repository-item.component';

describe('RepositoryItemComponent', () => {
  let component: RepositoryItemComponent;
  let fixture: ComponentFixture<RepositoryItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepositoryItemComponent]
    });
    fixture = TestBed.createComponent(RepositoryItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
