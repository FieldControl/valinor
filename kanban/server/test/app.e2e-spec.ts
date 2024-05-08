import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AppService } from '../src/app.service';
import { INestApplication } from '@nestjs/common';

describe('Boards', () => {
  let app: INestApplication;
  const boardService = {
    findAll: () => [
      {
        id: 'b21bbc41-a753-4b93-ad03-aa1d5f93c4ac',
        title: 'Quadro Exemplo',
        createdAt: '2024-05-08T13:13:50.293Z',
        columns: [],
      },
    ],
    findOne: (id: string) => {
      if (id === '1') {
        return {
          id: '1',
          title: 'Quadro Exemplo',
          createdAt: '2024-05-08T13:13:50.293Z',
          updatedAt: '2024-05-08T13:13:56.438Z',
        };
      }
      return null;
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AppService)
      .useValue(boardService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/POST board`, () => {
    return request(app.getHttpServer())
      .post('/board')
      .send({
        id: 'b21bbc41-a753-4b93-ad03-aa1d5f93c4ac', // 'id' is not required
        title: 'Quadro Exemplo',
        createdAt: '2024-05-08T13:13:50.293Z',
      })
      .expect(201)
      .then((response) => {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('title', 'Quadro Exemplo');
      });
  });

  it(`/GET board`, () => {
    return request(app.getHttpServer())
      .get('/board')
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(boardService.findAll());
      });
  });

  it(`/GET board/1`, () => {
    return request(app.getHttpServer())
      .get('/board/1')
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual({
          error: 'Not Found',
          message: 'Board not found',
          statusCode: 404,
        });
      });
  });

  it(`/PATCH board/1`, () => {
    return request(app.getHttpServer())
      .patch('/board/1')
      .send({
        title: 'Quadro Exemplo',
      })
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual({
          error: 'Not Found',
          message: 'Board not found',
          statusCode: 404,
        });
      });
  });

  it(`/DELETE board/1`, () => {
    return request(app.getHttpServer())
      .delete('/board/1')
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual({
          error: 'Not Found',
          message: 'Board not found',
          statusCode: 404,
        });
      });
  });

  afterAll(async () => {
    await app.close();
  });
});

describe('Colmuns', () => {
  let app: INestApplication;
  const columnService = {
    findAll: () => [],
    findOne: (id: string) => {
      if (id === '1') {
        return {
          id: '1',
          title: 'Coluna Exemplo',
          createdAt: '2024-05-08T13:13:50.293Z',
          updatedAt: '2024-05-08T13:13:56.438Z',
          boardId: 'b21bbc41-a753-4b93-ad03-aa1d5f93c4ac',
        };
      }
      return null;
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AppService)
      .useValue(columnService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET column`, () => {
    return request(app.getHttpServer())
      .get('/column')
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(columnService.findAll());
      });
  });

  it(`/GET column/1`, () => {
    return request(app.getHttpServer())
      .get('/column/1')
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual({
          error: 'Not Found',
          message: 'Column not found',
          statusCode: 404,
        });
      });
  });

  it(`/POST column`, () => {
    return request(app.getHttpServer())
      .post('/column')
      .send({
        id: '991ed14e-42c6-4216-953a-8b10d686d747', // 'id' is not required
        title: 'Coluna Exemplo',
        boardId: 'b21bbc41-a753-4b93-ad03-aa1d5f93c4ac',
      })
      .expect(201)
      .then((response) => {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('title', 'Coluna Exemplo');
        expect(response.body).toHaveProperty(
          'boardId',
          'b21bbc41-a753-4b93-ad03-aa1d5f93c4ac',
        );
      });
  });

  it(`/PATCH column/1`, () => {
    return request(app.getHttpServer())
      .patch('/column/1')
      .send({
        title: 'Coluna Exemplo',
        boardId: 'b21bbc41-a753-4b93-ad03-aa1d5f93c4ac',
      })
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual({
          error: 'Not Found',
          message: 'Column not found',
          statusCode: 404,
        });
      });
  });

  it(`/DELETE column/1`, () => {
    return request(app.getHttpServer())
      .delete('/column/1')
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual({
          error: 'Not Found',
          message: 'Column not found',
          statusCode: 404,
        });
      });
  });

  afterAll(async () => {
    await app.close();
  });
});

describe('Tasks', () => {
  let app: INestApplication;
  const taskService = {
    findAll: () => [],
    findOne: (id: string) => {
      if (id === '1') {
        return {
          id: '1',
          title: 'Tarefa Exemplo',
          description: 'Descrição da tarefa exemplo',
          createdAt: '2024-05-08T13:13:50.293Z',
          updatedAt: '2024-05-08T13:13:56.438Z',
          columnId: 'b21bbc41-a753-4b93-ad03-aa1d5f93c4ac',
        };
      }
      return null;
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AppService)
      .useValue(taskService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET task`, () => {
    return request(app.getHttpServer())
      .get('/task')
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(taskService.findAll());
      });
  });

  it(`/GET task/1`, () => {
    return request(app.getHttpServer())
      .get('/task/1')
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual({
          error: 'Not Found',
          message: 'Task not found',
          statusCode: 404,
        });
      });
  });

  // it(`/POST task`, () => {
  //   return request(app.getHttpServer())
  //     .post('/task')
  //     .send({
  //       id: 'b21bbc41-a753-4b93-ad03-aa1d5f93c4ac', // 'id' is not required
  //       title: 'Tarefa Exemplo',
  //       description: 'Descrição da tarefa exemplo',
  //       columnId: '991ed14e-42c6-4216-953a-8b10d686d747',
  //     })
  //     .expect(201)
  //     .then((response) => {
  //       expect(response.body).toHaveProperty('id');
  //       expect(response.body).toHaveProperty('title', 'Tarefa Exemplo');
  //       expect(response.body).toHaveProperty(
  //         'columnId',
  //         '991ed14e-42c6-4216-953a-8b10d686d747',
  //       );
  //     });
  // });

  it(`/PATCH task/1`, () => {
    return request(app.getHttpServer())
      .patch('/task/1')
      .send({
        title: 'Tarefa Exemplo',
        description: 'Descrição da tarefa exemplo',
        columnId: 'b21bbc41-a753-4b93-ad03-aa1d5f93c4ac',
      })
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual({
          error: 'Not Found',
          message: 'Task not found',
          statusCode: 404,
        });
      });
  });

  it(`/DELETE task/1`, () => {
    return request(app.getHttpServer())
      .delete('/task/1')
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual({
          error: 'Not Found',
          message: 'Task not found',
          statusCode: 404,
        });
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
