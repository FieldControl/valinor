import { Test, TestingModule } from '@nestjs/testing';
import { LanesService } from './lanes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Lane } from './entities/lane.entity';
import { DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { Board } from '../boards/entities/board.entity';

const mockLaneRepository = () => ({
  insert: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn()
});

describe('LanesService', () => {
  let service: LanesService;
  let repository: Repository<Lane>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        
      ],
      providers: [
        LanesService,
        {
          provide: getRepositoryToken(Lane),
          useFactory: mockLaneRepository,
        },
      ],
    }).compile();

    service = module.get<LanesService>(LanesService);
    repository = module.get<Repository<Lane>>(getRepositoryToken(Lane));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should insert a new lane', async () => {
      const createLaneDto = { name: 'Test Lane', boardId:1, order: 1, status:1, id:1 };
      jest.spyOn(repository, 'insert').mockResolvedValue({generatedMaps: [{
        id: 1,
        status: 1
      }],
      identifiers:[{id:1}],
      raw:[{id:1}],
     } as InsertResult);

      const result = await service.create(createLaneDto);
      expect(result.generatedMaps).toHaveLength(1);
      expect(result.generatedMaps[0].id).toBe(1);
      expect(repository.insert).toHaveBeenCalledWith(createLaneDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of lanes', async () => {
      const lanes = [{ name: 'Test Lane', boardId:1, order: 1, status:1, id:1 }] as Lane[];
      jest.spyOn(repository, 'find').mockResolvedValue(lanes);

      const result = await service.findAll();

      expect(result).toEqual(lanes);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single lane', async () => {
      const lane = { name: 'Test Lane', boardId:1, order: 1, status:1, id:1 } as Lane;
      jest.spyOn(repository, 'findOne').mockResolvedValue(lane);

      const result = await service.findOne(1);

      expect(result).toEqual(lane);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1, status:1 }, loadRelationIds:true });
    });
  });
  describe('update', () => {
    it('should update a single lane', async () => {
      const lane = { name: 'Test Lane', boardId:1, order: 1, status:1, id:1 } as Lane;
      jest.spyOn(repository, 'update').mockResolvedValue({
        affected:1,
        generatedMaps: [{
          id: 1,
          status: 1
        }],
        raw:[{id:1}],
      } as UpdateResult);

      const result = await service.update(1,lane);

      expect(result.affected).toBe(1);
      expect(repository.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete a single lane', async () => {
      const lane = { name: 'Test Lane', boardId:1, order: 1, status:1, id:1 } as Lane;
      jest.spyOn(repository, 'update').mockResolvedValue({
        affected:1,
        generatedMaps: [{
          id: 1,
          status: 1
        }],
        raw:[{id:1}],
      } as UpdateResult);

      const result = await service.remove(1);

      expect(result.affected).toBe(1);
      expect(repository.update).toHaveBeenCalled();
    });
  });
});