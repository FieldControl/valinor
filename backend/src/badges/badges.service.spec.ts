import { Test, TestingModule } from '@nestjs/testing';
import { BadgesService } from './badges.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { Badge } from './entities/badge.entity';

describe('BadgesService', () => {
  let service: BadgesService;
  let repository: Repository<Badge>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BadgesService,
        {
          provide: getRepositoryToken(Badge),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<BadgesService>(BadgesService);
    repository = module.get<Repository<Badge>>(getRepositoryToken(Badge));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new badge', async () => {
      const createBadgeDto: CreateBadgeDto = {
        name: 'Test Badge',
        color: 'blue',
      };

      const savedBadge: Badge = {
        id: '1',
        name: 'Test Badge',
        color: 'blue',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null
      };

      jest.spyOn(repository, 'save').mockResolvedValueOnce(savedBadge);

      const result = await service.create(createBadgeDto);

      expect(result).toEqual(savedBadge);
    });
  });

  describe('find', () => {
    it('should return an array of badges', async () => {
      const badges: Badge[] = [
        { id: '1', name: 'Badge 1', color: 'blue', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null},
        { id: '2', name: 'Badge 2', color: 'red', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null },
      ];

      jest.spyOn(repository, 'find').mockResolvedValueOnce(badges);

      const result = await service.findAll();

      expect(result).toEqual(badges);
    });

    it('should return a badge by id', async () => {
      const id = '1';
      const badge: Badge = { id:'1', name: 'Test Badge', color: 'blue', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null };
  
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(badge);
  
      const result = await service.findOne(id);
  
      expect(result).toEqual(badge);
    });
  });

  describe('update', () => {
    it('should update a badge', async () => {
      const id = '1';
      const updateData: Partial<Badge> = { name: 'Updated Badge' };

      jest.spyOn(repository, 'update').mockResolvedValueOnce(updateData as any);
      const updatedBadge: Badge = { id, name: 'Teste Badge', color: 'blue', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(updatedBadge);

      const result = await service.update(id, updateData);

      expect(result).toEqual(updatedBadge);
    });
  });

  describe('remove', () => {
    it('should delete a badge', async () => {
      const id = '1';
      const badgeToRemove: Badge = { id: '1', name: 'Test Badge', color: 'blue', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null };

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(badgeToRemove);
      jest.spyOn(repository, 'delete').mockResolvedValueOnce(undefined);

      const result = await service.remove(id);

      expect(result).toEqual(badgeToRemove);
    });
  });
});
