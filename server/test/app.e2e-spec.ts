import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Kanban Application (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;
  let authToken: string;
  let userId: number;
  let boardId: number;
  let columnId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);

    // Clean database before tests
    await prismaService.card.deleteMany();
    await prismaService.column.deleteMany();
    await prismaService.userBoard.deleteMany();
    await prismaService.board.deleteMany();
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    // Clean database after tests
    await prismaService.card.deleteMany();
    await prismaService.column.deleteMany();
    await prismaService.userBoard.deleteMany();
    await prismaService.board.deleteMany();
    await prismaService.user.deleteMany();

    await prismaService.$disconnect();
    await app.close();
  });

  describe('Authentication Flow', () => {
    it('should create a new user (POST /graphql - createUser)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              createUser(createUserInput: {
                name: "E2E Test User"
                email: "e2e@test.com"
                password: "password123"
              }) {
                id
                name
                email
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createUser).toBeDefined();
          expect(res.body.data.createUser.name).toBe('E2E Test User');
          expect(res.body.data.createUser.email).toBe('e2e@test.com');
          userId = res.body.data.createUser.id;
        });
    });

    it('should login with valid credentials (POST /graphql - login)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              login(loginInput: {
                email: "e2e@test.com"
                password: "password123"
              }) {
                access_token
                user {
                  id
                  name
                  email
                }
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.login).toBeDefined();
          expect(res.body.data.login.access_token).toBeDefined();
          expect(res.body.data.login.user.email).toBe('e2e@test.com');
          authToken = res.body.data.login.access_token;
        });
    });

    it('should reject login with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              login(loginInput: {
                email: "e2e@test.com"
                password: "wrongpassword"
              }) {
                access_token
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
        });
    });
  });

  describe('Board Management', () => {
    it('should create a new board (POST /graphql - createBoard)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `
            mutation {
              createBoard(createBoardInput: {
                name: "E2E Test Board"
              }) {
                id
                name
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createBoard).toBeDefined();
          expect(res.body.data.createBoard.name).toBe('E2E Test Board');
          boardId = res.body.data.createBoard.id;
        });
    });

    it('should list user boards (POST /graphql - myBoards)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `
            query {
              myBoards {
                id
                name
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.myBoards).toBeDefined();
          expect(res.body.data.myBoards.length).toBeGreaterThan(0);
          expect(res.body.data.myBoards[0].name).toBe('E2E Test Board');
        });
    });

    it('should get board with columns (POST /graphql - getBoard)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `
            query {
              getBoard(id: ${boardId}) {
                id
                name
                columns {
                  id
                  name
                }
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.getBoard).toBeDefined();
          expect(res.body.data.getBoard.id).toBe(boardId);
          expect(res.body.data.getBoard.columns).toEqual([]);
        });
    });
  });

  describe('Column Management', () => {
    it('should create a column (POST /graphql - createColumn)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `
            mutation {
              createColumn(createColumnInput: {
                name: "To Do"
                boardId: ${boardId}
              }) {
                id
                name
                position
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createColumn).toBeDefined();
          expect(res.body.data.createColumn.name).toBe('To Do');
          expect(res.body.data.createColumn.position).toBe(1);
          columnId = res.body.data.createColumn.id;
        });
    });

    it('should update a column (POST /graphql - updateColumn)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `
            mutation {
              updateColumn(id: ${columnId}, updateColumnInput: {
                name: "Updated Column"
              }) {
                id
                name
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.updateColumn).toBeDefined();
          expect(res.body.data.updateColumn.name).toBe('Updated Column');
        });
    });
  });

  describe('Card Management', () => {
    let cardId: number;

    it('should create a card (POST /graphql - createCard)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `
            mutation {
              createCard(createCardInput: {
                name: "Test Card"
                description: "Test Description"
                columnId: ${columnId}
              }) {
                id
                name
                description
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createCard).toBeDefined();
          expect(res.body.data.createCard.name).toBe('Test Card');
          expect(res.body.data.createCard.description).toBe('Test Description');
          cardId = res.body.data.createCard.id;
        });
    });

    it('should update a card (POST /graphql - updateCard)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `
            mutation {
              updateCard(id: ${cardId}, updateCardInput: {
                name: "Updated Card"
                description: "Updated Description"
              }) {
                id
                name
                description
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.updateCard).toBeDefined();
          expect(res.body.data.updateCard.name).toBe('Updated Card');
          expect(res.body.data.updateCard.description).toBe('Updated Description');
        });
    });

    it('should move a card to another column', async () => {
      // First create another column
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `
            mutation {
              createColumn(createColumnInput: {
                name: "In Progress"
                boardId: ${boardId}
              }) {
                id
              }
            }
          `,
        });

      const newColumnId = response.body.data.createColumn.id;

      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `
            mutation {
              moveCard(cardId: ${cardId}, columnId: ${newColumnId}) {
                id
                columnId
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.moveCard).toBeDefined();
          expect(res.body.data.moveCard.columnId).toBe(newColumnId);
        });
    });

    it('should remove a card (POST /graphql - removeCard)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `
            mutation {
              removeCard(id: ${cardId}) {
                id
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.removeCard).toBeDefined();
        });
    });
  });

  describe('Authorization', () => {
    it('should reject requests without authentication token', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              myBoards {
                id
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
        });
    });

    it('should reject requests with invalid token', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          query: `
            query {
              myBoards {
                id
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
        });
    });
  });
});

