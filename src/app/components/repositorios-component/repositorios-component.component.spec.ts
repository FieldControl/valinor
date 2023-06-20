import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoriosComponentComponent } from './repositorios-component.component';

describe('RepositoriosComponentComponent', () => {
  let component: RepositoriosComponentComponent;
  let fixture: ComponentFixture<RepositoriosComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepositoriosComponentComponent]
    });
    fixture = TestBed.createComponent(RepositoriosComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
