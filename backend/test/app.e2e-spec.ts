import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

describe('App E2E', () => {
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

  it('Deve responder com status 200 na rota "/"', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeDefined();
      });
  });

  it('Deve responder com status 404 para uma rota inexistente', () => {
    return request(app.getHttpServer())
      .get('/rota-inexistente')
      .expect(404);
  });

  it('Deve registrar e realizar login com credenciais válidas', async () => {
    const registerDto = { email: 'cleberjonsoncfl@gmail.com', password: 'kanbanteste123' };

    // Registro do usuário antes do login
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto)
      .expect(201);

    // Login com o usuário registrado
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(registerDto)
      .expect(201);

    expect(response.body).toHaveProperty('accessToken'); // Alterado para 'accessToken'
  });
});
