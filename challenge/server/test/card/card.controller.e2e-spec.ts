import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import * as request from 'supertest';
import { bootstrapDatabase } from '../bootstrap-database';

jest.setTimeout(30000);

describe('CardsController (e2e)', () => {
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

  test('[POST] /cards', async () => {
    const response = await request(app.getHttpServer()).post('/cards').send({
      columnId: 1,
      title: 'Lateral raises',
      description: 'Best shoulder exercise',
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      columnId: 1,
      title: 'Lateral raises',
      id: 3,
      description: 'Best shoulder exercise',
    });
  });

  test('[GET] /cards/:columnId', async () => {
    const response = await request(app.getHttpServer()).get('/cards/1').send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body).toEqual([
      expect.objectContaining({ title: 'Incline dumbbell press' }),
      expect.objectContaining({ title: 'Squats' }),
      expect.objectContaining({ title: 'Lateral raises' }),
    ]);
  });

  test('[DELETE] /cards/:id', async () => {
    const response = await request(app.getHttpServer())
      .delete('/cards/1')
      .send();

    expect(response.statusCode).toBe(200);
  });

  test('[PATCH] /cards/:id', async () => {
    const response = await request(app.getHttpServer()).patch('/cards/3').send({
      title: 'Cable lateral raises',
      description: 'Best shoulder exercise',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      columnId: 1,
      title: 'Cable lateral raises',
      id: 3,
      description: 'Best shoulder exercise',
    });
  });
});
