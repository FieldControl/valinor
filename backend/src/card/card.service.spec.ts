import { Test, TestingModule } from '@nestjs/testing';
import { CardService } from './card.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { SwimlaneService } from 'src/swimlane/swimlane.service';
import { UserService } from 'src/user/user.service';
import { UnauthorizedException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ReorderedCardDto } from './dto/reorder-cards.dto';
import { User } from 'src/user/entities/user.entity';
import { Swimlane } from 'src/swimlane/entities/swimlane.entity';

const mockCardRepository = {
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findOneBy: jest.fn(),
};

const mockSwimlaneService = {
  hasAccessToSwimlane: jest.fn(),
};

const mockUserService = {
  isConnectedToSwimlane: jest.fn(),
  isConnectedToBoard: jest.fn(),
};

describe('CardService', () => {
  let service: CardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        {
          provide: getRepositoryToken(Card),
          useValue: mockCardRepository,
        },
        {
          provide: SwimlaneService,
          useValue: mockSwimlaneService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<CardService>(CardService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Limpa os mocks após cada teste
  });

  describe('create', () => {
    it('should create a card successfully', async () => {
      const createCardDto: CreateCardDto = {
        name: 'Test Card',
        content: 'This is a test card content',
        swimlaneId: 1,
        order: 1,
      };
      const userId = 1;

      mockSwimlaneService.hasAccessToSwimlane.mockResolvedValue(true);
      mockCardRepository.save.mockResolvedValue(createCardDto);

      const result = await service.create(createCardDto, userId);
      expect(result).toEqual(createCardDto);
      expect(mockCardRepository.save).toHaveBeenCalledWith(expect.any(Card));
    });

    it('should throw UnauthorizedException if user does not have access to swimlane', async () => {
      const createCardDto: CreateCardDto = {
        name: 'Test Card',
        content: 'This is a test card content',
        swimlaneId: 1,
        order: 1,
      };
      const userId = 1;

      mockSwimlaneService.hasAccessToSwimlane.mockResolvedValue(false);

      await expect(service.create(createCardDto, userId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('update', () => {
    it('should update a card successfully', async () => {
      const updateCardDto: UpdateCardDto = {
        name: 'Updated Card',
        content: 'Updated content',
        swimlaneId: 1,
      };
      const userId = 1;
      const cardId = 1;

      mockUserService.isConnectedToSwimlane.mockResolvedValue(true);
      mockCardRepository.update.mockResolvedValue(undefined); // Simula o retorno do update

      await service.update(cardId, userId, updateCardDto);
      expect(mockCardRepository.update).toHaveBeenCalledWith(cardId, {
        name: updateCardDto.name,
        content: updateCardDto.content,
      });
    });
  });

  describe('remove', () => {
    it('should remove a card successfully', async () => {
      const userId = 1;
      const cardId = 1;

      mockCardRepository.findOneBy.mockResolvedValue({ swimlaneId: 1 });
      mockUserService.isConnectedToSwimlane.mockResolvedValue(true);
      mockCardRepository.delete.mockResolvedValue(undefined);

      await service.remove(cardId, userId);
      expect(mockCardRepository.delete).toHaveBeenCalledWith(cardId);
    });
  });

  describe('updateCardOrdersAndSwimlanes', () => {
    it('should update card orders and swimlanes successfully', async () => {
      const userId = 1;
      const reorder: ReorderedCardDto = {
        boardId: 1,
        cards: [
          {
            id: 1, order: 1, swimlaneId: 1,
            name: '',
            content: '',
            assigneId: 0,
            assigne: new User,
            swimlane: new Swimlane
          }, // Supondo que Card tenha essas propriedades
          {
            id: 2, order: 2, swimlaneId: 1,
            name: '',
            content: '',
            assigneId: 0,
            assigne: new User,
            swimlane: new Swimlane
          },
        ],
      };
  
      // Simule que o usuário está conectado ao quadro
      mockUserService.isConnectedToBoard.mockResolvedValue(true);
      // Simule o retorno do método update
      mockCardRepository.update.mockResolvedValue(undefined); // Simulação do retorno do update
  
      const result = await service.updateCardOrdersAndSwimlanes(reorder, userId);
  
      // Verifique se a função foi chamada duas vezes (uma para cada cartão)
      expect(mockCardRepository.update).toHaveBeenCalledTimes(2);
      // Verifique se a função foi chamada com os parâmetros corretos
      expect(mockCardRepository.update).toHaveBeenCalledWith(1, {
        order: 1,
        swimlaneId: 1,
      });
      expect(mockCardRepository.update).toHaveBeenCalledWith(2, {
        order: 2,
        swimlaneId: 1,
      });
      expect(result).toBe(true);
    });
  });
  
  
});
