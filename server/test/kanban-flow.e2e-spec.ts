import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

describe('Kanban Flow (E2E)', () => {
  let app: INestApplication;
  let boardId: number;
  let colToDoId: number;
  let colDoneId: number;
  let cardId: number;

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

  // 1. Criar Board (COM DEBUG)
  it('Deve criar um novo Board', () => {
    const mutation = `
      mutation {
        createBoard(createBoardInput: { title: "Board E2E ${Date.now()}" }) { id title }
      }
    `;
    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query: mutation })
      .expect((res) => {
        // --- BLOCO DE DEBUG ---
        if (res.status !== 200)
          console.error(
            '🚨 ERRO NO TESTE (Create Board):',
            JSON.stringify(res.body, null, 2),
          );
      })
      .expect(200)
      .expect((res) => {
        boardId = res.body.data.createBoard.id;
        expect(boardId).toBeDefined();
      });
  });

  // 2. Criar Colunas
  it('Deve criar colunas no Board', async () => {
    // Se o boardId não foi criado no passo anterior, este teste vai falhar.
    if (!boardId) throw new Error('Board ID não foi gerado no teste anterior');

    const mutToDo = `
      mutation {
        createColumn(createColumnInput: { title: "To Do", boardId: ${boardId} }) { id }
      }
    `;
    const mutDone = `
      mutation {
        createColumn(createColumnInput: { title: "Done", boardId: ${boardId} }) { id }
      }
    `;

    // Cria a primeira
    await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: mutToDo })
      .expect((res) => {
        if (res.status !== 200) 
          console.error(
            '🚨 ERRO (Create Column 1):',
            JSON.stringify(res.body, null, 2),
          );
      })
      .expect(200)
      .then((res) => {
        colToDoId = res.body.data.createColumn.id;
      });

    // Cria a segunda
    await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: mutDone })
      .expect(200)
      .then((res) => {
        colDoneId = res.body.data.createColumn.id;
      });
  });

  // 3. Criar Card
  it('Deve criar um card na coluna To Do', () => {
    if (!colToDoId) throw new Error('Column ID não foi gerado');

    const mutation = `
      mutation {
        createCard(createCardInput: { title: "Tarefa E2E", columnId: ${colToDoId} }) { id title }
      }
    `;
    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query: mutation })
      .expect((res) => {
        if (res.status !== 200)
          console.error(
            '🚨 ERRO (Create Card):',
            JSON.stringify(res.body, null, 2),
          );
      })
      .expect(200)
      .expect((res) => {
        cardId = res.body.data.createCard.id;
        expect(cardId).toBeDefined();
      });
  });

  // 4. Mover Card (Update)
  it('Deve mover o card para a coluna Done', () => {
    if (!cardId || !colDoneId) throw new Error('IDs necessários não existem');

    const mutation = `
      mutation {
        updateCard(updateCardInput: { id: ${cardId}, columnId: ${colDoneId} }) { 
          id 
          columnId 
        }
      }
    `;
    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query: mutation })
      .expect((res) => {
        if (res.status !== 200)
          console.error(
            '🚨 ERRO (Update Card):',
            JSON.stringify(res.body, null, 2),
          );
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.updateCard.columnId).toBe(colDoneId);
      });
  });

  // 5. Verificar Integridade (Query Profunda)
  it('Deve buscar o board completo e verificar a hierarquia', () => {
    const query = `
      query {
        board(id: ${boardId}) {
          title
          columns {
            id
            cards {
              id
              title
            }
          }
        }
      }
    `;
    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect((res) => {
        if (res.status !== 200)
          console.error(
            '🚨 ERRO (Query Board):',
            JSON.stringify(res.body, null, 2),
          );
      })
      .expect(200)
      .expect((res) => {
        const board = res.body.data.board;

        // Acha a coluna Done na lista
        const doneColumn = board.columns.find((c: any) => c.id === colDoneId);
        const todoColumn = board.columns.find((c: any) => c.id === colToDoId);

        // Verifica se o card está na Done e não na To Do
        expect(doneColumn.cards).toHaveLength(1);
        expect(doneColumn.cards[0].title).toBe("Tarefa E2E");
        expect(todoColumn.cards).toHaveLength(0);
      });
  });
});
