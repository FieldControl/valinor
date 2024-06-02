import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersModule } from '../src/users/users.module';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { User } from '../src/users/entities/user.entity';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();


describe('UserController (e2e)', () => {
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

  let userId

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
  });

  it('/users (POST)', async () => {
    const user = {
      name: 'User 1',
      email: `testuser${Date.now()}@example.com`,
      password: 'password',
    };
  
    const response = await request(app.getHttpServer())
      .post('/users')
      .send(user)
      .expect(201);

      userId = response.body['_id'];
      console.log(userId)

      return response;
  });

  it('/users/:id (GET)', () => {
    return request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(200);
  });

  it('/users/:id (PATCH)', () => {
    const updateUserDto = {
      name: 'Updated User',
    };
  
    return request(app.getHttpServer())
      .patch(`/users/${userId}`)
      .send(updateUserDto)
      .expect(200);
  });

  it('/users/:id (DELETE)', () => {  
    return request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .expect(200);
  });
  
  it('/users/login (POST)', () => {
    const credentials = {
      email: 'email@exemplo.com',
      password: 'password',
    };
  
    return request(app.getHttpServer())
      .post('/users/login')
      .send(credentials)
      .expect(201);
  });
  
});
