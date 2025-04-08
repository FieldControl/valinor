import { Test, TestingModule } from '@nestjs/testing';
import { KanbanService } from './kanban.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CardEntity } from './entities/CardEntity';
import { Repository, DeleteResult } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

const mockCard: CardEntity = {
  id: 1,
  title: 'Card Teste',
  description: 'Descrição',
  columnId: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('KanbanService', () => {
  let service: KanbanService;
  let repo: jest.Mocked<Repository<CardEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KanbanService,
        {
          provide: getRepositoryToken(CardEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<KanbanService>(KanbanService);
    repo = module.get(getRepositoryToken(CardEntity));
  });

  it('deve criar um card', async () => {
    const dto = { title: 'Novo', description: 'Desc', columnId: 1 };
    repo.create.mockReturnValue(dto as CardEntity);
    repo.save.mockResolvedValue(mockCard);

    const result = await service.createCard(dto);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.create).toHaveBeenCalledWith(dto);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.save).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockCard);
  });

  it('deve atualizar um card existente', async () => {
    repo.findOneBy.mockResolvedValue({ ...mockCard });
    repo.save.mockResolvedValue({ ...mockCard, title: 'Atualizado' });

    const result = await service.updateCard({
      id: 1,
      title: 'Atualizado',
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, title: 'Atualizado' }),
    );
    expect(result.title).toBe('Atualizado');
  });

  it('deve lançar erro ao atualizar card inexistente', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(
      service.updateCard({ id: 999, title: 'Falha' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve retornar um card por ID', async () => {
    repo.findOneBy.mockResolvedValue(mockCard);

    const result = await service.getCard(1);
    expect(result).toEqual(mockCard);
  });

  it('deve lançar erro se card não for encontrado por ID', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(service.getCard(999)).rejects.toThrow(NotFoundException);
  });

  it('deve retornar cards por columnId', async () => {
    repo.find.mockResolvedValue([mockCard]);

    const result = await service.getCardsByColumnId(2);
    expect(result).toEqual([mockCard]);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.find).toHaveBeenCalledWith({
      where: { columnId: 2 },
      order: { updatedAt: 'DESC' },
    });
  });

  it('deve lançar erro se nenhum card for encontrado por columnId', async () => {
    repo.find.mockResolvedValue([]);

    await expect(service.getCardsByColumnId(2)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve deletar um card existente', async () => {
    repo.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

    const result = await service.deleteCard(1);
    expect(result).toBe(true);
  });

  it('deve lançar erro ao tentar deletar um card inexistente', async () => {
    repo.delete.mockResolvedValue({ affected: 0 } as DeleteResult);

    await expect(service.deleteCard(999)).rejects.toThrow(NotFoundException);
  });
});
