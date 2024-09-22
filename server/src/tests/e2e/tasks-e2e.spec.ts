import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '../../app.module';
import { TasksService } from '../../tasks/tasks.service';

import {
  taskMock,
  createTaskDto,
  updateTaskDto,
  updatedTaskMock,
} from '../mocks/tasks.mocks';

describe('TasksController (e2e)', () => {
  let app: INestApplication;

  const tasksServiceMock = {
    create: () => taskMock,
    findAll: () => [taskMock],
    findOne: () => taskMock,
    update: () => updatedTaskMock,
    remove: () => null,
  };

  beforeAll(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TasksService)
      .useValue(tasksServiceMock)
      .compile();

    app = testModule.createNestApplication();
    await app.init();
  });

  it('/tasks POST', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send(createTaskDto)
      .expect(201)
      .expect({
        ...taskMock,
        createdAt: taskMock.createdAt.toISOString(),
        updatedAt: taskMock.updatedAt.toISOString(),
      });
  });

  it('/tasks GET', () => {
    return request(app.getHttpServer())
      .get('/tasks')
      .expect(200)
      .expect([
        {
          ...taskMock,
          createdAt: taskMock.createdAt.toISOString(),
          updatedAt: taskMock.updatedAt.toISOString(),
        },
      ]);
  });

  it('/tasks/:id GET', () => {
    return request(app.getHttpServer())
      .get(`/tasks/${taskMock.id}`)
      .expect(200)
      .expect({
        ...taskMock,
        createdAt: taskMock.createdAt.toISOString(),
        updatedAt: taskMock.updatedAt.toISOString(),
      });
  });

  it('/tasks/:id PATCH', () => {
    return request(app.getHttpServer())
      .patch(`/tasks/${taskMock.id}`)
      .send(updateTaskDto)
      .expect(200)
      .expect({
        ...updatedTaskMock,
        createdAt: taskMock.createdAt.toISOString(),
        updatedAt: taskMock.updatedAt.toISOString(),
      });
  });

  it('/tasks/:id DELETE', () => {
    return request(app.getHttpServer())
      .delete(`/tasks/${taskMock.id}`)
      .expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
