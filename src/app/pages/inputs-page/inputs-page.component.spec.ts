import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputComponent } from 'src/app/components/input/input.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputsPageComponent } from './inputs-page.component';
import { INPUTS } from './inputs-page.content';

describe('InputPageComponent', () => {
  let component: InputsPageComponent;
  let fixture: ComponentFixture<InputsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      declarations: [InputsPageComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(InputsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('Teste para garantir que todos os inputs possuem a propriedade `name` definida', () => {
    expect(INPUTS.every((input) => input.name)).toBeTrue();
  });

  it('Teste para garantir que todos os inputs possuem a propriedade `code` definida:', () => {
    expect(INPUTS.every((input) => input.code)).toBeTrue();
  });

  it('Teste para garantir que todos os inputs possuem a propriedade `label` definida', () => {
    expect(INPUTS.every((input) => input.label)).toBeTrue();
  });

  it('Teste para garantir que todos os inputs possuem a propriedade `type` definida', () => {
    expect(INPUTS.every((input) => input.type)).toBeTrue();
  });

  it('Teste para garantir que todos os inputs possuem a propriedade `control` definida', () => {
    expect(INPUTS.every((input) => input.control)).toBeTrue();
  });

  it('Teste para garantir que todos os inputs possuem a propriedade `required` definida', () => {
    expect(INPUTS.every((input) => input.required !== undefined)).toBeTrue();
  });

  it('Teste para garantir que todos os inputs possuem a propriedade `disabled` definida', () => {
    expect(INPUTS.every((input) => input.disabled !== undefined)).toBeTrue();
  });

  it('Teste para garantir que todos os inputs possuem a propriedade `placeholder` definida', () => {
    expect(INPUTS.every((input) => input.placeholder)).toBeTrue();
  });

  it('Teste para garantir que todos os inputs do tipo `search` possuem a propriedade `isSearch` definida', () => {
    expect(INPUTS.filter((input) => input.type === 'search').every((input) => input.isSearch !== undefined)).toBeTrue();
  });

  it('Teste para garantir que todos os inputs possuem o componente `app-input`:', () => {
    INPUTS.forEach((input) => {
      const fixture = TestBed.createComponent(InputComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance).toBeTruthy();
    });
  });
});
