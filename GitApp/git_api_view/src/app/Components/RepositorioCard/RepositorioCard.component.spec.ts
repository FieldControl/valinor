import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositorioCardComponent } from './RepositorioCard.component';

describe('RepositoryCardComponent', () => {
  let component: RepositorioCardComponent;
  let fixture: ComponentFixture<RepositorioCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepositorioCardComponent]
    });
    fixture = TestBed.createComponent(RepositorioCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
