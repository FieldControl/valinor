import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsService } from './columns.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Column } from '../entities/column.entity';

describe('ColumnsService', () => {
  let service: ColumnsService;
  let repository: Repository<Column>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnsService,
        {
          provide: getRepositoryToken(Column),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ColumnsService>(ColumnsService);
    repository = module.get<Repository<Column>>(getRepositoryToken(Column));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all columns', async () => {
    const mockColumns = [{ id: 1, title: 'Column 1', cards: [] }];
    jest.spyOn(repository, 'find').mockResolvedValue(mockColumns);

    expect(await service.findAll()).toEqual(mockColumns);
  });

  it('should create a column', async () => {
    const mockColumn = { id: 1, title: 'Column 1', cards: [] }; // Mock da coluna criada
  
    jest.spyOn(repository, 'create').mockReturnValue(mockColumn as Column); // Mock do método create
    jest.spyOn(repository, 'save').mockResolvedValue(mockColumn); // Mock do método save
  
    expect(await service.create('Column 1')).toEqual(mockColumn); // Verifica o resultado
  });
  

  it('should delete a column', async () => {
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 } as any);

    expect(await service.delete(1)).toEqual({ message: 'Column deleted successfully' });
  });

  it('should throw an error if column not found on delete', async () => {
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 0 } as any);

    await expect(service.delete(1)).rejects.toThrow('Column not found');
  });
});
