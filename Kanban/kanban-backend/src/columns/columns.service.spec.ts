import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsService } from './columns.service';
import { NotFoundException } from '@nestjs/common';

/**
 * 'describe' agrupa um conjunto de testes relacionados.
 * Aqui, estamos agrupando todos os testes para o nosso ColumnsService.
 */
describe('ColumnsService', () => {
  // Declaramos uma variável para manter a instância do nosso serviço.
  let service: ColumnsService;

  /**
   * 'beforeEach' é uma função que roda antes de CADA teste ('it') neste bloco.
   * É o lugar perfeito para criar uma nova instância "limpa" do nosso serviço
   * para cada teste, garantindo que um teste não interfira no outro.
   */
  beforeEach(async () => {
    // O 'Test.createTestingModule' cria um módulo de teste "falso",
    // imitando o sistema de módulos do NestJS.
    const module: TestingModule = await Test.createTestingModule({
      // Nós dizemos ao módulo de teste para "prover" nosso ColumnsService.
      providers: [ColumnsService],
    }).compile();

    // Pegamos a instância "fresca" do serviço do nosso módulo de teste.
    service = module.get<ColumnsService>(ColumnsService);
  });

  /**
   * O primeiro e mais simples teste: ele apenas verifica se o serviço
   * conseguiu ser criado sem erros.
   */
  it('should be defined', () => {
    // 'expect(service).toBeDefined()' significa: "Eu espero que a variável 'service' não seja nula ou indefinida."
    expect(service).toBeDefined();
  });

  /**
   * Teste para o método 'create'.
   * Ele verifica se, ao criar uma coluna, o serviço retorna um objeto
   * com os dados corretos e uma nova ID.
   */
  it('should create a new column correctly', () => {
    // 1. Arrange (Arranjo): Preparamos os dados de entrada para o teste.
    const newColumnData = { name: 'Coluna de Teste', boardId: 1 };
    
    // 2. Act (Ação): Executamos o método que queremos testar.
    const createdColumn = service.create(newColumnData);

    // 3. Assert (Afirmação): Verificamos se o resultado é o esperado.
    expect(createdColumn).toBeDefined(); // O resultado não é nulo.
    expect(createdColumn.id).toBeGreaterThan(0); // A coluna recebeu uma ID.
    expect(createdColumn.name).toEqual(newColumnData.name); // O nome está correto.
  });

  /**
   * Teste para o método 'findOne'.
   * Ele verifica se conseguimos encontrar uma das colunas padrão que existem no serviço.
   */
  it('should find an existing column by id', () => {
    const columnId = 1; // Sabemos que a coluna com ID 1 existe.
    const foundColumn = service.findOne(columnId);
    
    expect(foundColumn).toBeDefined();
    expect(foundColumn.id).toEqual(columnId);
  });

  /**
   * Teste para o cenário de erro do 'findOne'.
   * Ele verifica se o serviço lança a exceção correta (NotFoundException)
   * quando tentamos buscar uma coluna que não existe.
   */
  it('should throw a NotFoundException for a non-existing column', () => {
    const nonExistingId = 999;

    // Usamos uma função anônima () => ... para que o 'expect' possa "capturar" o erro.
    // 'toThrow' verifica se a função dentro do expect lança uma exceção.
    expect(() => service.findOne(nonExistingId)).toThrow(NotFoundException);
    
    // Podemos ser ainda mais específicos e verificar a mensagem do erro.
    expect(() => service.findOne(nonExistingId)).toThrow(
      `Coluna com ID #${nonExistingId} não encontrada.`,
    );
  });
});