import { TestBed } from '@angular/core/testing';
// ✅ CORREÇÃO: Importa o HttpClientTestingModule para simular as requisições HTTP nos testes.
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './auth';

// ✅ CORREÇÃO: Importa a classe correta, 'AuthService'.

/**
 * 'describe' agrupa todos os testes relacionados ao AuthService.
 */
describe('AuthService', () => {
  let service: AuthService;

  /**
   * 'beforeEach' é executado antes de cada teste. É usado para configurar
   * o ambiente de teste de forma limpa para cada cenário.
   */
  beforeEach(() => {
    // TestBed.configureTestingModule cria um módulo de teste do Angular.
    TestBed.configureTestingModule({
      // 'imports' é usado para importar outros módulos que nosso serviço possa precisar.
      // O HttpClientTestingModule permite-nos testar o serviço sem fazer chamadas de rede reais.
      imports: [HttpClientTestingModule],
      // 'providers' regista os serviços necessários para o teste.
      providers: [AuthService]
    });
    // 'TestBed.inject' obtém uma instância do serviço do nosso módulo de teste.
    service = TestBed.inject(AuthService);
  });

  /**
   * O teste mais básico: verifica se a instância do serviço foi criada com sucesso
   * pelo sistema de injeção de dependência do Angular.
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});