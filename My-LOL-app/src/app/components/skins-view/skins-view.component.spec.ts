import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PageEvent } from '@angular/material';
import { ChampionService } from '../shared/champion.service';
import { RouterTestingModule } from '@angular/router/testing';
import { SkinsViewComponent } from './skins-view.component';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SkinsViewComponent', () => {
  let component: SkinsViewComponent;
  let fixture: ComponentFixture<SkinsViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [SkinsViewComponent],
      providers: [{ provide: ChampionService }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(SkinsViewComponent);
    component = fixture.componentInstance;
  });

  it('Deve carregar a página', () => {
    expect(component).toBeTruthy();
  });

  describe('onPageChange', () => {
    it('Deve chamar a função ao fazer a paginação', () => {
      const pageEventStub: PageEvent = <any>{};
      const championServiceStub: ChampionService = fixture.debugElement.injector.get(
        ChampionService
      );
      spyOn(championServiceStub, 'getChampions').and.callThrough();
      component.onPageChange(pageEventStub);
      expect(championServiceStub.getChampions).toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    it('Deve chamar a função ao iniciar', () => {
      const championServiceStub: ChampionService = fixture.debugElement.injector.get(
        ChampionService
      );
      spyOn(championServiceStub, 'getChampions').and.callThrough();
      component.ngOnInit();
      expect(championServiceStub.getChampions).toHaveBeenCalled();
    });
  });

  describe('championSearch', () => {

    it('Ao buscar um campeão com valor de busca deve trazer os campeões esperados', () => {
      const championServiceStub: ChampionService = fixture.debugElement.injector.get(
        ChampionService
      );
      fixture.detectChanges();
      spyOn(championServiceStub, 'getChampions').and.callThrough();
      spyOn(championServiceStub, 'findChampion').and.callThrough();
      const componentElement = fixture.nativeElement as HTMLElement
      const searchElement = componentElement.querySelector('[data-test="searchText"]') as HTMLInputElement;
      component.searchText = 'teste'
      searchElement.dispatchEvent(new Event('input'))
      fixture.detectChanges();

      expect(championServiceStub.findChampion).toHaveBeenCalled()
      expect(championServiceStub.getChampions).not.toHaveBeenCalled()
    })

    it('Ao buscar um campeão sem valor de busca deve trazer os campeões iniciais', () => {
      const championServiceStub: ChampionService = fixture.debugElement.injector.get(
        ChampionService
      );
      fixture.detectChanges();
      spyOn(championServiceStub, 'getChampions').and.callThrough();
      spyOn(championServiceStub, 'findChampion').and.callThrough();
      const searchEl: HTMLInputElement = fixture.debugElement.query(By.css('[data-test="searchText"]')).nativeElement
      searchEl.dispatchEvent(new Event('input'))

      fixture.detectChanges();

      expect(championServiceStub.getChampions).toHaveBeenCalled()
      expect(championServiceStub.findChampion).not.toHaveBeenCalled()
    })
  })
})
