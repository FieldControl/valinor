import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import * as request from 'supertest';
import { bootstrapDatabase } from '../bootstrap-database';

jest.setTimeout(30000);

describe('ColumnsController (e2e)', () => {
  let app: INestApplication;
  const db = bootstrapDatabase();

  beforeAll(async () => {
    await db.setup();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forFeature(() => ({
          DATABASE_NAME: db.name,
        })),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await db.teardown();
  });

  test('[POST] /columns', async () => {
    const response = await request(app.getHttpServer())
      .post('/columns')
      .send({ name: 'worst gym exercises' });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      id: 2,
      name: 'worst gym exercises',
    });
  });

  test('[GET] /columns', async () => {
    const response = await request(app.getHttpServer()).get('/columns').send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body).toEqual([
      expect.objectContaining({ name: 'best gym exercises' }),
      expect.objectContaining({ name: 'worst gym exercises' }),
    ]);
  });

  test('[DELETE] /columns/:id', async () => {
    const response = await request(app.getHttpServer())
      .delete('/columns/2')
      .send();

    expect(response.statusCode).toBe(200);
  });

  test('[PATCH] /columns/:id', async () => {
    const response = await request(app.getHttpServer())
      .patch('/columns/1')
      .send({ name: 'Best gym exercises!' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      id: 1,
      name: 'Best gym exercises!',
    });
  });
});
