import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '../../app.module';
import { ColumnsService } from '../../columns/columns.service';

import {
  columnMock,
  createColumnDto,
  updateColumnDto,
  updatedColumnMock,
} from '../mocks/columns.mocks';

describe('ColumnsController (e2e)', () => {
  let app: INestApplication;

  const columnsServiceMock = {
    create: () => columnMock,
    findAll: () => [columnMock],
    findOne: () => columnMock,
    update: () => updatedColumnMock,
    remove: () => null,
  };

  beforeAll(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ColumnsService)
      .useValue(columnsServiceMock)
      .compile();

    app = testModule.createNestApplication();
    await app.init();
  });

  it('/columns POST', () => {
    return request(app.getHttpServer())
      .post('/columns')
      .send(createColumnDto)
      .expect(201)
      .expect({
        ...columnMock,
        createdAt: columnMock.createdAt.toISOString(),
        updatedAt: columnMock.updatedAt.toISOString(),
      });
  });

  it('/columns GET', () => {
    return request(app.getHttpServer())
      .get('/columns')
      .expect(200)
      .expect([
        {
          ...columnMock,
          createdAt: columnMock.createdAt.toISOString(),
          updatedAt: columnMock.updatedAt.toISOString(),
        },
      ]);
  });

  it('/columns/:id GET', () => {
    return request(app.getHttpServer())
      .get(`/columns/${columnMock.id}`)
      .expect(200)
      .expect({
        ...columnMock,
        createdAt: columnMock.createdAt.toISOString(),
        updatedAt: columnMock.updatedAt.toISOString(),
      });
  });

  it('/columns/:id PATCH', () => {
    return request(app.getHttpServer())
      .patch(`/columns/${columnMock.id}`)
      .send(updateColumnDto)
      .expect(200)
      .expect({
        ...updatedColumnMock,
        createdAt: columnMock.createdAt.toISOString(),
        updatedAt: columnMock.updatedAt.toISOString(),
      });
  });

  it('/columns/:id DELETE', () => {
    return request(app.getHttpServer())
      .delete(`/columns/${columnMock.id}`)
      .expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
