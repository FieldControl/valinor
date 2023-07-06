import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaIssuesComponent } from './lista-issues.component';
import { AppModule } from 'src/app/app.module';
import * as moment from 'moment';
import { ApiGithubService } from 'src/app/services/api-github.service';
import { of } from 'rxjs';

describe('ListaIssuesComponent', () => {
  let component: ListaIssuesComponent;
  let fixture: ComponentFixture<ListaIssuesComponent>;
  let apiGitMock = jasmine.createSpyObj('ApiGithubService', ['listaIssues'])
  const arrayIssues = {
    total_count: 1,
    incomplete_results: false,
    items: [
      {
        "url": "https://api.github.com/repos/nodejs/node/issues/48667",
        "repository_url": "https://api.github.com/repos/nodejs/node",
        "labels_url": "https://api.github.com/repos/nodejs/node/issues/48667/labels{/name}",
        "comments_url": "https://api.github.com/repos/nodejs/node/issues/48667/comments",
        "events_url": "https://api.github.com/repos/nodejs/node/issues/48667/events",
        "html_url": "https://github.com/nodejs/node/issues/48667",
        "id": 1790354229,
        "node_id": "I_kwDOAZ7xs85qtqM1",
        "number": 48667,
        "title": "stream: add an option to let stream.pipeline not throw if the source is destroyed",
        "user": {
          "login": "ErickWendel",
        },
        "state": "open",
        "locked": false,
        "assignee": null,
        "milestone": null,
        "created_at": "2023-07-05T21:22:46Z",
        "updated_at": "2023-07-05T21:25:50Z",
        "closed_at": null,
        "author_association": "MEMBER",
        "active_lock_reason": null,
        "body": "### What is the problem this feature will solve?\r\n\r\nWhen using standard `source.pipe(dest)` source will not be destroyed if dest emits close or an error.\r\n\r\nstream.pipeline came to solve this problem but if the source is destroyed it throws an error of premature close.\r\n\r\n```mjs\r\nimport stream from 'node:stream'\r\nconst readable = stream.Readable({\r\n    read() {\r\n       setInterval(() => {\r\n           this.push(`${Math.random() * 100}`)\r\n       }, 100).unref()\r\n    }\r\n})\r\n\r\nsetTimeout(() => readable.destroy(), 200);\r\n\r\n// this why works!\r\n// readable.pipe(process.stdout)\r\n\r\nawait stream.promises.pipeline(\r\n    readable,\r\n    process.stdout,\r\n    { end: false }\r\n)\r\n// Error [ERR_STREAM_PREMATURE_CLOSE]: Premature close\r\n```\r\n\r\n### What is the feature you are proposing to solve the problem?\r\n\r\nThe idea is to add an option to let stream.pipeline not throw if the source is destroyed. This is useful when working with files and an user disconnects from the webserver and it's not needed to consume the full stream\r\n\r\n@nodejs/streams \r\n\r\n### What alternatives have you considered?\r\n\r\n_No response_",
        "timeline_url": "https://api.github.com/repos/nodejs/node/issues/48667/timeline",
        "performed_via_github_app": null,
        "state_reason": null,
        "score": 1.0
      }
    ]}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaIssuesComponent ],
      imports: [AppModule],
      providers: [
        moment,
        { provide: ApiGithubService, useValue: apiGitMock }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve listar os issues corretamente', () => {
    apiGitMock.listaIssues.and.returnValues(of(arrayIssues))
    component.listarIssues()
    expect(component.issues.length).toBe(1);
    expect(component.exibirPaginacao).toBeTrue();
    expect(component.loader).toBeFalse();
    expect(component.totalIssues).toBe(1);
  });

  it('deve retornar o obejto params com o atributo page', () => {
    expect(component.parametros(2)).toEqual({ page: 2 });
  });

  it('deve retornar o obejto vazio passando valor nulo', () => {
    expect(component.parametros(0)).toEqual({});
  });

  it('deve chamar o metodo listaRepositorios ao chamar o metodo mudarPagina', () => {
    spyOn(component, 'listarIssues')
    component.mudarPagina(1)
    expect(component.listarIssues).toHaveBeenCalled();
  });

  it('deve resetar as variaveis ao ser chamado', () => {
    component.resetarVariaveisAoListar()
    expect(component.exibirPaginacao).toBeFalse();
    expect(component.loader).toBeTrue();
    expect(component.issues.length).toEqual(0);
    expect(component.totalIssues).toEqual(0);
  });
});
