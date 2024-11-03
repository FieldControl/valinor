import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateLaneDto } from '../src/lanes/dto/create-lane.dto';
import { UpdateLaneDto } from '../src/lanes/dto/update-lane.dto';
import { User } from '../src/users/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { BoardsModule } from '../src/boards/boards.module';
import { Lane } from '../src/lanes/entities/lane.entity';
import { Board } from '../src/boards/entities/board.entity';
import { Task } from '../src/tasks/entities/task.entity';
import { TasksModule } from '../src/tasks/tasks.module';
import { LanesModule } from '../src/lanes/lanes.module';

describe('LanesController (e2e)', () => {
  let app: INestApplication;
  let id = 0;
  let boardId = 0;
  let userId = 0;
  let token = '';
  let username = '';
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({
        isGlobal: true,
      }),
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          type: 'mariadb',
          host: configService.get<string>('DATABASE_HOST'),
          port: configService.get<number>('DATABASE_PORT'),
          username: configService.get<string>('DATABASE_USER'),
          password: configService.get<string>('DATABASE_PASSWORD'),
          database: configService.get<string>('DATABASE_NAME'),
          synchronize: true,
          entities: [Lane, User, Board, Task],
        }),
        inject: [ConfigService],
      }),
      LanesModule,
      BoardsModule,
      TasksModule,
      UsersModule,
      AuthModule, AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    username = 'username' + Math.floor(Math.random() * 1000);
    const createUser = { username: username, password:'123', status:1, boards:[] } as User;
    const responseCreateUser = await request(app.getHttpServer())
      .post('/users')
      .send(createUser);

    userId = responseCreateUser.body.generatedMaps[0].id;

    const responseToken = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ username: username, password: '123' })
    token = 'Bearer ' + responseToken.body.access_token;
    const createBoardDto = { name: 'Test Board', status: 1, userId: userId };
    const responseBoard = await request(app.getHttpServer())
      .post('/boards')
      .set('Authorization',token)
      .send(createBoardDto);
    boardId = responseBoard.body.generatedMaps[0].id;
    console.log(username);
  });

  
  
  it('/lanes (POST)', () => {
    const createLaneDto: CreateLaneDto = { name: 'Test Lane', boardId:boardId, order: 1, status:1 };
    return request(app.getHttpServer())
      .post('/lanes')
      .set('Authorization',token)
      .send(createLaneDto)
      .expect(201)
      .expect((res) => {
        id = res.body.generatedMaps[0].id;
        expect(res.body.generatedMaps[0]).toHaveProperty('id');
      });
  });

  it('/lanes (GET)', () => {
    return request(app.getHttpServer())
      .get('/lanes')
      .set('Authorization', token)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/lanes/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/lanes/'+id)
      .set('Authorization',  token)
      .send()
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.id).toBe(id);
      });
  });

  it('/lanes/:id (PATCH)', () => {
    const updateLaneDto: UpdateLaneDto = { name: 'Updated Lane' };
    return request(app.getHttpServer())
      .patch('/lanes/'+id)
      .set('Authorization',  token)
      .send(updateLaneDto)
      .expect(200)
      .expect((res) => {
        expect(res.body.affected).toBe(1);
      });
  });

  it('/lanes/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/lanes/'+id)
      .set('Authorization',  token)
      .send()
      .expect(200)
      .expect((res) => {
        expect(res.body.affected).toBe(1);
      });
  });
  afterAll(async () => {
    await request(app.getHttpServer())
    .delete('/users/'+userId)
    .set('Authorization', token)
    .send();
    await app.close();
  });
});