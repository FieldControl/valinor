import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs'; 

import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  
  let routerSpy: any;
  let apolloSpy: any;

  beforeEach(async () => {
    routerSpy = { navigate: jasmine.createSpy('navigate') };

    apolloSpy = {
      watchQuery: jasmine.createSpy('watchQuery').and.returnValue({
        valueChanges: of({
          data: { 
            boards: [
              { id: 1, title: 'Board 1' },
              { id: 2, title: 'Board 2' }
            ] 
          },
          loading: false
        })
      })
    };

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: Apollo, useValue: apolloSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignora <app-board-item> e modais
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges(); 
  });

  it('deve buscar a lista de boards ao iniciar', () => {
    expect(apolloSpy.watchQuery).toHaveBeenCalled();
    expect(component.boards.length).toBe(2);
    expect(component.boards[0].title).toBe('Board 1');
  });

  it('deve navegar para a tela de detalhes ao abrir um board', () => {
    component.openBoard('55');

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/board', '55']);
  });
});