import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Server } from 'http';

describe('KanbanResolver (e2e)', () => {
  let app: INestApplication;
  let createdColumnId: number;
  let createdCardId: number;

  const getHttpServer = (): Server => {
    return app.getHttpServer() as unknown as Server;
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('🟩 Deve criar uma coluna', async () => {
    const query = `
      mutation {
        createColumn(input: { title: "Minha coluna teste" }) {
          id
          title
        }
      }
    `;

    const response = await request(getHttpServer())
      .post('/graphql')
      .send({ query });

    const data = response.body as {
      data: {
        createColumn: {
          id: number;
          title: string;
        };
      };
    };

    expect(data.data.createColumn).toHaveProperty('id');
    expect(data.data.createColumn.title).toBe('Minha coluna teste');

    createdColumnId = data.data.createColumn.id;
  });

  it('🟦 Deve criar um card dentro da coluna', async () => {
    const mutation = `
      mutation {
        createCard(input: {
          title: "Novo Card",
          description: "Descrição teste",
          columnId: ${createdColumnId}
        }) {
          id
          title
          column {
            id
          }
        }
      }
    `;

    const response = await request(getHttpServer())
      .post('/graphql')
      .send({ query: mutation });

    const data = response.body as {
      data: {
        createCard: {
          id: number;
          title: string;
          column: {
            id: number;
          };
        };
      };
    };

    expect(data.data.createCard.title).toBe('Novo Card');
    expect(Number(data.data.createCard.column.id)).toBe(createdColumnId);

    createdCardId = data.data.createCard.id;
  });

  it('🟨 Deve buscar todas as colunas com seus cards', async () => {
    const query = `
      query {
        getColumns {
          id
          title
          cards {
            id
            title
          }
        }
      }
    `;

    const response = await request(getHttpServer())
      .post('/graphql')
      .send({ query });

    const data = response.body as {
      data: {
        getColumns: Array<{
          id: number;
          title: string;
          cards: Array<{ id: number; title: string }>;
        }>;
      };
    };

    expect(Array.isArray(data.data.getColumns)).toBe(true);
    expect(data.data.getColumns.length).toBeGreaterThan(0);
  });

  it('🟫 Deve buscar os cards de uma coluna específica', async () => {
    const query = `
      query {
        getCardsByColumn(columnId: ${createdColumnId}) {
          id
          title
        }
      }
    `;

    const response = await request(getHttpServer())
      .post('/graphql')
      .send({ query });

    const data = response.body as {
      data: {
        getCardsByColumn: Array<{ id: number; title: string }>;
      };
    };

    expect(Array.isArray(data.data.getCardsByColumn)).toBe(true);
    expect(data.data.getCardsByColumn.length).toBeGreaterThan(0);
  });

  it('🟪 Deve atualizar o título de uma coluna', async () => {
    const mutation = `
      mutation {
        updateColumn(input: {
          id: ${createdColumnId},
          title: "Coluna Atualizada"
        }) {
          id
          title
        }
      }
    `;

    const response = await request(getHttpServer())
      .post('/graphql')
      .send({ query: mutation });

    const data = response.body as {
      data: {
        updateColumn: {
          id: number;
          title: string;
        };
      };
    };

    expect(data.data.updateColumn.title).toBe('Coluna Atualizada');
  });

  it('🟥 Deve atualizar um card existente', async () => {
    const mutation = `
      mutation {
        updateCard(input: {
          id: ${createdCardId},
          title: "Card Atualizado",
          description: "Nova descrição"
        }) {
          id
          title
          description
        }
      }
    `;

    const response = await request(getHttpServer())
      .post('/graphql')
      .send({ query: mutation });

    const data = response.body as {
      data: {
        updateCard: {
          id: number;
          title: string;
          description: string;
        };
      };
    };

    expect(data.data.updateCard.title).toBe('Card Atualizado');
    expect(data.data.updateCard.description).toBe('Nova descrição');
  });
});
