import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Kanban API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    prisma = moduleRef.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // reset DB
    await prisma.card.deleteMany();
    await prisma.column.deleteMany();
    await prisma.user.deleteMany();
    // seed and register one user
    const hashed = await bcrypt.hash('adminpass', 10);
    const created = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@test.com',
        password: hashed,
        tipo: 0,
      },
    });
    userId = created.id;
    // login
    const loginResp = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'adminpass' });

    authToken = (loginResp.body as { access_token: string }).access_token;
  });

  it('/auth/register (POST) → register user without password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'User1', email: 'u1@test.com', password: '123456' })
      .expect(201);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(res.body.email).toBe('u1@test.com');

    expect(res.body).not.toHaveProperty('password');
  });

  it('/auth/login (POST) → issue JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'adminpass' })
      .expect(201);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(typeof res.body.access_token).toBe('string');
  });

  it('/users/:id/role (PATCH) → update role', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/users/${userId}/role`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ tipo: 1 })
      .expect(200);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(res.body.tipo).toBe(1);
  });

  it('/columns (CRUD)', async () => {
    // create
    const cRes = await request(app.getHttpServer())
      .post('/columns')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Todo', order: 0 })
      .expect(201);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const colId = cRes.body.id;

    // read
    await request(app.getHttpServer())
      .get(`/columns/${colId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // update
    await request(app.getHttpServer())
      .patch(`/columns/${colId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Doing' })
      .expect(200);

    // delete
    await request(app.getHttpServer())
      .delete(`/columns/${colId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('/cards (CRUD & move)', async () => {
    // setup column
    const col = await prisma.column.create({ data: { title: 'C', order: 0 } });

    // create
    const cardRes = await request(app.getHttpServer())
      .post('/cards')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Card1', order: 0, columnId: col.id })
      .expect(201);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const cardId = cardRes.body.id;

    // read one
    await request(app.getHttpServer())
      .get(`/cards/${cardId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // update
    await request(app.getHttpServer())
      .patch(`/cards/${cardId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Card2' })
      .expect(200);

    // move
    await request(app.getHttpServer())
      .patch(`/cards/${cardId}/move/${col.id}/1`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // delete
    await request(app.getHttpServer())
      .delete(`/cards/${cardId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });
});
