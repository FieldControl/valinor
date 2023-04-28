import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TypographyPageComponent } from './typography-page.component';
import { ITypography, TYPOGRAPHY } from './typography-page.content';

describe('TypographyPageComponent', () => {
  let component: TypographyPageComponent;
  let fixture: ComponentFixture<TypographyPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      declarations: [TypographyPageComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TypographyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('Deve ser um array', () => {
    expect(Array.isArray(TYPOGRAPHY)).toBe(true);
  });

  it('Verifica se o array possui pelo menos um item', () => {
    expect(TYPOGRAPHY.length).toBeGreaterThan(0);
  });

  it('Verifica se a propriedade `name` está definida', () => {
    for (const item of TYPOGRAPHY) {
      expect(item.name).toBeDefined();
    }
  });

  it('Verifica se cada item do array possui as propriedades `code` e `id`', () => {
    for (const item of TYPOGRAPHY) {
      expect(item.code).toBeDefined();
      expect(item.id).toBeDefined();
    }
  });

  it('Verifica se o código HTML de cada item é uma string válida', () => {
    for (const item of TYPOGRAPHY) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(item.code, 'text/html');
      expect(doc.body.innerHTML).toBe(item.code);
    }
  });

  it('Verifica se cada item possui um `id` único', () => {
    const ids = TYPOGRAPHY.map(item => item.id);
    expect([...new Set(ids)]).toEqual(ids);
  });

  it('Verifica se cada item possui um `name` único', () => {
    const names = TYPOGRAPHY.map(item => item.name);
    expect([...new Set(names)]).toEqual(names);
  });

  it('Verifica se cada item possui um código', () => {
    for (const item of TYPOGRAPHY) {
      expect(item.code).not.toBe('');
    }
  });

  it('Verifica se cada objeto deve ter uma propriedade `id` com o formato `typo-*`', () => {
    TYPOGRAPHY.forEach((typo: ITypography) => {
      expect(typo.id).toMatch(/^typo-.*/);
    });
  });
});
