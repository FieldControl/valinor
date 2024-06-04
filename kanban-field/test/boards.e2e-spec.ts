import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { BoardsModule } from '../src/boards/boards.module';

dotenv.config();

describe('BoardsController (e2e)', () => {
    let app: INestApplication;
    let token: string;
    let userInfo = [];
  
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          BoardsModule, 
          MongooseModule.forRoot(process.env.DB_CONNECTION_STRING_TEST),
      ],
      }).compile();
  
      app = moduleFixture.createNestApplication();
      await app.init();

      // Fluxo de login simulado para obtenção do token necessario para os testes
      const user = {
        name: 'Authenticated user',
        email: `testuser${Date.now()}@example.com`,
        password: 'password',
      };
    
      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .send(user)
        .expect(201);

      userInfo = [userResponse.body._id, user.email, user.password];
    
      const credentials = {
        email: user.email,
        password: user.password,
      };
    
      const loginResponse = await request(app.getHttpServer())
        .post('/users/login')
        .send(credentials)
        .expect(201);
    
      token = loginResponse.body.acess_token;

    },);
  
    afterAll(async () => {
      // Exclui o usuário criado no fluxo de login
      await request(app.getHttpServer())
        .delete(`/users/${userInfo[0]}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      await mongoose.connection.close();
      await app.close();
    });    
  
    let boardInfo = []
    
    describe('create board by the responsibles emails', () => {
    it('/boards/create-by-email (POST)', async () => {
        const board = {
            name: `Test Board ${Date.now()}`,
            responsibles: [userInfo[1]] // pode adicionar algum outro email de responsavel existente
        };
        
        const response = await request(app.getHttpServer())
            .post('/boards/create-by-email')
            .set('Authorization', `Bearer ${token}`)
            .send(board)
            .expect(201);
    
            boardInfo = [response.body['_id'], response.body.name, response.body.responsibles];
            console.log(boardInfo[1])

            expect(response.body.name).toBe(board.name);
            expect(response.body.responsibles[0]).toBe(userInfo[0]);
    
            return response;
        });
    })  
    
    it('/boards (GET)', () => {
    return request(app.getHttpServer())
        .get('/boards')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
    });

    it('/boards/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/boards/${boardInfo[0]}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('/boards/:id/update-by-email (PATCH)', () => {
    const updatedBoard = {
        name: "Updated board",
        responsibles: [userInfo[1]] // pode adicionar algum outro email de responsavel existente
    };
    
    return request(app.getHttpServer())
        .patch(`/boards/${boardInfo[0]}/update-by-email`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedBoard)
        .expect(200);
    });

    it('/boards/:id (DELETE)', () => {  
        return request(app.getHttpServer())
          .delete(`/boards/${boardInfo[0]}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
      });
  });
  