import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaRepositoriosComponent } from './lista-repositorios.component';
import { AppModule } from 'src/app/app.module';
import * as moment from 'moment';
import { ApiGithubService } from 'src/app/services/api-github.service';
import { of } from 'rxjs';

describe('ListaRepositoriosComponent', () => {
  let component: ListaRepositoriosComponent;
  let fixture: ComponentFixture<ListaRepositoriosComponent>;

  let apiGitMock = jasmine.createSpyObj('ApiGithubService', ['listaRepositorios'])
const arrayRepositorio = {
      total_count: 1,
      items: [{
        "id": 2126244,
        "node_id": "MDEwOlJlcG9zaXRvcnkyMTI2MjQ0",
        "name": "bootstrap",
        "full_name": "twbs/bootstrap",
        "private": false,
        "owner": {
          "login": "twbs",
          "id": 2918581,
          "node_id": "MDEyOk9yZ2FuaXphdGlvbjI5MTg1ODE=",
          "avatar_url": "https://avatars.githubusercontent.com/u/2918581?v=4",
        },
        "html_url": "https://github.com/twbs/bootstrap",
        "description": "The most popular HTML, CSS, and JavaScript framework for developing responsive, mobile first projects on the web.",
        "fork": false,
        "url": "https://api.github.com/repos/twbs/bootstrap",
        "created_at": "2011-07-29T21:19:00Z",
        "updated_at": "2023-07-03T23:05:35Z",
        "size": 232460,
        "stargazers_count": 164446,
        "watchers_count": 164446,
        "language": "JavaScript",
        "has_issues": true,
        "has_projects": true,
        "has_downloads": true,
        "has_wiki": false,
        "has_pages": true,
        "has_discussions": true,
        "forks_count": 78653,
        "mirror_url": null,
        "archived": false,
        "disabled": false,
        "open_issues_count": 423,
        "topics": [
          "bootstrap",
          "css",
          "css-framework",
          "html",
          "javascript",
          "sass",
          "scss"
        ],
      }]
    }
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaRepositoriosComponent ],
      imports: [AppModule],
      providers: [
        moment,
        { provide: ApiGithubService, useValue: apiGitMock }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaRepositoriosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicar componente com o input vazio', () => {
    expect(component.form.get('repositorio')?.value).toBe('');
  });

  it('deve listar os repositorios corretamente', () => {
    apiGitMock.listaRepositorios.and.returnValues(of(arrayRepositorio))
    component.listaRepositorios()
    expect(component.repositorios.length).toBe(1);
    expect(component.exibirPaginacao).toBeTrue();
    expect(component.totalRepositorios).toBe(1);
  });

  it('deve retornar o obejto params com o atributo page', () => {
    expect(component.parametros(2)).toEqual({page: 2});
  });

  it('deve chamar o metodo listaRepositorios ao chamar o metodo mudarPagina', () => {
    spyOn(component, 'listaRepositorios')
    component.mudarPagina(1)
    expect(component.listaRepositorios).toHaveBeenCalled();
  });

  it('deve resetar as variaveis ao ser chamado', () => {
    component.resetarVariaveisAoListar()
    expect(component.exibirPaginacao).toBeFalse();
    expect(component.loader).toBeTrue();
    expect(component.repositorios.length).toEqual(0);
    expect(component.totalRepositorios).toEqual(0);
  });
});
