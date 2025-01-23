import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcluirColunaComponent } from './excluir-coluna.component';

describe('ExcluirColunaComponent', () => {
  let component: ExcluirColunaComponent;
  let fixture: ComponentFixture<ExcluirColunaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExcluirColunaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExcluirColunaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
