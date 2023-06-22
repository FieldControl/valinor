import { TestBed } from '@angular/core/testing';
import { RepositoriosService } from './repositorios.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';

describe('RepositoriosService', () => {
  let service: RepositoriosService;
  
 

  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [HttpClientModule],
        providers: [RepositoriosService],
    });
    
    service = TestBed.inject(RepositoriosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Pega repositório', () =>{
    (service as any).url_api = 'http://localhost:3000/dados_teste?'
    spyOn(service, 'pegar_repositorios').and.callThrough()
    let resultado: any = ''

    service.pegar_repositorios('bootstrap', 1).subscribe((data) => {
      resultado = data;   
      
      expect(typeof resultado).toEqual('object');
      expect(resultado.items[0].full_name).toEqual('twbs/bootstrap');      
    })
    
    expect(service.pegar_repositorios).toHaveBeenCalled();
  })
});
