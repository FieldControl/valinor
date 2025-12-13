import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Kanban e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let httpServer: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Mesmo ValidationPipe do main (se você estiver usando lá)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    httpServer = app.getHttpServer();
    prisma = app.get(PrismaService);

    // limpa o banco para o teste (ordem: cards -> columns -> boards)
    await prisma.card.deleteMany();
    await prisma.column.deleteMany();
    await prisma.board.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve criar board, coluna, card e retornar o board completo', async () => {
    // 1) cria um board
    const boardRes = await request(httpServer)
      .post('/boards')
      .send({ name: 'Board e2e' })
      .expect(201);

    const board = boardRes.body;
    expect(board.id).toBeDefined();
    expect(board.name).toBe('Board e2e');

    const boardId = board.id;

    // 2) cria uma coluna nesse board
    const columnRes = await request(httpServer)
      .post(`/boards/${boardId}/columns`)
      .send({ title: 'To Do' })
      .expect(201);

    const column = columnRes.body;
    expect(column.id).toBeDefined();
    expect(column.title).toBe('To Do');
    expect(column.boardId).toBe(boardId);

    const columnId = column.id;

    // 3) cria um card nessa coluna
    const dueDate = '2025-12-15T18:00:00.000Z';

    const cardRes = await request(httpServer)
      .post(`/columns/${columnId}/cards`)
      .send({
        title: 'Primeira tarefa',
        description: 'Teste e2e',
        dueDate,
      })
      .expect(201);

    const card = cardRes.body;
    expect(card.id).toBeDefined();
    expect(card.title).toBe('Primeira tarefa');
    expect(card.columnId).toBe(columnId);

    // 4) busca o board completo e verifica se vem coluna + card
    const getBoardRes = await request(httpServer)
      .get(`/boards/${boardId}`)
      .expect(200);

    const fullBoard = getBoardRes.body;

    expect(fullBoard.id).toBe(boardId);
    expect(fullBoard.name).toBe('Board e2e');

    // deve ter pelo menos 1 coluna
    expect(fullBoard.columns.length).toBeGreaterThanOrEqual(1);
    const firstColumn = fullBoard.columns[0];
    expect(firstColumn.title).toBe('To Do');

    // deve ter pelo menos 1 card na coluna
    expect(firstColumn.cards.length).toBeGreaterThanOrEqual(1);
    const firstCard = firstColumn.cards[0];
    expect(firstCard.title).toBe('Primeira tarefa');
  });
});
