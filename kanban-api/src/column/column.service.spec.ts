import { Test, TestingModule } from '@nestjs/testing';
import { ColumnService } from './column.service';
import { Column } from './column.entity';
import { Board } from '../board/board.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

describe('ColumnService', () => {
  let service: ColumnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnService,
        {
          provide: getRepositoryToken(Column),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Board),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(() => ({
              manager: {
                getRepository: jest.fn(),
              },
            })),
          },
        },
      ],
    }).compile();

    service = module.get<ColumnService>(ColumnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
