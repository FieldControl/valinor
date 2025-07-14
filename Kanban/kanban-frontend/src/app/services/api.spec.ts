// ARQUIVO: src/app/services/api.spec.ts

import { TestBed } from '@angular/core/testing';
// ✅ CORREÇÃO: Importamos o HttpClientTestingModule para simular as requisições HTTP
// que este serviço faria.
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ApiService } from './api';

// ✅ CORREÇÃO: Importamos a classe 'ApiService' do ficheiro correto.
// Assumindo que o seu ficheiro se chama 'api.service.ts' ou 'api.ts'.

/**
 * 'describe' agrupa todos os testes relacionados ao ApiService.
 */
describe('ApiService', () => {
  let service: ApiService;

  /**
   * 'beforeEach' é executado antes de cada teste, configurando um ambiente limpo.
   */
  beforeEach(() => {
    TestBed.configureTestingModule({
      // Importamos o HttpClientTestingModule para satisfazer a dependência do HttpClient
      // que o ApiService tem no seu construtor.
      imports: [HttpClientTestingModule],
      // Registamos o ApiService como um 'provider' para que ele possa ser injetado.
      providers: [ApiService]
    });
    // Obtemos a instância do serviço a partir do nosso ambiente de teste configurado.
    service = TestBed.inject(ApiService);
  });

  /**
   * O teste básico: verifica se o serviço foi criado com sucesso.
   */
  it('should be created', () => {
    // 'toBeTruthy()' verifica se o valor não é nulo ou indefinido.
    expect(service).toBeTruthy();
  });
});