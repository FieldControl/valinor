import { Column } from '@prisma/client';
import { randomUUID } from 'crypto';
import { CreateColumnDto } from 'src/columns/dto/create-column.dto';
import { UpdateColumnDto } from 'src/columns/dto/update-column.dto';

export const columnMock: Column = {
  id: randomUUID(),
  title: 'Created column',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const updatedColumnMock: Column = {
  id: columnMock.id,
  title: 'Updated column',
  createdAt: columnMock.createdAt,
  updatedAt: columnMock.updatedAt,
};

export const createColumnDto: CreateColumnDto = {
  title: 'Created column',
};

export const updateColumnDto: UpdateColumnDto = {
  title: 'Updated column',
};
