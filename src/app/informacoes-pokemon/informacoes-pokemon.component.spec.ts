import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacoesPokemonComponent } from './informacoes-pokemon.component';

describe('InformacoesPokemonComponent', () => {
  let component: InformacoesPokemonComponent;
  let fixture: ComponentFixture<InformacoesPokemonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformacoesPokemonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformacoesPokemonComponent);
    component = fixture.componentInstance;
    component.dadosDoPokemon = { 
      dadosCompletos: { 
        weight: 50,
        height: 1.5,
        types: [{ type: { name: 'Grass' } }, { type: { name: 'Fire' } }],
        abilities: [{ ability: { name: 'Overgrow' } }, { ability: { name: 'Blaze' } }] 
      } 
    };
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir o peso em Kg', () => {
    const pesoElement = fixture.nativeElement.querySelector('p:first-child');
    expect(pesoElement.textContent).toContain('Peso: 50 Kg');
  });

  it('deve exibir a altura em m', () => {
    const alturaElement = fixture.nativeElement.querySelector('p:nth-child(2)');
    expect(alturaElement.textContent).toContain('Altura: 1.5 m');
  });

  it('deve exibir as categorias', () => {
    const categoriaElements = fixture.nativeElement.querySelectorAll('.badge');
    expect(categoriaElements.length).toBe(2);
    expect(categoriaElements[0].textContent).toContain('Grass');
    expect(categoriaElements[1].textContent).toContain('Fire');
  });

  it('deve exibir as habilidade', () => {
    const habilidadeElements = fixture.nativeElement.querySelectorAll('li');
    expect(habilidadeElements.length).toBe(2);
    expect(habilidadeElements[0].textContent).toContain('Overgrow');
    expect(habilidadeElements[1].textContent).toContain('Blaze');
  });
});
