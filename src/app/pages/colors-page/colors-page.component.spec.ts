import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorsPageComponent } from './colors-page.component';
import { COLORS, IColor } from './colors-page.content';

describe('ColorsPageComponent', () => {
  let component: ColorsPageComponent;
  let fixture: ComponentFixture<ColorsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      declarations: [ColorsPageComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ColorsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('Deve ser um array', () => {
    expect(Array.isArray(COLORS)).toBe(true);
  });

  it('Cada objeto deve ter uma propriedade "name"', () => {
    COLORS.forEach((color: IColor) => {
      expect(color.name).toBeDefined();
    });
  });

  it('Cada objeto deve ter uma propriedade "hex"', () => {
    COLORS.forEach((color: IColor) => {
      expect(color.hex).toBeDefined();
    });
  });

  it('Cada objeto deve ter uma propriedade "name" com o formato "color-*"', () => {
    COLORS.forEach((color: IColor) => {
      expect(color.name).toMatch(/^color-.*/);
    });
  });

  it('Cada objeto deve ter uma propriedade "hex" com o formato "#******"', () => {
    COLORS.forEach((color: IColor) => {
      expect(color.hex).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  it('Deve haver um objeto com o nome "color-primary"', () => {
    expect(COLORS.some((color: IColor) => color.name === 'color-primary')).toBe(true);
  });

  it('Deve haver um objeto com o nome "color-secondary"', () => {
    expect(COLORS.some((color: IColor) => color.name === 'color-secondary')).toBe(true);
  });

  it('Deve haver um objeto com o nome "color-terciery"', () => {
    expect(COLORS.some((color: IColor) => color.name === 'color-terciery')).toBe(true);
  });

  it('Deve haver um objeto com o nome "color-white"', () => {
    expect(COLORS.some((color: IColor) => color.name === 'color-white')).toBe(true);
  });

  it('Deve haver um objeto com o nome "color-black"', () => {
    expect(COLORS.some((color: IColor) => color.name === 'color-black')).toBe(true);
  });
});
