import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { PokedexComponent } from './pokedex.component';
import { PokeAPIService } from '../services/poke-api.service';
import { of, throwError } from 'rxjs';
import { AppModule } from '../app.module';

describe('PokedexComponent', () => {
  let component: PokedexComponent;
  let fixture: ComponentFixture<PokedexComponent>;
  let pokeAPIService: PokeAPIService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PokedexComponent ],
      imports: [AppModule],
      providers: [PokeAPIService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokedexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    pokeAPIService = TestBed.get(PokeAPIService);
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar a listagem dos pokemons ao inicializar', () => {
    const pokemons = { results: [] };
    spyOn(pokeAPIService, 'listarPokemonsPaginado').and.returnValue(of(pokemons));

    component.ngOnInit();

    expect(pokeAPIService.listarPokemonsPaginado).toHaveBeenCalled();
    expect(component.pokemons).toEqual([]);
    expect(component.pokemonNaoEncontrado).toBeFalse();
  });

  it('deve exibir os proximo pokemons ao clicar em exibir mais', () => {
    const pokemons = { results: [] };
    spyOn(pokeAPIService, 'chamarRequestGET').and.returnValue(of(pokemons));

    component.exibirMaisPokemons();

    expect(pokeAPIService.chamarRequestGET).toHaveBeenCalled();
  });

  it('deve completar os dados para os pokemons', fakeAsync(() => {
    const pokemons = { results: [{ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' }] };
    const completeData = { name: 'pikachu', height: 40, weight: 6 };
    spyOn(pokeAPIService, 'listarPokemonsPaginado').and.returnValue(of(pokemons));
    spyOn(pokeAPIService, 'chamarRequestGET').and.returnValue(of(completeData));

    component.listarPokemons();
    tick();

    expect(component.pokemons).toEqual(pokemons.results);
  }));

  it('deve lidar com erro ao buscar um pokemon', () => {
    spyOn(pokeAPIService, 'listarPokemonPorIdOuNome').and.returnValue(throwError('Not Found'));

    component.pokemonPesquisado = 'pikachu';
    component.buscarPokemon();

    expect(pokeAPIService.listarPokemonPorIdOuNome).toHaveBeenCalled();
    expect(component.pokemonNaoEncontrado).toBeTrue();
    expect(component.pokemons).toEqual([]);
  });

  it('deve buscar um pokemon', () => {
    const pikachuData = { name: 'pikachu', height: 40, weight: 6 };
    spyOn(pokeAPIService, 'listarPokemonPorIdOuNome').and.returnValue(of(pikachuData));

    component.pokemonPesquisado = 'pikachu';
    component.buscarPokemon();

    expect(pokeAPIService.listarPokemonPorIdOuNome).toHaveBeenCalled();
    expect(component.pokemonNaoEncontrado).toBeFalse();
    expect(component.pokemons).toEqual([{ 'name': 'pikachu', 'dadosCompletos': pikachuData }]);
  });

  it('deve buscar um pokemon quando clicado no botão', () => {
    spyOn(component, 'buscarPokemon');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.buscarPokemon).toHaveBeenCalled();
  });

  it('deve exibir os pokemons', () => {
    component.pokemonNaoEncontrado = false;
    component.pokemons = [{ name: 'pikachu', dadosCompletos: { id: 25 } }];
    fixture.detectChanges();
    const pokemonElements = fixture.nativeElement.querySelectorAll('.card');
    expect(pokemonElements.length).toBe(1);
  });

  it('deve exibir "Nenhum Pokemon encontrado" quando pokemonNaoEncontrado for igual a true', () => {
    component.pokemonNaoEncontrado = true;
    fixture.detectChanges();
    const alertaElement = fixture.nativeElement.querySelector('app-alerta-nao-encontrado');
    expect(alertaElement).toBeDefined();
  });

  it('deve abrir um modal quando clicado no card', () => {
    component.pokemons = [{ name: 'pikachu', dadosCompletos: { id: 25 } }];
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('.card');
    card.click();
    expect(component.dadosDoPokemon).toEqual(component.pokemons[0]);
 });
});
