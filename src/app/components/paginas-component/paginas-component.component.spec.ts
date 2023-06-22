import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginasComponentComponent } from './paginas-component.component';
import { COMPILER_OPTIONS } from '@angular/core';

describe('PaginasComponentComponent', () => {
  let component: PaginasComponentComponent;
  let fixture: ComponentFixture<PaginasComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaginasComponentComponent]
    });
    fixture = TestBed.createComponent(PaginasComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Definine pagina final', () => {
    component.quantidade_paginas = 1000
    component.pagina_final = 0

    component.define_pagina_final()
    expect(component.pagina_final).toBeTruthy()
    expect(component.pagina_final).toEqual(100)
    });
  
  it('Cria list para a paginacao', () => {
    component.pagina = 0
    component.quantidade_paginas = 100

    spyOn(component, 'cria_list_paginacao').and.returnValue([0, 1, 2])
    const resultado = component.cria_list_paginacao()

    expect(component.cria_list_paginacao).toHaveBeenCalled()
    expect(resultado).toEqual([0, 1, 2])
  });

  it('Muda pagina', () => {
    component.pagina = 100    

    spyOn(component, 'mudar_pagina').and.callThrough()
    spyOn(component.nova_pagina, 'emit')

    component.mudar_pagina(1)
    
    expect(component.mudar_pagina).toHaveBeenCalled()
    expect(component.nova_pagina.emit).toHaveBeenCalled()
    expect(component.nova_pagina.emit).toHaveBeenCalledWith(100)
    
  });
});
