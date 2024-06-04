import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { CardsModule } from '../src/cards/cards.module';

dotenv.config();

describe('CardsController (e2e)', () => {
    let app: INestApplication;
    let token: string;
    let userInfo = [];
    let columnId: string;
    let boardId: string;
  
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          CardsModule, 
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
        name: `Board for column/card ${Date.now()}`,
        responsibles: [userInfo[1]] 
      };

      const boardResponse = await request(app.getHttpServer())
        .post('/boards/create-by-email')
        .set('Authorization', `Bearer ${token}`)
        .send(board)
        .expect(201);

      boardId = boardResponse.body['_id'];

      // Fluxo de criação de column para obtenção de dados para os testes
      const column = {
        name: `Column for card ${Date.now()}`,
        board: boardId,
      };

      const columnResponse = await request(app.getHttpServer())
        .post('/columns')
        .set('Authorization', `Bearer ${token}`)
        .send(column)
        .expect(201);

      columnId = columnResponse.body['_id'];
      console.log("ida da coluna",columnId)

    },);
  
    afterAll(async () => {
      // Exclui a board criada no fluxo de criação incial
      await request(app.getHttpServer())
        .delete(`/boards/${boardId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Exclui a column criada no fluxo de criação incial
      await request(app.getHttpServer())
        .delete(`/columns/${columnId}`)
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
  
    let cardInfo = []
    
    it('/cards (POST)', async () => {
        const card = {
          name: `Test Card ${Date.now()}`,
          description: 'Test description',
          dueDate: new Date(),
          column: columnId,
        };
      
        const response = await request(app.getHttpServer())
          .post('/cards')
          .set('Authorization', `Bearer ${token}`)
          .send(card)
          .expect(201);
    
          cardInfo = [response.body['_id'], response.body.name, response.body.board];
          console.log(cardInfo[1])

          expect(response.body.name).toBe(card.name);
          expect(response.body.description).toBe(card.description);
          expect(new Date(response.body.dueDate)).toEqual(card.dueDate);
          expect(response.body.column).toBe(columnId);
    
          return response;
      });
    
    it('/cards (GET)', () => {
    return request(app.getHttpServer())
        .get('/cards')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
    });

    it('/cards/:id (PATCH)', () => {
    const updatedCard = {
        name: "Updated card",
        column: columnId 
    };
    
    return request(app.getHttpServer())
        .patch(`/cards/${cardInfo[0]}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedCard)
        .expect(200);
    });

    it('/cards/:id (DELETE)', () => {  
        return request(app.getHttpServer())
          .delete(`/cards/${cardInfo[0]}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
      });
  });
  