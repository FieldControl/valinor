import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from './cards.service';
import { NotFoundException } from '@nestjs/common';

/**
 * Agrupa todos os testes relacionados ao nosso CardsService.
 */
describe('CardsService', () => {
  let service: CardsService;

  /**
   * Roda antes de cada teste, criando uma nova instância limpa do serviço.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardsService],
    }).compile();

    service = module.get<CardsService>(CardsService);
  });

  /**
   * Teste 1: Verifica se o serviço foi criado com sucesso.
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * Teste 2: Verifica a lógica de criação de um novo card.
   */
  it('should create a new card with the correct data', () => {
    // Arrange: Preparamos os dados de entrada.
    const newCardData = {
      title: 'Card de Teste',
      columnId: 1,
      badge: 'medium' as 'medium', // Usamos 'as' para garantir o tipo correto.
      description: 'Descrição do teste',
    };

    // Act: Executamos o método a ser testado.
    const createdCard = service.create(newCardData);

    // Assert: Verificamos se o resultado é o esperado.
    expect(createdCard).toBeDefined();
    expect(createdCard.id).toEqual(1); // Esperamos que a primeira ID seja 1.
    expect(createdCard.title).toEqual(newCardData.title);
    expect(createdCard.badge).toEqual(newCardData.badge);
  });

  /**
   * Teste 3: Verifica se o método 'findOne' encontra um card existente.
   * Este teste depende que o teste anterior (create) funcione.
   */
  it('should find an existing card by id', () => {
    // Arrange: Primeiro, criamos um card para que ele exista no "banco de dados".
    const newCardData = { title: 'Card para Busca', columnId: 1, badge: 'low' as 'low' };
    const createdCard = service.create(newCardData);
    
    // Act: Buscamos pelo card que acabamos de criar.
    const foundCard = service.findOne(createdCard.id);

    // Assert: Verificamos se o card encontrado é o correto.
    expect(foundCard).toBeDefined();
    expect(foundCard.id).toEqual(createdCard.id);
  });

  /**
   * Teste 4: Verifica se o 'findOne' lança um erro para uma ID que não existe.
   */
  it('should throw a NotFoundException when searching for a non-existing card', () => {
    const nonExistingId = 999;

    // Assert: Verificamos se chamar findOne com uma ID inválida lança a exceção correta.
    // Usamos a função anônima () => ... para permitir que o Jest "capture" o erro.
    expect(() => service.findOne(nonExistingId)).toThrow(NotFoundException);
    
    // Podemos também verificar a mensagem exata do erro.
    expect(() => service.findOne(nonExistingId)).toThrow(
      `Card com ID #${nonExistingId} não encontrado.`,
    );
  });
});