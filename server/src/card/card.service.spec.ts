import { Test, TestingModule } from '@nestjs/testing';
import { CardService } from './card.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CardService', () => {
  let service: CardService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockCard = {
    sr_id: 1,
    vc_name: 'Test Card',
    vc_description: 'Test Description',
    fk_columnId: 1,
    fk_userId: 1,
    fk_assignedUserId: 1,
    dt_createdAt: new Date('2023-01-01'),
    assignedUser: {
      sr_id: 1,
      vc_name: 'Test User',
    },
  };

  beforeEach(async () => {
    const mockPrismaService = {
      card: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CardService>(CardService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a card with description', async () => {
      const input = {
        name: 'New Card',
        description: 'Card Description',
        columnId: 1,
      };
      const userId = 1;

      prismaService.card.create.mockResolvedValue(mockCard);

      const result = await service.create(input, userId);

      expect(result).toEqual({
        id: mockCard.sr_id,
        name: mockCard.vc_name,
        description: mockCard.vc_description,
        columnId: mockCard.fk_columnId,
        assignedUserId: mockCard.fk_assignedUserId,
        assignedUserName: mockCard.assignedUser.vc_name,
        createdAt: mockCard.dt_createdAt,
      });

      expect(prismaService.card.create).toHaveBeenCalledWith({
        data: {
          vc_name: input.name,
          vc_description: input.description,
          fk_columnId: input.columnId,
          fk_userId: userId,
        },
        include: {
          assignedUser: {
            select: {
              sr_id: true,
              vc_name: true,
            },
          },
        },
      });
    });

    it('should create a card without description', async () => {
      const input = {
        name: 'New Card',
        columnId: 1,
      };
      const userId = 1;
      const cardWithoutDescription = { ...mockCard, vc_description: null };

      prismaService.card.create.mockResolvedValue(cardWithoutDescription);

      const result = await service.create(input, userId);

      expect(result.description).toBeNull();
    });
  });

  describe('moveCard', () => {
    it('should move a card to a different column', async () => {
      const cardId = 1;
      const newColumnId = 2;
      const movedCard = { ...mockCard, fk_columnId: newColumnId };

      prismaService.card.update.mockResolvedValue(movedCard);

      const result = await service.moveCard(cardId, newColumnId);

      expect(result.columnId).toBe(newColumnId);
      expect(prismaService.card.update).toHaveBeenCalledWith({
        where: { sr_id: cardId },
        data: { fk_columnId: newColumnId },
        include: {
          assignedUser: {
            select: {
              sr_id: true,
              vc_name: true,
            },
          },
        },
      });
    });
  });

  describe('update', () => {
    it('should update card name, description and assigned user', async () => {
      const updateInput = {
        name: 'Updated Card',
        description: 'Updated Description',
        assignedUserId: 2,
      };
      const updatedCard = {
        ...mockCard,
        vc_name: updateInput.name,
        vc_description: updateInput.description,
        fk_assignedUserId: updateInput.assignedUserId,
      };

      prismaService.card.update.mockResolvedValue(updatedCard);

      const result = await service.update(1, updateInput);

      expect(result.name).toBe(updateInput.name);
      expect(result.description).toBe(updateInput.description);
      expect(result.assignedUserId).toBe(updateInput.assignedUserId);
    });

    it('should allow setting description to null', async () => {
      const updateInput = {
        description: null,
      };
      const updatedCard = { ...mockCard, vc_description: null };

      prismaService.card.update.mockResolvedValue(updatedCard);

      const result = await service.update(1, updateInput);

      expect(result.description).toBeNull();
    });
  });
});
