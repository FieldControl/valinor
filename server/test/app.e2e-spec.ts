import { describe, it, expect } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('GraphQL AppResolver (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Deve listar os boards', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: '{ boards { id title } }',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.boards).toBeInstanceOf(Array);
      });
  });

  it('Deve criar uma coluna via Mutation', () => {
    const mutation = `
      mutation {
        createColumn(createColumnInput: { title: "Coluna E2E", boardId: 1 }) {
          id
          title
        }
      }
    `;

    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query: mutation })
      .expect(200)
      .expect((res) => {
        const data = res.body.data.createColumn;
        expect(data.title).toBe('Coluna E2E');
        expect(data.id).toBeDefined();
      });
  });
});
