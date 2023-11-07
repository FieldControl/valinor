import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertaNaoEncontradoComponent } from './alerta-nao-encontrado.component';
import { By } from '@angular/platform-browser';

describe('AlertaNaoEncontradoComponent', () => {
  let component: AlertaNaoEncontradoComponent;
  let fixture: ComponentFixture<AlertaNaoEncontradoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlertaNaoEncontradoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertaNaoEncontradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir a mensagem de erro quando o Pokemon não for encontrado', () => {
    const erroAlert = fixture.debugElement.query(By.css('.alert.alert-danger'));
    expect(erroAlert.nativeElement.textContent).toContain('Pokemon não encontrado');
  });
});
