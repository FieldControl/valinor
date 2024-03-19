import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeAll, describe, expect, test } from 'vitest';
import request from 'supertest';
import { AppModule } from 'src/infra/app.module';

describe('Create Column (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
  });

  test('[POST] /column', async () => {
    const responseProject = await request(app.getHttpServer())
      .post('/projects')
      .send({
        title: 'Field Control',
      });

    const response = await request(app.getHttpServer()).post('/column').send({
      title: 'TO DO',
      projectId: responseProject.body.project.id,
    });

    expect(response.statusCode).toBe(201);
  });

  test('[GET] /column', async () => {
    const response = await request(app.getHttpServer()).get('/column');

    expect(response.statusCode).toBe(200);
  });

  test('[GET] /column/:id', async () => {
    const responseColumn = await request(app.getHttpServer())
      .post('/column')
      .send({
        title: 'DONE',
      });

    const response = await request(app.getHttpServer()).get(
      `/column/${responseColumn.body.id}`,
    );

    expect(response.statusCode).toBe(200);
  });

  test('[DELETE] /column/:id', async () => {
    const createProjectResponse = await request(app.getHttpServer())
      .post('/projects')
      .send({
        title: 'Field Control 05',
      });

    const responseCreateColumn = await request(app.getHttpServer())
      .post('/column')
      .send({
        title: 'Field Control 05',
        projectId: createProjectResponse.body.project.id,
      });

    const response = await request(app.getHttpServer()).delete(
      `/column/${responseCreateColumn.body.column.id}`,
    );
    expect(response.statusCode).toBe(200);
  });

  test('[PATCH] /column/:id', async () => {
    const responseProject = await request(app.getHttpServer())
      .post('/projects')
      .send({
        title: 'Field Control',
      });

    const responseColumn = await request(app.getHttpServer())
      .post('/column')
      .send({
        title: 'TO DO',
        projectId: responseProject.body.project.id,
      });

    const response = await request(app.getHttpServer())
      .patch(`/column/${responseColumn.body.column.id}`)
      .send({
        title: 'Field Control 06',
      });

    expect(response.statusCode).toBe(200);
  });
});
