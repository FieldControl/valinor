import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { Server } from 'http';
import { io, Socket } from 'socket.io-client';

// Interfaces para tipagem segura
interface Card {
  id: number;
  title: string;
  description: string;
  columnId: number;
}

interface GraphQLResponse<T> {
  data: T;
}

describe('KanbanResolver (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let socket: Socket;
  let url: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    httpServer = app.getHttpServer() as Server;

    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => resolve());
    });

    const address = httpServer.address();
    if (address && typeof address !== 'string') {
      const { port } = address;
      url = `http://localhost:${port}`;
    } else {
      throw new Error('Não foi possível obter o endereço do servidor');
    }

    socket = io(url, { transports: ['websocket'] });

    await new Promise<void>((resolve) => {
      socket.on('connect', () => resolve());
    });
  });

  afterAll(async () => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
    await app.close();
  });

  it('deve criar um card e emitir cardCreated', async () => {
    const mutation = `
      mutation {
        createCard(data: {
          title: "Novo Card",
          description: "Descrição do Card",
          columnId: 1
        }) {
          id
          title
          description
          columnId
        }
      }
    `;

    const eventPromise = new Promise<Card>((resolve) => {
      socket.once('cardCreated', (payload: Card) => {
        resolve(payload);
      });
    });

    const response = await request(httpServer)
      .post('/graphql')
      .send({ query: mutation });

    const body = response.body as GraphQLResponse<{ createCard: Card }>;
    const card = body.data.createCard;
    const emitted = await eventPromise;

    expect(card.title).toBe('Novo Card');
    expect(card.description).toBe('Descrição do Card');
    expect(card.columnId).toBe(1);
    expect(emitted).toMatchObject(card);
  });

  it('deve atualizar um card e emitir cardUpdated', async () => {
    const createMutation = `
      mutation {
        createCard(data: {
          title: "Temp Card",
          description: "Temp Desc",
          columnId: 1
        }) {
          id
        }
      }
    `;

    const createRes = await request(httpServer)
      .post('/graphql')
      .send({ query: createMutation });

    const createBody = createRes.body as GraphQLResponse<{
      createCard: { id: number };
    }>;

    const cardId = createBody.data.createCard.id;

    const updateMutation = `
      mutation {
        updateCard(data: {
          id: ${cardId},
          title: "Atualizado",
          description: "Atualizado Desc"
        }) {
          id
          title
          description
        }
      }
    `;

    const eventPromise = new Promise<Partial<Card>>((resolve) => {
      socket.once('cardUpdated', (payload: Partial<Card>) => {
        resolve(payload);
      });
    });

    const response = await request(httpServer)
      .post('/graphql')
      .send({ query: updateMutation });

    const body = response.body as GraphQLResponse<{
      updateCard: Partial<Card>;
    }>;

    const card = body.data.updateCard;
    const emitted = await eventPromise;

    expect(card.title).toBe('Atualizado');
    expect(card.description).toBe('Atualizado Desc');
    expect(emitted).toMatchObject(card);
  });

  it('deve deletar um card e emitir cardDeleted', async () => {
    const createMutation = `
      mutation {
        createCard(data: {
          title: "Temp Delete",
          description: "To Delete",
          columnId: 1
        }) {
          id
        }
      }
    `;

    const createRes = await request(httpServer)
      .post('/graphql')
      .send({ query: createMutation });

    const createBody = createRes.body as GraphQLResponse<{
      createCard: { id: number };
    }>;

    const cardId = createBody.data.createCard.id;

    const deleteMutation = `
      mutation {
        deleteCard(id: ${cardId})
      }
    `;

    const eventPromise = new Promise<number>((resolve) => {
      socket.once('cardDeleted', (payload: number) => {
        resolve(payload);
      });
    });

    const response = await request(httpServer)
      .post('/graphql')
      .send({ query: deleteMutation });

    const body = response.body as GraphQLResponse<{ deleteCard: boolean }>;
    const result = body.data.deleteCard;
    const emitted = await eventPromise;

    expect(result).toBe(true);
    expect(emitted).toBe(cardId);
  });
});
