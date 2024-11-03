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
import { LoginDto } from '../src/auth/dto/login.dto';

describe('AuthController (e2e)', () => {
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
        console.log(username);
    });



    it('/auth/login (POST)', () => {
        const loginDto: LoginDto = { username: username, password: '123' };
        return request(app.getHttpServer())
            .post('/auth/login')
            .set('Authorization', token)
            .send(loginDto)
            .expect(201)
            .expect((res) => {
                expect(res.body.access_token).not.toBeNull();
            });
    });
    it('/auth/login (POST) - invalid', () => {
        const loginDto: LoginDto = { username: 'invalid', password: 'invalid' };
        return request(app.getHttpServer())
            .post('/auth/login')
            .set('Authorization', token)
            .send(loginDto)
            .expect(401)
            .expect((res) => {
                expect(res.body.statusCode).toBe(401);
                expect(res.body.message).toBe('Unauthorized');
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