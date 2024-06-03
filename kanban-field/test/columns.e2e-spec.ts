import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ColumnsModule } from '../src/columns/columns.module';

dotenv.config();

describe('ColumnsController (e2e)', () => {
    let app: INestApplication;
    let token: string;
    let userInfo = [];
    let boardId: string;
  
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ColumnsModule, 
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

      // Fluxo de criação de board para obtenção de dados para os testes
      const board = {
        name: `Board for column ${Date.now()}`,
        responsibles: [userInfo[1]] 
      };

      const boardResponse = await request(app.getHttpServer())
        .post('/boards/create-by-email')
        .set('Authorization', `Bearer ${token}`)
        .send(board)
        .expect(201);

      boardId = boardResponse.body['_id'];

    },);
  
    afterAll(async () => {
      // Exclui a board criada no fluxo de criação incial
      await request(app.getHttpServer())
        .delete(`/boards/${boardId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Exclui o usuário criado no fluxo de login
      await request(app.getHttpServer())
        .delete(`/users/${userInfo[0]}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      await mongoose.connection.close();
      await app.close();
    });    
  
    let columnInfo = []
    
    it('/columns (POST)', async () => {
        const column = {
          name: `Test Column ${Date.now()}`,
          board: boardId,
        };
      
        const response = await request(app.getHttpServer())
          .post('/columns')
          .set('Authorization', `Bearer ${token}`)
          .send(column)
          .expect(201);
    
          columnInfo = [response.body['_id'], response.body.name, response.body.board];
          console.log(columnInfo[1])

          expect(response.body.name).toBe(column.name);
          expect(response.body.board).toBe(column.board);
    
          return response;
      });
    
    it('/columns (GET)', () => {
    return request(app.getHttpServer())
        .get('/columns')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
    });

    it('/columns/:id (PATCH)', () => {
    const updatedColumn = {
        name: "Updated column",
        board: boardId 
    };
    
    return request(app.getHttpServer())
        .patch(`/columns/${columnInfo[0]}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedColumn)
        .expect(200);
    });

    it('/boards/:id (DELETE)', () => {  
        return request(app.getHttpServer())
          .delete(`/columns/${columnInfo[0]}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
      });
  });
  