import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { CardResolver } from './card.resolver.js';
import { CardService } from './card.service.js';

const mockCardService = {
  create: jest.fn((dto) => ({ id: 1, ...dto })),
  update: jest.fn((id, dto) => ({ id, ...dto })),
  remove: jest.fn((id) => ({ id, isArchived: true })),
};

describe('CardResolver', () => {
  let resolver: CardResolver;
  let service: CardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardResolver,
        { provide: CardService, useValue: mockCardService },
      ],
    }).compile();

    resolver = module.get<CardResolver>(CardResolver);
    service = module.get<CardService>(CardService);
  });

  it('deve criar um card via mutation', async () => {
    const dto = { title: 'Card 1', columnId: 1 };
    const result = await resolver.createCard(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1, title: 'Card 1', columnId: 1 });
  });

  it('deve remover um card (arquivar)', async () => {
    const result = await resolver.removeCard(10);
    expect(service.remove).toHaveBeenCalledWith(10);
    expect(result.isArchived).toBe(true);
  });

  it('deve atualizar um card (mover)', async () => {
    const dto = { id: 1, columnId: 50 };
    await resolver.updateCard(dto);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });
});
