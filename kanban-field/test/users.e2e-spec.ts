import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersModule } from '../src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();


describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule, 
        MongooseModule.forRoot(process.env.DB_CONNECTION_STRING_TEST),
    ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await app.close();
  });

  let userInfo = []
  
  it('/users (POST)', async () => {
    const user = {
      name: 'Test User',
      email: `testuser${Date.now()}@example.com`,
      password: 'password',
    };
  
    const response = await request(app.getHttpServer())
      .post('/users')
      .send(user)
      .expect(201);

      userInfo = [response.body['_id'], response.body.email, response.body.password];
      console.log(userInfo[1])

      expect(response.body.name).toBe(user.name);
      expect(response.body.email).toBe(user.email);
      expect(response.body.password).toBe(user.password);

      return response;
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
  });

  it('/users/:id (GET)', () => {
    return request(app.getHttpServer())
      .get(`/users/${userInfo[0]}`)
      .expect(200);
  });

  it('/users/:id (PATCH)', () => {
    const updatedUser = {
      name: 'Updated User',
    };
  
    return request(app.getHttpServer())
      .patch(`/users/${userInfo[0]}`)
      .send(updatedUser)
      .expect(200);
  });
  
  describe('login', () => {
    it('/users/login (POST)', () => {
      const credentials = {
        email: userInfo[1],
        password: userInfo[2],
      };
    
      return request(app.getHttpServer())
        .post('/users/login')
        .send(credentials)
        .expect(201)
    });

    it('/users/login (POST) com credenciais inválidas', () => {
      const invalidCredentials = {
        email: 'nao@existe.com',
        password: 'senhaInvalida',
      };
    
      return request(app.getHttpServer())
        .post('/users/login')
        .send(invalidCredentials)
        .expect(401);
    });
  })

  it('/users/:id (DELETE)', () => {  
    return request(app.getHttpServer())
      .delete(`/users/${userInfo[0]}`)
      .expect(200);
  });
  
});
