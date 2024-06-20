import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from '../../Services/columns/columns.service';
import { ColumnsDto } from '../../DTO/columns.dto';
import { Columns } from '../../Entities/columns.entity';

describe('ColumnsController', () => {
  let controller: ColumnsController;
  let service: ColumnsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColumnsController],
      providers: [
        {
          provide: ColumnsService,
          useValue: {
            findAllColumns: jest.fn(),
            findOneColumn: jest.fn(),
            createColumn: jest.fn(),
            updateColumn: jest.fn(),
            removeColumn: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ColumnsController>(ColumnsController);
    service = module.get<ColumnsService>(ColumnsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllColumns', () => {
    it('should return an array of columns', async () => {
      const expectedColumns = [new Columns()];
      jest.spyOn(service, 'findAllColumns').mockResolvedValue(expectedColumns);

      const result = await controller.findAllColumns();
      expect(result).toEqual(expectedColumns);
    });
  });

  describe('findColumnByID', () => {
    it('should return a column by ID', async () => {
      const columnId = '1';
      const expectedColumn = new Columns();
      jest.spyOn(service, 'findOneColumn').mockResolvedValue(expectedColumn);

      const result = await controller.findColumnByID(columnId);
      expect(result).toEqual(expectedColumn);
    });
  });

  describe('createColumn', () => {
    it('should create a new column', async () => {
      const columnDto: ColumnsDto = { title: 'New Column' };
      const expectedColumn = new Columns();
      jest.spyOn(service, 'createColumn').mockResolvedValue(expectedColumn);

      const result = await controller.createColumn(columnDto);
      expect(result).toEqual(expectedColumn);
    });
  });

  describe('updateColumn', () => {
    it('should update a column', async () => {
      const columnId = '1';
      const columnDto: ColumnsDto = { title: 'Updated Column' };
      const expectedColumn = new Columns();
      jest.spyOn(service, 'updateColumn').mockResolvedValue(expectedColumn);

      const result = await controller.updateColumn(columnId, columnDto);
      expect(result).toEqual(expectedColumn);
    });
  });

  describe('deleteColumn', () => {
    it('should delete a column', async () => {
      const columnId = '1';
      jest.spyOn(service, 'removeColumn').mockResolvedValue(undefined);

      await controller.deleteColumn(columnId);
      expect(service.removeColumn).toHaveBeenCalledWith(columnId);
    });
  });
});
