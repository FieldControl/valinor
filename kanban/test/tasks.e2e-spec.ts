import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanesModule } from '../src/lanes/lanes.module';
import { BoardsModule } from '../src/boards/boards.module';
import { TasksModule } from '../src/tasks/tasks.module';
import { UsersModule } from '../src/users/users.module';
import { AuthModule } from '../src/auth/auth.module';
import { Lane } from '../src/lanes/entities/lane.entity';
import { User } from '../src/users/entities/user.entity';
import { Board } from '../src/boards/entities/board.entity';
import { Task } from '../src/tasks/entities/task.entity';
import { CreateTaskDto } from '../src/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../src/tasks/dto/update-task.dto';


describe('TasksController (e2e)', () => {
    let app: INestApplication;
    let token = '';
    let laneId = 0;
    let taskId = 0;
    let userId = 0;
    beforeAll(async () => {
        let username = '';
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
        const createBoardDto = { name: 'Test Board', status: 1, userId: userId };
        const responseBoard = await request(app.getHttpServer())
            .post('/boards')
            .set('Authorization', token)
            .send(createBoardDto);
        let boardId = responseBoard.body.generatedMaps[0].id as number;
        const createLaneDto = { name: 'Test Lane', boardId: boardId, order: 1, status: 1 };
        const responseLane = await request(app.getHttpServer())
            .post('/lanes')
            .set('Authorization', token)
            .send(createLaneDto);
        laneId = responseLane.body.generatedMaps[0].id as number;
        console.log(username);
    });




    it('/tasks (POST)', () => {
        return request(app.getHttpServer())
            .post('/tasks')
            .set('Authorization', token)
            .send({ title: 'Test Task', description: 'Test Description', targetDate: new Date(), laneId: laneId, taskStatus: 1, status: 1 } as CreateTaskDto)
            .expect(201)
            .expect((res) => {
                expect(res.body.generatedMaps).toHaveLength(1);
                expect(res.body.generatedMaps[0]).toHaveProperty('id');
                taskId = res.body.generatedMaps[0].id;
            });
    });

    it('/tasks/:id (GET)', () => {
        return request(app.getHttpServer())
            .get('/tasks/' + taskId)
            .set('Authorization', token)
            .send()
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('id', taskId);
            });
    });

    it('/tasks/:id (PATCH)', () => {
        return request(app.getHttpServer())
            .patch('/tasks/' + taskId)
            .set('Authorization', token)
            .send({ title: 'Updated Task' } as UpdateTaskDto)
            .expect(200)
            .expect((res) => {
                expect(res.body.affected).toBeGreaterThan(0);

            });
    });
    it('/tasks (GET)', () => {
        return request(app.getHttpServer())
            .get('/tasks')
            .set('Authorization', token)
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
            });
    });
    it('/tasks/:id (DELETE)', () => {
        return request(app.getHttpServer())
            .delete('/tasks/' + taskId)
            .set('Authorization', token)
            .expect(200);
    });

    afterAll(async () => {
        await request(app.getHttpServer())
            .delete('/users/' + userId)
            .set('Authorization', token)
            .send();
        await app.close();
    });
});

