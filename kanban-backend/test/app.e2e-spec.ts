import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tasks } from '../src/Entities/tasks.entity';
import { Columns } from '../src/Entities/columns.entity';
import { Repository } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let tasksRepository: Repository<Tasks>;
  let columnsRepository: Repository<Columns>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    tasksRepository = moduleFixture.get<Repository<Tasks>>(
      getRepositoryToken(Tasks),
    );
    columnsRepository = moduleFixture.get<Repository<Columns>>(
      getRepositoryToken(Columns),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await tasksRepository.query('DELETE FROM tasks;');
    await columnsRepository.query('DELETE FROM columns;');
  });

  it('/tasks (GET) should return an array of tasks', async () => {
    const column = await columnsRepository.save({ title: 'Column 1' });
    await tasksRepository.save([
      { title: 'Task 1', description: 'Description 1', columnId: column.id },
      { title: 'Task 2', description: 'Description 2', columnId: column.id },
    ]);

    const response = await request(app.getHttpServer()).get('/tasks');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].title).toBe('Task 1');
    expect(response.body[1].title).toBe('Task 2');
  });

  it('/tasks/:id (GET) should return a task by ID', async () => {
    const column = await columnsRepository.save({ title: 'Column 1' });
    const task = await tasksRepository.save({
      title: 'Task 1',
      description: 'Description 1',
      columnId: column.id,
    });

    const response = await request(app.getHttpServer()).get(
      `/tasks/${task.id}`,
    );
    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Task 1');
  });

  it('/tasks (POST) should create a new task', async () => {
    const column = await columnsRepository.save({ title: 'Column 1' });
    const newTask = {
      title: 'New Task',
      description: 'New Description',
      columnId: column.id,
    };

    const response = await request(app.getHttpServer())
      .post('/tasks')
      .send(newTask);
    expect(response.status).toBe(201);
    expect(response.body.title).toBe('New Task');
  });

  it('/tasks/:id (PATCH) should update a task', async () => {
    const column = await columnsRepository.save({ title: 'Column 1' });
    const task = await tasksRepository.save({
      title: 'Task 1',
      description: 'Description 1',
      columnId: column.id,
    });
    const updatedTask = {
      title: 'Updated Task',
      description: 'Updated Description',
      columnId: column.id,
    };

    const response = await request(app.getHttpServer())
      .patch(`/tasks/${task.id}`)
      .send(updatedTask);
    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Task');
  });

  it('/tasks/:id (DELETE) should delete a task', async () => {
    const column = await columnsRepository.save({ title: 'Column 1' });
    const task = await tasksRepository.save({
      title: 'Task 1',
      description: 'Description 1',
      columnId: column.id,
    });

    const deleteResponse = await request(app.getHttpServer()).delete(
      `/tasks/${task.id}`,
    );
    expect(deleteResponse.status).toBe(200);

    const findTaskResponse = await tasksRepository.findOne({
      where: { id: task.id },
    });
    expect(findTaskResponse).toBeNull();
  });

  it('/columns (GET) should return an array of columns', async () => {
    await columnsRepository.save([
      { title: 'Column 1' },
      { title: 'Column 2' },
    ]);

    const response = await request(app.getHttpServer()).get('/columns');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].title).toBe('Column 1');
    expect(response.body[1].title).toBe('Column 2');
  });

  it('/columns/:id (GET) should return a column by ID', async () => {
    const column = await columnsRepository.save({ title: 'Column 1' });

    const response = await request(app.getHttpServer()).get(
      `/columns/${column.id}`,
    );
    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Column 1');
  });

  it('/columns (POST) should create a new column', async () => {
    const newColumn = { title: 'New Column' };

    const response = await request(app.getHttpServer())
      .post('/columns')
      .send(newColumn);
    expect(response.status).toBe(201);
    expect(response.body.title).toBe('New Column');
  });

  it('/columns/:id (PATCH) should update a column', async () => {
    const column = await columnsRepository.save({ title: 'Column 1' });
    const updatedColumn = { title: 'Updated Column' };

    const response = await request(app.getHttpServer())
      .patch(`/columns/${column.id}`)
      .send(updatedColumn);
    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Column');
  });

  it('/columns/:id (DELETE) should delete a column', async () => {
    const column = await columnsRepository.save({ title: 'Column 1' });

    const deleteResponse = await request(app.getHttpServer()).delete(
      `/columns/${column.id}`,
    );
    expect(deleteResponse.status).toBe(200);

    const findColumnResponse = await columnsRepository.findOne({
      where: { id: column.id },
    });
    expect(findColumnResponse).toBeNull();
  });
});
