import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeAll, describe, expect, test } from 'vitest';
import request from 'supertest';
import { AppModule } from 'src/infra/app.module';

describe('Create Project (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
  });

  test('[POST] /projects', async () => {
    const response = await request(app.getHttpServer()).post('/projects').send({
      title: 'Field Control 01',
    });

    expect(response.statusCode).toBe(201);
  });

  test('[GET] /projects', async () => {
    const response = await request(app.getHttpServer()).get('/projects');

    expect(response.statusCode).toBe(200);
  });

  test('[GET] /projects/:id', async () => {
    const responseProject = await request(app.getHttpServer())
      .post('/projects')
      .send({
        title: 'Field Control 05',
      });

    const response = await request(app.getHttpServer()).get(
      `/projects/${responseProject.body.id}`,
    );

    expect(response.statusCode).toBe(200);
  });

  test('[DELETE] /projects/:id', async () => {
    const responseProject = await request(app.getHttpServer())
      .post('/projects')
      .send({
        title: 'Field Control 05',
      });

    const response = await request(app.getHttpServer()).delete(
      `/projects/${responseProject.body.project.id}`,
    );

    expect(response.statusCode).toBe(200);
  });

  test('[PATCH] /projects/:id', async () => {
    const responseProject = await request(app.getHttpServer())
      .post('/projects')
      .send({
        title: 'Field Control 05',
      });

    const response = await request(app.getHttpServer())
      .patch(`/projects/${responseProject.body.project.id}`)
      .send({
        title: 'Field Control 06',
      });

    expect(response.statusCode).toBe(200);
  });
});
