import { Test, TestingModule } from '@nestjs/testing';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';
import { Badge } from './entities/badge.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('BadgesController', () => {
  let controller: BadgesController;
  let service: BadgesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BadgesController],
      providers: [
        BadgesService,
        {
          provide: getRepositoryToken(Badge),
          useClass: Repository
        }
      ],
    }).compile();

    controller = module.get<BadgesController>(BadgesController);
    service = module.get<BadgesService>(BadgesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new badge', async () => {
      const createBadgeDto: CreateBadgeDto = {
        name: 'Test Badge',
        color: 'blue',
      };

      const createdBadge: Badge = {
        id: expect.any(String),
        name: 'Test Badge',
        color: 'blue',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      };

      jest.spyOn(service, 'create').mockResolvedValueOnce(createdBadge);

      const result = await controller.create(createBadgeDto);
      expect(result.badge.id).toHaveLength(36);
      expect(result.badge.name).toEqual(createdBadge.name);
      expect(result.badge.color).toEqual(createdBadge.color);
      expect(result.message).toEqual('Badge criada com sucesso !');
    });
  });

  describe('find', () => {
    it('should return an array of badges', async () => {
      const badges: Badge[] = [
        {id: '1', name: 'Badge 1', color: 'red', createdAt: new Date().toISOString(),updatedAt: new Date().toISOString(),deletedAt: null},
        {id: '2', name: 'Badge 2', color: 'green',createdAt: new Date().toISOString(),updatedAt: new Date().toISOString(),deletedAt: null},
      ];

      jest.spyOn(service, 'findAll').mockResolvedValueOnce(badges);

      const result = await controller.findAll();

      expect(result).toEqual(badges);
    });
    it('should return a badge by id', async () => {
      const id = '1';
      const badge: Badge = { id: '1', name: 'Test Badge', color: 'blue', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null };
  
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(badge);
  
      const result = await controller.findOne(id);
  
      expect(result).toEqual(badge);
    });
  });

  describe('update', () => {
    it('should update a badge', async () => {
      const id = '1';
      const updateBadgeDto: UpdateBadgeDto = { name: 'Updated Badge', color: 'green' };

      const updatedBadge: Badge = { id: '1', name: 'Updated Badge', color: 'green', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null };

      jest.spyOn(service, 'update').mockResolvedValueOnce(updatedBadge as any);

      const result = await controller.update(id, updateBadgeDto);

      expect(result).toEqual({
        badge: updatedBadge,
        message: 'Badge alterada com sucesso',
      });
    });
  });

  describe('remove', () => {
    it('should delete a badge', async () => {
      const id = '1';
      const badgeToRemove: Badge = { id: '1', name: 'Test Badge', color: 'blue', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null };

      jest.spyOn(service, 'remove').mockResolvedValueOnce(badgeToRemove as any);

      const result = await controller.remove(id);

      expect(result).toEqual({
        badge: badgeToRemove,
        message: 'Badge deletada com sucesso',
      });
    });
  });
});
