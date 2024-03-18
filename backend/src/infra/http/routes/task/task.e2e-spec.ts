import { INestApplication } from '@nestjs/common';
import { beforeAll, describe, expect, test } from 'vitest';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/infra/app.module';

describe('Create Task (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
  });

  test('[POST] /tasks', async () => {
    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .send({
        title: 'Field Control',
      });

    const columnResponse = await request(app.getHttpServer())
      .post('/column')
      .send({
        title: 'To Do',
        projectId: projectResponse.body.project.id,
      });

    const response = await request(app.getHttpServer()).post('/tasks').send({
      title: 'Create React APP - Landing Page',
      description: 'Create a landing page for the Create React App',
      archived: false,
      columnId: columnResponse.body.column.id,
      projectId: projectResponse.body.project.id,
    });

    expect(response.statusCode).toBe(201);
  });

  test('[GET] /tasks', async () => {
    const response = await request(app.getHttpServer()).get('/projects');

    expect(response.statusCode).toBe(200);
  });

  test('[GET] /tasks/:id', async () => {
    const responseTasks = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Field Control 05',
      });

    const response = await request(app.getHttpServer()).get(
      `/tasks/${responseTasks.body.id}`,
    );

    expect(response.statusCode).toBe(200);
  });

  test('[GET] /tasks?columnId', async () => {
    const responseTasks = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Field Control 05',
      });

    const response = await request(app.getHttpServer()).get(
      `/tasks?columnId=${responseTasks.body.columnId}`,
    );

    expect(response.statusCode).toBe(200);
  });

  test('[DELETE] /tasks/:id', async () => {
    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .send({
        title: 'Field Control',
      });

    const columnResponse = await request(app.getHttpServer())
      .post('/column')
      .send({
        title: 'To Do',
        projectId: projectResponse.body.project.id,
      });

    const responseTasks = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Create React APP - Landing Page',
        description: 'Create a landing page for the Create React App',
        archived: false,
        columnId: columnResponse.body.column.id,
        projectId: projectResponse.body.project.id,
      });

    const response = await request(app.getHttpServer()).delete(
      `/tasks/${responseTasks.body.task.id}`,
    );

    expect(response.statusCode).toBe(200);
  });

  test('[PATCH] /tasks/:id', async () => {
    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .send({
        title: 'Field Control',
      });

    const columnResponse = await request(app.getHttpServer())
      .post('/column')
      .send({
        title: 'To Do',
        projectId: projectResponse.body.project.id,
      });

    const responseTasks = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Create React APP - Landing Page',
        description: 'Create a landing page for the Create React App',
        archived: false,
        columnId: columnResponse.body.column.id,
        projectId: projectResponse.body.project.id,
      });

    const response = await request(app.getHttpServer())
      .patch(`/tasks/${responseTasks.body.task.id}`)
      .send({
        title: 'Field Control 06',
      });

    expect(response.statusCode).toBe(200);
  });
});
