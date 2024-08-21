import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarColunaComponent } from './editar-coluna.component';

describe('EditarColunaComponent', () => {
  let component: EditarColunaComponent;
  let fixture: ComponentFixture<EditarColunaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarColunaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarColunaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
