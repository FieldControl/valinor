import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginasComponentComponent } from './paginas-component.component';

describe('PaginasComponentComponent', () => {
  let component: PaginasComponentComponent;
  let fixture: ComponentFixture<PaginasComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaginasComponentComponent]
    });
    fixture = TestBed.createComponent(PaginasComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
