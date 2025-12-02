import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';

import { Columns } from './columns';

describe('ColumnsComponent', () => {
  let component: Columns;
  let fixture: ComponentFixture<Columns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Columns],
      schemas: [NO_ERRORS_SCHEMA] 
    }).compileComponents();

    fixture = TestBed.createComponent(Columns);
    component = fixture.componentInstance;

    component.column = { 
      id: 1, 
      title: 'Coluna Teste', 
      cards: []
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve mostrar o título da coluna', () => {
    expect(component.column.title).toBe('Coluna Teste');
  });

  it('deve emitir evento ao clicar para editar', () => {
    spyOn(component.editColumnModalOpen, 'emit');
    
    component.onEditModalOpen();
    
    expect(component.editColumnModalOpen.emit).toHaveBeenCalledWith(component.column);
  });
});