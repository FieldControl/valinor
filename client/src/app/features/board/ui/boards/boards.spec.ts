import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Boards } from './boards';

describe('BoardComponent', () => {
  let component: Boards;
  let fixture: ComponentFixture<Boards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Boards]
    }).compileComponents();

    fixture = TestBed.createComponent(Boards);
    component = fixture.componentInstance;

    component.board = { id: 1, title: 'Projeto Teste' };
    
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve mostrar o título do board', () => {
    const titleEl = fixture.debugElement.query(By.css('.board-title')).nativeElement;
    expect(titleEl.textContent).toContain('Projeto Teste');
  });
});