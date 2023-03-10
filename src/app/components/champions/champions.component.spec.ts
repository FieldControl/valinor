
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { ListChampionService } from 'src/app/services/list-champion.service';

import { ChampionsComponent } from './champions.component';



describe('ChampionsComponent', () => {
  let component: ChampionsComponent;
  let fixture: ComponentFixture<ChampionsComponent>;
  let listChampionServiceSpy: jasmine.SpyObj<ListChampionService>

  beforeEach(async () => {
    listChampionServiceSpy = jasmine.createSpyObj('ListChampionsService', ['getChampions'])
    listChampionServiceSpy.getChampions.and.returnValues(of({
      totalCount: 20,
      champions: [
        {
          "version": "13.4.1",
          "id": "Ahri",
          "key": "103",
          "name": "Ahri",
          "title": "a Raposa de Nove Caudas",
          "blurb": "A ligação de Ahri com a magia do mundo espiritual é inata. Ela é uma vastaya com traços de raposa, capaz de manipular as emoções de sua presa e consumir sua essência, devorando também as memórias e as percepções de cada alma absorvida. Outrora uma...",
          "info": {
            "attack": 3,
            "defense": 4,
            "magic": 8,
            "difficulty": 5
          },
          "image": {
            "full": "Ahri.png",
            "sprite": "champion0.png",
            "group": "champion",
            "x": 48,
            "y": 0,
            "w": 48,
            "h": 48
          },
          "tags": [
            "Mage",
            "Assassin"
          ],
        }
      ] as any
    }))

    await TestBed.configureTestingModule({
      declarations: [ ChampionsComponent ],
      providers: [
        {
          provide: ListChampionService,
          useValue: listChampionServiceSpy
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })

    fixture = TestBed.createComponent(ChampionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Ao buscar um campeão deve mostrar seu nome no componente específico', () =>{
    const expcted = 'Ahri'
    const championsElement = fixture.nativeElement as HTMLElement;

    const searchInput = championsElement.querySelector('[data-test="search-input"]') as HTMLInputElement
    const nameDisplay = championsElement.querySelector('[data-test="nameDisplay"]') as HTMLElement
    console.log(nameDisplay)
    searchInput.value = expcted
    searchInput.dispatchEvent(new Event('input'))

    fixture.detectChanges()
   
    
    expect(nameDisplay.textContent).toContain(expcted)
  })
});
