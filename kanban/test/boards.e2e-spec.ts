import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateLaneDto as CreateBordDto } from '../src/lanes/dto/create-lane.dto';
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
import { UpdateBoardDto } from '../src/boards/dto/update-board.dto';
import { CreateBoardDto } from '../src/boards/dto/create-board.dto';

describe('BoardsController (e2e)', () => {
    let app: INestApplication;
    let id = 0;
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
        const createUser = { username: username, password: '123', status: 1, boards: [] } as User;
        const responseCreateUser = await request(app.getHttpServer())
            .post('/users')
            .send(createUser);

        userId = responseCreateUser.body.generatedMaps[0].id;

        const responseToken = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ username: username, password: '123' })
        token = 'Bearer ' + responseToken.body.access_token;
        console.log(username);
    });



    it('/boards (POST)', () => {
        const createBoardDto: CreateBoardDto = { name: 'Test Lane', userId: userId, status: 1 };
        return request(app.getHttpServer())
            .post('/boards')
            .set('Authorization', token)
            .send(createBoardDto)
            .expect(201)
            .expect((res) => {
                id = res.body.generatedMaps[0].id;
                expect(res.body.generatedMaps[0]).toHaveProperty('id');
            });
    });

    it('/boards (GET)', () => {
        return request(app.getHttpServer())
            .get('/boards')
            .set('Authorization', token)
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
            });
    });

    it('/boards/:id (GET)', () => {
        return request(app.getHttpServer())
            .get('/boards/' + id)
            .set('Authorization', token)
            .send()
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.id).toBe(id);
            });
    });

    it('/boards/:id (PATCH)', () => {
        const updateBoardDto: UpdateBoardDto = { name: 'Updated Lane' };
        return request(app.getHttpServer())
            .patch('/boards/' + id)
            .set('Authorization', token)
            .send(updateBoardDto)
            .expect(200)
            .expect((res) => {
                expect(res.body.affected).toBe(1);
            });
    });

    it('/boards/:id (DELETE)', () => {
        return request(app.getHttpServer())
            .delete('/boards/' + id)
            .set('Authorization', token)
            .send()
            .expect(200)
            .expect((res) => {
                expect(res.body.affected).toBe(1);
            });
    });
    afterAll(async () => {
        await request(app.getHttpServer())
            .delete('/users/' + userId)
            .set('Authorization', token)
            .send();
        await app.close();
    });
});