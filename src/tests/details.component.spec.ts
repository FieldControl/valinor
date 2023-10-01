import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PokeApiService } from '../app/service/poke-api.service';
import { DetailsComponent } from '../app/pages/details/details.component';

describe('DetailsComponent', () => {
  let component: DetailsComponent;
  let fixture: ComponentFixture<DetailsComponent>;
  let pokeApiService: jasmine.SpyObj<PokeApiService>;
  const mockActivatedRoute = {
    snapshot: {
      params: {
        id: '1'
      }
    }
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('PokeApiService', ['apiGetPokemon']);
    await TestBed.configureTestingModule({
      declarations: [ DetailsComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: PokeApiService, useValue: spy }
      ]
    })
    .compileComponents();
    pokeApiService = TestBed.inject(PokeApiService) as jasmine.SpyObj<PokeApiService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call apiGetPokemon twice', () => {
    pokeApiService.apiGetPokemon.and.returnValue(of({}));
    component.getPokemon();
    expect(pokeApiService.apiGetPokemon).toHaveBeenCalledTimes(2);
  });

  it('should set pokemon and isLoading to true on success', () => {
    const pokemon = { name: 'Pikachu' };
    const name = { flavor_text_entries: [{ flavor_text: 'A cute and cuddly Pokemon.' }] };
    pokeApiService.apiGetPokemon.and.returnValues(of(pokemon), of(name));
    component.getPokemon();
    expect(component.pokemon).toEqual([pokemon, name]);
    expect(component.isLoading).toBeTrue();
  });

  it('should set apiError to true on error', () => {
    pokeApiService.apiGetPokemon.and.returnValue(of(null));
    component.getPokemon();
    expect(component.apiError).toBeTrue();
  });
});